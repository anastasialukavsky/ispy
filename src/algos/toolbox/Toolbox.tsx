import React, { Dispatch, SetStateAction } from 'react';
import { Button } from '../../UI/';

type ToolboxProps = {
  setSelectedAlgo: Dispatch<SetStateAction<string | null>>;
  setDisplayMetadata: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Toolbox({
  setSelectedAlgo,
  setDisplayMetadata,
}: ToolboxProps) {
  const buttonStyles = 'mb-4';

  return (
    <section className='flex flex-col translate-y-full justify-center'>
      <Button
        onClick={() => {
          setSelectedAlgo('ELA');
          setDisplayMetadata(false);
        }}
        colorVariant='dark'
        className={buttonStyles}
      >
        ELA
      </Button>
      <Button
        onClick={() => {
          setSelectedAlgo('Noise');
          setDisplayMetadata(false);
        }}
        colorVariant='dark'
        className={buttonStyles}
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
        colorVariant='dark'
        className={buttonStyles}
      >
        Metadata
      </Button>
      <Button
        onClick={() => {
          setSelectedAlgo('Weather');
          setDisplayMetadata(false);
        }}
        colorVariant='dark'
        className={buttonStyles}
      >
        Weather
      </Button>
      <Button
        onClick={() => setSelectedAlgo('All')}
        colorVariant='dark'
        className={buttonStyles}
      >
        Apply All
      </Button>
    </section>
  );
}
