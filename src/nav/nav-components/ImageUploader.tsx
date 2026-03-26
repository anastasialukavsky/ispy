import React, { useState, useEffect, useCallback } from 'react';
import Toolbox from '../../algos/toolbox/Toolbox';
import ELAComponent from '../../algos/ELAComponent';
import NoiseAnalysisComponent from '../../algos/NoiseAnalysisComponent';
import MetadataExtraction from '../../algos/MetadataExtraction';
import WeatherPrediction from '../../algos/WeatherPrediction';
import exifr from 'exifr';
import GeolocationDisplay from '../../algos/GeolocationDisplay';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import FlameGraph from './FlameGraph';
import MetadataFormatter from './MetadataFormatter';

const GRAPHQL_API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/graphql';
const API_BASE_URL = GRAPHQL_API_URL.replace('/graphql', '');

export interface Result {
  imageId?: number;
  score: number;
  algo: string;
  tamperingLikelihood?: number;
  detectedEla?: boolean;
  temperingAnalysis?: string;
}

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg'];

function ImageUploader() {
  const { isAuthenticated, userId } = useAuth();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAlgo, setSelectedAlgo] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [tamperingResult, setTamperingResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [weatherPrediction, setWeatherPrediction] = useState<string | null>(
    null,
  );
  const [metadata, setMetadata] = useState<any | null>(null);
  const [historicalWeather, setHistoricalWeather] = useState<string | null>(
    null,
  );
  const [metadataReady, setMetadataReady] = useState<boolean>(false);
  const [displayMetadata, setDisplayMetadata] = useState<boolean>(false);
  const [geolocation, setGeolocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [enableButton, setEnableButton] = useState<boolean>(false);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);
  const [tamperingProbability, setTamperingProbability] = useState<
    number | null
  >(null);
  const [softwareUsed, setSoftwareUsed] = useState<string | null>(null);
  const [savedImageId, setSavedImageId] = useState<number | null>(null);
  const [savedResults, setSavedResults] = useState<Set<string>>(new Set());

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isInvalidUpload, setIsInvalidUpload] = useState<boolean>(false);

  const isAllowedImageFile = useCallback((file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    return (
      ALLOWED_MIME_TYPES.includes(file.type) ||
      ALLOWED_EXTENSIONS.includes(extension)
    );
  }, []);

  const clearAnalysisStateForInvalidUpload = useCallback(() => {
    setSelectedFile(null);
    setSelectedImage(null);
    setSelectedAlgo(null);
    setResults([]);
    setTamperingResult(null);
    setProcessing(false);
    setWeatherPrediction(null);
    setMetadata(null);
    setHistoricalWeather(null);
    setMetadataReady(false);
    setDisplayMetadata(false);
    setGeolocation(null);
    setEnableButton(false);
    setImageUploaded(false);
    setTamperingProbability(null);
    setSoftwareUsed(null);
    setSavedImageId(null);
    setSavedResults(new Set());
  }, []);

  const resetAnalysisState = useCallback(() => {
    setSelectedAlgo(null);
    setResults([]);
    setTamperingResult(null);
    setWeatherPrediction(null);
    setHistoricalWeather(null);
    setDisplayMetadata(false);
    setEnableButton(true);
    setImageUploaded(true);
    setTamperingProbability(null);
    setProcessing(false);
    setSavedResults(new Set());
    setUploadError(null);
    setIsInvalidUpload(false);
  }, []);

  const formatPercentage = useCallback((value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return 'N/A';
    }

    const normalized = value <= 1 ? value * 100 : value;
    return `${normalized.toFixed(2)}%`;
  }, []);

  const getResultByAlgo = useCallback(
    (algo: string) => results.find((result) => result.algo === algo),
    [results],
  );

  const elaResult = getResultByAlgo('ELA');
  const noiseResult = getResultByAlgo('Noise Analysis');

  const hasGeoCoordinates = !!geolocation;
  const hasCaptureDate = !!(metadata?.DateTimeOriginal || metadata?.CreateDate);
  const canRunWeatherValidation = hasGeoCoordinates && hasCaptureDate;

  const buildWeatherConsistencyMessage = useCallback(() => {
    if (!historicalWeather || !weatherPrediction) return null;

    const historical = historicalWeather.toLowerCase();
    const predicted = weatherPrediction.toLowerCase();

    if (historical.includes(predicted) || predicted.includes(historical)) {
      return 'The historical data and deep learning analysis align, indicating consistency in weather conditions.';
    }

    return 'The historical data and deep learning analysis do not fully align, which may warrant a closer look.';
  }, [historicalWeather, weatherPrediction]);

  const uploadToS3 = async (file: File, extractedMetadata: any) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/generate-presigned-url`,
        {
          params: {
            fileName: file.name,
          },
        },
      );

      const presignedUrl = response.data;

      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      if (isAuthenticated) {
        await handleImageSave(file.name, extractedMetadata);
      }
    } catch (error) {
      console.error('Error uploading to S3:', error);
    }
  };

  const handleImageSave = async (filePath: string, extractedMetadata: any) => {
    if (!isAuthenticated || !userId) return;

    try {
      const mutation = `
        mutation SaveImage($input: ImageInput!) {
          saveImage(input: $input) {
            imageId
            userId
            filePath
            uploadedAt
          }
        }
      `;

      const variables = {
        input: {
          userId,
          filePath: `uploads/${filePath}`,
        },
      };

      const response = await axios.post(
        GRAPHQL_API_URL,
        {
          query: mutation,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        throw new Error('GraphQL request failed');
      }

      const newSavedImageId = response.data.data.saveImage.imageId;
      setSavedImageId(newSavedImageId);

      if (extractedMetadata) {
        await handleMetadataSave(newSavedImageId, extractedMetadata);
      }
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const saveNoiseAnalysisResult = useCallback(
    async (imageId: number, score: number, detectedNoise: boolean) => {
      try {
        const mutation = `
          mutation SaveNoiseAnalysis($input: NoiseAnalysisInput!) {
            saveNoiseAnalysis(input: $input) {
              id
              imageId
              tamperingLikelihood
              detectedNoise
            }
          }
        `;

        const variables = {
          input: {
            imageId,
            tamperingLikelihood: score,
            detectedNoise,
          },
        };

        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: mutation,
            variables,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.data.errors) {
          console.error('GraphQL errors:', response.data.errors);
          throw new Error('GraphQL request failed');
        }
      } catch (error) {
        console.error('Error saving noise analysis results:', error);
      }
    },
    [],
  );

  const handleMetadataSave = async (
    imageId: number,
    extractedMetadata: any,
  ) => {
    try {
      const mutation = `
        mutation SaveMetadata($input: MetadataInput!) {
          saveMetadata(input: $input) {
            metadataId
            imageId
            metadata
          }
        }
      `;

      const variables = {
        input: {
          imageId,
          metadata: extractedMetadata,
        },
      };

      const response = await axios.post(
        GRAPHQL_API_URL,
        {
          query: mutation,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        throw new Error('GraphQL request failed');
      }
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  };

  const extractMetadataForImage = async (file: File) => {
    try {
      const meta = await exifr.parse(file);

      if (meta) {
        setMetadata(meta);
        setMetadataReady(true);

        if (meta.latitude && meta.longitude) {
          setGeolocation({
            latitude: meta.latitude,
            longitude: meta.longitude,
          });
        } else {
          setGeolocation(null);
        }

        return meta;
      }

      setMetadataReady(false);
      setMetadata(null);
      setGeolocation(null);
      return null;
    } catch (error) {
      console.error('Error extracting metadata:', error);
      setMetadataReady(false);
      setMetadata(null);
      setGeolocation(null);
      return null;
    }
  };

  const saveElaResult = useCallback(
    async (
      imageId: number,
      tamperingLikelihood: number,
      detectedEla: boolean,
    ) => {
      try {
        const mutation = `
          mutation SaveEla($input: ElaInput!) {
            saveEla(input: $input) {
              id
              imageId
              tamperingLikelihood
              detectedEla
            }
          }
        `;

        const variables = {
          input: {
            imageId,
            tamperingLikelihood,
            detectedEla,
          },
        };

        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: mutation,
            variables,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.data.errors) {
          console.error('GraphQL errors:', response.data.errors);
          throw new Error('GraphQL request failed');
        }
      } catch (error) {
        console.error('Error saving ela results:', error);
      }
    },
    [],
  );

  const handleResult = useCallback(
    (result: Result) => {
      setResults((prevResults) => {
        const newResults = [...prevResults];
        const existingIndex = newResults.findIndex(
          (r) => r.algo === result.algo,
        );

        if (existingIndex !== -1) {
          newResults[existingIndex] = result;
        } else {
          newResults.push(result);
        }

        return newResults;
      });

      if (isAuthenticated && savedImageId && !savedResults.has(result.algo)) {
        if (result.algo === 'Noise Analysis') {
          saveNoiseAnalysisResult(
            savedImageId,
            result.score,
            result.score > 0.5,
          );
        }

        if (result.algo === 'ELA' && result.tamperingLikelihood !== undefined) {
          saveElaResult(
            savedImageId,
            result.tamperingLikelihood,
            result.detectedEla ?? false,
          );
        }

        setSavedResults((prev) => new Set(prev).add(result.algo));
      }
    },
    [
      isAuthenticated,
      savedImageId,
      savedResults,
      saveElaResult,
      saveNoiseAnalysisResult,
    ],
  );

  const saveHistoricalWeather = useCallback(
    async (imageId: number, weather: string) => {
      try {
        const mutation = `
          mutation SaveHistoricalWeather($input: HistoricalWeatherInput!) {
            saveHistoricalWeather(input: $input) {
              id
              imageId
              historicalWeather
            }
          }
        `;

        const variables = {
          input: {
            imageId,
            historicalWeather: weather,
          },
        };

        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: mutation,
            variables,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.data.errors) {
          console.error('GraphQL errors:', response.data.errors);
          throw new Error('GraphQL request failed');
        }
      } catch (error) {
        console.error('Error saving historical weather:', error);
      }
    },
    [],
  );

  const saveDeepLearningWeatherResult = useCallback(
    async (imageId: number, deepLearningWeather: string) => {
      try {
        const mutation = `
          mutation SaveDeepLearningWeather($input: DeepLearningWeatherInput!) {
            saveDeepLearningWeather(input: $input) {
              id
              imageId
              deepLearningWeather
            }
          }
        `;

        const variables = {
          input: {
            imageId,
            deepLearningWeather,
          },
        };

        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: mutation,
            variables,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.data.errors) {
          console.error('GraphQL errors:', response.data.errors);
          throw new Error('GraphQL request failed');
        }
      } catch (error) {
        console.error('Error saving deep learning weather results:', error);
      }
    },
    [],
  );

  const saveGeolocation = useCallback(
    async (imageId: number, latitude: number, longitude: number) => {
      try {
        const mutation = `
          mutation SaveGeolocation($input: GeolocationInput!) {
            saveGeolocation(input: $input) {
              id
              imageId
              latitude
              longitude
            }
          }
        `;

        const variables = {
          input: {
            imageId,
            latitude,
            longitude,
          },
        };

        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: mutation,
            variables,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.data.errors) {
          console.error('GraphQL errors:', response.data.errors);
          throw new Error('GraphQL request failed');
        }
      } catch (error) {
        console.error('Error saving geolocation data:', error);
      }
    },
    [],
  );

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAllowedImageFile(file)) {
      clearAnalysisStateForInvalidUpload();
      setUploadError('Only PNG, JPG, and JPEG files are allowed.');
      setIsInvalidUpload(true);
      event.target.value = '';
      return;
    }

    setUploadError(null);
    setIsInvalidUpload(false);
    setSelectedFile(file);

    try {
      const extractedMetadata = await extractMetadataForImage(file);

      const reader = new FileReader();
      reader.onload = async (e) => {
        resetAnalysisState();
        setSelectedImage(e.target?.result as string);

        if (isAuthenticated) {
          await uploadToS3(file, extractedMetadata);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error extracting metadata:', error);
      clearAnalysisStateForInvalidUpload();
      setUploadError('Failed to process the uploaded image.');
      setIsInvalidUpload(true);
      event.target.value = '';
    }
  };

  useEffect(() => {
    if (!selectedFile || !selectedImage) return;
    extractMetadataForImage(selectedFile);
  }, [selectedFile, selectedImage]);

  const calculateOverallProbability = () => {
    if (results.length === 0) return null;
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    return totalScore / results.length;
  };

  const transformResultsToFlameGraphData = (analysisResults: Result[]) => {
    if (!analysisResults || analysisResults.length === 0) {
      return [];
    }

    return analysisResults.map((result) => {
      if (result.algo === 'Noise Analysis') {
        return {
          name: result.algo,
          value: (result.score || 0) * 100,
        };
      }

      if (result.algo === 'Weather Analysis') {
        return {
          name: 'Deep Learning Weather',
          value: (result.score || 0) * 100,
        };
      }

      return {
        name: result.algo,
        value: (result.score || 0) * 100,
      };
    });
  };

  const renderSelectedAlgo = () => {
    switch (selectedAlgo) {
      case 'ELA':
        return (
          <ELAComponent
            imageSrc={selectedImage}
            onResult={handleResult}
            tamperingResult={tamperingResult}
            setTamperingResult={setTamperingResult}
            processing={processing}
            setProcessing={setProcessing}
            setTamperingProbability={setTamperingProbability}
          />
        );

      case 'Noise Analysis':
        return (
          <NoiseAnalysisComponent
            imageSrc={selectedImage}
            onResult={handleResult}
            tamperingResult={tamperingResult}
            setTamperingResult={setTamperingResult}
            processing={processing}
            setProcessing={setProcessing}
            setTamperingProbability={setTamperingProbability}
          />
        );

      case 'Metadata':
        return (
          <MetadataExtraction
            imageSrc={selectedImage}
            onResult={handleResult}
            setMetadata={setMetadata}
            historicalWeather={historicalWeather}
            setHistoricalWeather={setHistoricalWeather}
            weatherPrediction={weatherPrediction}
            setGeolocation={setGeolocation}
            geolocation={geolocation}
            setTamperingProbability={setTamperingProbability}
            tamperingProbability={tamperingProbability}
            setSoftwareUsed={setSoftwareUsed}
            setProcessing={setProcessing}
            savedImageId={savedImageId}
            saveHistoricalWeather={saveHistoricalWeather}
            saveGeolocation={saveGeolocation}
          />
        );

      case 'Geolocation':
        return geolocation ? (
          <GeolocationDisplay geolocation={geolocation} metadata={metadata} />
        ) : (
          <p className='text-white'>
            No geolocation coordinates found in metadata.
          </p>
        );

      case 'Weather Analizer':
        return canRunWeatherValidation ? (
          <WeatherPrediction
            imageSrc={selectedImage}
            setWeatherPrediction={setWeatherPrediction}
            setProcessing={setProcessing}
            savedImageId={savedImageId}
            saveDeepLearningWeatherResult={saveDeepLearningWeatherResult}
          />
        ) : (
          <p className='text-white'>
            Weather validation requires metadata with GPS coordinates and
            capture date.
          </p>
        );

      default:
        return null;
    }
  };

  const overallProbability = calculateOverallProbability();
  const weatherConsistencyMessage = buildWeatherConsistencyMessage();

  return (
    <div className='flex min-h-[calc(100vh_-_64px)] w-full bg-[#171717] font-abel text-primary-light-fill'>
      <div className='fixed left-0 top-18 h-full bg-toolbox-gray p-4 w-[20%] 5xl:w-[14%] text-primary-light-fill'>
        <Toolbox
          setSelectedAlgo={setSelectedAlgo}
          setDisplayMetadata={setDisplayMetadata}
          setEnableButton={setEnableButton}
          enableButton={enableButton}
          metadata={metadata}
          geolocation={geolocation}
          canRunWeatherValidation={canRunWeatherValidation}
        />
      </div>

      <div className='flex flex-col items-center justify-start w-full pl-96'>
        <h1 className='py-10 text-3xl font-bold text-white uppercase'>
          Image Forgery Detection
        </h1>

        <input
          type='file'
          id='file-input'
          onChange={handleImageUpload}
          accept='.png,.jpg,.jpeg,image/png,image/jpeg'
          className='hidden'
        />

        <label
          htmlFor='file-input'
          className={`px-4 py-2 border transition-transform duration-300 relative after:content-[""] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:transition-all after:duration-300 ${
            isInvalidUpload
              ? 'cursor-pointer text-gray-400 border-gray-500 bg-gray-700/30 after:w-0'
              : 'cursor-pointer text-white border-white bg-primary-light-fill/20 transform hover:scale-105 after:w-0 after:bg-white hover:after:w-full'
          }`}
        >
          <img
            src='/icons/add.svg'
            alt='Upload Icon'
            className={`w-3 h-3 mr-2 inline ${isInvalidUpload ? 'opacity-40' : ''}`}
          />
          {!imageUploaded ? 'Upload your image' : 'Upload another image'}
        </label>

        {uploadError && (
          <p className='mt-3 text-sm text-red-400'>{uploadError}</p>
        )}

        <div className='flex pt-10'>
          {selectedImage && (
            <img
              src={selectedImage}
              alt='Uploaded'
              className='3xl:w-[500px] w-[300px]'
            />
          )}

          {selectedImage && (
            <div
              className={`${
                imageUploaded ? 'pl-10' : ''
              } flex justify-center items-center w-full `}
            >
              {renderSelectedAlgo()}
            </div>
          )}
        </div>

        {selectedAlgo === 'Weather Analizer' &&
          canRunWeatherValidation &&
          (historicalWeather || weatherPrediction) && (
            <div className='mt-5 text-white space-y-2'>
              {historicalWeather && (
                <p>
                  <strong>Historical Weather:</strong> {historicalWeather}
                </p>
              )}

              {weatherPrediction && (
                <p>
                  <strong>Deep learning weather analyzer:</strong>{' '}
                  {weatherPrediction}
                </p>
              )}

              {weatherConsistencyMessage && <p>{weatherConsistencyMessage}</p>}
            </div>
          )}

        {metadata && displayMetadata && (
          <div className='flex flex-col overflow-auto p-4 pb-20'>
            <h4 className='text-primary-light-fill text-lg pt-5 text-center pb-5'>
              {!processing && 'Metadata Extraction Results:'}
            </h4>
            <MetadataFormatter metadata={metadata} />
          </div>
        )}

        {selectedAlgo === 'Noise Analysis' && noiseResult && (
          <div className='pt-3 text-white'>
            <p>
              <strong>Noise Analysis Score:</strong>{' '}
              {formatPercentage(noiseResult.score)}
            </p>

            {(noiseResult.temperingAnalysis || tamperingResult) && (
              <p>
                <strong>Tampering Likelihood:</strong>{' '}
                {noiseResult.temperingAnalysis || tamperingResult}
              </p>
            )}
          </div>
        )}

        {geolocation && metadata && selectedAlgo === 'Geolocation' && (
          <div className='pt-5 text-white'>
            <h4 className='text-primary-light-fill'>
              Geolocation coordinates:
            </h4>
            <p>
              Latitude: {geolocation.latitude}, Longitude:{' '}
              {geolocation.longitude}
            </p>
          </div>
        )}

        {selectedImage && selectedAlgo === 'ELA' && elaResult && (
          <div className='text-white pt-5'>
            <p>
              <strong>Tampering Likelihood:</strong>{' '}
              {formatPercentage(
                elaResult.tamperingLikelihood ?? elaResult.score,
              )}
            </p>

            <p>
              <strong>Detected ELA:</strong>{' '}
              {elaResult.detectedEla ? 'Yes' : 'No'}
            </p>

            {(elaResult.temperingAnalysis || tamperingResult) && (
              <p>{elaResult.temperingAnalysis || tamperingResult}</p>
            )}
          </div>
        )}

        {overallProbability !== null && results.length > 1 && (
          <div className='mt-5 text-center text-white'>
            <h3 className='text-xl font-semibold text-primary-light-fill'>
              Overall Tampering Probability
            </h3>
            <p>{formatPercentage(overallProbability)}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className='mt-10 w-full max-w-3xl'>
            <h2 className='text-lg font-bold text-white mb-4'>
              Approximate tampering likelihood:
            </h2>

            {transformResultsToFlameGraphData(results).length > 0 && (
              <FlameGraph data={transformResultsToFlameGraphData(results)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;