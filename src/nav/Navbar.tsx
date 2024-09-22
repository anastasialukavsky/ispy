import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Logo } from '../UI';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Function to determine the background color based on route
  const getNavbarColor = () => {
    switch (location.pathname) {
      case '/':
        return 'bg-primary-light-fill'; // Light background for landing page
      default:
        return 'bg-primary-dark-gray'; // Dark background for other pages
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Combine scroll and route-based background color
  const getFinalNavbarColor = () => {
    const routeColor = getNavbarColor();
    return isScrolled
      ? 'bg-primary-dark-gray/20 '
      : routeColor;
  };

  // Function to determine NavLink styles based on route
  const getNavlinkColor = () => {
    // On landing page, set NavLink text to black
    if (location.pathname === '/') {
      return 'text-black hover:underline hover:text-black';
    }
    // On other pages, set NavLink text to white
    return 'text-white hover:underline hover:text-white';
  };

  return (
    <nav
      className={`sticky top-0 z-50 flex h-16 w-full items-center justify-between transition-colors duration-300 ${getFinalNavbarColor()} text-xl font-bench`}
    >
      {/* Left Section: Logo */}
      <div className='pl-10'>
        <Logo />
      </div>

      {/* Right Section: Navigation Links */}
      <ul className='flex gap-6 pr-10'>
        <li>
          <NavLink to='/' className={getNavlinkColor()}>
            home
          </NavLink>
        </li>
        <li>
          <NavLink to='/upload' className={getNavlinkColor()}>
            upload image
          </NavLink>
        </li>
        <li>
          <NavLink to='/about' className={getNavlinkColor()}>
            about
          </NavLink>
        </li>
        <li>
          <NavLink to='/account' className={getNavlinkColor()}>
            account
          </NavLink>
        </li>
      </ul>

      {/* Bottom Border */}
      {/* <div className='absolute bottom-0 right-0 h-[1px] w-full bg-black'></div> */}
    </nav>
  );
}
