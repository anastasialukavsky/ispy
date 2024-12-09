import React, { useEffect, useState } from 'react';
import { Button } from '../../UI';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  DeepLearningWeather,
  getUserImagesWithResults,
  HistoricalWeather,
  ImageGeolocation,
  ImageWithResults,
  Metadata,
} from '../../graphql/service/imageService';

export default function Account() {
  const [hasFetched, setHasFetched] = useState(false);
  const [presignedUrls, setPresignedUrls] = useState<Record<string, string>>(
    {}
  );
  const { logout, userId } = useAuth();
  const [imagesWithResults, setImagesWithResults] = useState<
    ImageWithResults[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImagesWithResults = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getUserImagesWithResults(userId);
      setImagesWithResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPresignedUrl = async (filePath: string): Promise<string> => {
    try {
      const response = await axios.get(
        `/generate-presigned-url?fileName=${encodeURIComponent(filePath)}`
      );
      return response.data; // Expecting a valid HTTPS presigned URL
    } catch (error) {
      console.error('Error fetching presigned URL:', error);
      return '/placeholder-image.png'; // Fallback for errors
    }
  };

  useEffect(() => {
    const fetchAllPresignedUrls = async () => {
      const urls: Record<string, string> = {};

      for (const { image } of imagesWithResults) {
        const url = await fetchPresignedUrl(image.filePath);
        urls[image.imageId] = url; // Map the URL to imageId
      }

      setPresignedUrls(urls);
    };

    if (imagesWithResults.length > 0) {
      fetchAllPresignedUrls();
    }
  }, [imagesWithResults]);

  useEffect(() => {
    if (userId && imagesWithResults.length === 0 && !hasFetched) {
      fetchImagesWithResults(userId).then(() => setHasFetched(true));
    }
  }, [userId, hasFetched, imagesWithResults]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className='w-full min-h-[calc(100vh_-_64px)] bg-primary-dark-gray text-primary-light-fill font-abel'>
      <div className='flex flex-col justify-center items-center h-full w-full pt-20'>
        <Button onClick={() => logout()}>Logout</Button>
        <div className='w-full max-w-4xl px-4 py-6'>
          {imagesWithResults.map(
            ({
              image,
              elaResults,
              noiseAnalysisResults,
              metadata,
              historicalWeather,
              deepLearningWeather,
              geolocation,
            }: ImageWithResults) => (
              <div key={image.imageId} className='mb-6'>
                <h2 className='text-lg font-bold'>Image:</h2>
                <img
                  src={'public/assets/200w.gif'}
                  className='w-[300px] max-w-md mb-4 rounded'
                  alt='Uploaded'
                />

                <p>
                  Uploaded At: {new Date(image.uploadedAt).toLocaleString()}
                </p>

                {elaResults?.length > 0 ? (
                  <div>
                    <h3 className='text-md font-semibold'>ELA Results:</h3>
                    {elaResults.map((result) => (
                      <p key={result.id}>
                        Tampering Likelihood: {result.tamperingLikelihood},
                        Detected: {result.detectedEla ? 'Yes' : 'No'}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p>No ELA results available.</p>
                )}

                {noiseAnalysisResults?.length > 0 ? (
                  <div>
                    <h3 className='text-md font-semibold'>
                      Noise Analysis Results:
                    </h3>
                    {noiseAnalysisResults.map((result) => (
                      <p key={result.id}>
                        Tampering Likelihood: {result.tamperingLikelihood},
                        Detected Noise: {result.detectedNoise ? 'Yes' : 'No'}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p>No Noise Analysis results available.</p>
                )}

                {metadata?.length > 0 && (
                  <div>
                    <h3 className='text-md font-semibold'>Metadata:</h3>
                    {metadata.map((meta: Metadata) => (
                      <pre key={meta.metadataId}>
                        {JSON.stringify(meta.metadata, null, 2)}
                      </pre>
                    ))}
                  </div>
                )}

                {historicalWeather?.length > 0 && (
                  <div>
                    <h3 className='text-md font-semibold'>
                      Historical Weather:
                    </h3>
                    {historicalWeather.map((weather: HistoricalWeather) => (
                      <p key={weather.id}>{weather.historicalWeather}</p>
                    ))}
                  </div>
                )}

                {deepLearningWeather?.length > 0 && (
                  <div>
                    <h3 className='text-md font-semibold'>
                      Deep Learning Weather:
                    </h3>
                    {deepLearningWeather.map((weather: DeepLearningWeather) => (
                      <p key={weather.id}>{weather.deepLearningWeather}</p>
                    ))}
                  </div>
                )}
                {geolocation?.length > 0 ? (
                  <div>
                    <h3 className='text-md font-semibold'>Geolocation:</h3>
                    {geolocation.map((geo: ImageGeolocation) => (
                      <p key={geo.id}>
                        Latitude: {geo.latitude || 'N/A'}, Longitude:{' '}
                        {geo.longitude || 'N/A'}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p>No geolocation data available.</p>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}