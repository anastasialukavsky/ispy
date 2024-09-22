import { ReactNode, useState } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  colorVariant?: 'light' | 'dark';
  spanBgVariant?: 'bg-button-disabled-fill' | 'bg-button-unabled-fill';
  disabled?: boolean;
};

export const Button = ({
  onClick,
  className,
  children,
  colorVariant,
  spanBgVariant,
  disabled = false,
}: ButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => disabled && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={!disabled ? onClick : undefined}
        className={`${
          colorVariant === 'dark' ? 'border-black' : 'border-primary-light-fill'
        } w-full h-14 font-medium relative z-10 border ${
          disabled ? 'cursor-not-allowed' : ''
        }`}
        disabled={disabled}
      >
        {children}
      </button>
      {showTooltip && disabled && (
        <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-black text-white text-sm px-2 py-1 rounded'>
          Please upload an image first
        </div>
      )}
      <span
        className={`absolute left-0 top-0 z-0 h-full w-full -rotate-3 border ${
          colorVariant === 'dark' ? 'border-black' : 'border-primary-light-fill'
        } ${spanBgVariant} transition-transform duration-300 ease-in-out group-hover:rotate-0`}
      ></span>
    </div>
  );
};
