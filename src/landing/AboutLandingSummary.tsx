import React from 'react';

export default function AboutLandingSummary() {
  return (
    <section className='h-fit w-full'>
      {/* Angled background */}
      <div className='clip-path-custom h-fit w-full bg-primary-dark-blue'>
        {/* Section content */}
        <div className='flex items-center justify-center pt-64 text-red-400'>
          <h1 className='text-5xl font-bold'>ABOUT</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
            Praesentium recusandae pariatur ab laudantium temporibus excepturi
            nobis ratione dolores id voluptatum rerum dolorum totam dolor quod
            quam omnis autem debitis, sequi culpa animi. Laborum asperiores
            quibusdam eligendi eaque tempora unde nesciunt.
          </p>
        </div>
      </div>
    </section>
  );
}
