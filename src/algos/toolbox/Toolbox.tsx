import React, { Dispatch, SetStateAction } from 'react';
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
  const buttonEnabledStyles = ' mb-10 bg-button-unabled-fill';
  const buttonDisabledStyles =
    'mb-11 text-button-unabled-fill mb-4 bg-button-disabled-fill cursor-not-allowed';


  return (
    <section className='flex flex-col translate-y-1/2 justify-center font-abel text-lg tracking-wide'>
      <Button
        onClick={() => {
          setSelectedAlgo('ELA');
          setDisplayMetadata(false);
        }}
        colorVariant={enableButton ? 'light' : 'dark'}
        className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
        disabled={!enableButton}
      >
        Error Level Analysis
      </Button>
      <Button
        onClick={() => {
          setSelectedAlgo('Noise');
          setDisplayMetadata(false);
        }}
        colorVariant={enableButton ? 'light' : 'dark'}
        className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
        disabled={!enableButton}
      >
        Noise Analysis
      </Button>
      <Button
        onClick={() => {
          setSelectedAlgo('Metadata');
          setDisplayMetadata(true);
        }}
        colorVariant={enableButton ? 'light' : 'dark'}
        className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
        disabled={!enableButton}
      >
        Metadata
      </Button>
      <Button
        onClick={() => {
          setSelectedAlgo('Weather');
          setDisplayMetadata(false);
        }}
        colorVariant={enableButton ? 'light' : 'dark'}
        className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
        disabled={!enableButton}
      >
        Weather
      </Button>
      <Button
        onClick={() => setSelectedAlgo('All')}
        colorVariant={enableButton ? 'light' : 'dark'}
        className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
        disabled={!enableButton}
      >
        Apply All
      </Button>
    </section>
  );
}
