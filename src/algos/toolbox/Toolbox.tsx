import React, { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '../../UI/';

type ToolboxProps = {
  setSelectedAlgo: Dispatch<SetStateAction<string | null>>;
  setDisplayMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  setEnableButton: React.Dispatch<React.SetStateAction<boolean>>;
  enableButton: boolean;
};

export default function Toolbox({
  setSelectedAlgo,
  setDisplayMetadata,
  enableButton,
  setEnableButton,
}: ToolboxProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const currentOrigin = window.location.origin;
  let hideTooltipTimeout: ReturnType<typeof setTimeout>;

  const buttonEnabledStyles =
    'mb-10 bg-button-unabled-fill transition-transform duration-300 transform hover:scale-105 relative';
  const buttonDisabledStyles =
    'mb-12 text-button-unabled-fill mb-4 bg-button-disabled-fill cursor-not-allowed';

  const handleMouseEnter = (algo: string) => {
    clearTimeout(hideTooltipTimeout);
    setHoveredButton(algo);
    setShowTooltip(algo);
  };

  const handleMouseLeave = () => {
    hideTooltipTimeout = setTimeout(() => {
      setShowTooltip(null);
    }, 1200);
  };

  return (
    <section className='flex flex-col translate-y-1/2 justify-center font-abel text-lg tracking-wide'>
      {/* Error Level Analysis */}
      <div className='relative'>
        <Button
          onClick={() => {
            setSelectedAlgo('ELA');
            setDisplayMetadata(false);
          }}
          onMouseEnter={() => handleMouseEnter('ELA')}
          onMouseLeave={handleMouseLeave}
          colorVariant={enableButton ? 'light' : 'dark'}
          className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
          disabled={!enableButton}
        >
          Error Level Analysis
        </Button>
        {enableButton && showTooltip === 'ELA' && (
          <a
            href={`${currentOrigin}/about/Error-Level-Analysis`}
            target='_blank'
            rel='noopener noreferrer'
            className='absolute w-10 top-[1.5rem] right-[-4rem] transform -translate-y-1/2 z-10 '
          >
            <img
              src='public/icons/brain-bulb.svg'
              alt='brain bulb icon'
              className='cursor-pointer'
            />
          </a>
        )}
      </div>

      {/*  Noise Analysis */}
      <div className='relative'>
        <Button
          onClick={() => {
            setSelectedAlgo('Noise Analysis');
            setDisplayMetadata(false);
          }}
          onMouseEnter={() => handleMouseEnter('Noise Analysis')}
          onMouseLeave={handleMouseLeave}
          colorVariant={enableButton ? 'light' : 'dark'}
          className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
          disabled={!enableButton}
        >
          Noise Analysis
        </Button>
        {enableButton && showTooltip === 'Noise Analysis' && (
          <a
            href={`${currentOrigin}/about/Noise-Analysis`}
            target='_blank'
            rel='noopener noreferrer'
            className='absolute w-10 top-[1.5rem] right-[-4rem] transform -translate-y-1/2 z-10 '
          >
            <img
              src='public/icons/brain-bulb.svg'
              alt='brain bulb icon'
              className='cursor-pointer'
            />
          </a>
        )}
      </div>

      {/* Metadata */}
      <div className='relative'>
        <Button
          onClick={() => {
            setSelectedAlgo('Metadata');
            setDisplayMetadata(true);
          }}
          onMouseEnter={() => handleMouseEnter('Metadata')}
          onMouseLeave={handleMouseLeave}
          colorVariant={enableButton ? 'light' : 'dark'}
          className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
          disabled={!enableButton}
        >
          Metadata
        </Button>
        {enableButton && showTooltip === 'Metadata' && (
          <a
            href={`${currentOrigin}/about/Metadata-Extraction`}
            target='_blank'
            rel='noopener noreferrer'
            className='absolute w-10 top-[1.5rem] right-[-4rem] transform -translate-y-1/2 z-10 '
          >
            <img
              src='public/icons/brain-bulb.svg'
              alt='brain bulb icon'
              className='cursor-pointer'
            />
          </a>
        )}
      </div>

      {/* Weather */}
      <div className='relative'>
        <Button
          onClick={() => {
            setSelectedAlgo('Weather Analizer');
            setDisplayMetadata(false);
          }}
          onMouseEnter={() => handleMouseEnter('Weather Analizer')}
          onMouseLeave={handleMouseLeave}
          colorVariant={enableButton ? 'light' : 'dark'}
          className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
          disabled={!enableButton}
        >
          Weather Prediction
        </Button>
        {enableButton && showTooltip === 'Weather Analizer' && (
          <a
            href={`${currentOrigin}/about/Convolutional-Neural-Network`}
            target='_blank'
            rel='noopener noreferrer'
            className='absolute w-10 top-[1.5rem] right-[-4rem] transform -translate-y-1/2 z-10'
          >
            <img
              src='public/icons/brain-bulb.svg'
              alt='brain bulb icon'
              className='cursor-pointer'
            />
          </a>
        )}
      </div>

      {/* Apply All */}
      <div className='relative'>
        <Button
          onClick={() => setSelectedAlgo('All')}
          onMouseEnter={() => handleMouseEnter('All')}
          onMouseLeave={handleMouseLeave}
          colorVariant={enableButton ? 'light' : 'dark'}
          className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
          disabled={!enableButton}
        >
          Apply All
        </Button>
      </div>
    </section>
  );
}
