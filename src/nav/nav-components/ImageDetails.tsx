import { useLocation, useNavigate } from 'react-router-dom';
import ResultCard from './ResultCard';
import { ImageWithResults } from '../../graphql/service/imageService';

const ImageDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    image: ImageWithResults;
    presignedUrl: string;
  };

  if (!state) {
    return <p>No data available</p>;
  }

  const { image, presignedUrl } = state;

  return (
    <ResultCard
      image={image}
      presignedUrl={presignedUrl}
      onClose={() => navigate('/account')} 
    />
  );
};

export default ImageDetails;
