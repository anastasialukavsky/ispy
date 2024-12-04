import { useState } from 'react';
import API from '../../../api';
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from '@react-oauth/google';
import { NavLink, useNavigate } from 'react-router-dom';
import Form from '../signIn/Form';
import { Button } from '../../../UI';
import Separator from '../signIn/Separator';
import jwtDecode from 'jwt-decode';
import { useAuth } from '../../../context/AuthContext';

interface GoogleCredentialResponse {
  clientId: string;
  credential: string;
  select_by: string;
}

export default function SignUp() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const navigate = useNavigate();
  let errors: string | any[] = [];

  const handleGoogleSignUp = async (credentialResponse: CredentialResponse) => {
    try {
    //  const decoded: any = jwtDecode(credentialResponse.credential);

       // Check if email is present
      //  if (!decoded.email) {
      //    throw new Error('Failed to extract email from Google credential.');
      //  }
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

  const handleSignUp = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
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
        email,
        passwordHash: password,
        role,
      },
    };

    try {
      const response = await API.post('', { query: mutation, variables });
      if (response.status !== 200) {
        console.error('HTTP Status:', response.status);
        throw new Error(
          'GraphQL request failed with status code: ' + response.status
        );
      }
      const data = response.data;

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
      console.error('Sign-up failed:', error.message);
      alert('Sign-up failed. Please try again.');
    }
  };

  return (
    <div className='w-full min-h-[calc(100vh_-_64px)] bg-primary-dark-gray text-primary-light-fill font-abel flex flex-col gap-3 items-center pt-20'>
      <h1 className='text-3xl text-primary-light-fill'>Sign Up</h1>
      <Form
        email={email}
        password={password}
        setPassword={setPassword}
        setEmail={setEmail}
        handleSubmit={handleSignUp}
        mode='signUp'
      />
      <p>
        Have an accound already?{' '}
        <NavLink
          to='/auth/signin'
          className='cursor-pointer underline-offset-1 text-primary-light-fill'
        >
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
