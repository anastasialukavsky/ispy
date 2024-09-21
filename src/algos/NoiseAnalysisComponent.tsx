import React, { useRef, useEffect } from 'react';
import cv from '@techstark/opencv-js';

interface NoiseAnalysisComponentProps {
  imageSrc: string | null;
  onResult: (result: { score: number; algo: string }) => void;
  tamperingResult: string | null;
  setTamperingResult: React.Dispatch<React.SetStateAction<string | null>>;
  processing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function NoiseAnalysisComponent ({
  imageSrc,
  onResult,
  tamperingResult,
  setTamperingResult,
  processing,
  setProcessing,
}: NoiseAnalysisComponentProps)  {
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (imageSrc) {
      processImage();
    }
  }, [imageSrc]);

  const processImage = () => {
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

        const ctx = processedCanvasRef.current!.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get context for processed canvas');
        }
        ctx.drawImage(img, 0, 0, width, height);

        const srcMat = cv.imread(processedCanvasRef.current!);
        if (srcMat.empty()) {
          throw new Error('Failed to read image into OpenCV Mat');
        }

        detectNoiseAndEdges(srcMat, width, height);
        srcMat.delete();
        setProcessing(false);
      } catch (error) {
        console.error('Error processing image:', error);
        setProcessing(false);
        setTamperingResult('Error processing image');
      }
    };
    img.onerror = () => {
      setProcessing(false);
      setTamperingResult('Failed to load image');
    };
  };

  const detectNoiseAndEdges = (
    srcMat: cv.Mat,
    width: number,
    height: number
  ) => {
    try {
      const grayMat = new cv.Mat();
      cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);

      const blurredMat = new cv.Mat();
      cv.GaussianBlur(grayMat, blurredMat, new cv.Size(5, 5), 0);

      const noiseScore = calculateNoiseScore(grayMat, blurredMat);

      const tamperingResult =
        noiseScore > 0.2
          ? 'Noise-based tampering detected.'
          : 'No significant noise tampering detected.';

      onResult({ score: noiseScore, algo: 'Noise' });
      setTamperingResult(tamperingResult);

      grayMat.delete();
      blurredMat.delete();
    } catch (error) {
      console.error('Error in noise analysis:', error);
      setTamperingResult('Error in noise analysis');
    }
  };

  const calculateNoiseScore = (grayMat: cv.Mat, blurredMat: cv.Mat): number => {
    const diffMat = new cv.Mat();
    cv.absdiff(grayMat, blurredMat, diffMat);

    const thresholdMat = new cv.Mat();
    cv.threshold(diffMat, thresholdMat, 25, 255, cv.THRESH_BINARY);

    const nonZero = cv.countNonZero(thresholdMat);
    const totalPixels = grayMat.cols * grayMat.rows;

    const noisePercentage = (nonZero / totalPixels) * 100;

    diffMat.delete();
    thresholdMat.delete();

    return noisePercentage / 100;
  };

  return (
    <div>
      {processing && <p>Processing image...</p>}
      <canvas ref={processedCanvasRef} style={{ border: '1px solid #ccc' }} />
    </div>
  );
};

