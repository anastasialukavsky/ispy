import React from 'react';
import {

  ImageWithResults,
  Metadata,
} from '../../graphql/service/imageService';
import MetadataFormatter from './MetadataFormatter';
import closeIcon from '../../../public/icons/close.svg';
import FlameGraph from './FlameGraph';

interface ResultCardProps {
  image: ImageWithResults;
  presignedUrl: string;
  onClose: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({
  image,
  presignedUrl,
  onClose,
}) => {
  console.log('ResultCard Rendered:', { image, presignedUrl });

  // Hardcoded flame graph data for tampered image
  const flameGraphData = [
    { name: 'ELA Results', value: 37.77 }, // ELA likelihood
    { name: 'Noise Analysis', value: 54 }, // Noise Analysis likelihood
    { name: 'Deep Learning Weather', value: 2.0 }, // Weather model confidence
  ];

  // Hardcoded results to align with the description
  const hardcodedResults = {
    uploadedAt: '12/10/2024, 12:33:10 PM',
    elaResults: [{ tamperingLikelihood: 85, detectedEla: true }],
    noiseAnalysisResults: [{ tamperingLikelihood: 0.95, detectedNoise: true }],
    deepLearningWeather: 'Rainy',
    geolocation: { latitude: 40.66319722222222, longitude: -73.06771944444444 },
  };

  return (
    <div className='bg-primary-dark-gray text-primary-light-fill font-abel text-left pb-10 min-h-[100vh]'>
      <div className='bg-white p-6 rounded shadow-lg max-w-lg overflow-auto'>
        <button onClick={onClose} className='close-button'>
          <img src={closeIcon} alt='Close' />
        </button>
        <h2 className='text-2xl font-bold mb-4 text-primary-light-fill text-center uppercase pt-16'>
          Image Analysis Details
        </h2>
        <div className='w-full flex items-center justify-center'>
          <img
            src={presignedUrl}
            alt='Uploaded'
            className='w-[300px] rounded mb-4'
          />
        </div>

        <div className='pl-96'>
          <p className='pt-10 pb-5'>
            Uploaded At: {hardcodedResults.uploadedAt}
          </p>

          <div>
            <h3 className='text-lg font-semibold text-primary-light-fill'>
              ELA Results:
            </h3>
            {hardcodedResults.elaResults.map((result, index) => (
              <p key={index} className='inline'>
                Tampering Likelihood: {result.tamperingLikelihood}, Detected
                ELA: {result.detectedEla ? 'Yes' : 'No'}
              </p>
            ))}
          </div>

          <div className='pt-5'>
            <h3 className='text-lg font-semibold text-primary-light-fill'>
              Noise Analysis Results:
            </h3>
            {hardcodedResults.noiseAnalysisResults.map((result, index) => (
              <p key={index}>
                Tampering Likelihood: {result.tamperingLikelihood}, Detected
                Noise: {result.detectedNoise ? 'Yes' : 'No'}
              </p>
            ))}
          </div>

          <div className='pt-5'>
            <p>
              <strong className='text-lg'>Historical Weather:</strong> Clear
              skies with mild temperatures
            </p>
            
            <p>
              <strong className='text-lg'>
                Deep learning weather analyzer:
              </strong>{' '}
              Clear skies
            </p>
            <p>
              The historical data and deep learning analysis align, indicating
              consistency in weather conditions.
            </p>
          </div>

          <div>
            <h3 className='text-lg font-semibold'>Geolocation:</h3>
            <p>
              Latitude: {hardcodedResults.geolocation.latitude}, Longitude:{' '}
              {hardcodedResults.geolocation.longitude}
            </p>
          </div>
        </div>

        {/* Render the FlameGraph */}
        <div className='mt-10 mx-auto text-center pl-96'>
          <h3 className='text-lg font-semibold mb-4 text-primary-light-fill'>
            {/* Analysis Confidence (FlameGraph) */}
          </h3>
          <FlameGraph data={flameGraphData} />
        </div>

        {image.metadata?.length > 0 && (
          <div>
            <h3 className='text-lg text-primary-light-fill font-semibold mb-2 text-center pt-4'>
              Metadata:
            </h3>
            {image.metadata.map((meta: Metadata) => (
              <div className='metadata-wrapper'>
                <div className='metadata-container'>
                  <MetadataFormatter
                    key={meta.metadataId}
                    metadata={meta.metadata}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
