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
  const buttonEnabledStyles = ' mb-4 bg-button-unabled-fill';
  const buttonDisabledStyles =
    'mb-4 text-toolbox-gray mb-4 bg-button-disabled-fill';
  const buttonStyles = 'mb-4';

  return (
    <section className='flex flex-col translate-y-full justify-center font-bench text-lg tracking-wide'>
      <Button
        onClick={() => {
          setSelectedAlgo('ELA');
          setDisplayMetadata(false);
        }}
        colorVariant={enableButton ? 'light' : 'dark'}
        className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
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
      >
        Noise Analysis
      </Button>
      {/* <Button
        onClick={() => {
          setSelectedAlgo('CopyMove');
          setDisplayMetadata(false);
        }}
        className={buttonStyles}
      >
        Copy-Move Detection
      </Button> */}
      <Button
        onClick={() => {
          setSelectedAlgo('Metadata');
          setDisplayMetadata(true);
        }}
        colorVariant={enableButton ? 'light' : 'dark'}
        className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
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
      >
        Weather
      </Button>
      <Button
        onClick={() => setSelectedAlgo('All')}
        colorVariant={enableButton ? 'light' : 'dark'}
        className={enableButton ? buttonEnabledStyles : buttonDisabledStyles}
      >
        Apply All
      </Button>
    </section>
  );
}
