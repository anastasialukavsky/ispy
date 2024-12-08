import React, { useState, useEffect } from 'react';
import { Button } from '../../../UI/Button';
import visibilityOn from '/icons/eye_on.svg';
import visibilityOff from '/icons/eye_off.svg';
import { useForm } from 'react-hook-form';

type Props = {
  handleFormSubmit: (data: SignInFormData) => Promise<void>;
  mode?: 'signIn' | 'signUp';
  rememberMe?: boolean;
  setRememberMe: React.Dispatch<React.SetStateAction<boolean>>;
};

export interface SignInFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export default function Form({
  handleFormSubmit,
  mode,
  rememberMe,
  setRememberMe,
}: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((prev) => !prev);
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignInFormData>();

  const password = watch('password');

  // Use effect to handle clearing the confirmPassword field when there's a mismatch error
  useEffect(() => {
    if (errors.confirmPassword?.message === 'Passwords do not match') {
      setValue('confirmPassword', '');
    }
  }, [errors.confirmPassword, setValue]);

  return (
    <div className='w-[20vw] h-full'>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className='flex flex-col pb-10'
        autoComplete='on'
      >
        <label htmlFor='email'>email</label>
        <input
          id='email'
          type='email'
          placeholder={errors.email ? errors.email.message : 'Enter your email'}
          className={`w-full px-3 py-2 text-sm mb-4 outline-none ${
            errors.email
              ? 'input-error placeholder-error'
              : 'border border-slate-300'
          }`}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address',
            },
          })}
        />

        <label htmlFor='password'>password</label>
        <div
          className={`flex items-center mb-3 w-full px-3 ${
            errors.password ? 'input-error' : 'border border-slate-300'
          }`}
        >
          <input
            id='password'
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete={
              mode === 'signIn' ? 'current-password' : 'new-password'
            }
            placeholder={
              errors.password ? errors.password.message : 'Enter your password'
            }
            className='w-full py-2 text-sm outline-none'
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
          <div
            className='mr-3 cursor-pointer'
            onClick={togglePasswordVisibility}
          >
            <img
              src={isPasswordVisible ? visibilityOff : visibilityOn}
              alt='Toggle password field visibility'
              className='h-5 w-5'
            />
          </div>
        </div>

        {mode === 'signUp' && (
          <>
            <label htmlFor='confirmPassword'>confirm password</label>
            <div
              className={`flex items-center mb-3 w-full px-3 ${
                errors.confirmPassword
                  ? 'input-error'
                  : 'border border-slate-300'
              }`}
            >
              <input
                id='confirmPassword'
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                placeholder={
                  errors.confirmPassword
                    ? errors.confirmPassword.message
                    : 'Confirm your password'
                }
                className={`w-full py-2 text-sm outline-none ${
                  errors.confirmPassword ? 'placeholder-error' : ''
                }`}
                {...register('confirmPassword', {
                  required: 'Confirm password is required',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
              />
              <div
                className='mr-3 cursor-pointer'
                onClick={toggleConfirmPasswordVisibility}
              >
                <img
                  src={isConfirmPasswordVisible ? visibilityOff : visibilityOn}
                  alt='Toggle confirm password field visibility'
                  className='h-5 w-5'
                />
              </div>
            </div>
          </>
        )}

        <div className='checkbox-container'>
          <input
            type='checkbox'
            id='rememberMe'
            checked={rememberMe}
            onChange={() => setRememberMe((prev) => !prev)}
          />
          <label htmlFor='rememberMe'>Remember me</label>
        </div>

        <Button type='submit' className='text-xl' colorVariant='light'>
          {mode === 'signIn' ? 'sign in' : 'sign up'}
        </Button>
      </form>
    </div>
  );
}
