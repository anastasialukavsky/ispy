import React, { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '../../UI/';

type ToolboxProps = {
  setSelectedAlgo: Dispatch<SetStateAction<string | null>>;
  setDisplayMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  setEnableButton: React.Dispatch<React.SetStateAction<boolean>>;
  enableButton: boolean;
  metadata?: any;
  geolocation?: {
    latitude: number;
    longitude: number;
  } | null;
  canRunWeatherValidation?: boolean;
};

export default function Toolbox({
  setSelectedAlgo,
  setDisplayMetadata,
  enableButton,
  metadata,
  geolocation,
  canRunWeatherValidation = false,
}: ToolboxProps) {
  // @ts-ignore
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const currentOrigin = window.location.origin;
  let hideTooltipTimeout: ReturnType<typeof setTimeout>;

  const buttonEnabledStyles =
    'mb-10 bg-button-unabled-fill transition-transform duration-300 transform hover:scale-105 relative';
  const buttonDisabledStyles =
    'mb-11 text-button-unabled-fill mb-4 bg-button-disabled-fill cursor-not-allowed';

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
    <section className='flex flex-col 3xl:translate-y-1/2 translate-y-1/4 justify-center font-abel text-lg tracking-wide px-3'>
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
          disabledTooltip='Please upload an image first'
        >
          Error Level Analysis
        </Button>
        {enableButton && showTooltip === 'ELA' && (
          <a
            href={`${currentOrigin}/about/Error-Level-Analysis`}
            target='_blank'
            rel='noopener noreferrer'
            className='absolute w-10 top-[1.5rem] right-[-4.8rem] transform -translate-y-1/2 z-10 '
          >
            <img
              src='/icons/brain-bulb.svg'
              alt='brain bulb icon'
              className='cursor-pointer'
            />
          </a>
        )}
      </div>

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
          disabledTooltip='Please upload an image first'
        >
          Noise Analysis
        </Button>
        {enableButton && showTooltip === 'Noise Analysis' && (
          <a
            href={`${currentOrigin}/about/Noise-Analysis`}
            target='_blank'
            rel='noopener noreferrer'
            className='absolute w-10 top-[1.5rem] right-[-4.8rem] transform -translate-y-1/2 z-10 '
          >
            <img
              src='/icons/brain-bulb.svg'
              alt='brain bulb icon'
              className='cursor-pointer'
            />
          </a>
        )}
      </div>

      <div className='relative'>
        <Button
          onClick={() => {
            setSelectedAlgo('Metadata');
            setDisplayMetadata(true);
          }}
          onMouseEnter={() => handleMouseEnter('Metadata')}
          onMouseLeave={handleMouseLeave}
          colorVariant={enableButton && metadata ? 'light' : 'dark'}
          className={
            enableButton && metadata
              ? buttonEnabledStyles
              : buttonDisabledStyles
          }
          disabled={!metadata}
          disabledTooltip={
            !enableButton
              ? 'Please upload an image first'
              : 'This image contains no metadata'
          }
        >
          Metadata
        </Button>
        {enableButton && showTooltip === 'Metadata' && (
          <a
            href={`${currentOrigin}/about/Metadata-Extraction`}
            target='_blank'
            rel='noopener noreferrer'
            className='absolute w-10 top-[1.5rem] right-[-4.8rem] transform -translate-y-1/2 z-10 '
          >
            <img
              src='/icons/brain-bulb.svg'
              alt='brain bulb icon'
              className='cursor-pointer'
            />
          </a>
        )}
      </div>

      <div className='relative'>
        <Button
          onClick={() => {
            setSelectedAlgo('Weather Analizer');
            setDisplayMetadata(false);
          }}
          onMouseEnter={() => handleMouseEnter('Weather Analizer')}
          onMouseLeave={handleMouseLeave}
          colorVariant={
            enableButton && canRunWeatherValidation ? 'light' : 'dark'
          }
          className={
            enableButton && canRunWeatherValidation
              ? buttonEnabledStyles
              : buttonDisabledStyles
          }
          disabled={!canRunWeatherValidation}
          disabledTooltip={
            !enableButton
              ? 'Please upload an image first'
              : 'Weather analysis is not possible for this image'
          }
        >
          Weather Condition Analysis
        </Button>
        {enableButton && showTooltip === 'Weather Analizer' && (
          <a
            href={`${currentOrigin}/about/Convolutional-Neural-Network`}
            target='_blank'
            rel='noopener noreferrer'
            className='absolute w-10 top-[1.5rem] right-[-4.8rem] transform -translate-y-1/2 z-10'
          >
            <img
              src='/icons/brain-bulb.svg'
              alt='brain bulb icon'
              className='cursor-pointer'
            />
          </a>
        )}
      </div>

      <div className='relative'>
        <Button
          onClick={() => {
            setSelectedAlgo('Geolocation');
            setDisplayMetadata(false);
          }}
          onMouseEnter={() => handleMouseEnter('Geolocation')}
          onMouseLeave={handleMouseLeave}
          colorVariant={enableButton && !!geolocation ? 'light' : 'dark'}
          className={
            enableButton && !!geolocation
              ? buttonEnabledStyles
              : buttonDisabledStyles
          }
          disabled={!geolocation}
          disabledTooltip={
            !enableButton
              ? 'Please upload an image first'
              : 'This image contains no geolocation data'
          }
        >
          Geolocation
        </Button>
      </div>
    </section>
  );
}