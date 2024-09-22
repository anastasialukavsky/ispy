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

interface Result {
  score: number;
  algo: string;
}

function ImageUploader() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  // console.log({enableButton})
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
          setSelectedAlgo(null);
          setResults([]);
          setTamperingResult(null);
          setWeatherPrediction(null);
          setMetadata(null);
          setMetadataReady(false);
          setDisplayMetadata(false);
          setEnableButton(true);
          setImageUploaded(true);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  useEffect(() => {
    if (selectedImage) {
      extractMetadataForImage();
    }
  }, [selectedImage]);

  const extractMetadataForImage = async () => {
    if (!selectedImage) return;

    try {
      const file = await fetch(selectedImage).then((res) => res.blob());
      const meta = await exifr.parse(file);
      setMetadata(meta);
      console.log({ meta });
      setMetadataReady(true);
      setDisplayMetadata(false);
    } catch (error) {
      console.error('Error extracting metadata:', error);
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
          />
        );
      case 'Noise':
        return (
          <NoiseAnalysisComponent
            imageSrc={selectedImage}
            onResult={handleResult}
            tamperingResult={tamperingResult}
            setTamperingResult={setTamperingResult}
            processing={processing}
            setProcessing={setProcessing}
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
          />
        );
      case 'Weather':
        return metadataReady ? (
          <WeatherPrediction
            imageSrc={selectedImage}
            setWeatherPrediction={setWeatherPrediction}
          />
        ) : (
          <p>Extracting metadata... Please wait.</p>
        );
      default:
        return null;
    }
  };

  const overallProbability = calculateOverallProbability();

  return (
    <div className='flex min-h-[calc(100vh_-_64px)] w-full bg-primary-dark-gray font-abel text-primary-light-fill'>
      <div className='fixed left-0 top-18 h-full bg-toolbox-gray p-4 w-[25rem] text-primary-light-fill'>
        <Toolbox
          setSelectedAlgo={setSelectedAlgo}
          setDisplayMetadata={setDisplayMetadata}
          setEnableButton={setEnableButton}
          enableButton={enableButton}
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
          className='cursor-pointer px-4 py-2 text-white border border-white'
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
              className='border w-[500px]'
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

        {/* Display weather results when the 'Weather' algo is selected */}
        {selectedAlgo === 'Weather' &&
          historicalWeather &&
          weatherPrediction &&
          geolocation && (
            <div className='mt-5'>
              <p>
                <strong>Historical Weather:</strong> {historicalWeather}
              </p>
              <p>
                <strong>Predicted Weather:</strong> {weatherPrediction}
              </p>
            </div>
          )}

        {tamperingResult && !processing ? (
          <p className='pt-6'>
            <strong>Analysis Result:</strong> {tamperingResult}
          </p>
        ) : (
          null
          // <Loader />
        )}

        {metadata && displayMetadata && (
          <div>
            <h3>Metadata Results:</h3>
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          </div>
        )}

        {overallProbability !== null && (
          <div className='mt-5 text-center'>
            <h3 className='text-xl font-semibold text-primary-light-fill'>
              Overall Tampering Probability
            </h3>
            <p className='text-lg'>
              {(overallProbability * 100).toFixed(2)}% likely tampered
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;
