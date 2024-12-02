import React from 'react';

type Props = {
  email: string;
  password: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleSignIn: (event: { preventDefault: () => void }) => Promise<void>;
};
export default function Form({
  email,
  password,
  setEmail,
  setPassword,
  handleSignIn,
}: Props) {
  return (
    <div className='w-[20vw] bg-blue-400 h-full'>
      <form
        action='submit'
        className='bg-red-400 flex flex-col border border-black w-full '
      >
        <label htmlFor='email'>
          email
          <input
            type='email'
            placeholder='email'
            autoComplete='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full px-3 py-2 bg-blue-700 border border-slate-300 rounded-md text-sm mb-4'
            // style={{ borderRadius: '8px', backgroundColor: '#1E3A8A' }}
          />
        </label>
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full px-3 py-2 bg-blue-700 border border-slate-300 rounded-md text-sm mb-4'
        />
        <button onClick={handleSignIn} className='border mt-10'>
          sign in
        </button>
      </form>
    </div>
  );
}
