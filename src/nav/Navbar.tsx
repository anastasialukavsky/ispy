import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../UI';

export default function Navbar() {
  return (
    <nav className='sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-white text-lg uppercase'>
      {/* Left Section: Logo */}
      <div className='pl-10'>
        <Logo />
      </div>

      {/* Right Section: Navigation Links */}
      <ul className='flex gap-6 pr-10'>
        <li>
          <NavLink to='/' className='hover:underline'>
            home
          </NavLink>
        </li>
        <li>
          <NavLink to='/about' className='hover:underline'>
            about
          </NavLink>
        </li>
        <li>
          <NavLink to='/account' className='hover:underline'>
            account
          </NavLink>
        </li>
      </ul>

      {/* Bottom Border */}
      <div className='absolute bottom-0 right-0 h-[2px] w-4/12 bg-black'></div>
    </nav>
  );
}
