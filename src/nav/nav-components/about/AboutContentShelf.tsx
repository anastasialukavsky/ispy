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

  return (
    <div>
      <ul>
        <li>
          <Button onClick={() => handleClick('Error Level Analysis')}>
            Error Level Analysis
          </Button>
        </li>
        <li>
          <Button onClick={() => handleClick('Noise Analysis')}>
            Noise Analysis
          </Button>
        </li>
        <li>
          <Button onClick={() => handleClick('Convolutional Neural Network')}>
            Convolutional Neural Network
          </Button>
        </li>
        <li>
          <Button onClick={() => handleClick('Metadata Extraction')}>
            Metadata Extractino
          </Button>
        </li>
      </ul>
    </div>
  );
}
