import React from 'react';
import { Button } from '../../../UI';

type AboutContentShelfProps = {
  setSelectedArticle: (article: string) => void;
};

export default function AboutContentShelf({
  setSelectedArticle,
}: AboutContentShelfProps) {
  const handleClick = (article: string) => {
    setSelectedArticle(article);
  };
  const shelfStyles = 'py-2';
  return (
    <div>
      <ul className='pt-10'>
        <li className={shelfStyles}>
          <Button onClick={() => handleClick('Error Level Analysis')}>
            Error Level Analysis
          </Button>
        </li>
        <li className={shelfStyles}>
          <Button onClick={() => handleClick('Noise Analysis')}>
            Noise Analysis
          </Button>
        </li>
        <li className={shelfStyles}>
          <Button onClick={() => handleClick('Convolutional Neural Network')}>
            Convolutional Neural Network
          </Button>
        </li>
        <li className={shelfStyles}>
          <Button onClick={() => handleClick('Metadata Extraction')}>
            Metadata Extractino
          </Button>
        </li>
      </ul>
    </div>
  );
}
