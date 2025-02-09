import { useState } from 'react';
import API from '../../../api';
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from '@react-oauth/google';
import { NavLink, useNavigate } from 'react-router-dom';
import Form, { SignInFormData } from './Form';
import Separator from './Separator';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// @ts-ignore
interface GoogleCredentialResponse {
  clientId: string;
  credential: string;
  select_by: string;
}

export default function SignIn() {
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const navigate = useNavigate();
  // @ts-ignore
  let errorsArr: string | any[] = [];

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
        errorsArr = data.errors;
        throw new Error('GraphQL request failed');
      }

      const { accessToken } = data.data.signIn;
      localStorage.setItem('token', accessToken);
      login();
      toast.success('Sign-in successful!');
      // alert('Sign-in successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Google sign-in failed:', error.message);
      // alert('Google sign-in failed.');
      toast.error('Google sign-in failed.');
    }
  };

  const handleSignIn = async (data: SignInFormData) => {
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
        email: data.email,
        passwordHash: data.password,
      },
    };

    try {
      const { data: response } = await API.post('', {
        query: mutation,
        variables,
      });

      if (response.errors) {
        console.error('GraphQL errors:', response.errors);
        throw new Error('GraphQL request failed');
      }

      const { accessToken } = response.data.signIn;

      if (rememberMe) {
        localStorage.setItem('token', accessToken);
      } else {
        sessionStorage.setItem('token', accessToken);
      }
      login();
      toast.success('Sign-in successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Sign-in failed:', error.message);
      // alert('Sign-in failed. Please try again.');
      toast.error('Sign-in failed. Invalid credentials');
    }
  };

  return (
    <div className='w-full min-h-[calc(100vh_-_64px)] bg-primary-dark-gray text-primary-light-fill font-abel flex flex-col gap-3 items-center pt-20'>
      <h1 className='text-3xl text-primary-light-fill'>Sign In</h1>
      <Form
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        handleFormSubmit={handleSignIn}
        mode='signIn'
      />

      <p className=''>
        don't have an account?{' '}
        <NavLink to='/auth/signup' className='animated-link'>
          sign up
        </NavLink>{' '}
        instead
      </p>
      <Separator />
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
