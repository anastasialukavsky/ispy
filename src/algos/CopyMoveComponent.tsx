import React, { useState, useRef, useEffect } from 'react';
import cv from '@techstark/opencv-js';

interface CopyMoveComponentProps {
  imageSrc: string | null;
  onResult: (result: { score: number; algo: string }) => void;
  tamperingResult: string | null;
  setTamperingResult: React.Dispatch<React.SetStateAction<string | null>>;
  processing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

const CopyMoveComponent = ({
  imageSrc,
  onResult,
  tamperingResult,
  setTamperingResult,
  processing,
  setProcessing,
}: CopyMoveComponentProps) => {
  // const [processing, setProcessing] = useState<boolean>(false);
  // const [tamperingResult, setTamperingResult] = useState<string | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (imageSrc) {
      processImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // Set canvas dimensions for processed image
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

        detectCopyMoveForgery(srcMat, width, height);

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

  const detectCopyMoveForgery = (
    srcMat: cv.Mat,
    width: number,
    height: number
  ) => {
    try {
      // Resize image for performance
      let resizedMat = new cv.Mat();
      const maxDim = 500;
      if (srcMat.cols > maxDim || srcMat.rows > maxDim) {
        const scale = Math.min(maxDim / srcMat.cols, maxDim / srcMat.rows);
        cv.resize(
          srcMat,
          resizedMat,
          new cv.Size(0, 0),
          scale,
          scale,
          cv.INTER_AREA
        );
      } else {
        resizedMat = srcMat.clone();
      }

      // Convert to grayscale
      const grayMat = new cv.Mat();
      cv.cvtColor(resizedMat, grayMat, cv.COLOR_RGBA2GRAY);

      // Initialize ORB detector with more features
      const orb = new cv.ORB(10000);

      // Detect keypoints and compute descriptors
      const keypoints = new cv.KeyPointVector();
      const descriptors = new cv.Mat();
      orb.detectAndCompute(grayMat, new cv.Mat(), keypoints, descriptors);

      // Match features with themselves using KNN
      const bf = new cv.BFMatcher(cv.NORM_HAMMING, false);
      const matches = new cv.DMatchVectorVector();
      bf.knnMatch(descriptors, descriptors, matches, 2);

      // Apply ratio test to filter good matches
      const goodMatches = new cv.DMatchVector();
      for (let i = 0; i < matches.size(); i++) {
        const m = matches.get(i).get(0);
        const n = matches.get(i).get(1);

        // Ratio test
        if (m.distance < 0.75 * n.distance) {
          // Exclude matches where keypoints are the same
          if (m.queryIdx !== m.trainIdx) {
            const kp1 = keypoints.get(m.queryIdx).pt;
            const kp2 = keypoints.get(m.trainIdx).pt;

            // Spatial distance constraint
            const distance = Math.hypot(kp1.x - kp2.x, kp1.y - kp2.y);
            if (distance > 10) {
              goodMatches.push_back(m);
            }
          }
        }
      }

      // Create a new empty Mat to avoid drawing on the original image
      const outputMat = resizedMat.clone();

      // Draw matches only on the cloned Mat
      cv.drawMatches(
        resizedMat,
        keypoints,
        resizedMat,
        keypoints,
        goodMatches,
        outputMat
      );

      // Display the result on the processed canvas
      cv.imshow(processedCanvasRef.current!, outputMat);

      // Set tampering result and calculate score
      const tamperingScore = goodMatches.size() / 1000; // Normalize based on 1000 as an arbitrary max threshold
      if (goodMatches.size() > 50) {
        setTamperingResult('Potential copy-move forgery detected.');
      } else {
        setTamperingResult('No significant forgery detected.');
      }

      // Pass the result to the parent component
      onResult({ score: tamperingScore, algo: 'CopyMove' });

      // Clean up
      grayMat.delete();
      orb.delete();
      keypoints.delete();
      descriptors.delete();
      bf.delete();
      matches.delete();
      goodMatches.delete();
      outputMat.delete(); // Remove the result mat after displaying
      resizedMat.delete();
    } catch (error) {
      console.error('Error in detectCopyMoveForgery:', error);
      setTamperingResult('An error occurred during copy-move analysis.');
      setProcessing(false);
    }
  };

  return (
    <div>
      {processing && <p>Processing image...</p>}
      {tamperingResult && !processing && (
        <p>
          <strong>Analysis Result:</strong> {tamperingResult}
        </p>
      )}
      <div style={{ marginTop: '20px' }}>
        <h3>Copy-Move Detection Result:</h3>
        <canvas ref={processedCanvasRef} style={{ border: '1px solid #ccc' }} />
      </div>
    </div>
  );
};

export default CopyMoveComponent;
