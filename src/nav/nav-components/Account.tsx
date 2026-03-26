import  { useEffect, useState } from 'react';
import { Button } from '../../UI';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  getUserImagesWithResults,
  ImageWithResults,
} from '../../graphql/service/imageService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const GRAPHQL_API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/graphql';
  const API_BASE_URL = GRAPHQL_API_URL.replace('/graphql', '');

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
  const navigate = useNavigate();

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

  const fetchPresignedGetUrl = async (filePath: string): Promise<string> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/generate-presigned-get-url?fileName=${encodeURIComponent(
          filePath
        )}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching presigned GET URL:', error);
      return '/placeholder-image.png';
    }
  };

  useEffect(() => {
    const fetchAllGetUrls = async () => {
      const urls: Record<string, string> = {};
      for (const { image } of imagesWithResults) {
        const url = await fetchPresignedGetUrl(image.filePath);
        urls[image.imageId] = url;
      }
      setPresignedUrls(urls);
    };

    if (imagesWithResults.length > 0) {
      fetchAllGetUrls();
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
    <div className='h-[100vh]'>
      <Button
        className='logout-button'
        onClick={() => {
          logout();
          toast.success('Logged out successfully!', { autoClose: 3000 });
          navigate('/');
        }}
      >
        logout
      </Button>
      <section className='account-section '>
        <div className='flex flex-col'>
          <h1 className='text-primary-light-fill text-3xl text-center pb-10'>
            Recently uploaded
          </h1>
          <div className='account-container'>
            <div className='image-grid'>
              {imagesWithResults.map((imageData) => (
                <div key={imageData.image.imageId} className='image-wrapper'>
                  <img
                    src={
                      presignedUrls[imageData.image.imageId] ||
                      '/placeholder-image.png'
                    }
                    className='image-grid-item'
                    alt='Uploaded'
                    onClick={() =>
                      navigate(`/image/${imageData.image.imageId}`, {
                        state: {
                          image: imageData,
                          presignedUrl: presignedUrls[imageData.image.imageId],
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
