import React, { useState, useEffect } from 'react';
import Toolbox from '../../algos/toolbox/Toolbox';
import ELAComponent from '../../algos/ELAComponent';
import CopyMoveComponent from '../../algos/CopyMoveComponent';
import NoiseAnalysisComponent from '../../algos/NoiseAnalysisComponent';
import MetadataExtraction from '../../algos/MetadataExtraction';
import WeatherPrediction from '../../algos/WeatherPrediction';
import DefaultResult from '../../algos/DefaultResult';
import exifr from 'exifr';
import Loader from '../../UI/Loader';
import GeolocationDisplay from '../../algos/GeolocationDisplay';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
// import { div } from '@tensorflow/tfjs';

interface Result {
  score: number;
  algo: string;
}

function ImageUploader() {
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
  const [softwareUsed, setSoftwareUsed] = useState<string | null>(null);
  const { isAuthenticated, userId } = useAuth();

  // console.log({enableButton})
const handleImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  if (event?.target?.files) {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Extract metadata first and wait for it to complete before proceeding
      try {
        const metadataExtracted = await extractMetadataForImage(file);
        if (metadataExtracted) {
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

            if (isAuthenticated) {
              await uploadToS3(file);
            }
          };
          reader.readAsDataURL(file);
        } else {
          console.error('Metadata extraction failed or not ready');
          alert('Metadata extraction failed. Image upload aborted.');
        }
      } catch (error) {
        console.error('Error extracting metadata:', error);
        alert('Failed to extract metadata. Image upload aborted.');
      }
    }
  }
};



  const uploadToS3 = async (file: File) => {
    try {
      const response = await axios.get(
        'http://localhost:8080/generate-presigned-url',
        {
          params: {
            fileName: file.name,
          },
        }
      );

      const presignedUrl = response.data;

      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      alert('Image uploaded successfully to S3!');
      if (isAuthenticated) {
        await handleImageSave(file.name);
      }
    } catch (error) {
      console.error('Error uploading to S3:', error);
      alert('Failed to upload image to S3.');
    }
  };

  // const handleImageSave = async (filePath: string) => {
  //   if (!isAuthenticated || !userId) return;

  //   try {
  //     const mutation = `
  //     mutation SaveImage($input: ImageInput!) {
  //       saveImage(input: $input) {
  //         imageId
  //         userId
  //         filePath
  //         uploadedAt
  //       }
  //     }
  //   `;

  //     const variables = {
  //       input: {
  //         userId,
  //         filePath: `uploads/${filePath}`,
  //       },
  //     };

  //     const response = await axios.post(
  //       'http://localhost:8080/graphql',
  //       {
  //         query: mutation,
  //         variables: variables,
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );

  //     if (response.data.errors) {
  //       console.error('GraphQL errors:', response.data.errors);
  //       throw new Error('GraphQL request failed');
  //     }
  //     const savedImageId = response.data.data.saveImage.imageId;

  //     alert('Image details saved successfully!');
  //     if (metadataReady && metadata) {
  //       await handleMetadataSave(savedImageId, metadata);
  //       alert('Metadata saved successfully!');
  //     }
  //   } catch (error) {
  //     console.error('Error saving image:', error);
  //     alert('Failed to save image details.');
  //   }
  // };
  const handleImageSave = async (filePath: string) => {
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
        'http://localhost:8080/graphql',
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

      alert('Image details saved successfully!');

      // Save metadata after image details are saved
      if (metadataReady && metadata) {
        await handleMetadataSave(savedImageId, metadata);
      }
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image details.');
    }
  };
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
        'http://localhost:8080/graphql',
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

      alert('Metadata saved successfully!');
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert('Failed to save metadata.');
    }
  };

  useEffect(() => {
    if(!selectedFile) return;
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
      return true; // Indicating metadata extraction was successful
    } else {
      console.error('No metadata found.');
      setMetadataReady(false);
      return false; // Indicating metadata extraction failed
    }
  } catch (error) {
    console.error('Error extracting metadata:', error);
    setMetadataReady(false);
    setMetadata(null);
    setGeolocation(null);
    return false; // Indicating metadata extraction failed
  }
};


  const handleResult = (result: Result) => {
    setResults((prevResults) => {
      const newResults = [...prevResults];
      const index = newResults.findIndex((r) => r.algo === result.algo);
      if (index !== -1) {
        newResults[index] = result;
      } else {
        newResults.push(result);
      }
      return newResults;
    });
  };

  const calculateOverallProbability = () => {
    if (results.length === 0) return null;
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    return totalScore / results.length;
  };

  // console.log({ softwareUsed });
  console.log({ processing });
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
          />
        ) : (
          <p>Extracting metadata... Please wait.</p>
        );
      default:
        return null;
    }
  };

  console.log({ weatherPrediction });
  // console.log({ tamperingProbability });
  // console.log({ selectedAlgo });
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
            src='public/icons/add.svg'
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
              {renderSelectedAlgo()}
            </div>
          )}
        </div>

        {selectedAlgo === 'Weather Analizer' &&
          historicalWeather &&
          weatherPrediction &&
          geolocation && (
            <div className='mt-5 text-lg text-white'>
              <p>
                <strong>Historical Weather:</strong> {historicalWeather}
              </p>
              <p>
                <strong>Deep learning weather analizer:</strong>{' '}
                {weatherPrediction}
              </p>
            </div>
          )}

        {tamperingResult &&
          !processing &&
          selectedAlgo !== 'Metadata' &&
          selectedAlgo !== 'Weather Analizer' &&
          selectedAlgo !== 'ELA' &&
          selectedAlgo !== 'Geolocation' && (
            <p className='pt-6 text-lg'>
              <strong>Analysis Result for {selectedAlgo}:</strong>{' '}
              {tamperingResult}
            </p>
          )}
        {tamperingProbability !== null &&
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
        ) : null}

        {metadata && displayMetadata && (
          <div>
            <h4 className='text-primary-light-fill text-lg pt-5 text-center'>
              {!processing && 'Metadata Results: '}
            </h4>
            <pre className='text-sm pb-20'>
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        )}

        {geolocation && metadata && selectedAlgo === 'Geolocation' && (
          <>
            <h4 className='text-primary-light-fill text-lg pt-5'>
              Geolocation coordinates:{' '}
            </h4>
            <pre className='text-sm pt-1'>
              {JSON.stringify(
                {
                  latitude: geolocation.latitude,
                  longitude: geolocation.longitude,
                },
                null,
                2
              )}
            </pre>
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
      </div>
    </div>
  );
}

export default ImageUploader;
