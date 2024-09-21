import React, { useState, useEffect } from 'react';
import * as exifr from 'exifr';

const VITE_VISUAL_CROSSING_API_KEY = import.meta.env
  .VITE_VISUAL_CROSSING_API_KEY;

interface Props {
  imageSrc: string | null;
  onResult: (result: { score: number; algo: string }) => void;
  setMetadata: React.Dispatch<any>;
  weatherPrediction: string | null;
  setHistoricalWeather: React.Dispatch<React.SetStateAction<string | null>>;
  historicalWeather: string | null;
}

const MetadataExtraction = ({
  imageSrc,
  onResult,
  setMetadata,
  weatherPrediction,
  setHistoricalWeather,
  historicalWeather,
}: Props) => {
  const [geolocation, setGeolocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [tamperingScore, setTamperingScore] = useState<number>(0);

  const fetchHistoricalWeather = async (
    lat: number,
    lon: number,
    date: string
  ) => {
    try {
      const apiKey = VITE_VISUAL_CROSSING_API_KEY;
      if (!apiKey) {
        throw new Error('API key is missing');
      }

      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${date}?key=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching weather data: ${response.statusText}`);
      }

      const weatherData = await response.json();
      const weatherCondition = weatherData?.days?.[0]?.conditions;
      setHistoricalWeather(weatherCondition);
      return weatherCondition;
    } catch (error) {
      console.error('Error fetching historical weather:', error);
      return null;
    }
  };

  const extractMetadata = async () => {
    if (imageSrc) {
      try {
        const file = await fetch(imageSrc).then((res) => res.blob());
        const meta = await exifr.parse(file);

        setMetadata(meta);

        // Use precomputed latitude and longitude if available
        const latitude = meta?.latitude || null;
        const longitude = meta?.longitude || null;
        const dateTime = meta?.DateTimeOriginal || meta?.CreateDate;

        if (latitude && longitude && dateTime) {
          const date = new Date(dateTime).toISOString().split('T')[0]; // Format the date to YYYY-MM-DD
          setGeolocation({ latitude, longitude });

          const fetchedHistoricalWeather = await fetchHistoricalWeather(
            latitude,
            longitude,
            date
          );

          setHistoricalWeather(fetchedHistoricalWeather);

          // Compare predicted weather with historical weather
          let score = 0;
          if (fetchedHistoricalWeather && weatherPrediction) {
            if (fetchedHistoricalWeather === weatherPrediction) {
              score = 0; // No tampering
            } else {
              score = 80; // High likelihood of tampering
            }
          }

          setTamperingScore(score);
          onResult({ score: score / 100, algo: 'Weather Validation' });
        } else {
          console.log('No geolocation or datetime found in metadata.');
        }
      } catch (error) {
        console.error('Error extracting metadata:', error);
      }
    }
  };

  useEffect(() => {
    if (imageSrc) {
      extractMetadata();
    }
  }, [imageSrc]);

  return (
    <div>
      <h3>Weather Validation</h3>
      {imageSrc && (
        <img src={imageSrc} alt='Uploaded' style={{ maxWidth: '500px' }} />
      )}
      {geolocation && historicalWeather && weatherPrediction && (
        <div>
          <p>
            <strong>Historical Weather:</strong> {historicalWeather}
          </p>
          <p>
            <strong>Predicted Weather:</strong> {weatherPrediction}
          </p>
          {tamperingScore > 0 && (
            <p>
              <strong>Potential Tampering Detected:</strong> {tamperingScore}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MetadataExtraction;
