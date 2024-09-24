import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as exifr from 'exifr';

const VITE_VISUAL_CROSSING_API_KEY = import.meta.env
  .VITE_VISUAL_CROSSING_API_KEY;

interface Props {
  imageSrc: string | null;
  onResult: (result: { score: number; algo: string }) => void;
  setMetadata: React.Dispatch<any>;
  weatherPrediction: string | null;
  setHistoricalWeather: React.Dispatch<React.SetStateAction<string | null>>;
  historicalWeather?: string | null;
  setGeolocation: React.Dispatch<
    React.SetStateAction<{
      latitude: number;
      longitude: number;
    } | null>
  >;
  geolocation?: {
    latitude: number;
    longitude: number;
  } | null;
  setTamperingProbability: React.Dispatch<React.SetStateAction<number | null>>;
  tamperingProbability?: number | null;
  setSoftwareUsed?: React.Dispatch<React.SetStateAction<string | null>>;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

const MetadataExtraction = ({
  imageSrc,
  onResult,
  setMetadata,
  weatherPrediction,
  setHistoricalWeather,
  setGeolocation,
  setTamperingProbability,
  setProcessing
}: Props) => {
  const [weatherCache, setWeatherCache] = useState<{
    [key: string]: string | null;
  }>({});
  const [fetchError, setFetchError] = useState<boolean>(false);
  const apiCallInProgress = useRef(false); 

  const fetchHistoricalWeather = useCallback(
    async (lat: number, lon: number, date: string) => {
      const cacheKey = `${lat}-${lon}-${date}`;
      if (weatherCache[cacheKey]) {
        return weatherCache[cacheKey]; // Return cached weather data
      }

      try {
        const apiKey = VITE_VISUAL_CROSSING_API_KEY;
        if (!apiKey) {
          throw new Error('API key is missing');
        }

        const url = 'https://google.com'
        // const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${date}?key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Error fetching weather data: ${response.statusText}`
          );
        }

        const weatherData = await response.json();
        const weatherCondition = weatherData?.days?.[0]?.conditions;

        // Cache the fetched weather data
        setWeatherCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: weatherCondition,
        }));

        setHistoricalWeather(weatherCondition);
        return weatherCondition;
      } catch (error) {
        console.error('Error fetching historical weather:', error);
        setFetchError(true); // Stop further retries if the API limit is hit
        return null;
      }
    },
    [weatherCache, setHistoricalWeather]
  );

  const extractMetadata = useCallback(async () => {
    if (!imageSrc || apiCallInProgress.current) return; // Prevent duplicate calls
    apiCallInProgress.current = true; 

    try {
      // console.log('Fetching image metadata...');
      // setProcessing(true)
      const file = await fetch(imageSrc).then((res) => {
        if (!res.ok) {
          throw new Error(`Error fetching image: ${res.statusText}`);
        }
        return res.blob();
      });
      const meta = await exifr.parse(file);

      if (!meta) {
        throw new Error('Failed to extract metadata from image.');
      }

      setMetadata(meta);

      const softwareUsed = meta?.Software || '';
      // console.log({softwareUsed})
      let metadataTamperingScore = 0;
      if (
        softwareUsed &&
        (softwareUsed.toLowerCase().includes('photoshop') ||
          softwareUsed.toLowerCase().includes('vscode'))
      ) {
        // setSoftwareUsed(softwareUsed);
        metadataTamperingScore = 50;
      }

      const latitude = meta?.latitude || null;
      const longitude = meta?.longitude || null;
      const dateTime = meta?.DateTimeOriginal || meta?.CreateDate;

      if (latitude && longitude && dateTime && !fetchError) {
        const date = new Date(dateTime).toISOString().split('T')[0];
        setGeolocation({ latitude, longitude });

        const fetchedHistoricalWeather = await fetchHistoricalWeather(
          latitude,
          longitude,
          date
        );

        if (fetchedHistoricalWeather) {
          setHistoricalWeather(fetchedHistoricalWeather);

          // Compare predicted weather with historical weather
          let weatherTamperingScore = 0;
          if (fetchedHistoricalWeather && weatherPrediction) {
            weatherTamperingScore =
              fetchedHistoricalWeather === weatherPrediction ? 0 : 80; // High likelihood of tampering based on weather
          }

          const overallTamperingScore = Math.max(
            metadataTamperingScore,
            weatherTamperingScore
          );

          setTamperingProbability(overallTamperingScore);
          onResult({
            score: overallTamperingScore / 100,
            algo: 'Metadata & Weather Validation',
          });
        }
      } else {
        console.log('No geolocation or datetime found in metadata.');
      }
    } catch (error) {
      console.error('Error extracting metadata:', error);
    } finally {
      // setProcessing(false)
      apiCallInProgress.current = false;
    }
  }, [
    imageSrc,
    fetchHistoricalWeather,
    onResult,
    setMetadata,
    setGeolocation,
    setHistoricalWeather,
    weatherPrediction,
    // setProcessing,
    // setSoftwareUsed,
    fetchError,
  ]);

  useEffect(() => {
    if (imageSrc && !fetchError) {
      extractMetadata();
    }
  }, [imageSrc, fetchError]);

  return (
    <div>
      {imageSrc && (
        <img src={imageSrc} alt='Uploaded' style={{ maxWidth: '500px' }} />
      )}
    </div>
  );
};

export default MetadataExtraction;
