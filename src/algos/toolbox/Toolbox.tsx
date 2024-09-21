import React, { Dispatch, SetStateAction } from 'react';
import {Button} from '../../UI/';

type ToolboxProps = {
  setSelectedAlgo: Dispatch<SetStateAction<string | null>>;
};

export default function Toolbox({ setSelectedAlgo }: ToolboxProps) {
  const buttonStyles = 'border-2 border-black mb-2';

  return (
    <section className='flex flex-col justify-center pt-96 bg-gray-100'>
      <Button onClick={() => setSelectedAlgo('ELA')} className={buttonStyles}>
        ELA
      </Button>
      <Button onClick={() => setSelectedAlgo('Noise')} className={buttonStyles}>
        Noise Analysis
      </Button>
      <Button
        onClick={() => setSelectedAlgo('CopyMove')}
        className={buttonStyles}
      >
        Copy-Move Detection
      </Button>
      <Button
        onClick={() => setSelectedAlgo('Metadata')}
        className={buttonStyles}
      >
        Metadata
      </Button>
      <Button
        onClick={() => setSelectedAlgo('Weather')}
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
