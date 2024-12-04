import { useState } from 'react';
import API from '../../../api';
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from '@react-oauth/google';
import { NavLink, redirect, useNavigate } from 'react-router-dom';
import Form from './Form';
import TestForm from './TestForm';
import Separator from './Separator';
import { useAuth } from '../../../context/AuthContext';

interface GoogleCredentialResponse {
  clientId: string;
  credential: string;
  select_by: string;
}

export default function SignIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  let errors: string | any[] = [];

  const handleGoogleSignIn = async (credentialResponse: CredentialResponse) => {
    try {
      const mutation = `
        mutation SignIn($input: AuthSignInInput!) {
          signIn(input: $input) {
            user {
              userId
              email
              createdAt
              updatedAt
            }
            accessToken
          }
        }
      `;

      const variables = {
        input: {
          oAuthProvider: 'google',
          oAuthId: credentialResponse.credential,
        },
      };

      const { data } = await API.post('', { query: mutation, variables });

      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        errors = data.errors;
        throw new Error('GraphQL request failed');
      }

      const { accessToken } = data.data.signIn;
      localStorage.setItem('token', accessToken);
       login();
      // alert('Sign-in successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Google sign-in failed:', error.message);
      alert('Google sign-in failed.');
    }
  };

  const handleSignIn = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const mutation = `
      mutation SignIn($input: AuthSignInInput!) {
        signIn(input: $input) {
          user {
            userId
            email
            role
            createdAt
            updatedAt
          }
          accessToken
        }
      }
    `;

    const variables = {
      input: {
        email,
        passwordHash: password,
      },
    };

    try {
      const { data } = await API.post('', { query: mutation, variables });

      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        throw new Error('GraphQL request failed');
      }

      const { accessToken } = data.data.signIn;
      console.log('Access token:', accessToken);

      localStorage.setItem('token', accessToken);
       login();
      // alert('Sign-in successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Sign-in failed:', error.message);
      alert('Sign-in failed. Please try again.');
    }
  };

  return (
    <div className='w-full min-h-[calc(100vh_-_64px)] bg-primary-dark-gray text-primary-light-fill font-abel flex flex-col gap-3 items-center pt-20'>
      <h1 className='text-3xl text-primary-light-fill'>Sign In</h1>
      <Form
        email={email}
        password={password}
        setPassword={setPassword}
        setEmail={setEmail}
        handleSubmit={handleSignIn}
        mode='signIn'
      />

      <p className=''>
        don't have an account?{' '}
        <NavLink
          to='/auth/signup'
          className='cursor-pointer underline-offset-1 text-primary-light-fill'
        >
          sign up
        </NavLink>{' '}
        instead
      </p>
      <Separator/>
      <GoogleOAuthProvider clientId='778743708511-482k2i9mrc6oq5fgs5824p50f5jfod93.apps.googleusercontent.com'>
        <GoogleLogin
          onSuccess={handleGoogleSignIn}
          onError={() => console.log('Google login failed')}
          width='350px'
          size='medium'
          shape='square'
          logo_alignment='center'
          type='standard'
        />
      </GoogleOAuthProvider>
    </div>
  );
}
