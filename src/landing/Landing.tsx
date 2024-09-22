import { useNavigate } from 'react-router-dom';
import AboutLandingSummary from './AboutLandingSummary';
import { Button } from '../UI';

export default function Landing() {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/upload');
  };

  return (
    <main className='flex min-h-full w-full flex-col items-center justify-center bg-primary-light-fill'>
      <div className='relative w-full'>
        <h1 className=' absolute top-20 left-16 w-full text-8xl uppercase font-londrina tracking-widest z-10'>
          explore image analysis
        </h1>
      </div>
      <div className='flex items-end pb-20 pt-10 border border-red-400 h-fit'>
        <div className='relative w-full h-[70vh] overflow-hidden'>
          <img
            src='public/assets/landing-bg.gif'
            alt=''
            className='w-full h-full relative top-[-10%] border border-black'
          />
        </div>

        <div className='w-44 pl-5 border border-blue-500 -translate-y-[400%]' >
          <Button
            onClick={handleButtonClick}
            className='w-full font-bench text-lg'
            colorVariant='dark'
          >
            get started
          </Button>
        </div>
      </div>
      <AboutLandingSummary />
    </main>
  );
}
