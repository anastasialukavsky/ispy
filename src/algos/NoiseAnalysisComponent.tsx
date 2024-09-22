import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  tamperingResult,
  setTamperingResult,
  processing,
  setProcessing,
  setTamperingProbability
}: NoiseAnalysisComponentProps) {
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (imageSrc) {
      processImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  const detectNoiseInconsistencies = useCallback(
    (srcMat: cv.Mat, width: number, height: number) => {
      try {
        // Convert to grayscale
        const grayMat = new cv.Mat();
        cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);

        // Edge detection to create a mask
        const edges = new cv.Mat();
        cv.Canny(grayMat, edges, 100, 200);
        const edgeMask = new cv.Mat();
        cv.bitwise_not(edges, edgeMask);

        // Apply a high-pass filter to isolate noise
        const blurredMat = new cv.Mat();
        cv.GaussianBlur(grayMat, blurredMat, new cv.Size(5, 5), 0);
        const noiseMat = new cv.Mat();
        cv.subtract(grayMat, blurredMat, noiseMat);

        // Divide the image into blocks
        const blockSize = 8;
        const rows = Math.floor(height / blockSize);
        const cols = Math.floor(width / blockSize);

        let totalVariance = 0;
        let totalBlocks = 0;

        // Calculate variance for each block
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * blockSize;
            const y = row * blockSize;

            // Extract block from the noiseMat
            const block = noiseMat.roi(new cv.Rect(x, y, blockSize, blockSize));

            // Calculate variance for the block
            const meanStdDev = new cv.Mat();
            cv.meanStdDev(block, new cv.Mat(), meanStdDev);
            const variance = meanStdDev.doubleAt(1, 0) ** 2;

            totalVariance += variance;
            totalBlocks++;

            block.delete();
            meanStdDev.delete();
          }
        }

        // Compute the average variance
        const averageVariance = totalVariance / totalBlocks;

        // Assign tampering score based on the average variance
        const tamperingScore = averageVariance > 0.5 ? 1 : averageVariance;

        setTamperingProbability(tamperingScore * 100); // Convert to percentage

        const algo = 'Noise Analysis';

        onResult({ score: tamperingScore, algo });

        setTamperingResult(
          tamperingScore > 0.01 ? 'Tampering detected' : 'No tampering detected'
        );

        // Clean up
        grayMat.delete();
        blurredMat.delete();
        noiseMat.delete();
        edges.delete();
        edgeMask.delete();
      } catch (error) {
        console.error('Error in noise analysis:', error);
        setTamperingResult('Error in noise analysis.');
      }
    },
    [onResult, setTamperingResult]
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

        processedCanvasRef.current!.width = width;
        processedCanvasRef.current!.height = height;

        const ctx = processedCanvasRef.current!.getContext('2d', {
          willReadFrequently: true,
        });

        if (!ctx) {
          throw new Error('Failed to get context for processed canvas');
        }
        ctx.drawImage(img, 0, 0, width, height);

        const srcMat = cv.imread(processedCanvasRef.current!);
        if (srcMat.empty()) {
          throw new Error('Failed to read image into OpenCV Mat');
        }

        detectNoiseInconsistencies(srcMat, width, height);
        srcMat.delete();
        setProcessing(false);
      } catch (error) {
        console.error('Error processing image:', error);
        setProcessing(false);
        setTamperingResult('Error processing image.');
      }
    };
    img.onerror = () => {
      setProcessing(false);
      setTamperingResult('Failed to load image.');
    };
  }, [imageSrc, detectNoiseInconsistencies, setProcessing, setTamperingResult]);

  return (
    <div>
      {processing && <Loader />}
      <canvas ref={processedCanvasRef} />
    </div>
  );
}
