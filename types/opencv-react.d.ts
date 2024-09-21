declare module 'opencv-react' {
  import React from 'react';

  interface OpenCvProviderProps {
    openCvPath?: string;
    children: React.ReactNode;
    onLoad?: () => void;
    onError?: (error: Error) => void;
  }

  export class OpenCvProvider extends React.Component<OpenCvProviderProps> {}

  interface UseOpenCv {
    loaded: boolean;
    loading: boolean;
    error: Error | null;
    cv: typeof cv; 
  }

  export function useOpenCv(): UseOpenCv;
}
