import React, { useState, useEffect } from 'react';
import { ModalPortal } from '../../components/ui';
import { X, GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';

export default function ReorderExercisesModal({ exercises, onClose, onSave }) {
  const [items, setItems] = useState(exercises);

  useEffect(() => {
    setItems(exercises);
  }, [exercises]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[600] flex flex-col justify-end animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full h-[85vh] bg-[#0A0A0A] rounded-t-[32px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 border-t border-white/10">
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>
          
          <header className="px-6 py-4 flex items-center justify-between border-b border-white/5">
            <h2 className="text-xl font-black text-white">Reorder Exercises</h2>
            <button onClick={onClose} className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
              <X size={20} strokeWidth={3} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
              {items.map((ex) => (
                <Reorder.Item 
                  key={ex.id} 
                  value={ex}
                  className="bg-[#1C1C1E] border border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-lg cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-4 pointer-events-none">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-white">
                      {ex.name[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-white">{ex.name}</h4>
                      <p className="text-xs text-[#8E8E93]">{ex.sets.length} sets</p>
                    </div>
                  </div>
                  <GripVertical className="text-[#8E8E93]" size={20} />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          <div className="p-6 bg-[#0A0A0A] border-t border-white/10">
            <button 
              onClick={() => onSave(items.map(i => i.id))}
              className="w-full bg-white text-black py-4 rounded-2xl font-black shadow-lg shadow-white/10 active:scale-95 transition-all"
            >
              Save Order
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
