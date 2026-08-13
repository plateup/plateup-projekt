import React, { useState } from 'react';
import SetRow from './SetRow';
import { MoreHorizontal, Plus, Timer, Edit3, Trash2, Dumbbell, Info, X } from 'lucide-react';
import { ModalPortal } from '../../components/ui';
import RestTimerModal from './RestTimerModal';
import PlateCalculator from './PlateCalculator';

export default function ExerciseCard({ 
  exercise, 
  updateSet, 
  toggleSetComplete, 
  toggleSetType,
  addSetToExercise,
  removeSetFromExercise,
  duplicateSetInExercise,
  updateExerciseRestDuration,
  updateExerciseNote,
  onRequestReplace,
  isDisabled,
  activeRestSetId,
  restTime
}) {
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRpeInfo, setShowRpeInfo] = useState(false);
  const [showAddedWeightInfo, setShowAddedWeightInfo] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [localNote, setLocalNote] = useState(exercise.note || '');

  // Funkcja pomocnicza: formatRest

  const formatRest = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isBarbellExercise = exercise.equipment === 'Barbell' ||
                            exercise.name.toLowerCase().includes('barbell') || 
                            exercise.name.toLowerCase().includes('sztang');

  const isBodyweightExercise = exercise.equipment === 'Bodyweight' ||
                               exercise.name.toLowerCase().includes('dip') || 
                               exercise.name.toLowerCase().includes('pull-up') ||
                               exercise.name.toLowerCase().includes('pull up') ||
                               exercise.name.toLowerCase().includes('chin-up') ||
                               exercise.name.toLowerCase().includes('chin up') ||
                               exercise.name.toLowerCase().includes('muscle-up') ||
                               exercise.name.toLowerCase().includes('muscle up') ||
                               exercise.name.toLowerCase().includes('push-up') ||
                               exercise.name.toLowerCase().includes('push up');

  // Zwraca interfejs użytkownika (JSX) dla tego komponentu

  return (
    <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] transition-all hover:border-white/10 shadow-lg relative">
      <div className="p-6 md:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-black text-lg border border-white/5">
              {exercise.name[0]}
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white leading-none mb-2">{exercise.name}</h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowTimerModal(true)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#8E8E93] hover:text-white transition-colors"
                >
                  <Timer size={12} />
                  Rest: {formatRest(exercise.restDuration || 90)}
                </button>
                {isBarbellExercise && (
                  <button 
                    onClick={() => setShowPlateCalc(true)}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#8E8E93] hover:text-white transition-colors"
                  >
                    <Dumbbell size={12} />
                    Calc
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <button 
              onClick={() => setShowOptions(true)}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Notes (Scratchpad) */}
        {(exercise.note || isEditingNote) && (
          <div className="mb-6 animate-in fade-in duration-300">
            <textarea
              className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-sm text-white/90 placeholder:text-white/30 focus:border-indigo-500/50 outline-none resize-none transition-all"
              placeholder="Zanotuj np. ustawienie maszyny..."
              value={localNote}
              rows={2}
              onChange={(e) => setLocalNote(e.target.value)}
              onBlur={() => {
                setIsEditingNote(false);
                if (updateExerciseNote) updateExerciseNote(exercise.id, localNote);
              }}
              autoFocus={isEditingNote}
            />
          </div>
        )}

        <div className="space-y-4">
          {/* Labels */}
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_60px] gap-3 text-center text-[10px] font-black text-[#8E8E93] uppercase tracking-widest px-2">
            <span>Set</span>
            {isBodyweightExercise ? (
              <span className="flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors" onClick={() => setShowAddedWeightInfo(true)}>
                + KG <Info size={10} className="text-white/60" />
              </span>
            ) : (
              <span>KG</span>
            )}
            <span>Reps</span>
            <span className="flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors" onClick={() => setShowRpeInfo(true)}>
              RPE <Info size={10} className="text-white/60" />
            </span>
            <span>Done</span>
          </div>

          {/* Sets */}
          <div className="space-y-2">
            {exercise.sets.map((set, index) => {
              const displayIndex = exercise.sets.slice(0, index + 1).filter(s => s.type !== 'warmup').length;
              // Zwraca interfejs użytkownika (JSX) dla tego komponentu
              return (
                <SetRow
                  key={set.id}
                  index={displayIndex}
                  exerciseId={exercise.id}
                  set={set}
                  updateSet={updateSet}
                  toggleSetComplete={toggleSetComplete}
                  toggleSetType={toggleSetType}
                  removeSetFromExercise={removeSetFromExercise}
                  duplicateSetInExercise={duplicateSetInExercise}
                  isDisabled={isDisabled}
                  isBodyweight={isBodyweightExercise}
                  maxReps={exercise.maxReps}
                />
              );
            })}
          </div>

          {/* Add Set Button */}
          <button 
            onClick={() => addSetToExercise(exercise.id)}
            className="w-full py-4 mt-2 rounded-2xl bg-black border border-[#2C2C2E] flex items-center justify-center gap-2 text-[#8E8E93] font-black text-xs hover:text-white hover:border-[#3C3C3E] transition-all"
          >
            <Plus size={16} strokeWidth={3} />
            ADD SET
          </button>
        </div>
      </div>

      {showTimerModal && (
        <RestTimerModal
          currentDuration={exercise.restDuration || 90}
          exerciseName={exercise.name}
          onClose={() => setShowTimerModal(false)}
          onSave={(newSeconds) => {
            updateExerciseRestDuration(exercise.id, newSeconds);
            setShowTimerModal(false);
          }}
        />
      )}

      {showPlateCalc && (
        <PlateCalculator 
          initialWeight={Math.max(...exercise.sets.map(s => parseFloat(s.kg) || 0))}
          onClose={() => setShowPlateCalc(false)}
        />
      )}

      {showAddedWeightInfo && (
        <ModalPortal>
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddedWeightInfo(false)} />
            <div className="relative w-full max-w-sm bg-[#1C1C1E] rounded-[36px] shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
                <h3 className="font-black text-xl text-white">Added Weight</h3>
                <button onClick={() => setShowAddedWeightInfo(false)} className="text-[#8E8E93] hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Dumbbell size={32} className="text-white" />
                </div>
                <p className="text-sm text-[#8E8E93] mb-4 font-medium text-center leading-relaxed">
                  For bodyweight exercises like pull-ups or dips, <strong className="text-white">only log the extra weight</strong> you are adding (e.g. from a weight belt).
                </p>
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl mb-2">
                  <p className="text-xs text-[#8E8E93] font-bold uppercase tracking-widest mb-2">Example</p>
                  <p className="text-sm text-white/90">
                    If you weigh 80kg and use a 20kg belt, you should log <strong className="text-white">20 kg</strong>, not 100 kg.
                  </p>
                </div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                  <p className="text-sm text-white/90">
                    If you are doing it with just your body weight, leave it at <strong className="text-white">0 kg</strong> or empty.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {showRpeInfo && (
        <ModalPortal>
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRpeInfo(false)} />
            <div className="relative w-full max-w-sm bg-[#1C1C1E] rounded-[36px] shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
                <h3 className="font-black text-xl text-white">RPE Scale</h3>
                <button onClick={() => setShowRpeInfo(false)} className="text-[#8E8E93] hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <p className="text-sm text-[#8E8E93] mb-6 font-medium leading-relaxed">
                  RPE (Rate of Perceived Exertion) helps you measure the intensity of your sets based on how many reps you had left in the tank.
                </p>
                <div className="space-y-3">
                  {[
                    { rpe: '10', reps: '0', desc: 'Absolute maximum effort. Could not do another rep or add any weight.', color: 'bg-red-500' },
                    { rpe: '9.5', reps: '0', desc: 'Could not do another rep, but could maybe add a tiny bit of weight.', color: 'bg-red-500/80' },
                    { rpe: '9', reps: '1', desc: '1 rep left in the tank. Very hard.', color: 'bg-orange-500' },
                    { rpe: '8.5', reps: '1-2', desc: 'Maybe 2 reps left in the tank.', color: 'bg-orange-500/80' },
                    { rpe: '8', reps: '2', desc: '2 reps left in the tank. Hard but manageable.', color: 'bg-yellow-500' },
                    { rpe: '7.5', reps: '2-3', desc: 'Maybe 3 reps left.', color: 'bg-yellow-500/80' },
                    { rpe: '7', reps: '3', desc: '3 reps left in the tank. Fast bar speed.', color: 'bg-green-500' },
                    { rpe: '<7', reps: '4+', desc: 'Light effort. Warmups and technique work.', color: 'bg-green-500/50' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-2xl bg-black/40 border border-white/5">
                      <div className="flex flex-col items-center justify-center shrink-0 w-12 gap-1">
                        <span className="font-black text-white text-lg">{item.rpe}</span>
                        <div className={`w-8 h-1 rounded-full ${item.color}`} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#8E8E93] uppercase tracking-widest mb-1">Reps left: {item.reps}</div>
                        <div className="text-sm text-white/90 leading-tight">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Options Bottom Sheet */}
      {showOptions && (
        <ModalPortal>
          <div className="fixed inset-0 z-[700] flex flex-col justify-end">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowOptions(false)}
            />
            <div className="relative w-full bg-[#1C1C1E] rounded-t-[32px] p-6 pb-12 animate-in slide-in-from-bottom duration-[400ms] ease-out-ios border-t border-white/10">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setShowOptions(false);
                    if (onRequestReplace) onRequestReplace();
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 p-5 rounded-2xl flex items-center justify-between text-white font-bold transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Dumbbell size={20} className="text-indigo-400" />
                    <span>Podmień ćwiczenie</span>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setShowOptions(false);
                    setIsEditingNote(true);
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 p-5 rounded-2xl flex items-center justify-between text-white font-bold transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Edit3 size={20} className="text-white/70" />
                    <span>Dodaj notatkę (Scratchpad)</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setShowOptions(false);
                    removeSetFromExercise(exercise.id, 'all');
                  }}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 p-5 rounded-2xl flex items-center justify-between text-red-500 font-bold transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 size={20} />
                    <span>Usuń ćwiczenie z treningu</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
