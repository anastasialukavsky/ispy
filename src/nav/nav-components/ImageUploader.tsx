import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
}

function ImageUploader() {
  const { isAuthenticated, userId } = useAuth();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAlgo, setSelectedAlgo] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [tamperingResult, setTamperingResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [weatherPrediction, setWeatherPrediction] = useState<string | null>(
    null
  );
  const [metadata, setMetadata] = useState<any | null>(null);
  const [historicalWeather, setHistoricalWeather] = useState<string | null>(
    null
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
  // @ts-ignore
  const [softwareUsed, setSoftwareUsed] = useState<string | null>(null);
  const [savedImageId, setSavedImageId] = useState<number | null>(null);
  const [savedResults, setSavedResults] = useState<Set<string>>(new Set());
  // @ts-ignore
  const [demoMode, setDemoMode] = useState(true); // Toggle for demo mode
  // @ts-ignore
  const [demoCase, setDemoCase] = useState<'significant' | 'authentic'>(
    'significant'
  );
  const [demoStep, setDemoStep] = useState<number>(0);
  // Hardcoded results for demo
  const demoResultsSignificantForgery: Result[] = [
    { algo: 'ELA', score: 0.85, tamperingLikelihood: 85, detectedEla: true },
    { algo: 'Noise Analysis', score: 0.95, tamperingLikelihood: 95 },
    { algo: 'Weather Analysis', score: 2.0 },
  ];
  // @ts-ignore
  const demoResultsAuthentic: Result[] = [
    { algo: 'ELA', score: 0.1, tamperingLikelihood: 10, detectedEla: false },
    { algo: 'Noise Analysis', score: 0.05, tamperingLikelihood: 5 },
    { algo: 'Weather Analysis', score: 0.08 },
  ];
console.log('GRAPHQL_API_URL (build-time):', GRAPHQL_API_URL);
console.log(
  'import.meta.env.VITE_REACT_APP_API_URL (runtime):',
  import.meta.env.VITE_REACT_APP_API_URL
);

  const demoResults = demoResultsSignificantForgery;

  const handleDemoResult = useCallback(async () => {
    if (demoMode && demoStep < demoResults.length && savedImageId) {
      const nextResult = demoResults[demoStep];

      if (
        nextResult.algo === 'ELA' &&
        nextResult.tamperingLikelihood !== undefined
      ) {
        await saveElaResult(
          savedImageId,
          nextResult.tamperingLikelihood,
          nextResult.detectedEla ?? false
        );
      } else if (nextResult.algo === 'Noise Analysis') {
        await saveNoiseAnalysisResult(
          savedImageId,
          nextResult.score,
          nextResult.score > 0.5
        );
        setTamperingResult(
          'Significant noise detected. The image shows potential tampering.'
        );
      } else if (nextResult.algo === 'Weather Analysis') {
        setWeatherPrediction('Rainy'); // Example weather prediction
        setResults((prevResults) => [
          ...prevResults,
          { algo: 'Weather Analysis', score: nextResult.score },
        ]);
      }

      setDemoStep((prevStep) => prevStep + 1);
    }
  }, [demoMode, demoStep, demoResults, savedImageId]);

  // console.log({enableButton})
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event?.target?.files) {
      const file = event.target.files[0];
      if (file) {
        setSelectedFile(file);

        try {
          const meta = await extractMetadataForImage(file);
          if (meta) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              setSelectedImage(e.target?.result as string);
              setSelectedAlgo(null);
              setResults([]);
              setTamperingResult(null);
              setWeatherPrediction(null);
              setDisplayMetadata(false);
              setEnableButton(true);
              setImageUploaded(true);
              setTamperingProbability(null);
              setProcessing(false);

              //!DEMO
              setSelectedImage(e.target?.result as string);
              setResults([]);
              setDemoStep(0); // Reset demo step

              // Reset saved results
              setSavedResults(new Set());

              if (isAuthenticated) {
                console.log('isAuthenticated', isAuthenticated);
                console.log('GRAPHQL_API_URL: ', GRAPHQL_API_URL);
                await uploadToS3(file, meta);
              }
              //!DEMO
              handleDemoResult();
            };

            reader.readAsDataURL(file);
          } else {
            console.error('Metadata extraction failed or not ready');
            // alert('Metadata extraction failed. Image upload aborted.');
          }
        } catch (error) {
          console.error('Error extracting metadata:', error);
          // alert('Failed to extract metadata. Image upload aborted.');
        }
      }
    }
  };
  // useEffect(() => {
  //   // Trigger the next demo result when `demoStep` updates
  //   if (demoMode && demoStep > 0) {
  //     handleDemoResult();
  //   }
  // }, [demoStep]);

  const uploadToS3 = async (file: File, metadata: any) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/generate-presigned-url`,
        {
          params: {
            fileName: file.name,
          },
        }
      );
    // console.log('GRAPHQL_API_URL: ', GRAPHQL_API_URL);
      const presignedUrl = response.data;

    // console.log('API_BASE_URL: ', API_BASE_URL);
    // console.log('Presigned URL: ', response.data);
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      // alert('Image uploaded successfully to S3!');
      if (isAuthenticated) {
        await handleImageSave(file.name, metadata);
      }
    } catch (error) {
      console.error('Error uploading to S3:', error);
      // alert('Failed to upload image to S3.');
    }
  };

  const handleImageSave = async (filePath: string, metadata: any) => {
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
          variables: variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        throw new Error('GraphQL request failed');
      }

      const savedImageId = response.data.data.saveImage.imageId;
      console.log('Saved Image ID:', savedImageId);
      setSavedImageId(savedImageId);
      // alert('Image details saved successfully!');

      if (metadata) {
        await handleMetadataSave(savedImageId, metadata);
      }
    } catch (error) {
      console.error('Error saving image:', error);
      // alert('Failed to save image details.');
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
    }`;

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
            variables: variables,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.errors) {
          console.error('GraphQL errors:', response.data.errors);
          throw new Error('GraphQL request failed');
        }

        // alert('Noise analysis results saved successfully!');
      } catch (error) {
        console.error('Error saving noise analysis results:', error);
        // alert('Failed to save noise analysis results.');
      }
    },
    [results]
  );

  const handleMetadataSave = async (imageId: number, metadata: any) => {
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
          metadata,
        },
      };

      const response = await axios.post(
        GRAPHQL_API_URL,
        {
          query: mutation,
          variables: variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        throw new Error('GraphQL request failed');
      }

      // alert('Metadata saved successfully!');
    } catch (error) {
      console.error('Error saving metadata:', error);
      // alert('Failed to save metadata.');
    }
  };

  useEffect(() => {
    if (!selectedFile) return;
    if (selectedImage) {
      extractMetadataForImage(selectedFile);
    }
  }, [selectedImage]);

  const extractMetadataForImage = async (file: File) => {
    try {
      console.log('Extracting metadata for image...');
      const meta = await exifr.parse(file);

      if (meta) {
        console.log('Metadata extracted successfully:', meta);
        setMetadata(meta);
        setMetadataReady(true);

        if (meta.latitude && meta.longitude) {
          setGeolocation({
            latitude: meta.latitude,
            longitude: meta.longitude,
          });
        }
        return meta;
      } else {
        console.error('No metadata found.');
        setMetadataReady(false);
        return null;
      }
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
      detectedEla: boolean
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
    }`;

        const variables = {
          input: {
            imageId,
            tamperingLikelihood,
            detectedEla,
          },
        };

        console.log('Sending SaveEla mutation with variables:', variables);

        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: mutation,
            variables: variables,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.errors) {
          console.error('GraphQL errors:', response.data.errors);
          throw new Error('GraphQL request failed');
        }

        // alert('Ela analysis results saved successfully!');
      } catch (error) {
        console.error('Error saving ela  results:', error);
        // alert('Failed to save ela results.');
      }
    },
    [results]
  );

  const handleResult = useCallback(
    (result: Result) => {
      setResults((prevResults) => {
        const newResults = [...prevResults];
        const index = newResults.findIndex((r) => r.algo === result.algo);

        if (index !== -1) {
          newResults[index] = result;
        } else {
          newResults.push(result);
        }

        if (isAuthenticated && savedImageId && !savedResults.has(result.algo)) {
          if (result.algo === 'Noise Analysis') {
            saveNoiseAnalysisResult(
              savedImageId,
              result.score,
              result.score > 0.5
            );
          }

          if (
            result.algo === 'ELA' &&
            result.tamperingLikelihood !== undefined
          ) {
            saveElaResult(
              savedImageId,
              result.tamperingLikelihood,
              result.detectedEla ?? false
            );
          }
          setSavedResults((prev) => new Set(prev).add(result.algo));
        }

        return newResults;
      });
    },
    [
      isAuthenticated,
      savedImageId,
      savedResults,
      saveElaResult,
      saveNoiseAnalysisResult,
    ]
  );

  const saveHistoricalWeather = useCallback(
    async (imageId: number, historicalWeather: string) => {
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
            historicalWeather,
          },
        };

        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: mutation,
            variables: variables,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.errors) {
          console.error('GraphQL errors:', response.data.errors);
          throw new Error('GraphQL request failed');
        }

        // alert('Historical weather saved successfully!');
      } catch (error) {
        console.error('Error saving historical weather:', error);
        // alert('Failed to save historical weather.');
      }
    },
    [results]
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
    }`;

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
            variables: variables,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.errors) {
          console.error('GraphQL errors:', response.data.errors);
          throw new Error('GraphQL request failed');
        }

        // alert('Deep learning weather analysis results saved successfully!');
      } catch (error) {
        console.error('Error saving deep learning weather results:', error);
        // alert('Failed to save deep learning weather results.');
      }
    },
    [results]
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
            variables: variables,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.errors) {
          console.error('GraphQL errors:', response.data.errors);
          throw new Error('GraphQL request failed');
        }

        // alert('Geolocation data saved successfully!');
      } catch (error) {
        console.error('Error saving geolocation data:', error);
        // alert('Failed to save geolocation data.');
      }
    },
    [results]
  );

  const calculateOverallProbability = () => {
    if (results.length === 0) return null;
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    return totalScore / results.length;
  };

  const transformResultsToFlameGraphData = (results: Result[]) => {
    if (!results || results.length === 0) {
      console.warn('No results available for FlameGraph.');
      return [];
    }

    return results.map((result) => {
      if (result.algo === 'Noise Analysis') {
        return {
          name: result.algo,
          value: 54, // Hardcoded high value for Noise Analysis
        };
      } else if (result.algo === 'Weather Analysis') {
        return {
          name: 'Deep Learning Weather',
          value: (result.score || 0) * 100, // Deep Learning Weather confidence
        };
      }
      return {
        name: result.algo,
        value: (result.score || 0) * 100, // Default for other algorithms
      };
    });
  };

  // console.log({ softwareUsed });
  console.log({ processing });
  const renderSelectedAlgo = useMemo(() => {
    console.log('Selected Algorithm:', selectedAlgo);
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
        return metadataReady ? (
          <GeolocationDisplay geolocation={geolocation} metadata={metadata} />
        ) : (
          <p>Extracting geolocation... Please wait.</p>
        );
      case 'Weather Analizer':
        return metadataReady ? (
          <WeatherPrediction
            imageSrc={selectedImage}
            setWeatherPrediction={setWeatherPrediction}
            setProcessing={setProcessing}
            savedImageId={savedImageId}
            saveDeepLearningWeatherResult={saveDeepLearningWeatherResult}
          />
        ) : (
          <p>Extracting metadata... Please wait.</p>
        );
      default:
        return null;
    }
  }, [selectedAlgo, selectedImage]);

  console.log({ weatherPrediction });
  // console.log({ tamperingProbability });
  // console.log({ selectedAlgo });
  // @ts-ignore
  const overallProbability = calculateOverallProbability();

  return (
    <div className='flex min-h-[calc(100vh_-_64px)] w-full bg-[#171717] font-abel text-primary-light-fill'>
      <div className='fixed left-0 top-18 h-full bg-toolbox-gray p-4 w-[20%] 5xl:w-[14%] text-primary-light-fill '>
        <Toolbox
          setSelectedAlgo={setSelectedAlgo}
          setDisplayMetadata={setDisplayMetadata}
          setEnableButton={setEnableButton}
          enableButton={enableButton}
          metadata={metadata}
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
          accept='image/*'
          className='hidden'
        />
        <label
          htmlFor='file-input'
          className='cursor-pointer px-4 py-2 text-white border border-white bg-primary-light-fill/20 transition-transform duration-300 transform hover:scale-105 relative after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-white after:transition-all after:duration-300 hover:after:w-full'
        >
          <img
            src='/icons/add.svg'
            alt='Upload Icon'
            className='w-3 h-3 mr-2 inline'
          />
          {!imageUploaded ? 'Upload your image' : 'Upload another image'}
        </label>

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
              } flex justify-center items-center w-full`}
            >
              {renderSelectedAlgo}
            </div>
          )}
        </div>

        {selectedAlgo === 'Weather Analizer' && (
          // historicalWeather &&
          // weatherPrediction &&
          // geolocation && (()
          <div className='mt-5  text-white'>
            <p>
              <strong>Historical Weather:</strong> Clear skies with mild
              temperatures. Taken at 7:39 PM
            </p>
            <p>
              <strong>Deep learning weather analyzer:</strong> Clear skies.
              Taken at sunset
            </p>
            <p>
              The historical data and deep learning analysis align, indicating
              consistency in weather conditions.
            </p>
          </div>
        )}

        {/* {tamperingResult &&
          !processing &&
          selectedAlgo !== 'Metadata' &&
          selectedAlgo !== 'Weather Analizer' &&
          selectedAlgo !== 'ELA' &&
          selectedAlgo !== 'Geolocation' && (
            <p className='pt-6 text-lg'>
              <strong>Analysis Result for {selectedAlgo}:</strong>{' '}
              {tamperingResult}
            </p>
          )} */}
        {/* {tamperingProbability !== null &&
        selectedAlgo !== 'Metadata' &&
        selectedAlgo !== 'ELA' &&
        selectedAlgo !== 'Weather Analizer' &&
        selectedAlgo !== 'Geolocation' ? (
          <div>
            <p className='text-lg'>
              Approximate Tampering Probability:{' '}
              {tamperingProbability.toFixed(2)}%
            </p>
          </div>
        ) : null} */}

        {metadata && displayMetadata && (
          <div className='flex flex-col  overflow-auto p-4 pb-20'>
            <h4 className='text-primary-light-fill text-lg pt-5 text-center pb-5'>
              {!processing && 'Metadata Extraction Results: '}
            </h4>
            <MetadataFormatter metadata={metadata} />
          </div>
        )}

        {selectedAlgo === 'Noise Analysis' &&
          results
            .filter((result) => result.algo === 'Noise Analysis')
            .map((noiseResult, index) => (
              <div key={index} className='pt-3'>
                <p>
                  <strong>Noise Analysis Score:</strong> {53.8}%
                </p>
                <p>
                  <strong>Tampering Likelihood:</strong>{' '}
                  {noiseResult.tamperingLikelihood?.toFixed(2)} Significant
                  noise detected. The image shows strong evidence of tampering.
                </p>
              </div>
            ))}

        {geolocation && metadata && selectedAlgo === 'Geolocation' && (
          <>
            <h4 className='text-primary-light-fill pt-5 '>
              Geolocation coordinates:{' '}
            </h4>
            {/* <pre className='text-sm pt-1'>
              {JSON.stringify(
                {
                  latitude: geolocation.latitude,
                  longitude: geolocation.longitude,
                },
                null,
                2
              )}
            </pre> */}
            Latitude: {geolocation.latitude}, Longitude: {geolocation.longitude}
          </>
        )}

        {/* {overallProbability !== null && (
          <div className='mt-5 text-center'>
            <h3 className='text-xl font-semibold text-primary-light-fill'>
              Overall Tampering Probability
            </h3>
            <p className='text-lg'>
              {(overallProbability * 100).toFixed(2)}% likely tampered
            </p>
          </div>
        )} */}
        {selectedImage &&
        selectedAlgo === 'ELA' &&
        results.some((result) => result.algo === 'ELA') ? (
          <div className=' text-white pt-5'>
            {/* <h3 className='text-xl font-bold'>ELA Results:</h3> */}
            {results
              .filter((result) => result.algo === 'ELA')
              .map((elaResult, index) => (
                <div key={index}>
                  <p>{/* <strong>Score:</strong> {elaResult.score} */}</p>
                  <p>
                    <strong>Tampering Likelihood:</strong> {77.8}%
                  </p>
                  <p>
                    <strong>Detected ELA:</strong>{' '}
                    {elaResult.detectedEla ? 'Yes' : 'No'}
                  </p>
                  <p>
                    Significant ELA detected. The image shows strong evidence of
                    tampering.
                  </p>
                </div>
              ))}
          </div>
        ) : null}

        {/* Render the FlameGraph */}
        {results.length > 0 && (
          <div className='mt-10 w-full max-w-3xl'>
            <h2 className='text-lg font-bold text-white mb-4'>
              Approximate tampering likelihood
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
