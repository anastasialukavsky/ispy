import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import cv from '@techstark/opencv-js';
import { TamperingResult } from './toolbox/TamperingResult';

interface ELAComponentProps {
  imageSrc: string | null;
  onResult: (result: { score: number; algo: string }) => void;
  tamperingResult: string | null;
  setTamperingResult: Dispatch<SetStateAction<string | null>>;
  processing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ELAComponent  ({ imageSrc, onResult, tamperingResult, setTamperingResult, processing, setProcessing }: ELAComponentProps) {

  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    processImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  const processImage = () => {
    if (!cv || !processedCanvasRef.current || !imageSrc) return;
    setProcessing(true);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;
    img.onload = async () => {
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

        await detectELA(srcMat, width, height);

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
  };

  const detectELA = async (src: cv.Mat, width: number, height: number) => {
    try {
      // Convert the src Mat to a data URL with JPEG compression
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = src.cols;
      originalCanvas.height = src.rows;
      cv.imshow(originalCanvas, src);

      // Recompress the image at a lower quality
      const recompressedDataURL = originalCanvas.toDataURL('image/jpeg', 0.75);

      // Load the recompressed image back into OpenCV
      const recompressedImg = new Image();
      recompressedImg.crossOrigin = 'Anonymous';
      recompressedImg.src = recompressedDataURL;
      await new Promise<void>((resolve, reject) => {
        recompressedImg.onload = () => resolve();
        recompressedImg.onerror = (error) => reject(error);
      });

      const recompressedCanvas = document.createElement('canvas');
      recompressedCanvas.width = src.cols;
      recompressedCanvas.height = src.rows;
      const recompressedCtx = recompressedCanvas.getContext('2d');
      if (!recompressedCtx) {
        throw new Error('Failed to get context for recompressed canvas');
      }
      recompressedCtx.drawImage(recompressedImg, 0, 0);

      const recompressedMat = cv.imread(recompressedCanvas);

      if (recompressedMat.empty()) {
        throw new Error('Failed to read recompressed image into OpenCV Mat');
      }

      // Calculate the absolute difference between the original and recompressed images
      const diffMat = new cv.Mat();
      cv.absdiff(src, recompressedMat, diffMat);

      // Amplify the differences
      const amplifiedDiff = new cv.Mat();
      diffMat.convertTo(amplifiedDiff, cv.CV_8UC4, 10, 0);

      // Convert amplifiedDiff to RGB
      const displayMat = new cv.Mat();
      cv.cvtColor(amplifiedDiff, displayMat, cv.COLOR_RGBA2RGB);

      // Display the amplified difference image (ELA image)
      cv.imshow(processedCanvasRef.current!, displayMat);

      // Analyze the result using grayscale thresholding
      const diffGray = new cv.Mat();
      cv.cvtColor(diffMat, diffGray, cv.COLOR_RGBA2GRAY);
      const amplifiedDiffGray = new cv.Mat();
      cv.convertScaleAbs(diffGray, amplifiedDiffGray, 10, 0);
      const threshMat = new cv.Mat();
      cv.threshold(amplifiedDiffGray, threshMat, 20, 255, cv.THRESH_BINARY);

      const nonZero = cv.countNonZero(threshMat);
      const totalPixels = width * height;
      const tamperingPercentage = (nonZero / totalPixels) * 100;

      // Determine result and score
      let elaScore = tamperingPercentage / 100; // Scale to [0, 1] range
      if (tamperingPercentage > 1) {
        setTamperingResult('Potential forgery detected (splicing).');
      } else {
        setTamperingResult('No significant forgery detected.');
        elaScore = 0;
      }

      onResult({ score: elaScore, algo: 'ELA' });

      originalCanvas.remove();
      recompressedCanvas.remove();
      recompressedMat.delete();
      diffMat.delete();
      amplifiedDiff.delete();
      displayMat.delete();
      diffGray.delete();
      amplifiedDiffGray.delete();
      threshMat.delete();
    } catch (error) {
      console.error('Error in detectELA:', error);
      setTamperingResult('An error occurred during ELA analysis.');
      setProcessing(false);
    }
  };

  return (
    <div className=''>
    <div>
      {processing && <p>Processing image...</p>}
      <div>
        {/* <h3>ELA Processed Image:</h3> */}
        <canvas ref={processedCanvasRef} style={{ border: '1px solid #ccc' }} />
      </div>
    </div>
      {/* {tamperingResult && !processing && (
        <TamperingResult tamperingResult={tamperingResult}/>
      )} */}
      </div>
  );
};

