import React, { useRef, useEffect, useCallback } from 'react';
import cv from '@techstark/opencv-js';
import Loader from '../UI/Loader';

interface NoiseAnalysisComponentProps {
  imageSrc: string | null;
  onResult: (result: { score: number; algo: string }) => void;
  tamperingResult: string | null;
  setTamperingResult: React.Dispatch<React.SetStateAction<string | null>>;
  processing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setTamperingProbability: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function NoiseAnalysisComponent({
  imageSrc,
  onResult,
  setTamperingResult,
  setProcessing,
  setTamperingProbability,
  processing,
}: NoiseAnalysisComponentProps) {
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (imageSrc) {
      processImage();
    }
  }, [imageSrc]);

  const calculateNoiseScore = useCallback(
    (grayMat: cv.Mat, blurredMat: cv.Mat): number => {
      // Compute the difference between the original grayscale and blurred image
      const diffMat = new cv.Mat();
      cv.absdiff(grayMat, blurredMat, diffMat);

      // Threshold the difference to detect noise pixels
      const thresholdMat = new cv.Mat();
      cv.threshold(diffMat, thresholdMat, 25, 255, cv.THRESH_BINARY);

      const nonZero = cv.countNonZero(thresholdMat);
      const totalPixels = grayMat.cols * grayMat.rows;

      const noisePercentage = (nonZero / totalPixels) * 100;

      // Clean up
      diffMat.delete();
      thresholdMat.delete();

      // Return the noise percentage, converted to a score (higher score = more noise)
      return noisePercentage / 100; // Normalize score between 0 and 1
    },
    []
  );

  const detectNoiseAndEdges = useCallback(
    (srcMat: cv.Mat, width: number, height: number) => {
      try {
        console.log('Starting image processing...');

        // Step 1: Convert image to grayscale
        const grayMat = new cv.Mat();
        cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);
        console.log('Grayscale conversion done.');

        // Step 2: Apply Gaussian blur
        const blurredMat = new cv.Mat();
        cv.GaussianBlur(grayMat, blurredMat, new cv.Size(5, 5), 0);
        console.log('Gaussian blur applied.');

        // Display the processed image (grayscale)
        cv.imshow(processedCanvasRef.current!, grayMat);

        // Calculate noise score
        const noiseScore = calculateNoiseScore(grayMat, blurredMat);

        // Output the result to the parent component
        onResult({ score: noiseScore, algo: 'Noise Analysis' });

        // Set tampering probability based on noise score
        setTamperingProbability(noiseScore * 100);

        grayMat.delete();
        blurredMat.delete();
        console.log('Image processing completed successfully.');
      } catch (error) {
        console.error('Error in detectNoiseAndEdges:', error);
        setTamperingResult('An error occurred during noise and edge analysis.');
        setProcessing(false);
        onResult({ score: 1, algo: 'Noise Analysis' }); 
      }
    },
    [
      calculateNoiseScore,
      onResult,
      setTamperingProbability,
      setTamperingResult,
      setProcessing,
    ]
  );

  const processImage = useCallback(() => {
    if (!cv || !processedCanvasRef.current || !imageSrc) return;
    setProcessing(true);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;
    img.onload = () => {
      try {
        const MAX_WIDTH = 500;
        const scale = MAX_WIDTH / img.width;
        const width = MAX_WIDTH;
        const height = img.height * scale;

        // Set canvas dimensions
        processedCanvasRef.current!.width = width;
        processedCanvasRef.current!.height = height;

        const ctx = processedCanvasRef.current!.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get context for processed canvas');
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to OpenCV Mat
        const srcMat = cv.imread(processedCanvasRef.current!);

        if (srcMat.empty()) {
          throw new Error('Failed to read image into OpenCV Mat');
        }

        detectNoiseAndEdges(srcMat, width, height);

        srcMat.delete();
        setProcessing(false);
      } catch (error) {
        console.error('Error processing image:', error);
        setTamperingResult('An error occurred during processing.');
        setProcessing(false);
      }
    };
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      setTamperingResult('Failed to load the image.');
      setProcessing(false);
    };
  }, [imageSrc, detectNoiseAndEdges, setProcessing, setTamperingResult]);

  return (
    <div>
      {processing && <Loader />}
      <canvas ref={processedCanvasRef} />
    </div>
  );
}
