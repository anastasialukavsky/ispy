import React, { useState, useEffect } from 'react';
import Toolbox from '../../algos/toolbox/Toolbox';
import ELAComponent from '../../algos/ELAComponent';
import CopyMoveComponent from '../../algos/CopyMoveComponent';
import NoiseAnalysisComponent from '../../algos/NoiseAnalysisComponent';
import MetadataExtraction from '../../algos/MetadataExtraction';
import WeatherPrediction from '../../algos/WeatherPrediction';
import DefaultResult from '../../algos/DefaultResult';
import exifr from 'exifr';

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

  // Handle image upload and trigger metadata extraction automatically
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
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Automatically extract metadata when an image is uploaded
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

      setMetadataReady(true);

      console.log('Extracted Metadata:', meta);
    } catch (error) {
      console.error('Error extracting metadata:', error);
    }
  };

  // Handle results from algorithms
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
      case 'CopyMove':
        return (
          <CopyMoveComponent
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
            historicalWeather={historicalWeather}
            setHistoricalWeather={setHistoricalWeather}
            weatherPrediction={weatherPrediction}
            setMetadata={setMetadata}
          />
        );
      case 'Weather':
        if (!metadataReady) {
          return <p>Extracting metadata... Please wait.</p>; // Prevent running model until metadata is ready
        }
        return (
          <WeatherPrediction
            imageSrc={selectedImage}
            setWeatherPrediction={setWeatherPrediction}
          />
        );
      case 'All':
        return (
          <>
            <ELAComponent
              imageSrc={selectedImage}
              onResult={handleResult}
              tamperingResult={tamperingResult}
              setTamperingResult={setTamperingResult}
              processing={processing}
              setProcessing={setProcessing}
            />
            <NoiseAnalysisComponent
              imageSrc={selectedImage}
              onResult={handleResult}
              tamperingResult={tamperingResult}
              setTamperingResult={setTamperingResult}
              processing={processing}
              setProcessing={setProcessing}
            />
            <CopyMoveComponent
              imageSrc={selectedImage}
              onResult={handleResult}
              tamperingResult={tamperingResult}
              setTamperingResult={setTamperingResult}
              processing={processing}
              setProcessing={setProcessing}
            />
            <MetadataExtraction
              imageSrc={selectedImage}
              onResult={handleResult}
              setMetadata={setMetadata}
              setHistoricalWeather={setHistoricalWeather}
              historicalWeather={historicalWeather}
              weatherPrediction={weatherPrediction}
            />
            {metadataReady ? (
              <WeatherPrediction
                imageSrc={selectedImage}
                setWeatherPrediction={setWeatherPrediction}
              />
            ) : (
              <p>Extracting metadata... Please wait.</p>
            )}
          </>
        );
      default:
        return <DefaultResult />;
    }
  };

  const overallProbability = calculateOverallProbability();

  return (
    <div className='flex h-[100vh] w-full bg-primary-dark-blue/30'>
      {/* Toolbox for selecting algorithms */}
      <div className='fixed left-0 top-0 h-full bg-gray-100 p-4 w-1/4'>
        <Toolbox setSelectedAlgo={setSelectedAlgo} />
      </div>

      {/* Main content */}
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
          className='cursor-pointer px-4 py-2 text-white border-2 border-white'
        >
          + Upload your image
        </label>

        {/* Display uploaded image */}
        <div className='bg-red-400 flex pt-10'>
          {selectedImage && (
            <img
              src={selectedImage}
              alt='Uploaded'
              className='border w-[500px]'
            />
          )}

          {/* Render selected algorithm */}
          {selectedImage && (
            <div className='flex justify-center items-center w-full'>
              {renderSelectedAlgo()}
            </div>
          )}
        </div>

        {/* Display tampering result */}
        <div>
          {tamperingResult && !processing && (
            <p>
              <strong>Analysis Result:</strong> {tamperingResult}
            </p>
          )}
        </div>

        {/* Display metadata extraction results */}
        {metadata && (
          <div>
            <h3>Metadata Results:</h3>
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          </div>
        )}

        {/* Display overall probability */}
        {overallProbability !== null && (
          <div className='mt-5 text-center'>
            <h3 className='text-xl font-semibold'>
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
