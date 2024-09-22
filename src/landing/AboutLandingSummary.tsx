import { useNavigate } from 'react-router-dom';
import { Button } from '../UI';

export default function AboutLandingSummary() {
  const navigate = useNavigate();
  const handleButtonClick = () => {
    navigate('/about');
  };
  return (
    <section className='h-fit w-full font-smooch text-lg tracking-wider'>
      {/* Angled background */}
      <div className='clip-path-custom h-fit w-full bg-primary-dark-gray py-28 flex flex-col items-center'>
        {/* Section content */}
        <h1 className='text-5xl font-bold text-white pl-10 self-start'>
          what is it all about?..
        </h1>
        <div className='flex pt-16 text-white border border-blue-600 w-full 5xl:w-[70%] justify-between px-64 items-start gap-14'>
          <div className='w-full h-full pr-10 border border-red-400'>
            <img
              src='public/assets/bg.jpg'
              alt=''
              className='w-[40vh] object-cover'
            />
          </div>
          <div className=' flex flex-col  '>
            <h3 className='text-primary-light-fill text-3xl pt-[10%] pb-5'>
              A picture is worth a thousand words...
            </h3>
            <p className=' border border-white '>
              But what if that picture isn't telling the truth? In an era where
              images are easily manipulated, the challenge of distinguishing
              reality from fabrication has grown immensely. With modern editing
              tools, nearly any photo can be altered to misinform or mislead,
              making the task of uncovering these manipulations more crucial
              than ever. Traditional methods often focus on identifying visual
              inconsistencies or errors that betray the use of editing software.
              While this can be effective, it's not always sufficient.
            </p>
          </div>
        </div>
        <div className='flex pt-16 text-white border border-blue-600 w-full 5xl:w-[70%] justify-between px-64 items-start gap-14 flex-row-reverse'>
          <div className='h-full pr-10 border border-red-400'>
            <img src='public/assets/bg1.jpg' alt='' className='w-full' />
          </div>
          <div className=' flex flex-col  '>
            <h3 className='text-primary-light-fill text-3xl pt-[10%] pb-5'>
              The power of digital analysis
            </h3>
            <p className=' border border-white'>
              Some images may not display obvious signs of tampering, leaving
              those methods inconclusive. That’s where data-driven analysis
              comes into play. Hidden within the digital makeup of an image are
              subtle traces that reveal manipulation—traces that are invisible
              to the naked eye but speak volumes to a trained tool. By analyzing
              these data points through advanced algorithms like Error Level
              Analysis, Noise Analysis, Copy-Move Detection, and Metadata
              Extraction, we can uncover the truth behind an image, offering
              unparalleled insights into whether it has been altered. This tool
              opens a new frontier in image authentication, ensuring that what
              we see aligns with reality and empowering us to verify the
              integrity of images with confidence.
            </p>
          <div className='w-44 pt-10'>
            <Button
              onClick={handleButtonClick}
              className='w-full font-bench text-lg'
              colorVariant='light'
            >
              learn more
            </Button>
          </div>
          </div>
      
        </div>
      </div>
    </section>
  );
}



