import  { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  colorVariant?: 'light' | 'dark';
};

export const Button = ({
  onClick,
  className,
  children,
  colorVariant,
}: ButtonProps) => {
  return (
    <div className={`relative group ${className}`}>
      <button
        onClick={onClick}
        className={`${
          colorVariant === 'dark'
            ? 'border-primary-dark-gray'
            : 'border-primary-light-fill'
        } w-full h-10 font-medium relative z-10 border-2`}
      >
        {children}
      </button>
      <span
        className={`absolute left-0 top-0 z-0 h-full w-full -rotate-3 border-2 ${
          colorVariant === 'dark'
            ? 'border-primary-dark-gray'
            : 'border-primary-light-fill'
        } transition-transform duration-300 ease-in-out group-hover:rotate-0`}
      ></span>
    </div>
  );
};

