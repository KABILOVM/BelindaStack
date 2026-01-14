
import React, { useState, useEffect } from 'react';
import { User, GameResult, PRIZES, PRIZE_DETAILS, THRESHOLDS } from '../../types';
import { backend } from '../../services/mockBackend';
import { PrizeIcon } from './PrizeIcons';

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
);

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

export const ProfileScreen = ({ user: initialUser, onBack, onLogout }: ProfileScreenProps) => {
  const [user, setUser] = useState<User>(initialUser);
  const [history, setHistory] = useState<GameResult[]>([]);
  const [bestScore, setBestScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tempError, setTempError] = useState<string | null>(null);

  // Local selection state (Staging area before confirmation)
  const [localSelection, setLocalSelection] = useState<string[]>(initialUser.claimedPrizes || []);

  useEffect(() => {
    backend.getUserResults(user.id).then(userHistory => {
      setHistory(userHistory);
      // Only count scores from non-trial games for prize unlocking
      const eligibleGames = userHistory.filter(r => r.codeUsed !== 'TRIAL');
      const max = Math.max(0, ...eligibleGames.map((r: GameResult) => r.score));
      setBestScore(max);
    });
  }, [user.id]);

  // Sync local selection if user updates from backend (e.g. after confirm)
  useEffect(() => {
    if (user.claimedPrizes) {
        setLocalSelection(prev => {
            // Merge persistent prizes with local selection, ensuring no duplicates
            const unique = new Set([...prev, ...user.claimedPrizes]);
            return Array.from(unique);
        });
    }
  }, [user.claimedPrizes]);

  const showTempError = (msg: string) => {
      setTempError(msg);
      setTimeout(() => setTempError(null), 3000);
  };

  const handleToggleSelection = (prizeTitle: string, isValuable: boolean, threshold: number) => {
    // 1. Check Score Requirement
    if (bestScore < threshold) {
        showTempError(`Нужно ${threshold} очков (по коду) для этого приза!`);
        return;
    }

    // 2. Check if already confirmed (cannot deselect confirmed prizes)
    if (user.claimedPrizes?.includes(prizeTitle)) {
        return; 
    }

    setLocalSelection(prev => {
        const isSelected = prev.includes(prizeTitle);
        
        if (isSelected) {
            // Deselect
            return prev.filter(p => p !== prizeTitle);
        } else {
            // Select logic
            if (isValuable) {
                // Radio button logic: Remove other valuable prizes from selection
                const nonValuablePrizes = prev.filter(p => !PRIZE_DETAILS[p].isValuable);
                return [...nonValuablePrizes, prizeTitle];
            } else {
                // Basic prize logic: Just add
                return [...prev, prizeTitle];
            }
        }
    });
  };

  const handleConfirmSelection = async () => {
    const newPrizes = localSelection.filter(p => !user.claimedPrizes?.includes(p));
    
    if (newPrizes.length === 0) return;

    setLoading(true);
    try {
        let updatedUser = user;
        // Process sequentially to ensure backend validation
        for (const prize of newPrizes) {
            updatedUser = await backend.claimPrize(user.id, prize);
        }
        setUser(updatedUser);
        // Local selection is now synced with backend via the useEffect
    } catch (e: any) {
        showTempError(e.message);
        // Revert local selection to match backend to avoid UI sync issues
        setLocalSelection(user.claimedPrizes || []);
    } finally {
        setLoading(false);
    }
  };

  const handleDeliveryRequest = async () => {
     setLoading(true);
     try {
         await backend.requestDelivery(user.id);
         const updated = await backend.refreshUser();
         if(updated) setUser(updated);
     } catch (e: any) {
         showTempError(e.message);
     } finally {
         setLoading(false);
     }
  };

  // Derived State
  const confirmedBasic = user.claimedPrizes?.includes(PRIZES.TIER_1);
  const confirmedValuable = user.claimedPrizes?.some(p => PRIZE_DETAILS[p].isValuable);
  
  const selectedBasic = localSelection.includes(PRIZES.TIER_1);
  const selectedValuable = localSelection.find(p => PRIZE_DETAILS[p].isValuable); // The specific title selected
  const hasUnsavedChanges = localSelection.length > (user.claimedPrizes?.length || 0);

  // Can we show the "Confirm" button?
  const canConfirm = hasUnsavedChanges;

  // Can we show "Delivery"? (Must be confirmed in backend)
  const canRequestDelivery = confirmedBasic && !user.deliveryRequested;

  const PrizeCard: React.FC<{ prizeKey: string, threshold: number }> = ({ prizeKey, threshold }) => {
    const title = PRIZES[prizeKey as keyof typeof PRIZES];
    const details = PRIZE_DETAILS[title];
    const isConfirmed = user.claimedPrizes?.includes(title);
    const isSelectedLocally = localSelection.includes(title);
    const isUnlocked = bestScore >= threshold;
    
    // Progress calculation
    const progressPercent = Math.min(100, Math.max(0, (bestScore / threshold) * 100));
    
    // Visual Logic
    let cardStyle = "bg-white border-slate-200 shadow-sm";
    let buttonText = "Выбрать";
    let buttonStyle = "bg-slate-100 text-slate-400";
    let isDisabled = false;
    let overlayMessage = null;

    if (isConfirmed) {
        cardStyle = "bg-emerald-500 text-white border-emerald-500 shadow-md";
        buttonText = "В списке";
        buttonStyle = "bg-white/20 text-white";
        isDisabled = true;
    } else if (isSelectedLocally) {
        cardStyle = "bg-indigo-50 border-indigo-500 shadow-md ring-1 ring-indigo-500";
        buttonText = "Выбрано";
        buttonStyle = "bg-indigo-600 text-white shadow-lg scale-105";
    } else if (!isUnlocked) {
        cardStyle = "bg-slate-50 border-slate-100 opacity-80";
        buttonText = `Нужно ${threshold}`;
        isDisabled = false; // Allow click to show error
    } else {
        // Unlocked, not selected
        if (details.isValuable && selectedValuable && selectedValuable !== title) {
            // Another valuable is selected (Radio logic visually)
            cardStyle = "bg-slate-50 border-slate-100 opacity-60 grayscale-[0.5]";
            buttonText = "Другой выбран";
            overlayMessage = "Уже выбран другой ценный приз";
        } else if (confirmedValuable && details.isValuable) {
            // Already saved a valuable prize
            cardStyle = "bg-slate-50 border-slate-100 opacity-50";
            buttonText = "Недоступно";
            isDisabled = true;
        } else {
            // Available to select
            buttonStyle = "bg-slate-800 text-white hover:bg-slate-900 shadow-md active:scale-95";
        }
    }

    return (
        <div 
            onClick={() => !isDisabled && handleToggleSelection(title, details.isValuable, threshold)}
            className={`relative p-4 rounded-[30px] border transition-all duration-300 overflow-hidden group cursor-pointer ${cardStyle}`}
        >
            <div className="flex gap-4 items-center relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white ${isConfirmed ? 'ring-2 ring-white/30 text-emerald-500' : 'text-indigo-500'}`}>
                    {/* Replaced img with PrizeIcon */}
                    <PrizeIcon name={details.icon} className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`text-[10px] font-black uppercase tracking-wider mb-1 leading-tight ${isConfirmed ? 'text-white' : 'text-slate-800'}`}>
                        {details.title}
                    </h4>
                    {!isConfirmed && (
                       <p className="text-[9px] font-medium text-slate-400 leading-tight line-clamp-2">{details.description}</p>
                    )}
                    
                    {/* Progress Bar for Valuable Prizes */}
                    {details.isValuable && !isConfirmed && (
                        <div className="mt-2 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${isUnlocked ? 'bg-emerald-400' : 'bg-orange-400'}`} 
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
                 <div className={`text-[9px] font-black uppercase tracking-widest ${isConfirmed ? 'text-white/80' : 'text-slate-300'}`}>
                    {isUnlocked ? `${threshold} Pts` : `${Math.floor(progressPercent)}%`}
                 </div>
                 
                 <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${buttonStyle}`}>
                    {isConfirmed && <CheckIcon />}
                    {!isUnlocked && !isConfirmed ? <LockIcon /> : null}
                    <span>{buttonText}</span>
                 </div>
            </div>
        </div>
    );
  };

  return (
    <div className="w-full h-full bg-slate-50 overflow-auto custom-scrollbar">
      <div className="max-w-xl mx-auto min-h-full flex flex-col p-6 pb-20">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <button onClick={onBack} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 flex items-center gap-1 transition">
                ← Назад
            </button>
            <div className="flex items-center gap-2">
                <BoltIcon />
                <span className="text-xs font-black uppercase tracking-widest text-slate-800">Профиль</span>
            </div>
            <button onClick={onLogout} className="text-[10px] font-black uppercase text-red-300 hover:text-red-500 transition">
                Выход
            </button>
        </div>

        {/* User Card */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight mb-1">{user.name}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{user.city} • {user.phone}</p>
                
                <div className="flex gap-4">
                    <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                         <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mb-1">Рекорд</div>
                         <div className="text-2xl font-thin text-slate-800 leading-none">{bestScore}</div>
                         <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">(по коду)</div>
                    </div>
                    <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                         <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mb-1">Призы</div>
                         <div className="text-2xl font-thin text-emerald-500 leading-none">{user.claimedPrizes?.length || 0}<span className="text-slate-200">/2</span></div>
                    </div>
                </div>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-5">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
        </div>

        {/* Floating Error Message */}
        {tempError && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                <div className="bg-red-500 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="10" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/></svg>
                    {tempError}
                </div>
            </div>
        )}

        {/* Prize Selection Area */}
        <div className="space-y-8">
            
            {/* Mandatory Section */}
            <div>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-sm font-black text-slate-800 uppercase italic">Базовый Приз</h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Обязательно</span>
                </div>
                <PrizeCard prizeKey="TIER_1" threshold={THRESHOLDS.TIER_1} />
            </div>

            {/* Valuable Section */}
            <div>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-sm font-black text-slate-800 uppercase italic">Ценные Призы</h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Выберите один</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(PRIZES)
                        .filter(key => key !== 'TIER_1')
                        .sort((a, b) => THRESHOLDS[a as keyof typeof THRESHOLDS] - THRESHOLDS[b as keyof typeof THRESHOLDS])
                        .map(key => (
                            <PrizeCard key={key} prizeKey={key} threshold={THRESHOLDS[key as keyof typeof THRESHOLDS]} />
                        ))
                    }
                </div>
            </div>

            {/* Action Area (Confirm & Delivery) */}
            <div className="pt-6 pb-12 sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-40">
                 
                 {/* 1. Confirmation Button */}
                 {canConfirm && (
                    <button 
                        onClick={handleConfirmSelection}
                        disabled={loading}
                        className="w-full py-5 mb-4 bg-indigo-600 text-white font-black rounded-[35px] shadow-xl shadow-indigo-200 uppercase tracking-widest text-xs transition active:scale-95 hover:bg-indigo-700 flex items-center justify-center gap-2 animate-fade-in"
                    >
                        {loading ? 'Сохранение...' : 'Подтвердить выбор'}
                    </button>
                 )}

                 {/* 2. Delivery Button / Status */}
                 {user.deliveryRequested ? (
                     <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[30px] text-center">
                         <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                             <CheckIcon />
                         </div>
                         <h3 className="text-emerald-700 font-black uppercase text-xs tracking-widest mb-1">Заявка принята!</h3>
                         <p className="text-[10px] text-emerald-600/70 font-medium">Мы свяжемся с вами для уточнения деталей доставки.</p>
                     </div>
                 ) : (
                     <>
                        <button 
                            onClick={handleDeliveryRequest}
                            disabled={!canRequestDelivery || loading || canConfirm} // Disabled if unconfirmed changes exist
                            className={`w-full py-6 font-black rounded-[35px] shadow-xl uppercase tracking-widest text-xs transition active:scale-95 flex items-center justify-center gap-2 ${
                                canRequestDelivery && !canConfirm
                                ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {loading ? 'Обработка...' : 'Оформить доставку'}
                        </button>
                        
                        {!user.deliveryRequested && (
                            <div className="text-center mt-4 space-y-2">
                                {canConfirm && (
                                     <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest animate-pulse">
                                        Нажмите «Подтвердить выбор» для сохранения
                                    </p>
                                )}
                                {!confirmedBasic && !canConfirm && (
                                    <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">
                                        Необходимо выбрать и подтвердить Карту
                                    </p>
                                )}
                                {confirmedBasic && !canConfirm && user.claimedPrizes && user.claimedPrizes.length < 2 && (
                                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">
                                        Можете выбрать еще один ценный приз
                                    </p>
                                )}
                            </div>
                        )}
                     </>
                 )}
            </div>
        </div>

      </div>
    </div>
  );
};
