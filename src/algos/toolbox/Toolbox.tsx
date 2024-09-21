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
  const buttonStyles = 'border-2 border-black mb-2';

  return (
    <section className='flex flex-col justify-center pt-96 bg-gray-100'>
      <Button
        onClick={() => {
          setSelectedAlgo('ELA');
          setDisplayMetadata(false);
        }}
        className={buttonStyles}
      >
        ELA
      </Button>
      <Button
        onClick={() => {
          setSelectedAlgo('Noise');
          setDisplayMetadata(false);
        }}
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
        className={buttonStyles}
      >
        Metadata
      </Button>
      <Button
        onClick={() => {
          setSelectedAlgo('Weather');
          setDisplayMetadata(false);
        }}
        className={buttonStyles}
      >
        Weather
      </Button>
      <Button onClick={() => setSelectedAlgo('All')} className={buttonStyles}>
        Apply All
      </Button>
    </section>
  );
}


     