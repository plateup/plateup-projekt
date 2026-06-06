import React from 'react';

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
