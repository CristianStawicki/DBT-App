/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Heart, 
  Zap, 
  Users, 
  Plus, 
  Calendar, 
  BookOpen, 
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  X,
  Smile,
  Frown,
  Meh,
  Wind,
  Sparkles,
  MessageSquare,
  Loader2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { es, pl } from 'date-fns/locale';
import { cn } from './lib/utils';
import { DBT_SKILLS, type Skill, type DailyLog, type DBTModule, type AIResponse } from './types';
import { analyzeEmotions } from './services/aiService';

const MODULE_COLORS: Record<DBTModule, string> = {
  'Uważność': 'bg-blue-50 text-blue-700 border-blue-200',
  'Tolerancja na stres': 'bg-orange-50 text-orange-700 border-orange-200',
  'Regulacja emocji': 'bg-purple-50 text-purple-700 border-purple-200',
  'Skuteczność interpersonalna': 'bg-green-50 text-green-700 border-green-200',
};

const MODULE_ICONS: Record<DBTModule, React.ReactNode> = {
  'Uważność': <Brain className="w-5 h-5" />,
  'Tolerancja na stres': <Zap className="w-5 h-5" />,
  'Regulacja emocji': <Heart className="w-5 h-5" />,
  'Skuteczność interpersonalna': <Users className="w-5 h-5" />,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'skills' | 'diary' | 'crisis' | 'ai'>('home');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  
  // Log Modal State
  const [logNotes, setLogNotes] = useState('');
  
  // AI State
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Feedback after saving log
  const [logFeedback, setLogFeedback] = useState<AIResponse | null>(null);
  const [isSavingLog, setIsSavingLog] = useState(false);
  
  // Delete Confirmation State
  const [logToDelete, setLogToDelete] = useState<string | null>(null);

  // Load logs from localStorage and migrate if necessary
  useEffect(() => {
    const savedLogs = localStorage.getItem('dbt_logs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        // Migracja: Upewnij się, że wszystkie wpisy mają unikalny identyfikator
        const migratedLogs = parsedLogs.map((log: any) => ({
          ...log,
          id: log.id || (Math.random().toString(36).substring(2, 9) + Date.now())
        }));
        setLogs(migratedLogs);
        
        // Zapisz ponownie, jeśli nastąpiły zmiany w wyniku migracji
        if (JSON.stringify(migratedLogs) !== savedLogs) {
          localStorage.setItem('dbt_logs', JSON.stringify(migratedLogs));
        }
      } catch (e) {
        console.error("Błąd podczas ładowania wpisów:", e);
      }
    }
  }, []);

  const saveLog = async (newLog: Omit<DailyLog, 'id'>) => {
    setIsSavingLog(true);
    
    // Perform AI analysis in background for feedback
    let feedback: AIResponse | null = null;
    try {
      feedback = await analyzeEmotions(newLog.notes);
    } catch (e: any) {
      console.error("Błąd podczas analizy AI:", e);
      // Opcjonalnie: Poinformuj użytkownika o braku klucza API
      if (e.message?.includes("Clave de API")) {
        alert("Błąd: Brak klucza API Gemini. Skonfiguruj VITE_GEMINI_API_KEY w pliku .env.");
      }
    }

    const logWithId: DailyLog = { 
      ...newLog, 
      id: Math.random().toString(36).substring(2, 9) + Date.now(),
      aiFeedback: feedback || undefined
    };

    setLogs(prevLogs => {
      const updatedLogs = [logWithId, ...prevLogs];
      localStorage.setItem('dbt_logs', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
    
    setShowLogModal(false);
    setLogNotes(''); // Reset notes
    setIsSavingLog(false);
    
    if (feedback) {
      setLogFeedback(feedback);
    }
  };

  const deleteLog = (id: string) => {
    setLogs(prevLogs => {
      const updatedLogs = prevLogs.filter(log => log.id !== id);
      localStorage.setItem('dbt_logs', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  const closeLogModal = () => {
    setShowLogModal(false);
    setLogNotes('');
  };

  const handleAiAnalysis = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const result = await analyzeEmotions(aiInput);
      setAiResult(result);
    } catch (err: any) {
      setAiError(err.message || "Przepraszam, nie mogłem przetworzyć Twojej wiadomości. Spróbuj ponownie.");
      if (err.message?.includes("Clave de API")) {
        alert("Błąd: Brak klucza API Gemini. Skonfiguruj VITE_GEMINI_API_KEY w pliku .env.");
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2D2D] font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">DBT Companion</h1>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mądry Umysł</p>
        </div>
        <button 
          onClick={() => setActiveTab('crisis')}
          className="bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"
          title="Crisis"
        >
          <AlertCircle className="w-6 h-6" />
        </button>
      </header>

      <main className="max-w-md mx-auto px-6 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-light mb-2">Cześć, jak się dziś czujesz?</h2>
                <p className="text-gray-500 text-sm mb-6">Poświęć chwilę, aby zarejestrować swoje emocje i umiejętności.</p>
                <button 
                  onClick={() => setShowLogModal(true)}
                  className="w-full bg-[#141414] text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-5 h-5" />
                  Nowy wpis do dziennika
                </button>
              </section>

              <section>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-lg font-medium">Sugerowane umiejętności</h3>
                  <button onClick={() => setActiveTab('skills')} className="text-sm text-blue-600 font-medium">Zobacz wszystkie</button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {DBT_SKILLS.slice(0, 3).map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("p-2 rounded-xl", MODULE_COLORS[skill.module].split(' ')[0])}>
                          {MODULE_ICONS[skill.module]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{skill.name}</p>
                          <p className="text-xs text-gray-400">{skill.module}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  ))}
                </div>
              </section>

              {logs.length > 0 && (
                <section>
                  <h3 className="text-lg font-medium mb-4">Ostatnie wpisy</h3>
                  <div className="space-y-3">
                    {logs.slice(0, 3).map(log => (
                      <div key={log.id} className="p-4 bg-white rounded-2xl border border-gray-100 relative group">
                        <button 
                          onClick={() => setLogToDelete(log.id)}
                          className="absolute top-2 right-2 p-2 text-gray-200 hover:text-red-500 transition-all"
                          title="Usuń wpis"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="flex justify-between items-start mb-2 pr-6">
                          <p className="text-sm font-medium text-gray-500">
                            {format(new Date(log.date), "EEEE, d MMMM", { locale: pl })}
                          </p>
                          <div className="flex gap-1">
                            {Array.from({ length: log.mood }).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-blue-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm line-clamp-2 text-gray-600 italic">"{log.notes}"</p>
                        {log.aiFeedback && (
                          <button 
                            onClick={() => setLogFeedback(log.aiFeedback!)}
                            className="mt-2 flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            ANALIZA AI
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-light">Biblioteka umiejętności</h2>
              
              {(['Uważność', 'Tolerancja na stres', 'Regulacja emocji', 'Skuteczność interpersonalna'] as DBTModule[]).map(module => (
                <div key={module} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mt-4">{module}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {DBT_SKILLS.filter(s => s.module === module).map(skill => (
                      <button
                        key={skill.id}
                        onClick={() => setSelectedSkill(skill)}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-xl", MODULE_COLORS[skill.module].split(' ')[0])}>
                            {MODULE_ICONS[skill.module]}
                          </div>
                          <p className="font-medium text-sm">{skill.name}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'diary' && (
            <motion.div
              key="diary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-light">Twój dziennik</h2>
                <button 
                  onClick={() => setShowLogModal(true)}
                  className="p-2 bg-[#141414] text-white rounded-full"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-20">
                  <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400">Nie masz jeszcze żadnych wpisów.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map(log => (
                    <div key={log.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
                      <button 
                        onClick={() => setLogToDelete(log.id)}
                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-all"
                        title="Usuń wpis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex justify-between items-center mb-4 pr-8">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">
                          {format(new Date(log.date), "dd MMM yyyy", { locale: pl })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Nastrój:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(v => (
                              <div key={v} className={cn("w-2 h-2 rounded-full", v <= log.mood ? "bg-blue-500" : "bg-gray-100")} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{log.notes}</p>
                      
                      {log.aiFeedback && (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                          <button 
                            onClick={() => setLogFeedback(log.aiFeedback!)}
                            className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                          >
                            <Sparkles className="w-3 h-3" />
                            ZOBACZ ANALIZĘ AI
                          </button>
                        </div>
                      )}

                      {log.skillsUsed.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {log.skillsUsed.map(s => (
                            <span key={s} className="px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-100">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-light">Asystent AI</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Wsparcie DBT w czasie rzeczywistym</p>
                </div>
              </div>

              {!aiResult ? (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Podziel się swoimi myślami, emocjami lub trudną sytuacją. Przeanalizuję, co się dzieje i zasugeruję umiejętności DBT, które mogą Ci pomóc.
                  </p>
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Czuję się bardzo przytłoczony, ponieważ..."
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[150px] text-sm"
                  />
                  <button
                    onClick={handleAiAnalysis}
                    disabled={isAiLoading || !aiInput.trim()}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-5 h-5" />
                    )}
                    Analizuj z AI
                  </button>
                  {aiError && <p className="text-xs text-red-500 text-center">{aiError}</p>}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-indigo-900">Analiza</h3>
                      <button 
                        onClick={() => { setAiResult(null); setAiInput(''); }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Nowa analiza
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed italic">"{aiResult.analysis}"</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {aiResult.identifiedEmotions.map(emotion => (
                        <span key={emotion} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-full">
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg space-y-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Praktyczna porada
                    </h3>
                    <p className="text-sm opacity-90 leading-relaxed">{aiResult.advice}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Polecane umiejętności</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {aiResult.suggestedSkills.map(skillId => {
                        const skill = DBT_SKILLS.find(s => s.id === skillId);
                        if (!skill) return null;
                        return (
                          <button
                            key={skill.id}
                            onClick={() => setSelectedSkill(skill)}
                            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-xl", MODULE_COLORS[skill.module].split(' ')[0])}>
                                {MODULE_ICONS[skill.module]}
                              </div>
                              <p className="font-medium text-sm">{skill.name}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'crisis' && (
            <motion.div
              key="crisis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-700 mb-2">Tryb kryzysowy</h2>
                <p className="text-red-600 text-sm">Oddychaj. Jesteś bezpieczny. Razem obniżymy intensywność.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Umiejętności przetrwania</h3>
                
                <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                        <Wind className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold">Spokojne oddychanie</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Wdech przez 4 sekundy, zatrzymaj na 2, wydech przez 6 sekund.</p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: ["0%", "100%", "0%"] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                        <Zap className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold">Umiejętności TIPP</h4>
                    </div>
                    <ul className="space-y-3">
                      {['Temperatura: Przemyj twarz bardzo zimną wodą.', 'Intensywne ćwiczenia: Zrób 20 pajacyków lub biegnij w miejscu.', 'Spokojne oddychanie: Skup się na długich wydechach.'].map((tip, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-6 py-3 flex justify-around items-center">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<BookOpen className="w-6 h-6" />} label="Start" />
        <NavButton active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} icon={<Brain className="w-6 h-6" />} label="Umiejętności" />
        <NavButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Sparkles className="w-6 h-6" />} label="Asystent" />
        <NavButton active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} icon={<Calendar className="w-6 h-6" />} label="Dziennik" />
      </nav>

      {/* Log Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLogModal}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-light">Nowy wpis</h2>
                <button onClick={closeLogModal} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveLog({
                  date: new Date().toISOString(),
                  mood: Number(formData.get('mood')),
                  anxiety: Number(formData.get('anxiety')),
                  notes: logNotes,
                  skillsUsed: [],
                });
              }} className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">Nastrój</label>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map(v => (
                      <label key={v} className="flex-1 cursor-pointer group">
                        <input type="radio" name="mood" value={v} className="sr-only peer" defaultChecked={v === 3} />
                        <div className="h-12 flex items-center justify-center rounded-2xl border border-gray-100 peer-checked:bg-blue-50 peer-checked:border-blue-200 peer-checked:text-blue-600 transition-all">
                          {v === 1 && <Frown className="w-6 h-6" />}
                          {v === 2 && <Meh className="w-5 h-5 opacity-70" />}
                          {v === 3 && <Meh className="w-6 h-6" />}
                          {v === 4 && <Smile className="w-5 h-5 opacity-70" />}
                          {v === 5 && <Smile className="w-6 h-6" />}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">Poziom lęku</label>
                  <input type="range" name="anxiety" min="1" max="5" defaultValue="3" className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">
                    <span>Niski</span>
                    <span>Średni</span>
                    <span>Wysoki</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-400 uppercase tracking-widest">Notatki / Obserwacje</label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!logNotes.trim()) return;
                        setIsSavingLog(true);
                        try {
                          const feedback = await analyzeEmotions(logNotes);
                          setLogFeedback(feedback);
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setIsSavingLog(false);
                        }
                      }}
                      disabled={isSavingLog || !logNotes.trim()}
                      className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-700 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      Wsparcie AI
                    </button>
                  </div>
                  <textarea 
                    name="notes"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Co się dzisiaj stało? Jak się czułeś? (AI pomoże Ci dobrać umiejętności)"
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[120px]"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSavingLog}
                  className="w-full bg-[#141414] text-white py-4 rounded-2xl font-medium shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSavingLog && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isSavingLog ? 'Zapisywanie...' : 'Zapisz wpis'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSkill(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3 rounded-2xl mb-4 inline-block", MODULE_COLORS[selectedSkill.module].split(' ')[0])}>
                  {MODULE_ICONS[selectedSkill.module]}
                </div>
                <button onClick={() => setSelectedSkill(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-2">{selectedSkill.name}</h2>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-6">{selectedSkill.module}</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Opis</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedSkill.description}</p>
                </div>

                {selectedSkill.steps && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Kroki do wykonania</h3>
                    <ul className="space-y-4">
                      {selectedSkill.steps.map((step, i) => (
                        <li key={i} className="flex gap-4 items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                            {i + 1}
                          </span>
                          <p className="text-sm text-gray-600 pt-0.5">{step}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedSkill(null)}
                className="w-full mt-8 bg-gray-100 text-gray-900 py-4 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
              >
                Rozumiem
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {logToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xs bg-white rounded-[32px] p-8 shadow-2xl text-center"
            >
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold mb-2">Usunąć wpis?</h2>
              <p className="text-sm text-gray-500 mb-8">Tej akcji nie można cofnąć.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    deleteLog(logToDelete);
                    setLogToDelete(null);
                  }}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-medium hover:bg-red-600 transition-colors"
                >
                  Tak, usuń
                </button>
                <button 
                  onClick={() => setLogToDelete(null)}
                  className="w-full bg-gray-100 text-gray-900 py-4 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Anuluj
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post-Save Feedback Modal */}
      <AnimatePresence>
        {logFeedback && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogFeedback(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <button onClick={() => setLogFeedback(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-2">Wsparcie i analiza</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Informacja zwrotna od Twojego asystenta</p>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 italic text-sm text-gray-600 leading-relaxed">
                  "{logFeedback.analysis}"
                </div>

                <div className="flex flex-wrap gap-2">
                  {logFeedback.identifiedEmotions.map(emotion => (
                    <span key={emotion} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-full">
                      {emotion}
                    </span>
                  ))}
                </div>

                <div className="bg-indigo-600 p-6 rounded-2xl text-white space-y-3">
                  <h3 className="font-bold flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4" />
                    Sugestia wsparcia
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed">{logFeedback.advice}</p>
                </div>

                {logFeedback.suggestedSkills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Polecane umiejętności</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {logFeedback.suggestedSkills.map(skillId => {
                        const skill = DBT_SKILLS.find(s => s.id === skillId);
                        if (!skill) return null;
                        return (
                          <button
                            key={skill.id}
                            onClick={() => {
                              setLogFeedback(null);
                              setSelectedSkill(skill);
                            }}
                            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-xl", MODULE_COLORS[skill.module].split(' ')[0])}>
                                {MODULE_ICONS[skill.module]}
                              </div>
                              <p className="font-medium text-sm">{skill.name}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setLogFeedback(null)}
                className="w-full mt-8 bg-gray-100 text-gray-900 py-4 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
              >
                Dziękuję za wsparcie
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-[#141414]" : "text-gray-300 hover:text-gray-400"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {active && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#141414] rounded-full" />}
    </button>
  );
}
