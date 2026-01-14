
import React, { useState, useEffect } from 'react';
import { RegisterScreen, CodeScreen } from './components/UI/AuthScreens';
import { BelindaStackGame } from './components/Game/BelindaStackGame';
import { AdminPanel } from './components/UI/AdminPanel';
import { ProfileScreen } from './components/UI/ProfileScreen';
import { backend } from './services/mockBackend';
import { ScreenType, User, THRESHOLDS, PRIZES, PRIZE_DETAILS, GameResult } from './types';
import { sounds } from './services/SoundService';
import { PrizeIcon } from './components/UI/PrizeIcons';

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

  const bestScore = Math.max(score, ...userHistory.map(r => r.score), 0);
  
  // Logic to show prize modal
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'ended') {
      // Logic for checking prize unlocks if needed immediately
    }
  }, [score, gameState]);

  const handleLogout = () => {
      backend.logout();
      setCurrentUser(null);
      setScreen('register');
      setGameState('idle');
      setScore(0);
      setShowCodeEntry(false);
  };

  if (screen === 'register') {
    return <RegisterScreen onRegisterSuccess={() => {
        const u = backend.getCurrentUser();
        setCurrentUser(u);
        setScreen('game');
        if (u && u.name.toLowerCase() !== 'admin') {
            setShowCodeEntry(true);
            setTrialsLeft(3 - backend.getTrialCount(u.id));
        }
    }} onAdminLogin={() => setScreen('admin')} />;
  }

  if (screen === 'admin') {
    return <AdminPanel onBack={() => setScreen('register')} onTestGame={handleAdminTest} />;
  }

  if (screen === 'profile' && currentUser) {
      return <ProfileScreen user={currentUser} onBack={() => setScreen('game')} onLogout={handleLogout} />;
  }

  return (
    <div className="w-full h-full relative bg-slate-100 overflow-hidden font-sans">
      
      {/* Background Gradient */}
      <div id="game-background" className="absolute inset-0 bg-gradient-to-b from-[#d6e8f5] to-[#aed9e0] transition-all duration-1000 ease-in-out"></div>

      {/* Main Game Component */}
      <BelindaStackGame 
        onGameOver={handleGameOver} 
        onScoreUpdate={handleGameScoreUpdate}
        gameState={gameState}
        onGameStart={() => {
            if (gameState === 'idle') {
                if (!activeCode && trialsLeft <= 0 && !isAdminTester) {
                    setShowCodeEntry(true);
                    return;
                }
                if (!isAdminTester && (activeCode || trialsLeft > 0)) {
                    // Need to show tutorial if not playing yet? 
                    // Actually Game component handles clicks to start, 
                    // but we control state.
                }
            }
        }}
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          <div className="pointer-events-auto flex flex-col gap-2">
            <button 
              onClick={() => setShowRules(true)}
              className="bg-white/80 backdrop-blur-md p-3 rounded-full text-slate-400 hover:text-slate-600 shadow-lg shadow-slate-200/50 transition active:scale-95"
            >
              <InfoIcon />
            </button>
            <button 
              onClick={toggleMute}
              className="bg-white/80 backdrop-blur-md p-3 rounded-full text-slate-400 hover:text-slate-600 shadow-lg shadow-slate-200/50 transition active:scale-95"
            >
              <SoundIcon muted={muted} />
            </button>
          </div>
          
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
             <div className="bg-white/90 backdrop-blur-xl px-6 py-4 rounded-[30px] shadow-xl shadow-indigo-100/50 border border-white flex flex-col items-center min-w-[100px]">
                <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-1">Очки</span>
                <span className="text-4xl font-black text-slate-800 leading-none tracking-tight">{score}</span>
             </div>
             
             {currentUser && currentUser.name.toLowerCase() !== 'admin' && (
                <div className="flex gap-2">
                    <button 
                        onClick={() => setScreen('profile')}
                        className="bg-slate-800 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-900 transition flex items-center gap-2"
                    >
                       <UserIcon /> {currentUser.name}
                    </button>
                    {!activeCode && (
                        <button 
                            onClick={handleForceCodeEntry}
                            className="bg-white text-indigo-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-50 transition flex items-center gap-2"
                        >
                            <TicketIcon /> Ввести код
                        </button>
                    )}
                </div>
             )}
          </div>
        </div>

        {/* Bottom Bar - Only show when IDLE (Start Screen) */}
        {gameState === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center animate-fade-in pointer-events-auto">
                    <div className="mb-4">
                        <BoltIcon className="w-12 h-12 text-slate-800 mx-auto animate-bounce" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-800 uppercase italic tracking-tighter mb-4 drop-shadow-sm leading-none">
                        Stack<br/><span className="text-emerald-500">Challenge</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs mb-10">Нажми чтобы начать</p>
                    
                    {activeCode && (
                        <div className="bg-emerald-500 text-white px-6 py-2 rounded-full inline-block text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 animate-pulse">
                            Активен код: {activeCode}
                        </div>
                    )}
                    {!activeCode && !isAdminTester && trialsLeft > 0 && (
                        <div className="bg-slate-800 text-white px-6 py-2 rounded-full inline-block text-[10px] font-black uppercase tracking-widest shadow-xl">
                            Пробный режим ({trialsLeft})
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>

      {/* Code Entry Modal */}
      {showCodeEntry && (
        <CodeScreen 
            onCodeSuccess={(code) => startTutorial(code)} 
            onClose={() => {
                if (trialsLeft > 0) setShowCodeEntry(false);
                // else keep open? User needs code to play if no trials
            }} 
            onLogout={handleLogout}
        />
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
              <div className="bg-white w-full max-w-sm p-8 rounded-[50px] shadow-2xl animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-emerald-400"></div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-6 text-center">Как играть</h3>
                  
                  <div className="space-y-6">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-black text-xl shadow-sm">1</div>
                          <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed">Нажимай на экран, когда блок находится над башней</p>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-black text-xl shadow-sm">2</div>
                          <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed">Лишние части блока будут обрезаны</p>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 font-black text-xl shadow-sm">3</div>
                          <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed">Набери очки, чтобы открыть призы!</p>
                      </div>
                  </div>

                  <button 
                    onClick={startGameAfterTutorial}
                    className="w-full mt-8 py-5 bg-slate-800 text-white font-black rounded-[25px] shadow-xl uppercase tracking-widest text-xs hover:bg-slate-900 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    Погнали! <ArrowRightIcon />
                  </button>
              </div>
          </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6" onClick={() => setShowRules(false)}>
          <div className="bg-white w-full max-w-md p-10 rounded-[50px] shadow-2xl animate-fade-in relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowRules(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-500 text-2xl font-light">&times;</button>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic mb-8 tracking-tight">Правила</h2>
            
            <div className="space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
                <div>
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Цель</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">Построй самую высокую башню из блоков Ламбротин. Чем точнее попадание, тем выше башня.</p>
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Призы</h4>
                    <div className="space-y-3 mt-3">
                        {Object.entries(THRESHOLDS).map(([key, val]) => (
                            <div key={key} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-600 uppercase">{PRIZES[key as keyof typeof PRIZES]}</span>
                                <span className="text-[10px] font-black text-slate-400">{val} очков</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Важно</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">Для получения призов необходимо ввести код с упаковки. Пробная игра не дает права на призы.</p>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'ended' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/20 backdrop-blur-sm p-6">
           <div className="bg-white p-10 rounded-[60px] shadow-2xl text-center max-w-sm w-full animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <div className="mb-6">
                <div className="inline-block p-4 rounded-full bg-slate-50 mb-4 shadow-inner">
                    <CrownIcon />
                </div>
                <h2 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter mb-1">Конец Игры</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Твой результат</p>
              </div>

              <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600 mb-8 leading-none">
                {score}
              </div>

              {score > bestScore && (
                 <div className="mb-8 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border border-amber-100 animate-pulse">
                    Новый Рекорд!
                 </div>
              )}

              <div className="space-y-3">
                  <button 
                    onClick={handleRestart}
                    className="w-full py-5 bg-slate-800 text-white font-black rounded-[30px] shadow-xl shadow-slate-300 uppercase tracking-widest text-xs hover:bg-slate-900 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">↺</div>
                    Играть снова
                  </button>
                  
                  {currentUser && currentUser.name.toLowerCase() !== 'admin' && (
                      <button 
                        onClick={() => setScreen('profile')}
                        className="w-full py-5 bg-white text-slate-600 font-black rounded-[30px] border-2 border-slate-100 uppercase tracking-widest text-xs hover:bg-slate-50 transition active:scale-95"
                      >
                        Мои Призы
                      </button>
                  )}
              </div>
           </div>
        </div>
      )}
      
      {/* Prize Unlocked Modal (Transient) */}
      {viewingPrizeId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-fade-in" onClick={() => setViewingPrizeId(null)}>
            <div className="bg-white w-full max-w-xs p-8 rounded-[45px] text-center shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center bg-white shadow-2xl ring-4 ring-white/50 text-emerald-500">
                        {/* Replaced img with PrizeIcon */}
                        <PrizeIcon name={PRIZE_DETAILS[viewingPrizeId].icon} className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase italic mb-2 leading-tight">Открыт приз!</h3>
                    <p className="text-sm font-bold text-emerald-500 uppercase tracking-wide mb-6">{PRIZE_DETAILS[viewingPrizeId].title}</p>
                    <button onClick={() => setViewingPrizeId(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition">
                        Круто!
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

export default App;
