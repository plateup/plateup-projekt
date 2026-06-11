/**
 * Plik: index.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Moduł odpowiedzialny za logikę powiązaną z ui/index.jsx.
 * Technologia: React / JSX / Tailwind CSS
 */

import React from 'react';
import { createPortal } from 'react-dom';

export const ModalPortal = ({ children }) => {
  if (typeof document === 'undefined') return children;
  return createPortal(children, document.body);
};

export const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseStyles = 'w-full py-4 px-6 rounded-[24px] font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-black text-white dark:bg-white dark:text-black',
    secondary: 'bg-[#F2F2F7] text-black dark:bg-[#1C1C1E] dark:text-white',
    outline: 'border-2 border-black dark:border-white text-black dark:text-white',
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const Avatar = ({ src, name }) => {
  return (
    <div className="w-12 h-12 rounded-full bg-[#E5E5EA] dark:bg-[#3A3A3C] flex items-center justify-center overflow-hidden">
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xl font-bold text-[#8E8E93]">{name[0]}</span>
      )}
    </div>
  );
};

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) => {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
        <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-sm rounded-[32px] p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
          {message && <p className="text-[#8E8E93] font-bold">{message}</p>}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={onCancel} 
              className="bg-white/5 text-white font-black py-4 rounded-2xl text-sm hover:bg-white/10 transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm} 
              className={`${isDanger ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-black hover:bg-neutral-200'} font-black py-4 rounded-2xl text-sm transition-all active:scale-95 shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
