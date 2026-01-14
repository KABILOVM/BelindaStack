
import React, { useState, useEffect } from 'react';
import { RegisterScreen, CodeScreen } from './components/UI/AuthScreens';
import { BelindaStackGame } from './components/Game/BelindaStackGame';
import { AdminPanel } from './components/UI/AdminPanel';
import { ProfileScreen } from './components/UI/ProfileScreen';
import { backend } from './services/mockBackend';
import { ScreenType, User, THRESHOLDS, PRIZES, PRIZE_DETAILS, GameResult } from './types';
import { sounds } from './services/SoundService';

const CrownIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
  </svg>
);

const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SoundIcon = ({ muted }: { muted: boolean }) => (
  muted ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  )
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
  </svg>
);

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M1.5 9.5a1.5 1.5 0 0 1 1.5-1.5h.77a2 2 0 0 0 1.98-1.73l.083-.497A2 2 0 0 1 7.81 4.5h8.38a2 2 0 0 1 1.977 1.273l.083.497A2 2 0 0 0 20.23 8h.77a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-.77a2 2 0 0 0-1.98 1.73l-.083.497A2 2 0 0 1 16.19 20.5H7.81a2 2 0 0 1-1.977-1.273l-.083-.497A2 2 0 0 0 3.77 17h-.77a1.5 1.5 0 0 1-1.5-1.5v-6ZM5 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm16 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM8 12a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Z" clipRule="evenodd" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

function App() {
  const [screen, setScreen] = useState<ScreenType>('register');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [userHistory, setUserHistory] = useState<GameResult[]>([]);
  const [isAdminTester, setIsAdminTester] = useState(false);
  const [muted, setMuted] = useState(false);
  const [trialsLeft, setTrialsLeft] = useState(0);
  
  const [viewingPrizeId, setViewingPrizeId] = useState<string | null>(null); // This stores the Prize Name (string)

  useEffect(() => {
    const user = backend.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setScreen('game');
      setTrialsLeft(3 - backend.getTrialCount(user.id));
      if (user.name.toLowerCase() !== 'admin') {
        setShowCodeEntry(true);
      }
    }
    setMuted(sounds.isMuted());
  }, []);

  useEffect(() => {
    if (currentUser) {
      backend.getUserResults(currentUser.id).then(history => setUserHistory(history));
      setTrialsLeft(3 - backend.getTrialCount(currentUser.id));
    }
  }, [currentUser, gameState]);

  const toggleMute = () => {
    const newVal = !muted;
    sounds.setMuted(newVal);
    setMuted(newVal);
  };

  const handleGameScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  const handleGameOver = async (finalScore: number) => {
    if (currentUser) {
      await backend.saveGameResult(currentUser.id, finalScore, isAdminTester ? 'ADMIN_TEST' : (activeCode || 'TRIAL'), !activeCode && !isAdminTester);
      setTrialsLeft(3 - backend.getTrialCount(currentUser.id));
      // Refresh user to get latest stats/claims
      const updated = await backend.refreshUser();
      if (updated) setCurrentUser(updated);
    }
    setGameState('ended');
  };

  const handleAdminTest = () => {
    setIsAdminTester(true);
    setScreen('game');
    setShowCodeEntry(false);
    setShowTutorial(false);
    setGameState('idle');
    setScore(0);
  };

  const handleRestart = () => {
    setGameState('idle');
    setScore(0);
    if (!isAdminTester) {
      if (!activeCode && trialsLeft <= 0) {
         setShowCodeEntry(true);
      } else if (!activeCode) {
        startTutorial(null);
      } else {
        setActiveCode(null);
        setShowCodeEntry(true);
      }
    }
  };

  const handleForceCodeEntry = () => {
    setGameState('idle');
    setScore(0);
    setActiveCode(null);
    setShowCodeEntry(true);
  }

  const startTutorial = (c: string | null) => {
    setActiveCode(c);
    setShowCodeEntry(false);
    setShowTutorial(true);
    setViewingPrizeId(null);
  };

  const startGameAfterTutorial = () => {
    if (!activeCode && !isAdminTester && currentUser) {
      backend.useTrial(currentUser.id);
    }
    setShowTutorial(false);
    setGameState('playing');
  };

  const bestScore = Math.max(score, ...userHistory.map(h => h.score), 0);
  const isTrial = !activeCode && !isAdminTester;

  // New logic: Just find next threshold to show progress
  const getNextThreshold = () => {
    const thresholds = Object.values(THRESHOLDS).sort((a,b) => a - b);
    const next = thresholds.find(t => t > score);
    if (!next) return null;
    
    // Find prize name for this threshold
    const tierKey = Object.keys(THRESHOLDS).find(key => THRESHOLDS[key as keyof typeof THRESHOLDS] === next);
    // If multiple keys map to same threshold, just pick one to show name
    const prizeName = PRIZES[tierKey as keyof typeof PRIZES];
    return { score: next, name: PRIZE_DETAILS[prizeName].title };
  };
  
  const nextGoal = getNextThreshold();

  const getThresholdForPrize = (prizeName: string): number => {
    const tierEntry = Object.entries(PRIZES).find(([_, name]) => name === prizeName);
    if (!tierEntry) return 0;
    return THRESHOLDS[tierEntry[0] as keyof typeof THRESHOLDS];
  };

  const renderPrizeModalContent = (actionButton: React.ReactNode) => {
    if (viewingPrizeId) {
      const details = PRIZE_DETAILS[viewingPrizeId];
      const points = getThresholdForPrize(viewingPrizeId);
      
      return (
        <div className="flex flex-col h-full animate-fade-in">
          <button 
            onClick={() => setViewingPrizeId(null)} 
            className="self-start mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <ArrowLeftIcon /> Назад к списку
          </button>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full aspect-square rounded-[35px] overflow-hidden shadow-sm mb-6 bg-slate-50">
              <img src={details.image} className="w-full h-full object-cover" alt={details.title} />
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-tight mb-2">{details.title}</h3>
            <div className="inline-block px-3 py-1 bg-emerald-50 rounded-lg text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-6">
              ТРЕБУЕТСЯ: {points} ОЧКОВ
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {details.description}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="text-center mb-6">
          <BoltIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <h2 className="text-2xl font-black text-slate-800 uppercase italic">ПРИЗЫ И ПРАВИЛА</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Максимум 2 приза (1 + 1)</p>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="p-4 bg-slate-50 rounded-[25px] border border-slate-100 mb-6 text-center">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Обязательное условие</p>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Вы можете забрать <span className="text-emerald-600 font-bold">Карту Ёвар</span> (10 очков)<br/>
              плюс <span className="text-slate-800 font-bold">ОДИН ценный приз</span> на выбор.
            </p>
          </div>
          
          <div className="space-y-3">
            {Object.entries(PRIZES).map(([tierKey, prizeName]) => {
              const details = PRIZE_DETAILS[prizeName];
              const points = THRESHOLDS[tierKey as keyof typeof THRESHOLDS];
              
              return (
                <div key={tierKey} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-[25px] shadow-sm hover:border-emerald-100 transition group cursor-pointer" onClick={() => setViewingPrizeId(prizeName)}>
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50">
                    <img src={details.image} className="w-full h-full object-cover" alt={details.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-800 text-[10px] uppercase truncate mb-1">{details.title}</div>
                    <div className="inline-flex px-2 py-1 bg-emerald-50 rounded-md text-[9px] text-emerald-600 font-black uppercase tracking-widest">
                      {points} ОЧКОВ
                    </div>
                  </div>
                  <button 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition"
                  >
                    <ArrowRightIcon />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-50">
          {actionButton}
        </div>
      </div>
    );
  };

  if (screen === 'admin') return <AdminPanel onBack={() => setScreen('game')} onTestGame={handleAdminTest} />;
  
  if (screen === 'profile' && currentUser) {
      return <ProfileScreen user={currentUser} onBack={() => setScreen('game')} onLogout={() => { backend.logout(); setScreen('register'); }} />;
  }

  if (screen === 'register') return <RegisterScreen onRegisterSuccess={() => { setCurrentUser(backend.getCurrentUser()); setScreen('game'); setShowCodeEntry(true); }} onAdminLogin={() => setScreen('admin')} />;

  return (
    <div id="game-background" className="relative w-full h-screen overflow-hidden transition-all duration-1000 bg-teal-100">
      <BelindaStackGame 
        gameState={gameState} 
        onGameStart={() => {}} 
        onGameOver={handleGameOver} 
        onScoreUpdate={handleGameScoreUpdate} 
      />

      <div className={`absolute top-[15%] left-0 w-full z-10 flex flex-col items-center pointer-events-none transition-opacity duration-500 ${gameState === 'idle' ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-white text-[120px] font-thin leading-none tracking-tighter drop-shadow-md">
          {score}
        </div>
        <div className="flex items-center gap-2 text-white/80 font-light text-2xl -mt-2">
          <CrownIcon />
          <span>{bestScore}</span>
        </div>
      </div>

      {gameState === 'idle' && !showCodeEntry && !showTutorial && !showRules && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-bounce">
           <button
              onClick={(e) => { e.stopPropagation(); setShowCodeEntry(true); }}
              className="bg-white/10 backdrop-blur-md border border-white/50 text-white px-10 py-6 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-white/20 transition active:scale-95 flex items-center gap-3"
           >
              <TicketIcon /> 
              <span>Ввести код</span>
           </button>
        </div>
      )}

      <div className="absolute top-8 left-8 z-20 flex flex-col gap-4">
        <button 
          onClick={() => {
            if (gameState === 'playing') {
               setGameState('idle');
               setScore(0);
            } else {
               setScreen('profile');
            }
          }} 
          className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 transition active:scale-90 relative"
        >
          {gameState === 'playing' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6"><path d="M15 18L9 12L15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
              <UserIcon />
          )}
          {currentUser?.claimedPrizes && currentUser.claimedPrizes.length > 0 && gameState !== 'playing' && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          )}
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); setShowCodeEntry(true); }}
          className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 transition active:scale-90"
        >
          <TicketIcon />
        </button>
        
        <button 
          onClick={() => { setShowRules(true); setViewingPrizeId(null); }}
          className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 transition active:scale-90"
        >
          <InfoIcon />
        </button>

        <button onClick={toggleMute} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 transition active:scale-90">
          <SoundIcon muted={muted} />
        </button>
      </div>

      {(currentUser?.name.toLowerCase() === 'admin' || isAdminTester) && (
        <div className="absolute top-8 right-8 z-20 flex gap-2">
          <button 
            onClick={() => { setScreen('admin'); setIsAdminTester(false); }} 
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 transition active:scale-90"
          >
            <SettingsIcon />
          </button>
        </div>
      )}

      {showCodeEntry && !isAdminTester && (
        <CodeScreen onCodeSuccess={startTutorial} onClose={() => setShowCodeEntry(false)} onLogout={() => { backend.logout(); setScreen('register'); }} />
      )}

      {/* MERGED TUTORIAL/RULES MODAL */}
      {showTutorial && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 animate-fade-in">
          <div className="bg-white w-full max-w-sm h-[70vh] max-h-[600px] rounded-[45px] p-8 shadow-2xl relative overflow-hidden">
            {renderPrizeModalContent(
              <button onClick={startGameAfterTutorial} className="w-full py-5 bg-slate-800 text-white rounded-[30px] font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2 transition active:scale-95 hover:bg-slate-900">
                <BoltIcon className="w-4 h-4" /> Начать игру
              </button>
            )}
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {gameState === 'ended' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-6 animate-fade-in">
          <div className="bg-slate-300/40 backdrop-blur-2xl w-full max-w-xs rounded-[55px] p-8 text-center shadow-2xl relative overflow-hidden border border-white/30">
            <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4 opacity-70">Твой результат</h2>
            <div className="text-8xl font-thin text-slate-800 mb-8 leading-none">{score}</div>
            
            {isTrial ? (
              <div className="mb-8 space-y-4">
                 <div className="p-4 bg-white/40 rounded-[35px] border border-white/30 shadow-inner backdrop-blur-sm">
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest leading-relaxed">
                      В пробном режиме<br/>призы не выдаются
                    </p>
                 </div>
                 {trialsLeft > 0 ? (
                    <p className="text-[9px] text-slate-200 font-bold uppercase tracking-[0.2em]">
                      Осталось попыток: <span className="text-white text-base">{trialsLeft}</span>
                    </p>
                 ) : (
                    <div className="space-y-2">
                       <p className="text-[9px] text-slate-200 font-bold uppercase tracking-[0.2em]">Попытки закончились</p>
                       <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider leading-relaxed">
                         Купите сироп Ламбротин,<br/>чтобы получить код для игры
                       </p>
                    </div>
                 )}
              </div>
            ) : (
                <div className="mb-8 p-5 bg-white/40 rounded-[35px] border border-white/30 shadow-inner backdrop-blur-sm">
                  {score >= THRESHOLDS.TIER_1 ? (
                      <div className="space-y-2">
                          <p className="text-[9px] text-emerald-700 font-black uppercase tracking-widest">
                            Отличный результат!
                          </p>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">
                            Вы разблокировали призы. Перейдите в профиль, чтобы выбрать приз.
                          </p>
                      </div>
                  ) : nextGoal && (
                    <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.15em] leading-relaxed">
                        <span className="opacity-60">не хватило</span> <span className="text-emerald-700 text-lg">{nextGoal.score - score}</span> {score % 10 === 1 ? 'очка' : 'очков'}<br/>
                        <span className="opacity-60">до приза:</span> {nextGoal.name}
                    </p>
                  )}
                </div>
            )}

            {score >= THRESHOLDS.TIER_1 && !isTrial && (
                 <button onClick={() => setScreen('profile')} className="w-full py-4 mb-3 bg-emerald-500 text-white font-black uppercase rounded-[30px] shadow-lg tracking-widest text-xs flex items-center justify-center gap-2 transition active:scale-95 hover:bg-emerald-600 border border-emerald-400">
                    <UserIcon /> К выбору приза
                 </button>
            )}

            {isTrial && (
                <button onClick={() => { setShowRules(true); setViewingPrizeId(null); }} className="w-full py-4 mb-3 bg-white/80 text-slate-700 font-black uppercase rounded-[30px] shadow-lg tracking-widest text-xs flex items-center justify-center gap-2 transition active:scale-95 hover:bg-white border border-white/50 backdrop-blur-sm">
                    <InfoIcon /> Узнать про призы
                </button>
            )}

            {isTrial && trialsLeft <= 0 ? (
               <button onClick={handleForceCodeEntry} className="w-full py-5 bg-slate-800 text-white font-black uppercase rounded-[30px] shadow-lg tracking-widest text-xs flex items-center justify-center gap-2 transition active:scale-95 hover:bg-slate-900 border border-slate-700">
                  <TicketIcon /> Ввести код
               </button>
            ) : (
               <button onClick={handleRestart} className="w-full py-5 bg-slate-800 text-white font-black uppercase rounded-[30px] shadow-lg tracking-widest text-xs flex items-center justify-center gap-2 transition active:scale-95 hover:bg-slate-900 border border-slate-700">
                  <BoltIcon className="w-4 h-4" /> {isTrial ? 'Еще раз' : 'Играть снова'}
               </button>
            )}
          </div>
        </div>
      )}

      {/* INFO BUTTON MODAL */}
      {showRules && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6" onClick={() => setShowRules(false)}>
          <div className="bg-white w-full max-w-sm h-[70vh] max-h-[600px] rounded-[45px] p-8 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            {renderPrizeModalContent(
              <button onClick={() => setShowRules(false)} className="w-full py-5 bg-slate-100 text-slate-500 rounded-[30px] font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition">
                Закрыть
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
