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

type BlockInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
  noise: number;
  edgeDensity: number;
  score: number;
};

type RegionBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
};

const DISPLAY_MAX_WIDTH = 500;
const BLOCK_SIZE = 20;
const EDGE_DENSITY_LIMIT = 0.22;
const MIN_COMPONENT_AREA_RATIO = 0.001;
const MAX_COMPONENT_AREA_RATIO = 0.45;
const MAX_CLUSTER_BOXES = 8;
const BLOCK_SCORE_THRESHOLD = 0.5;
const HIGH_CONFIDENCE_BLOCK_THRESHOLD = 0.68;

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

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });

  const median = (values: number[]) => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };

  const mad = (values: number[], med: number) => {
    if (values.length === 0) return 0;
    const deviations = values.map((v) => Math.abs(v - med));
    return median(deviations);
  };

  const drawDisplayImage = useCallback((displayMat: cv.Mat) => {
    const canvas = processedCanvasRef.current;
    if (!canvas) return;

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = displayMat.cols;
    sourceCanvas.height = displayMat.rows;
    cv.imshow(sourceCanvas, displayMat);

    const scale = Math.min(1, DISPLAY_MAX_WIDTH / displayMat.cols);
    const displayWidth = Math.max(1, Math.round(displayMat.cols * scale));
    const displayHeight = Math.max(1, Math.round(displayMat.rows * scale));

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      sourceCanvas.remove();
      throw new Error('Failed to get context for processed canvas');
    }

    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(sourceCanvas, 0, 0, displayWidth, displayHeight);

    sourceCanvas.remove();
  }, []);

  const buildClusterBoxes = (
    suspiciousBlocks: BlockInfo[],
    rows: number,
    cols: number,
  ): RegionBox[] => {
    if (suspiciousBlocks.length === 0) return [];

    const blockMap = new Map<string, BlockInfo>();
    suspiciousBlocks.forEach((block) => {
      const key = `${block.x}_${block.y}`;
      blockMap.set(key, block);
    });

    const visited = new Set<string>();
    const clusters: RegionBox[] = [];

    const directions = [
      [-BLOCK_SIZE, 0],
      [BLOCK_SIZE, 0],
      [0, -BLOCK_SIZE],
      [0, BLOCK_SIZE],
      [-BLOCK_SIZE, -BLOCK_SIZE],
      [BLOCK_SIZE, BLOCK_SIZE],
      [-BLOCK_SIZE, BLOCK_SIZE],
      [BLOCK_SIZE, -BLOCK_SIZE],
    ];

    for (const block of suspiciousBlocks) {
      const startKey = `${block.x}_${block.y}`;
      if (visited.has(startKey)) continue;

      const queue: BlockInfo[] = [block];
      visited.add(startKey);

      let minX = block.x;
      let minY = block.y;
      let maxX = block.x + block.width;
      let maxY = block.y + block.height;
      let totalArea = block.width * block.height;

      while (queue.length > 0) {
        const current = queue.shift()!;

        for (const [dx, dy] of directions) {
          const nx = current.x + dx;
          const ny = current.y + dy;
          const neighborKey = `${nx}_${ny}`;
          const neighbor = blockMap.get(neighborKey);

          if (!neighbor || visited.has(neighborKey)) continue;

          visited.add(neighborKey);
          queue.push(neighbor);

          minX = Math.min(minX, neighbor.x);
          minY = Math.min(minY, neighbor.y);
          maxX = Math.max(maxX, neighbor.x + neighbor.width);
          maxY = Math.max(maxY, neighbor.y + neighbor.height);
          totalArea += neighbor.width * neighbor.height;
        }
      }

      const width = maxX - minX;
      const height = maxY - minY;

      if (width >= BLOCK_SIZE * 1.5 && height >= BLOCK_SIZE * 1.5) {
        clusters.push({
          x: Math.max(0, minX),
          y: Math.max(0, minY),
          width: Math.min(cols - minX, width),
          height: Math.min(rows - minY, height),
          area: totalArea,
        });
      }
    }

    return clusters.sort((a, b) => b.area - a.area).slice(0, MAX_CLUSTER_BOXES);
  };

  const analyzeNoiseResidual = useCallback((srcMat: cv.Mat) => {
    let grayMat: cv.Mat | null = null;
    let denoisedMat: cv.Mat | null = null;
    let residualMat: cv.Mat | null = null;
    let normalizedResidualMat: cv.Mat | null = null;
    let sobelX: cv.Mat | null = null;
    let sobelY: cv.Mat | null = null;
    let absSobelX: cv.Mat | null = null;
    let absSobelY: cv.Mat | null = null;
    let edgeMat: cv.Mat | null = null;
    let edgeMaskBinary: cv.Mat | null = null;
    let suspiciousMask: cv.Mat | null = null;
    let morphMask: cv.Mat | null = null;
    let labels: cv.Mat | null = null;
    let stats: cv.Mat | null = null;
    let centroids: cv.Mat | null = null;
    let filteredMask: cv.Mat | null = null;
    let kernel: cv.Mat | null = null;
    let displayMat: cv.Mat | null = null;

    try {
      grayMat = new cv.Mat();
      cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);

      denoisedMat = new cv.Mat();
      cv.GaussianBlur(
        grayMat,
        denoisedMat,
        new cv.Size(5, 5),
        0,
        0,
        cv.BORDER_DEFAULT,
      );

      residualMat = new cv.Mat();
      cv.absdiff(grayMat, denoisedMat, residualMat);

      normalizedResidualMat = new cv.Mat();
      cv.normalize(residualMat, normalizedResidualMat, 0, 255, cv.NORM_MINMAX);

      sobelX = new cv.Mat();
      sobelY = new cv.Mat();
      absSobelX = new cv.Mat();
      absSobelY = new cv.Mat();
      edgeMat = new cv.Mat();

      cv.Sobel(grayMat, sobelX, cv.CV_16S, 1, 0, 3, 1, 0, cv.BORDER_DEFAULT);
      cv.Sobel(grayMat, sobelY, cv.CV_16S, 0, 1, 3, 1, 0, cv.BORDER_DEFAULT);
      cv.convertScaleAbs(sobelX, absSobelX);
      cv.convertScaleAbs(sobelY, absSobelY);
      cv.addWeighted(absSobelX, 0.5, absSobelY, 0.5, 0, edgeMat);

      edgeMaskBinary = new cv.Mat();
      cv.threshold(
        edgeMat,
        edgeMaskBinary,
        0,
        255,
        cv.THRESH_BINARY + cv.THRESH_OTSU,
      );

      const blockData: BlockInfo[] = [];

      for (let y = 0; y < grayMat.rows; y += BLOCK_SIZE) {
        for (let x = 0; x < grayMat.cols; x += BLOCK_SIZE) {
          const rectWidth = Math.min(BLOCK_SIZE, grayMat.cols - x);
          const rectHeight = Math.min(BLOCK_SIZE, grayMat.rows - y);
          const rect = new cv.Rect(x, y, rectWidth, rectHeight);

          const residualBlock = normalizedResidualMat.roi(rect);
          const edgeBlock = edgeMaskBinary.roi(rect);

          const meanResidual = cv.mean(residualBlock)[0] ?? 0;
          const edgePixels = cv.countNonZero(edgeBlock);
          const edgeDensity = edgePixels / (rectWidth * rectHeight);

          blockData.push({
            x,
            y,
            width: rectWidth,
            height: rectHeight,
            noise: meanResidual,
            edgeDensity,
            score: 0,
          });

          residualBlock.delete();
          edgeBlock.delete();
        }
      }

      const candidateBlocks = blockData.filter(
        (block) => block.edgeDensity <= EDGE_DENSITY_LIMIT,
      );

      const baselineBlocks =
        candidateBlocks.length >= 8 ? candidateBlocks : blockData;

      const baselineValues = baselineBlocks.map((b) => b.noise);
      const med = median(baselineValues);
      const madValue = mad(baselineValues, med) || 1e-6;

      blockData.forEach((block) => {
        const robustZ = Math.abs(block.noise - med) / (1.4826 * madValue);
        const edgePenalty =
          block.edgeDensity > EDGE_DENSITY_LIMIT
            ? Math.min((block.edgeDensity - EDGE_DENSITY_LIMIT) * 2.0, 1)
            : 0;

        let blockScore = robustZ / 4.5;
        blockScore = Math.max(0, Math.min(blockScore, 1));
        blockScore = Math.max(0, blockScore - edgePenalty);

        block.score = blockScore;
      });

      const suspiciousBlocks = blockData.filter(
        (block) => block.score >= BLOCK_SCORE_THRESHOLD,
      );

      const highConfidenceBlocks = blockData.filter(
        (block) => block.score >= HIGH_CONFIDENCE_BLOCK_THRESHOLD,
      );

      suspiciousMask = cv.Mat.zeros(grayMat.rows, grayMat.cols, cv.CV_8UC1);

      suspiciousBlocks.forEach((block) => {
        const roi = suspiciousMask!.roi(
          new cv.Rect(block.x, block.y, block.width, block.height),
        );
        roi.setTo(new cv.Scalar(255));
        roi.delete();
      });

      kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));

      morphMask = new cv.Mat();
      cv.morphologyEx(suspiciousMask, morphMask, cv.MORPH_OPEN, kernel);
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

      const totalPixels = grayMat.rows * grayMat.cols;
      const minArea = Math.max(
        BLOCK_SIZE * BLOCK_SIZE,
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
        largestRegionArea = Math.max(largestRegionArea, area);

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

      const averageBlockScore =
        blockData.reduce((sum, block) => sum + block.score, 0) /
        Math.max(blockData.length, 1);

      const highConfidenceBlockRatio =
        highConfidenceBlocks.length / Math.max(blockData.length, 1);

      let finalScore =
        Math.min(averageBlockScore / 0.75, 1) * 0.25 +
        Math.min(highConfidenceBlockRatio / 0.18, 1) * 0.25 +
        Math.min(suspiciousRatio / 0.12, 1) * 0.25 +
        Math.min(largestRegionRatio / 0.06, 1) * 0.25;

      if (keptRegionCount === 0) {
        finalScore *= 0.35;
      }

      if (suspiciousRatio > 0.28 && largestRegionRatio < 0.015) {
        finalScore -= 0.12;
      }

      if (keptRegionCount > 18) {
        finalScore -= 0.06;
      }

      finalScore = Math.max(0, Math.min(finalScore, 1));

      let temperingAnalysis =
        'Minimal localized noise inconsistency detected. The image appears relatively consistent.';
      if (finalScore >= 0.65) {
        temperingAnalysis =
          'Strong localized noise inconsistency detected. The image contains regions whose noise pattern differs significantly from the rest of the scene.';
      } else if (finalScore >= 0.35) {
        temperingAnalysis =
          'Moderate noise inconsistency detected. Some regions differ from surrounding areas, but the result should be cross-checked with other signals.';
      } else if (highConfidenceBlockRatio > 0.2) {
        temperingAnalysis =
          'Some noise irregularities were detected, but they appear diffuse or edge-related rather than strongly localized.';
      }

      displayMat = srcMat.clone();

      const clusterBoxes = buildClusterBoxes(
        suspiciousBlocks,
        grayMat.rows,
        grayMat.cols,
      );

      suspiciousBlocks.forEach((block) => {
        const isHighConfidence = block.score >= HIGH_CONFIDENCE_BLOCK_THRESHOLD;
        const color = isHighConfidence
          ? new cv.Scalar(255, 0, 0, 255)
          : new cv.Scalar(255, 120, 120, 255);

        const p1 = new cv.Point(block.x, block.y);
        const p2 = new cv.Point(block.x + block.width, block.y + block.height);

        cv.rectangle(displayMat!, p1, p2, color, 1);
      });

      clusterBoxes.forEach((box, index) => {
        const p1 = new cv.Point(box.x, box.y);
        const p2 = new cv.Point(box.x + box.width, box.y + box.height);

        cv.rectangle(displayMat!, p1, p2, new cv.Scalar(255, 0, 0, 255), 2);

        const labelY = box.y > 18 ? box.y - 5 : box.y + 18;
        cv.putText(
          displayMat!,
          `${index + 1}`,
          new cv.Point(box.x, labelY),
          cv.FONT_HERSHEY_SIMPLEX,
          0.55,
          new cv.Scalar(255, 255, 255, 255),
          2,
        );
      });

      return {
        displayMat: displayMat.clone(),
        score: finalScore,
        temperingAnalysis,
      };
    } finally {
      cleanupMats([
        grayMat,
        denoisedMat,
        residualMat,
        normalizedResidualMat,
        sobelX,
        sobelY,
        absSobelX,
        absSobelY,
        edgeMat,
        edgeMaskBinary,
        suspiciousMask,
        morphMask,
        labels,
        stats,
        centroids,
        filteredMask,
        kernel,
        displayMat,
      ]);
    }
  }, []);

  const processImage = useCallback(() => {
    if (!cv || !processedCanvasRef.current || !imageSrc) return;

    setProcessing(true);

    loadImage(imageSrc)
      .then((img) => {
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

        let resultDisplayMat: cv.Mat | null = null;

        try {
          const result = analyzeNoiseResidual(srcMat);
          resultDisplayMat = result.displayMat.clone();

          drawDisplayImage(resultDisplayMat);

          setLatestNoiseScore(result.score);
          setTamperingProbability(result.score * 100);
          setTamperingResult(result.temperingAnalysis);

          onResult({
            score: result.score,
            algo: 'Noise Analysis',
            temperingAnalysis: result.temperingAnalysis,
          });
        } finally {
          srcMat.delete();
          if (resultDisplayMat) {
            resultDisplayMat.delete();
          }
          setProcessing(false);
        }
      })
      .catch((error) => {
        console.error('Error processing image:', error);
        setTamperingResult('An error occurred during noise analysis.');
        setProcessing(false);
      });
  }, [
    analyzeNoiseResidual,
    drawDisplayImage,
    imageSrc,
    onResult,
    setProcessing,
    setTamperingProbability,
    setTamperingResult,
  ]);

  useEffect(() => {
    if (tamperingResult) {
      onResult({
        score: latestNoiseScore,
        algo: 'Noise Analysis',
        temperingAnalysis: tamperingResult,
      });
    }
  }, [latestNoiseScore, onResult, tamperingResult]);

  return (
    <div>
      {processing && <Loader />}
      <canvas ref={processedCanvasRef} style={{ display: 'block' }} />
    </div>
  );
}