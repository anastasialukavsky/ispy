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
import { Result } from '../nav/nav-components/ImageUploader';

interface ELAComponentProps {
  imageSrc: string | null;
  onResult: (result: Result) => void;
  tamperingResult: string | null;
  setTamperingResult: Dispatch<SetStateAction<string | null>>;
  processing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setTamperingProbability: React.Dispatch<React.SetStateAction<number | null>>;
}

type QualityAnalysis = {
  quality: number;
  score: number;
  suspiciousRatio: number;
  meanIntensity: number;
  largestRegionRatio: number;
  keptRegionCount: number;
  displayMat: cv.Mat;
};

const DISPLAY_MAX_WIDTH = 500;
const JPEG_QUALITIES = [0.95, 0.9, 0.85, 0.75];
const MIN_COMPONENT_AREA_RATIO = 0.0008;
const MAX_COMPONENT_AREA_RATIO = 0.6;

const ZOOM_CANVAS_SIZE = 200;
const ZOOM_SOURCE_SIZE = 100;
const ZOOM_OFFSET = 12;

// Display tuning: raise or lower these to match the older visual feel
const DISPLAY_AMPLIFICATION = 3.2;
const DISPLAY_BRIGHTNESS = 0;
const MAX_BOXES_TO_DRAW = 8;
const MIN_BOX_DIMENSION = 14;

export default function ELAComponent({
  imageSrc,
  onResult,
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
    screenX: number;
    screenY: number;
  } | null>(null);

  useEffect(() => {
    processImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });

  const matMeanScalarToNumber = (mat: cv.Mat) => {
    const meanScalar = cv.mean(mat);
    return meanScalar[0] ?? 0;
  };

  const cleanupMats = (mats: Array<cv.Mat | null | undefined>) => {
    mats.forEach((mat) => {
      if (mat) {
        try {
          mat.delete();
        } catch (error) {
          console.warn('Failed to delete mat:', error);
        }
      }
    });
  };

  const recompressMatAtQuality = useCallback(
    async (src: cv.Mat, quality: number) => {
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = src.cols;
      originalCanvas.height = src.rows;
      cv.imshow(originalCanvas, src);

      const recompressedDataURL = originalCanvas.toDataURL(
        'image/jpeg',
        quality,
      );

      const recompressedImg = await loadImage(recompressedDataURL);

      const recompressedCanvas = document.createElement('canvas');
      recompressedCanvas.width = src.cols;
      recompressedCanvas.height = src.rows;

      const recompressedCtx = recompressedCanvas.getContext('2d');
      if (!recompressedCtx) {
        originalCanvas.remove();
        recompressedCanvas.remove();
        throw new Error('Failed to get context for recompressed canvas');
      }

      recompressedCtx.drawImage(recompressedImg, 0, 0, src.cols, src.rows);

      const recompressedMat = cv.imread(recompressedCanvas);

      originalCanvas.remove();
      recompressedCanvas.remove();

      if (recompressedMat.empty()) {
        recompressedMat.delete();
        throw new Error('Failed to read recompressed image into OpenCV Mat');
      }

      return recompressedMat;
    },
    [],
  );

  const analyzeAtQuality = useCallback(
    async (src: cv.Mat, quality: number): Promise<QualityAnalysis> => {
      let recompressedMat: cv.Mat | null = null;
      let srcGray: cv.Mat | null = null;
      let recompressedGray: cv.Mat | null = null;
      let diffGray: cv.Mat | null = null;
      let blurredDiff: cv.Mat | null = null;
      let normalizedDiff: cv.Mat | null = null;
      let thresholdMask: cv.Mat | null = null;
      let morphMask: cv.Mat | null = null;
      let stats: cv.Mat | null = null;
      let centroids: cv.Mat | null = null;
      let labels: cv.Mat | null = null;
      let filteredMask: cv.Mat | null = null;
      let kernel: cv.Mat | null = null;
      let displayGray: cv.Mat | null = null;
      let displayMat: cv.Mat | null = null;
      let meanMat: cv.Mat | null = null;
      let stdMat: cv.Mat | null = null;

      try {
        recompressedMat = await recompressMatAtQuality(src, quality);

        srcGray = new cv.Mat();
        recompressedGray = new cv.Mat();
        cv.cvtColor(src, srcGray, cv.COLOR_RGBA2GRAY);
        cv.cvtColor(recompressedMat, recompressedGray, cv.COLOR_RGBA2GRAY);

        diffGray = new cv.Mat();
        cv.absdiff(srcGray, recompressedGray, diffGray);

        blurredDiff = new cv.Mat();
        cv.GaussianBlur(
          diffGray,
          blurredDiff,
          new cv.Size(5, 5),
          0,
          0,
          cv.BORDER_DEFAULT,
        );

        meanMat = new cv.Mat();
        stdMat = new cv.Mat();
        cv.meanStdDev(blurredDiff, meanMat, stdMat);

        const meanIntensity =
          meanMat.data64F?.[0] ?? matMeanScalarToNumber(blurredDiff);
        const stdIntensity = stdMat.data64F?.[0] ?? 0;

        normalizedDiff = new cv.Mat();
        cv.normalize(blurredDiff, normalizedDiff, 0, 255, cv.NORM_MINMAX);

        thresholdMask = new cv.Mat();
        cv.threshold(
          normalizedDiff,
          thresholdMask,
          0,
          255,
          cv.THRESH_BINARY + cv.THRESH_OTSU,
        );

        kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));

        morphMask = new cv.Mat();
        cv.morphologyEx(thresholdMask, morphMask, cv.MORPH_OPEN, kernel);
        cv.morphologyEx(morphMask, morphMask, cv.MORPH_CLOSE, kernel);

        labels = new cv.Mat();
        stats = new cv.Mat();
        centroids = new cv.Mat();

        const componentCount = cv.connectedComponentsWithStats(
          morphMask,
          labels,
          stats,
          centroids,
          8,
          cv.CV_32S,
        );

        filteredMask = cv.Mat.zeros(morphMask.rows, morphMask.cols, cv.CV_8UC1);

        const totalPixels = src.rows * src.cols;
        const minArea = Math.max(
          12,
          Math.floor(totalPixels * MIN_COMPONENT_AREA_RATIO),
        );
        const maxArea = Math.floor(totalPixels * MAX_COMPONENT_AREA_RATIO);

        let keptRegionCount = 0;
        let largestRegionArea = 0;

        for (let label = 1; label < componentCount; label += 1) {
          const area = stats.intAt(label, cv.CC_STAT_AREA);

          if (area < minArea || area > maxArea) {
            continue;
          }

          keptRegionCount += 1;
          if (area > largestRegionArea) {
            largestRegionArea = area;
          }

          const componentMask = new cv.Mat();
          const labelScalar = new cv.Mat(
            labels.rows,
            labels.cols,
            labels.type(),
            new cv.Scalar(label),
          );

          cv.compare(labels, labelScalar, componentMask, cv.CMP_EQ);
          cv.bitwise_or(filteredMask, componentMask, filteredMask);

          labelScalar.delete();
          componentMask.delete();
        }

        const suspiciousPixels = cv.countNonZero(filteredMask);
        const suspiciousRatio = suspiciousPixels / totalPixels;
        const largestRegionRatio = largestRegionArea / totalPixels;

        const normalizedMean = Math.min(meanIntensity / 32, 1);
        const normalizedStd = Math.min(stdIntensity / 24, 1);
        const normalizedSuspiciousRatio = Math.min(suspiciousRatio / 0.12, 1);
        const normalizedLargestRegion = Math.min(largestRegionRatio / 0.05, 1);
        const regionCountPenalty =
          keptRegionCount > 25 ? 0.1 : keptRegionCount > 15 ? 0.05 : 0;

        let score =
          normalizedMean * 0.2 +
          normalizedStd * 0.1 +
          normalizedSuspiciousRatio * 0.35 +
          normalizedLargestRegion * 0.35 -
          regionCountPenalty;

        if (suspiciousRatio > 0.35 && largestRegionRatio < 0.01) {
          score -= 0.1;
        }

        if (keptRegionCount === 0) {
          score *= 0.35;
        }

        score = Math.max(0, Math.min(score, 1));

        displayGray = new cv.Mat();
        cv.convertScaleAbs(
          normalizedDiff,
          displayGray,
          DISPLAY_AMPLIFICATION,
          DISPLAY_BRIGHTNESS,
        );

        displayMat = new cv.Mat();
        cv.cvtColor(displayGray, displayMat, cv.COLOR_GRAY2RGBA);

        // Draw thin red rectangles only around suspicious connected regions.
        const regionBoxes: Array<{
          x: number;
          y: number;
          width: number;
          height: number;
          area: number;
        }> = [];

        for (let label = 1; label < componentCount; label += 1) {
          const area = stats.intAt(label, cv.CC_STAT_AREA);
          const left = stats.intAt(label, cv.CC_STAT_LEFT);
          const top = stats.intAt(label, cv.CC_STAT_TOP);
          const width = stats.intAt(label, cv.CC_STAT_WIDTH);
          const height = stats.intAt(label, cv.CC_STAT_HEIGHT);

          if (area < minArea || area > maxArea) continue;
          if (width < MIN_BOX_DIMENSION || height < MIN_BOX_DIMENSION) continue;

          regionBoxes.push({ x: left, y: top, width, height, area });
        }

        regionBoxes
          .sort((a, b) => b.area - a.area)
          .slice(0, MAX_BOXES_TO_DRAW)
          .forEach((box) => {
            const p1 = new cv.Point(box.x, box.y);
            const p2 = new cv.Point(box.x + box.width, box.y + box.height);

            cv.rectangle(displayMat!, p1, p2, new cv.Scalar(255, 0, 0, 255), 1);
          });

        return {
          quality,
          score,
          suspiciousRatio,
          meanIntensity,
          largestRegionRatio,
          keptRegionCount,
          displayMat: displayMat.clone(),
        };
      } finally {
        cleanupMats([
          recompressedMat,
          srcGray,
          recompressedGray,
          diffGray,
          blurredDiff,
          normalizedDiff,
          thresholdMask,
          morphMask,
          stats,
          centroids,
          labels,
          filteredMask,
          kernel,
          displayGray,
          displayMat,
          meanMat,
          stdMat,
        ]);
      }
    },
    [recompressMatAtQuality],
  );

  const combineQualityResults = useCallback(
    (qualityResults: QualityAnalysis[]) => {
      const averageScore =
        qualityResults.reduce((sum, item) => sum + item.score, 0) /
        qualityResults.length;

      const averageSuspiciousRatio =
        qualityResults.reduce((sum, item) => sum + item.suspiciousRatio, 0) /
        qualityResults.length;

      const averageLargestRegionRatio =
        qualityResults.reduce((sum, item) => sum + item.largestRegionRatio, 0) /
        qualityResults.length;

      const consistencyHits = qualityResults.filter(
        (item) => item.score >= 0.4,
      ).length;

      const consistencyBoost =
        consistencyHits >= 3 ? 0.08 : consistencyHits === 2 ? 0.03 : -0.04;

      let finalScore =
        averageScore * 0.75 +
        Math.min(averageSuspiciousRatio / 0.1, 1) * 0.1 +
        Math.min(averageLargestRegionRatio / 0.04, 1) * 0.15 +
        consistencyBoost;

      finalScore = Math.max(0, Math.min(finalScore, 1));

      const tamperingLikelihood = finalScore * 100;
      const detectedEla = finalScore >= 0.33;

      let temperingAnalysis = 'Minimal localized ELA inconsistencies detected.';
      if (finalScore >= 0.65) {
        temperingAnalysis =
          'Strong localized ELA inconsistencies detected across multiple recompression levels. Potential digital tampering is more likely.';
      } else if (finalScore >= 0.33) {
        temperingAnalysis =
          'Moderate localized ELA inconsistencies detected. The image may contain altered regions, but this should be cross-checked with other signals.';
      } else if (averageSuspiciousRatio > 0.18) {
        temperingAnalysis =
          'Broad ELA activity was detected, but it appears diffuse rather than strongly localized. This can happen with heavy compression or textured scenes.';
      }

      return {
        finalScore,
        tamperingLikelihood,
        detectedEla,
        temperingAnalysis,
      };
    },
    [],
  );

  const pickBestDisplayResult = useCallback(
    (qualityResults: QualityAnalysis[]) => {
      const sorted = [...qualityResults].sort((a, b) => b.score - a.score);
      return sorted[0];
    },
    [],
  );

  const drawDisplayMat = useCallback((displayMat: cv.Mat) => {
    const targetCanvas = processedCanvasRef.current;
    if (!targetCanvas) return;

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = displayMat.cols;
    sourceCanvas.height = displayMat.rows;
    cv.imshow(sourceCanvas, displayMat);

    const scale = Math.min(1, DISPLAY_MAX_WIDTH / displayMat.cols);
    const displayWidth = Math.max(1, Math.round(displayMat.cols * scale));
    const displayHeight = Math.max(1, Math.round(displayMat.rows * scale));

    targetCanvas.width = displayWidth;
    targetCanvas.height = displayHeight;

    const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      sourceCanvas.remove();
      throw new Error('Failed to get context for processed canvas');
    }

    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(sourceCanvas, 0, 0, displayWidth, displayHeight);

    sourceCanvas.remove();
  }, []);

  const detectELA = useCallback(
    async (src: cv.Mat) => {
      let bestDisplayMat: cv.Mat | null = null;

      try {
        const qualityResults: QualityAnalysis[] = [];

        for (const quality of JPEG_QUALITIES) {
          const result = await analyzeAtQuality(src, quality);
          qualityResults.push(result);
        }

        if (qualityResults.length === 0) {
          throw new Error('No ELA quality analyses were produced.');
        }

        const bestDisplayResult = pickBestDisplayResult(qualityResults);
        bestDisplayMat = bestDisplayResult.displayMat.clone();
        drawDisplayMat(bestDisplayMat);

        const {
          finalScore,
          tamperingLikelihood,
          detectedEla,
          temperingAnalysis,
        } = combineQualityResults(qualityResults);

        setTamperingProbability(tamperingLikelihood);
        setTamperingResult(temperingAnalysis);

        onResult({
          score: finalScore,
          algo: 'ELA',
          tamperingLikelihood,
          detectedEla,
          temperingAnalysis,
        });

        qualityResults.forEach((item) => {
          item.displayMat.delete();
        });
      } catch (error) {
        console.error('Error in detectELA:', error);
        setTamperingResult('An error occurred during ELA analysis.');
      } finally {
        if (bestDisplayMat) {
          bestDisplayMat.delete();
        }
      }
    },
    [
      analyzeAtQuality,
      combineQualityResults,
      drawDisplayMat,
      onResult,
      pickBestDisplayResult,
      setTamperingProbability,
      setTamperingResult,
    ],
  );

  const processImage = useCallback(() => {
    if (!cv || !imageSrc || !processedCanvasRef.current) return;

    setProcessing(true);
    setMousePosition(null);

    loadImage(imageSrc)
      .then(async (img) => {
        const analysisCanvas = document.createElement('canvas');
        analysisCanvas.width = img.naturalWidth || img.width;
        analysisCanvas.height = img.naturalHeight || img.height;

        const analysisCtx = analysisCanvas.getContext('2d', {
          willReadFrequently: true,
        });

        if (!analysisCtx) {
          analysisCanvas.remove();
          throw new Error('Failed to get context for analysis canvas');
        }

        analysisCtx.drawImage(
          img,
          0,
          0,
          analysisCanvas.width,
          analysisCanvas.height,
        );

        const srcMat = cv.imread(analysisCanvas);
        analysisCanvas.remove();

        if (srcMat.empty()) {
          srcMat.delete();
          throw new Error('Failed to read image into OpenCV Mat');
        }

        try {
          await detectELA(srcMat);
        } finally {
          srcMat.delete();
        }
      })
      .catch((error) => {
        console.error('Error processing image:', error);
        setTamperingResult('An error occurred during processing.');
      })
      .finally(() => {
        setProcessing(false);
      });
  }, [detectELA, imageSrc, setProcessing, setTamperingResult]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const processedCanvas = processedCanvasRef.current;
    const zoomCanvas = zoomCanvasRef.current;

    if (!processedCanvas || !zoomCanvas) return;

    const rect = processedCanvas.getBoundingClientRect();

    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;

    const scaleX = processedCanvas.width / rect.width;
    const scaleY = processedCanvas.height / rect.height;

    const canvasX = cssX * scaleX;
    const canvasY = cssY * scaleY;

    const halfSource = ZOOM_SOURCE_SIZE / 2;

    const adjustedCanvasX = Math.max(
      halfSource,
      Math.min(canvasX, processedCanvas.width - halfSource),
    );

    const adjustedCanvasY = Math.max(
      halfSource,
      Math.min(canvasY, processedCanvas.height - halfSource),
    );

    let previewLeft = cssX + ZOOM_OFFSET;
    let previewTop = cssY + ZOOM_OFFSET;

    if (previewLeft + ZOOM_CANVAS_SIZE > rect.width) {
      previewLeft = cssX - ZOOM_CANVAS_SIZE - ZOOM_OFFSET;
    }

    if (previewTop + ZOOM_CANVAS_SIZE > rect.height) {
      previewTop = cssY - ZOOM_CANVAS_SIZE - ZOOM_OFFSET;
    }

    previewLeft = Math.max(0, previewLeft);
    previewTop = Math.max(0, previewTop);

    setMousePosition({
      x: adjustedCanvasX,
      y: adjustedCanvasY,
      screenX: previewLeft,
      screenY: previewTop,
    });

    const zoomCtx = zoomCanvas.getContext('2d');
    if (!zoomCtx) return;

    zoomCtx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
    zoomCtx.imageSmoothingEnabled = false;

    zoomCtx.drawImage(
      processedCanvas,
      adjustedCanvasX - halfSource,
      adjustedCanvasY - halfSource,
      ZOOM_SOURCE_SIZE,
      ZOOM_SOURCE_SIZE,
      0,
      0,
      ZOOM_CANVAS_SIZE,
      ZOOM_CANVAS_SIZE,
    );

    zoomCtx.strokeStyle = '#ffffff';
    zoomCtx.lineWidth = 1;
    zoomCtx.strokeRect(0, 0, ZOOM_CANVAS_SIZE, ZOOM_CANVAS_SIZE);
  };

  const handleMouseLeave = () => {
    setMousePosition(null);

    const zoomCanvas = zoomCanvasRef.current;
    if (!zoomCanvas) return;

    const zoomCtx = zoomCanvas.getContext('2d');
    if (!zoomCtx) return;

    zoomCtx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
  };

  return (
    <div className='relative inline-block'>
      <div>
        {processing && <Loader />}
        <canvas
          ref={processedCanvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'crosshair', display: 'block' }}
        />
      </div>

      {mousePosition && (
        <div
          style={{
            position: 'absolute',
            top: mousePosition.screenY,
            left: mousePosition.screenX,
            width: ZOOM_CANVAS_SIZE,
            height: ZOOM_CANVAS_SIZE,
            border: '1px solid #fff',
            background: '#111',
            zIndex: 10,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={zoomCanvasRef}
            width={ZOOM_CANVAS_SIZE}
            height={ZOOM_CANVAS_SIZE}
            style={{ display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}