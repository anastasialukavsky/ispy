import { useState } from 'react';
import API from '../../../api';
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from '@react-oauth/google';
import { NavLink, useNavigate } from 'react-router-dom';
import Form, { SignInFormData } from '../signIn/Form';
import { Button } from '../../../UI';
import Separator from '../signIn/Separator';
import { useAuth } from '../../../context/AuthContext';

interface GoogleCredentialResponse {
  clientId: string;
  credential: string;
  select_by: string;
}

export default function SignUp() {
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  let errors: string | any[] = [];

  const handleGoogleSignUp = async (credentialResponse: CredentialResponse) => {
    try {

      const mutation = `
        mutation SignUp($input: AuthSignUpInput!) {
          signUp(input: $input) {
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
          oAuthProvider: 'google',
          oAuthId: credentialResponse.credential,
          // credential: credentialResponse.credential,
        },
      };

      const { data } = await API.post('', { query: mutation, variables });

      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        errors = data.errors;
        throw new Error('GraphQL request failed');
      }

      const { accessToken } = data.data.signUp;
      localStorage.setItem('token', accessToken);
       login();
      // alert('Sign-up successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Google sign-in failed:', error.message);
      alert('Google sign-in failed.');
    }
  };

  const handleSignUp = async (data: SignInFormData) => {
    const mutation = `
    mutation SignUp($input: AuthSignUpInput!) {
      signUp(input: $input) {
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
        role: 'USER',
      },
    };

    try {
      const response = await API.post('', { query: mutation, variables });
      const result = response.data;

      if (!result || result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error('GraphQL request failed');
      }

      const { accessToken } = result.data.signUp;
      // Store the token based on the 'rememberMe' flag
      if (rememberMe) {
        localStorage.setItem('token', accessToken);
      } else {
        sessionStorage.setItem('token', accessToken);
      }

      login();
      navigate('/');
    } catch (error: any) {
      console.error('Sign-up failed:', error.message);
      alert('Sign-up failed. Please try again.');
    }
  };


  return (
    <div className='w-full min-h-[calc(100vh_-_64px)] bg-primary-dark-gray text-primary-light-fill font-abel flex flex-col gap-3 items-center pt-20'>
      <h1 className='text-3xl text-primary-light-fill'>Sign Up</h1>
      <Form
        handleFormSubmit={handleSignUp}
        mode='signUp'
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
      />
      <p>
        Have an accound already?{' '}
        <NavLink to='/auth/signin' className='animated-link'>
          sign in
        </NavLink>{' '}
        instead
      </p>
      <Separator />
      <GoogleOAuthProvider clientId='778743708511-482k2i9mrc6oq5fgs5824p50f5jfod93.apps.googleusercontent.com'>
        <GoogleLogin
          onSuccess={handleGoogleSignUp}
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
