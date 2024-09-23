import AboutContentShelf from './AboutContentShelf';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ELADetails from './ELADetails';
import DefaultArticle from './DefaultArticle';
import NoiseAnalysisDetails from './NoiseAnalysisDetails';
import CNNDetails from './CNNDetails';
import MetadataDetails from './MetadataDetails';

export default function About() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  useEffect(() => {
    const path = location.pathname.split('/')[2]; // Get the part after "/about/"
    if (path) {
      setSelectedArticle(path.replace(/-/g, ' ')); // Convert URL-friendly format to readable string
    } else {
      setSelectedArticle('About iSPY'); // Default to "About Article" when path is just /about
    }
  }, [location]);

  const handleNavigation = (article: string) => {
    const articleSlug = article.replace(/\s+/g, '-'); // Convert article name to URL-friendly format
    setSelectedArticle(article);
    navigate(`/about/${articleSlug}`); // Update the URL without navigating away
  };

  const renderSelectedArticle = () => {
    switch (selectedArticle) {
      case 'Error Level Analysis':
        return <ELADetails />;
      case 'Noise Analysis':
        return <NoiseAnalysisDetails />;
      case 'Convolutional Neural Network':
        return <CNNDetails />;
      case 'Metadata Extraction':
        return <MetadataDetails />;
      case 'About': 
        return <DefaultArticle />;
      default:
        return <DefaultArticle />; 
    }
  };

 return (
   <section className='w-full min-h-[calc(100vh_-_64px)] bg-primary-dark-gray text-primary-light-fill font-abel'>
     <aside className='fixed left-0 top-18 h-full bg-toolbox-gray p-4 w-[25rem] text-primary-light-fill'>
       <AboutContentShelf setSelectedArticle={handleNavigation} />
     </aside>

     {/* Center the article content */}
     <article className='w-full max-w-[50%] mx-auto flex flex-col pt-10 text-primary-light-fill pl-20'>
       <h1 className='text-9xl text-primary-light-fill text-center'>
         {selectedArticle}
       </h1>
       <div>{renderSelectedArticle()}</div>
     </article>
   </section>
 );
}
