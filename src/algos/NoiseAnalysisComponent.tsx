import React, { useRef, useEffect, useCallback, useState } from 'react';
import cv from '@techstark/opencv-js';
import Loader from '../UI/Loader';

interface NoiseAnalysisComponentProps {
  imageSrc: string | null;
  onResult: (result: {
    score: number;
    algo: string;
    temperingAnalysis: string;
  }) => void;
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
  setProcessing,
  setTamperingProbability,
  processing,
}: NoiseAnalysisComponentProps) {
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [latestNoiseScore, setLatestNoiseScore] = useState<number>(0);

  useEffect(() => {
    if (imageSrc) {
      processImage();
    }
  }, [imageSrc]);
  let tamperingText: string;

  const detectNoiseAndEdges = useCallback(
    // @ts-ignore
    (srcMat: cv.Mat, width: number, height: number) => {
      try {
        // Clone the source so we don't alter the original image displayed on canvas.
        const processingMat = srcMat.clone();

        // Convert the cloned image to grayscale.
        const grayMat = new cv.Mat();
        cv.cvtColor(processingMat, grayMat, cv.COLOR_RGBA2GRAY);

        // Define block size for local noise estimation.
        const blockSize = 16;
        const blockData: {
          x: number;
          y: number;
          width: number;
          height: number;
          noise: number;
        }[] = [];

        // Loop over blocks and compute noise (standard deviation) for each block.
        for (let y = 0; y < grayMat.rows; y += blockSize) {
          for (let x = 0; x < grayMat.cols; x += blockSize) {
            const rectWidth = Math.min(blockSize, grayMat.cols - x);
            const rectHeight = Math.min(blockSize, grayMat.rows - y);
            const rect = new cv.Rect(x, y, rectWidth, rectHeight);
            const block = grayMat.roi(rect);

            const mean = new cv.Mat();
            const stddev = new cv.Mat();
            cv.meanStdDev(block, mean, stddev);
            const noise = stddev.data64F[0];
            blockData.push({
              x,
              y,
              width: rectWidth,
              height: rectHeight,
              noise,
            });

            mean.delete();
            stddev.delete();
            block.delete();
          }
        }

        // Calculate global average noise.
        const n = blockData.length;
        const totalNoise = blockData.reduce((acc, b) => acc + b.noise, 0);
        const avgNoise = totalNoise / n;

        // Calculate global noise standard deviation.
        const variance =
          blockData.reduce((acc, b) => acc + (b.noise - avgNoise) ** 2, 0) / n;
        const stdNoise = Math.sqrt(variance);

        // Compute the overall noise inconsistency score.
        const noiseScore = avgNoise > 0 ? stdNoise / avgNoise : 0;
        setLatestNoiseScore(noiseScore);
        if (noiseScore > 0.5) {
          tamperingText =
            'Significant inconsistency in noise detected, potential tampering.';
        } else if (noiseScore > 0.3) {
          tamperingText =
            'Moderate inconsistency in noise detected. Some signs of potential image alterations.';
        } else {
          tamperingText =
            'Minimal noise variation detected, the image appears unaltered.';
        }
        setTamperingResult(tamperingText);

        // Notify the parent component with the analysis result.
        onResult({
          score: noiseScore,
          algo: 'Noise Analysis',
          temperingAnalysis: tamperingText ?? 'No analysis available',
        });
        setTamperingProbability(noiseScore * 100);

        // Identify suspicious blocks (those deviating more than 1 standard deviation from the average).
        const suspiciousBlocks = blockData.filter(
          (block) => Math.abs(block.noise - avgNoise) > stdNoise
        );

        // Draw rectangles over suspicious blocks on the canvas overlay.
        const canvas = processedCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Set style for suspicious regions.
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            suspiciousBlocks.forEach((block) => {
              ctx.strokeRect(block.x, block.y, block.width, block.height);
            });
          }
        }

        grayMat.delete();
        processingMat.delete();

        console.log('Digital forgery analysis completed successfully.');
      } catch (error) {
        console.error('Error in detectNoiseAndEdges:', error);
        setTamperingResult(
          'An error occurred during digital forgery analysis.'
        );
        setProcessing(false);
        onResult({
          score: 1,
          algo: 'Digital Forgery Analysis',
          temperingAnalysis: tamperingText ?? 'No analysis available',
        });
      }
    },
    [onResult, setTamperingProbability, setTamperingResult, setProcessing]
  );
  useEffect(() => {
    if (tamperingResult) {
      onResult({
        score: latestNoiseScore,
        algo: 'Noise Analysis',
        temperingAnalysis: tamperingResult,
      });
    }
  }, [tamperingResult]);
  const processImage = useCallback(() => {
    if (!cv || !processedCanvasRef.current || !imageSrc) return;
    setProcessing(true);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;
    img.onload = () => {
      try {
        // Maintain original image size (scaled to a maximum width) for display.
        const MAX_WIDTH = 500;
        const scale = MAX_WIDTH / img.width;
        const width = MAX_WIDTH;
        const height = img.height * scale;

        // Set canvas dimensions and draw the original image on it.
        processedCanvasRef.current!.width = width;
        processedCanvasRef.current!.height = height;
        const ctx = processedCanvasRef.current!.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get context for processed canvas');
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Read the image from the canvas into an OpenCV Mat.
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
