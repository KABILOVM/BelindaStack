
import React, { useState, useEffect } from 'react';
import { backend } from '../../services/mockBackend';
import { CITIES } from '../../types';

const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export const RegisterScreen = ({ onRegisterSuccess, onAdminLogin }: { onRegisterSuccess: () => void, onAdminLogin: () => void }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ name: '', city: '', phone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Admin Backdoor
    if (formData.name.toLowerCase() === 'admin' && formData.phone === '0000') { 
      onAdminLogin(); 
      return; 
    }

    if (!isLogin && (!formData.name || !formData.city || !formData.phone || !formData.password)) {
      setError("Заполните все поля");
      return;
    }
    if (isLogin && (!formData.phone || !formData.password)) {
      setError("Введите телефон и пароль");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await backend.loginUser(formData.phone, formData.password);
      } else {
        await backend.registerUser(formData.name, formData.city, formData.phone, formData.password);
      }
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white w-full max-w-md p-8 md:p-12 rounded-[60px] shadow-2xl shadow-slate-200/50">
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BoltIcon className="w-8 h-8 text-emerald-500 animate-pulse" />
            <h1 className="text-3xl font-black text-slate-800 italic tracking-tight leading-none uppercase">ЛАМБРОТИН</h1>
          </div>
          <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em]">Stack Challenge</p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex bg-slate-50 p-1.5 rounded-[20px] mb-8">
          <button 
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white shadow-md text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Новый игрок
          </button>
          <button 
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white shadow-md text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Уже играл
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input 
                type="text" 
                placeholder="ВАШЕ ИМЯ" 
                className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-slate-200 font-bold uppercase tracking-widest text-[11px] text-slate-700 transition-all placeholder:text-slate-300" 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                value={formData.name}
              />
              
              <div className="relative">
                <select 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className={`w-full p-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-slate-200 font-bold uppercase tracking-widest text-[11px] transition-all appearance-none cursor-pointer ${formData.city ? 'text-slate-700' : 'text-slate-300'}`}
                >
                  <option value="" disabled>ВЫБЕРИТЕ ГОРОД</option>
                  {CITIES.map(city => (
                    <option key={city} value={city} className="text-slate-800 font-bold">{city}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </>
          )}

          <input 
            type="tel" 
            placeholder="ТЕЛЕФОН" 
            className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-slate-200 font-bold uppercase tracking-widest text-[11px] text-slate-700 transition-all placeholder:text-slate-300" 
            onChange={e => setFormData({...formData, phone: e.target.value})} 
            value={formData.phone}
          />
          
          <input 
            type="password" 
            placeholder="ПАРОЛЬ" 
            className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-slate-200 font-bold uppercase tracking-widest text-[11px] text-slate-700 transition-all placeholder:text-slate-300" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            value={formData.password}
          />

          {error && <p className="text-red-400 text-center font-bold text-[10px] uppercase tracking-widest animate-pulse">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 bg-slate-800 text-white font-black rounded-3xl uppercase shadow-xl shadow-slate-200 transition active:scale-95 hover:bg-slate-900 mt-6 tracking-widest text-xs disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Регистрация')}
          </button>
        </form>
        
        <p className="text-center text-[9px] text-slate-300 mt-10 font-bold uppercase tracking-[0.2em] leading-relaxed flex items-center justify-center gap-1">
          <BoltIcon className="w-3 h-3" /> Lambrotin • Сироп от кашля №1
        </p>
      </div>
    </div>
  );
};

export const CodeScreen = ({ onCodeSuccess, onClose, onLogout }: { onCodeSuccess: (c: string | null) => void, onClose: () => void, onLogout: () => void }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const user = backend.getCurrentUser();
  const [trialCount, setTrialCount] = useState(0);
  const MAX_TRIALS = 3;

  useEffect(() => {
    if (user) {
      setTrialCount(backend.getTrialCount(user.id));
    }
  }, [user]);

  const handleTrial = () => {
    if (user && trialCount < MAX_TRIALS) {
      // Trial will be officially deducted when they start the game from tutorial
      onCodeSuccess(null);
    }
  };

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await backend.validateAndUseCode(code.toUpperCase(), user.id);
      onCodeSuccess(code.toUpperCase());
    } catch (err: any) { setError(err.message); }
  };

  const trialsRemaining = MAX_TRIALS - trialCount;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
      <div className="bg-white w-full max-w-md p-12 rounded-[65px] relative shadow-2xl animate-fade-in border border-white/50">
        <div className="flex justify-between items-center mb-10">
          <button onClick={onLogout} className="text-[10px] font-black uppercase text-slate-300 hover:text-red-400 transition tracking-[0.2em]">Выйти</button>
          <div className="flex items-center gap-1">
            <BoltIcon className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-black italic uppercase text-slate-800 tracking-tight">Старт</h2>
          </div>
          <button onClick={onClose} className="text-4xl font-light text-slate-100 hover:text-slate-300 transition leading-none">&times;</button>
        </div>
        <form onSubmit={handleCode} className="space-y-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="000000" 
              className="w-full p-8 text-center text-5xl font-black bg-slate-50 rounded-[40px] outline-none border-4 border-transparent focus:border-slate-100 uppercase tracking-[0.3em] text-slate-800 transition-all placeholder:text-slate-100" 
              value={code} 
              onChange={e => setCode(e.target.value)} 
            />
            <p className="text-center text-[10px] text-indigo-400 font-bold uppercase mt-6 tracking-[0.2em]">Код с упаковки Ламбротин</p>
          </div>
          {error && <p className="text-red-400 text-center font-black text-[10px] uppercase tracking-widest">{error}</p>}
          <button type="submit" className="w-full py-7 bg-slate-800 text-white font-black rounded-[35px] shadow-2xl shadow-slate-200 uppercase tracking-widest text-xs transition active:scale-95 hover:bg-slate-900">Играть по коду</button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          {trialsRemaining > 0 ? (
            <div className="space-y-4">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                Осталось пробных попыток: <span className="text-emerald-500">{trialsRemaining}</span>
              </p>
              <button onClick={handleTrial} className="w-full py-5 bg-emerald-50 text-emerald-600 font-black rounded-[30px] uppercase text-[10px] tracking-widest border border-emerald-100 transition active:scale-95 hover:bg-emerald-100/50 flex items-center justify-center gap-2">
                <BoltIcon className="w-3 h-3" /> Попробовать бесплатно
              </button>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-[35px] border border-dashed border-slate-200">
              <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Бесплатные попытки закончились.<br/>Введите код для получения призов.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
