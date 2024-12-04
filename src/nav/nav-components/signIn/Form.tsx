import React, { useState } from 'react';
import { Button } from '../../../UI/Button';
import visibilityOn from '/icons/eye_on.svg';
import visibilityOff from '/icons/eye_off.svg';

type Props = {
  email: string;
  password: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (event: { preventDefault: () => void }) => Promise<void>;
  mode?: 'signIn' | 'signUp';
};

export default function Form({
  email,
  password,
  setEmail,
  setPassword,
  handleSubmit,
  mode,
}: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <div className='w-[20vw] h-full'>
      <form action='submit' className='flex flex-col pb-10'>
        <label htmlFor='email' className=''>
          email
        </label>
        <input
          type='email'
          placeholder='email'
          autoComplete='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full px-3 py-2 border border-slate-300 text-sm mb-4 placeholder:text-black'
        />
        <label htmlFor='password' className='pb-2'>
          password
        </label>
        <div className='relative flex items-center mb-10 border border-slate-300'>
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-3 py-2 text-sm placeholder:text-black outline-none'
          />
          <div
            className='mr-6 cursor-pointer'
            onClick={togglePasswordVisibility}
          >
            <img
              src={isPasswordVisible ? visibilityOff : visibilityOn}
              alt='Toggle password field visibility'
              className='h-5 w-5'
            />
          </div>
        </div>
        <Button
          type='button'
          onClick={handleSubmit}
          className='text-xl'
          colorVariant='light'
        >
          {mode === 'signIn' ? 'sign in' : 'sign up'}
        </Button>
      </form>
    </div>
  );
}
