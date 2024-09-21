import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

interface WeatherPredictionProps {
  imageSrc: string | null;
  setWeatherPrediction: React.Dispatch<React.SetStateAction<string | null>>; 
}

export default function WeatherPrediction({ imageSrc, setWeatherPrediction }: WeatherPredictionProps)  {
  const [model, setModel] = useState<tf.GraphModel | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadGraphModel('models/weather_model_tfjs/model.json');
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };
    loadModel();
  }, []);

  const predictWeather = async () => {
    if (!model || !imageSrc) return;

    const imgElement = document.createElement('img');
    imgElement.src = imageSrc;
    imgElement.onload = async () => {
      const tensor = tf.browser
        .fromPixels(imgElement)
        .resizeBilinear([299, 299]) // Adjust for model's input size
        .toFloat()
        .div(255)
        .expandDims(0); // Add batch dimension

      const prediction = model.predict(tensor) as tf.Tensor;
      const predictedClass = prediction.argMax(-1).dataSync()[0];
      const weatherClasses = ['Cloudy', 'Rainy', 'Sunny'];
      const predictedWeather = weatherClasses[predictedClass];
      setWeatherPrediction(predictedWeather);
    };
  };

  useEffect(() => {
    if (imageSrc && model) {
      predictWeather(); // Predict when model and image are ready
    }
  }, [imageSrc, model]);

  return (
    <div>
      {imageSrc && <img src={imageSrc} alt="Uploaded" style={{ maxWidth: '500px' }} />}
    </div>
  );
};


