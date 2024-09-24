import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Logo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getLogoColor = () => {
    switch (location.pathname) {
      case '/':
        return 'public/assets/logo2.png';
      default:
        return 'public/assets/logo01.png';
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };
  return (
    <div className='block w-10'>
      <img src={getLogoColor()} alt='' onClick={handleLogoClick} />
    </div>
  );
};
