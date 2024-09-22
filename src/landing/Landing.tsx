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
      <div className="relative w-full">
        <h1 className=' absolute top-16 left-10 w-full text-8xl uppercase font-erica'>
          explore image analysis
        </h1>
      </div>
      <div className='flex items-end py-36'>
        {/* Set the image height to 70% of the viewport height */}
        <img
          src='public/assets/landing.gif'
          alt=''
          className='h-[70vh] object-cover'
        />

        <div className='w-44 pl-5'>
          <Button onClick={handleButtonClick} className='w-full font-bench text-lg' colorVariant='dark'>
            get started
          </Button>
        </div>
      </div>
      <AboutLandingSummary />
    </main>
  );
}
