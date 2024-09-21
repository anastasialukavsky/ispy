import { useNavigate } from 'react-router-dom';

import AboutLandingSummary from './AboutLandingSummary';
import { Button } from '../UI';

export default function Landing() {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/upload');
  };
  return (
    <main className='flex min-h-full w-full flex-col items-center justify-center'>
        <h1 className="self-start py-10 pl-10 text-5xl uppercase">explore image analisys</h1>
      <div className='pb- flex items-end border border-red-400 pb-64'>
        <img src='public/assets/landing-bg.gif' alt='' width='700px' />

        <div className='relative left-20 top-0'>
          <Button
            onClick={handleButtonClick}
            className='relative z-10 border-2 border-primary-dark-blue'
          >
            get started
          </Button>
          <span className='absolute left-0 top-0 z-0 h-full w-28 -rotate-3 border-2 border-black'></span>
          {/* <span className='absolute left-0 top-0 h-full w-full rotate-3 border-2 border-black'></span> */}
          {/* <span className='absolute left-0 top-0 h-full w-full -translate-x-1 translate-y-1 border-2 border-black'></span> */}
        </div>
      </div>
      <AboutLandingSummary />
    </main>
  );
}
