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
        return 'bg-primary-light-fill'; 
      default:
        return 'bg-primary-dark-gray'; 
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

  const getFinalNavbarColor = () => {
    const routeColor = getNavbarColor();
    return isScrolled
      ? 'bg-primary-dark-gray/20 '
      : routeColor;
  };

  // Function to determine NavLink styles based on route
  const getNavlinkColor = () => {
    if (location.pathname === '/') {
      return 'text-primary-dark-gray transition-transform duration-300 transform relative after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-primary-dark-gray after:transition-all after:duration-300 hover:after:w-full';
    }
    return 'text-white hover:text-white transition-transform duration-300 transform relative after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full';
  };

  return (
    <nav
      className={`sticky top-0 z-[250]  flex h-16 w-full items-center justify-between transition-colors duration-300 ${getFinalNavbarColor()} text-xl font-bench`}
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
