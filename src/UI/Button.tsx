import { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  colorVariant?: 'light' | 'dark';
  spanBgVariant?: 'bg-button-disabled-fill' | 'bg-button-unabled-fill';
  disabled?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const Button = ({
  onClick,
  className,
  children,
  colorVariant,
  spanBgVariant,
  disabled = false,
  onMouseEnter,
  onMouseLeave,
}: ButtonProps) => {
  return (
    <div className={`relative group ${className}`}>
      <button
        onClick={!disabled ? onClick : undefined}
        onMouseEnter={onMouseEnter} // Forwarding the onMouseEnter event
        onMouseLeave={onMouseLeave} // Forwarding the onMouseLeave event
        className={`${
          colorVariant === 'dark' ? 'border-black' : 'border-primary-light-fill'
        } w-full h-14 font-medium relative z-10 border ${
          disabled ? 'cursor-not-allowed' : ''
        }`}
        disabled={disabled}
      >
        {children}
      </button>
      <span
        className={`absolute left-0 top-0 z-0 h-full w-full -rotate-3 border ${
          colorVariant === 'dark' ? 'border-black' : 'border-primary-light-fill'
        } ${spanBgVariant} transition-transform duration-300 ease-in-out group-hover:rotate-0`}
      ></span>
    </div>
  );
};
