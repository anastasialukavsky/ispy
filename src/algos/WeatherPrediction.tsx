import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

interface WeatherPredictionProps {
  imageSrc: string | null;
  setWeatherPrediction: React.Dispatch<React.SetStateAction<string | null>>;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function WeatherPrediction({ imageSrc, setWeatherPrediction, setProcessing }: WeatherPredictionProps)  {
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

    setProcessing(true)
    const imgElement = document.createElement('img');
    imgElement.src = imageSrc;
    imgElement.onload = async () => {
      try {

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
      } catch(error) {
        console.error('Prediction failed:', error);
      } finally {
        setProcessing(false)
      }
    };
  };

  useEffect(() => {
    if (imageSrc && model) {
      predictWeather(); 
    }
  }, [imageSrc, model]);

  return (
    <div>
      {imageSrc && <img src={imageSrc} alt="" style={{ maxWidth: '500px' }} />}
    </div>
  );
};


