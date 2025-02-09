import { useLocation, useNavigate } from 'react-router-dom';

export const Logo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getLogoColor = () => {
    switch (location.pathname) {
      case '/':
        return '/assets/logo2.png';
      default:
        return '/assets/logo01.png';
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
