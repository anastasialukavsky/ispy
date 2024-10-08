import React, {
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import cv from '@techstark/opencv-js';
import Loader from '../UI/Loader';

interface ELAComponentProps {
  imageSrc: string | null;
  onResult: (result: { score: number; algo: string }) => void;
  tamperingResult: string | null;
  setTamperingResult: Dispatch<SetStateAction<string | null>>;
  processing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setTamperingProbability: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function ELAComponent({
  imageSrc,
  onResult,
  tamperingResult,
  setTamperingResult,
  processing,
  setProcessing,
  setTamperingProbability,
}: ELAComponentProps) {
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    processImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  const detectELA = useCallback(
    async (src: cv.Mat, width: number, height: number) => {
      try {
        const originalCanvas = document.createElement('canvas');
        originalCanvas.width = src.cols;
        originalCanvas.height = src.rows;
        cv.imshow(originalCanvas, src);

        const recompressedDataURL = originalCanvas.toDataURL(
          'image/jpeg',
          0.75
        );

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

        const diffMat = new cv.Mat();
        cv.absdiff(src, recompressedMat, diffMat);

        const amplifiedDiff = new cv.Mat();
        diffMat.convertTo(amplifiedDiff, cv.CV_8UC4, 10, 0);

        const displayMat = new cv.Mat();
        cv.cvtColor(amplifiedDiff, displayMat, cv.COLOR_RGBA2RGB);
        cv.imshow(processedCanvasRef.current!, displayMat);

        const diffGray = new cv.Mat();
        cv.cvtColor(diffMat, diffGray, cv.COLOR_RGBA2GRAY);
        const amplifiedDiffGray = new cv.Mat();
        cv.convertScaleAbs(diffGray, amplifiedDiffGray, 10, 0);
        const threshMat = new cv.Mat();
        cv.threshold(amplifiedDiffGray, threshMat, 20, 255, cv.THRESH_BINARY);

        const nonZero = cv.countNonZero(threshMat);
        const totalPixels = width * height;
        const tamperingPercentage = (nonZero / totalPixels) * 100;

        setTamperingProbability(tamperingPercentage);

        let elaScore = tamperingPercentage / 100;
        if (tamperingPercentage > 35) {
          setTamperingResult(
            'Significant ELA discrepancies detected, potential tampering.'
          );
        } else if (tamperingPercentage > 1.5) {
          setTamperingResult(
            'Moderate ELA discrepancies detected. Some signs of potential image alterations.'
          );
        } else {
          setTamperingResult(
            'Minimal ELA discrepancies, the image appears to have no significant alterations.'
          );
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
    },
    [onResult, setTamperingResult, setProcessing, setTamperingProbability]
  );

  const processImage = useCallback(() => {
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
  }, [imageSrc, detectELA, setProcessing, setTamperingResult]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = processedCanvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const zoomSize = 150;
    const zoomFactor = 2;

    const adjustedX = Math.max(
      zoomSize / 2,
      Math.min(x, rect.width - zoomSize / 2)
    );
    const adjustedY = Math.max(
      zoomSize / 2,
      Math.min(y, rect.height - zoomSize / 2)
    );

    setMousePosition({ x: adjustedX, y: adjustedY });

    const zoomCtx = zoomCanvasRef.current!.getContext('2d');
    if (zoomCtx) {
      zoomCtx.clearRect(
        0,
        0,
        zoomCanvasRef.current!.width,
        zoomCanvasRef.current!.height
      );
      zoomCtx.drawImage(
        processedCanvasRef.current!,
        adjustedX - zoomSize / 2,
        adjustedY - zoomSize / 2,
        zoomSize,
        zoomSize,
        0,
        0,
        zoomSize * zoomFactor,
        zoomSize * zoomFactor
      );
    }
  };
  const handleMouseLeave = () => {
    setMousePosition(null);
  };

  return (
    <div className='relative'>
      <div>
        {processing && <Loader />}
        <canvas
          ref={processedCanvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'crosshair' }}
        />
      </div>

      {/* Zoom Tooltip */}
      {mousePosition && (
        <div
          style={{
            position: 'absolute',
            top: mousePosition.y + 10,
            left: mousePosition.x + 10,
            border: '1px solid #fff',
            zIndex: 10,
          }}
        >
          <canvas ref={zoomCanvasRef} width={200} height={200} />
        </div>
      )}
    </div>
  );
}
