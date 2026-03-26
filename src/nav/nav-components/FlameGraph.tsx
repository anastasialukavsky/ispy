import React, { useRef, useEffect } from 'react';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarController,
} from 'chart.js';

Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarController
);

interface FlameGraphProps {
  data: { name: string; value: number }[];
}

const FlameGraph: React.FC<FlameGraphProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    // Cleanup existing chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (chartRef.current) {
      try {
        chartInstanceRef.current = new Chart(chartRef.current, {
          type: 'bar',
          data: {
            labels: data.map((d) => d.name),
            datasets: [
              {
                label: 'Algorithm Scores (%)',
                data: data.map((d) => d.value),
                backgroundColor: [
                  '#1f2937', // Gray-800
                  '#4b5563', // Gray-600
                  '#6b7280', // Gray-500
                  '#9ca3af', // Gray-400
                  '#d1d5db', // Gray-300
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false, // Allows the chart to stretch with a fixed height
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.raw}%`,
                },
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Algorithms',
                },
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Tampering Probability (%)',
                },
              },
            },
          },
        });
      } catch (error) {
        console.error('Error initializing Chart.js instance:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data]);

  return (
    <div style={{ height: '200px', width: '700px' }}>
      {' '}
      <canvas ref={chartRef} />
    </div>
  );
};


export default FlameGraph;
