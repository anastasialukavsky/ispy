import AboutContentShelf from './AboutContentShelf';
import React, { useEffect, useState } from 'react';
import { Button } from '../../../UI';
import { useNavigate } from 'react-router-dom';
import ELADetails from './ELADetails';
import DefaultArticle from './DefaultArticle';

export default function About() {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const renderSelectedArticle = () => {
    switch (selectedArticle) {
      case 'Error Level Analysis':
        return <ELADetails />;
      // Add other cases for different articles here
      default:
        return <DefaultArticle/>;
    }
  };
  return (
    <section className='w-full min-h-[calc(100vh_-_64px)] bg-primary-dark-gray text-primary-light-fill font-abel'>
      <aside className='fixed left-0 top-18 h-full bg-toolbox-gray p-4 w-[25rem] text-primary-light-fill'>
        <AboutContentShelf setSelectedArticle={setSelectedArticle} />
      </aside>
      <article className='w-fit pl-[26rem] flex flex-col pt-10 text-primary-light-fill'>
        <h1 className='text-9xl text-primary-light-fill'>hello</h1>

        <div>{selectedArticle ? renderSelectedArticle() : <DefaultArticle/>}</div>
      </article>
    </section>
  );
}
