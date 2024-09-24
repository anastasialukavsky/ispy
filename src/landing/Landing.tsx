import { useNavigate } from 'react-router-dom';
import { Button } from '../UI';
import { gsap } from 'gsap';
import { useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const navigate = useNavigate();

  const navigateToAbout = () => {
    navigate('/about');
  };
  const navigateToUpload = () => {
    navigate('/upload');
  };
  useLayoutEffect(() => {
    if (
      !document.querySelector('.landing') ||
      !document.querySelector('.about')
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl_01 = gsap.timeline({});
      const tl_02 = gsap.timeline({});
      const tl_03 = gsap.timeline({});
      const tl_04 = gsap.timeline({});
      tl_01.from('.pic', {
        yPercent: -10,
        autoAlpha: 0,
        ease: 'expo',
        duration: 1,
      });

      tl_02.fromTo(
        '.letter-span:not(.space)',
        { height: 0, autoAlpha: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          autoAlpha: 1,
          duration: 0.4,
          ease: 'power2.inOut',
          stagger: 0.03,
          clearProps: 'all',
        }
      );

      tl_03.from('.cta-section', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.2,
        ease: 'expo',
      });

      const tl = gsap.timeline({});
      tl.to('.landing', {
        yPercent: 110,
        ease: 'none',
        duration: 2,
        scrollTrigger: {
          trigger: '.landing',
          start: 'top top',
          end: 'center center',
          scrub: 2,
          pin: true,
          // markers: true,
        },
      });

      tl.to('.about', {
        // yPercent: -30,
        delay: 0.8,
        ease: 'expo',
        duration: 2,
        // ease: 'none',
        scrollTrigger: {
          trigger: '.landing',
          start: 'center center',
          end: '+=100%',
          scrub: true,
          // markers: true,
        },
      });

      tl.from('.about-header', {
        xPercent: -40,
        ease: 'expo',
        duration: 2,

        scrollTrigger: {
          trigger: '.about',
          // markers: true,
          start: 'top 90%',
          end: 'bottom 99%',
          scrub: true,
        },
      });
      tl.from('.about-subheader-1', {
        xPercent: 40,
        ease: 'expo',
        duration: 2,

        scrollTrigger: {
          trigger: '.about',
          // markers: true,
          start: 'top 90%',
          end: 'bottom 99%',
          scrub: true,
        },
      });
      tl.from('.article-1', {
        xPercent: 50,
        ease: 'expo',
        duration: 1,

        scrollTrigger: {
          trigger: '.about',
          // markers: true,
          start: 'top 90%',
          end: 'bottom 99%',
          scrub: true,
        },
      });
      tl.from('.about-img-1', {
        yPercent: 60,
        ease: 'expo',
        duration: 2,

        scrollTrigger: {
          trigger: '.about',
          // markers: true,
          start: 'top center',
          end: 'bottom 99%',
          scrub: 1,
        },
      });

      tl.from('.about-subheader-2', {
        xPercent: -20,
        ease: 'expo',
        duration: 2,

        scrollTrigger: {
          trigger: '.about',
          // markers: true,
          start: 'center 70%',
          end: 'bottom bottom',
          scrub: 2,
        },
      });

      tl.from('.article-2', {
        xPercent: -40,
        ease: 'expo',
        duration: 5,

        scrollTrigger: {
          trigger: '.about',
          // markers: true,
          start: 'center 90%',
          end: 'bottom bottom',
          scrub: 3,
        },
      });
      tl.from('.about-img-2', {
        yPercent: 60,
        ease: 'expo',
        duration: 4,

        scrollTrigger: {
          trigger: '.about',
          // markers: true,
          start: 'top top',
          end: 'bottom 99%',
          scrub: 3,
        },
      });
      tl.from('.about-cta-btn', {
        yPercent: 10,
        ease: 'power1',
        duration: 4,
        opacity: 0,
        scrollTrigger: {
          trigger: '.about',
          // markers: true,
          start: 'center center',
          end: 'bottom 99%',
          scrub: 2,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  //   const ctx = gsap.context(() => {
  //     // Image timeline
  //     const tl_01 = gsap.timeline({});
  //     const tl_02 = gsap.timeline({});
  //     const tl_03 = gsap.timeline({});
  //     tl_01.from('.pic', {
  //       yPercent: -10,
  //       autoAlpha: 0,
  //       ease: 'expo',
  //       duration: 1,
  //     });

  //     tl_02.fromTo(
  //       '.letter-span:not(.space)',
  //       { height: 0, autoAlpha: 0, opacity: 0 },
  //       {
  //         height: 'auto',
  //         opacity: 1,
  //         autoAlpha: 1,
  //         duration: 0.4,
  //         ease: 'power2.inOut',
  //         stagger: 0.03,
  //         clearProps: 'all',
  //       }
  //     );

  //     tl_03.from('.cta-section', {
  //       opacity: 0,
  //       y: 30,
  //       duration: 1,
  //       delay: 0.2,
  //       ease: 'expo',
  //     });
  //   });

  //   return () => ctx.revert();
  // }, []);

  return (
    <main className='flex w-full h-full min-h-[100vh]  flex-col items-center justify-center bg-primary-light-fill overflow-hidden'>
      <section className='landing w-full h-full z-[100] relative pt-44'>
        <div className='relative w-full max-w-6xl h-[75vh] overflow-hidden flex items-center mx-auto'>
          {/* Main bg */}
          <img
            src='public/assets/landing-bg.gif'
            alt=''
            className='pic h-[70vh] w-full object-cover relative top-[-10%]'
          />

          <h1 className='absolute -top-12 left-0 text-[8.2rem] h-fit w-full uppercase font-smooch tracking-widest z-10 text-primary-dark-gray mix-blend-color-burn'>
            {'Expose the unseen'.split('').map((letter, index) => (
              <span
                key={index}
                className={`letter-span ${letter === ' ' ? 'space' : ''}`}
              >
                {letter}
              </span>
            ))}
          </h1>

          {/* CTA Section */}
          <div className='cta-section w-fit relative flex items-end justify-center pl-20 '>
            <div className='text-end flex flex-col items-end'>
              <p className='font-abel text-xl'>
                Reveal the truth in every pixel. Detect image tampering with
                precision and confidence.
              </p>
              <Button
                onClick={navigateToUpload}
                className='w-44 font-bench text-xl mt-10'
                colorVariant='dark'
              >
                get started
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className='about z-[150] h-fit w-full font-smooch text-lg tracking-wider'>
        {/* Angled background */}
        <div className=' clip-path-custom w-full bg-primary-dark-gray pb-28 pt-44 flex flex-col items-center'>
          <h2 className='about-header text-5xl font-bold text-white pl-44 self-start'>
            What is it all about?..
          </h2>
          <div className='flex pt-20 text-white  w-full 5xl:w-[70%] justify-between px-64 items-start gap-14'>
            <div className='about-img-1 pr-10 w-[90vw]'>
              <img
                src='public/assets/bg.webp'
                alt=''
                className='w-full object-cover'
              />
            </div>
            <div className=' flex flex-col  '>
              <h3 className='about-subheader-1 text-primary-light-fill text-3xl pt-[10%] pb-5'>
                A picture is worth a thousand words...
              </h3>
              <p className='article-1'>
                But what if that picture isn't telling the truth? In an era
                where images are easily manipulated, the challenge of
                distinguishing reality from fabrication has grown immensely.
                With modern editing tools, nearly any photo can be altered to
                misinform or mislead, making the task of uncovering these
                manipulations more crucial than ever. Traditional methods often
                focus on identifying visual inconsistencies or errors that
                betray the use of editing software. While this can be effective,
                it's not always sufficient.
              </p>
            </div>
          </div>
          <div className='flex pt-44 text-white  w-full 5xl:w-[70%] justify-between px-64 items-start gap-14 flex-row-reverse'>
            <div className='about-img-2 h-full pr-10 '>
              <img src='public/assets/bg1.webp' alt='' className='w-full' />
            </div>
            <div className=' flex flex-col  '>
              <h3 className='about-subheader-2 text-primary-light-fill text-3xl pt-[10%] pb-5'>
                The power of digital analysis
              </h3>
              <p className='article-2'>
                Some images may not display obvious signs of tampering, leaving
                those methods inconclusive. That’s where data-driven analysis
                comes into play. Hidden within the digital makeup of an image
                are subtle traces that reveal manipulation—traces that are
                invisible to the naked eye but speak volumes to a trained tool.
                By analyzing these data points through advanced algorithms like
                Error Level Analysis, Noise Analysis, Copy-Move Detection, and
                Metadata Extraction, we can uncover the truth behind an image,
                offering unparalleled insights into whether it has been altered.
                This tool opens a new frontier in image authentication, ensuring
                that what we see aligns with reality and empowering us to verify
                the integrity of images with confidence.
              </p>
              <div className='about-cta-btn w-44 pt-10'>
                <Button
                  onClick={navigateToAbout}
                  className='w-full font-bench text-xl'
                  colorVariant='light'
                >
                  learn more
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
