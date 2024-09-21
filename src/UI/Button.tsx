import React, { ReactNode } from 'react';


type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}

export const Button = ({ children, onClick, className }: ButtonProps) => {
  return (
    <button onClick={onClick} className={`px-4 py-2 ${className}`}>
      {children}
    </button>
  );
};


