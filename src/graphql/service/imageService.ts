import axios from 'axios';
export type UUID = string;
export type DateTime = string;
export type OffsetDateTime = string;
export type JSON = any;

const GRAPHQL_API_URL = 'http://localhost:8080/graphql';

/**
 * Fetches all saved images and their associated algorithm results for a given user ID.
 * @param userId - UUID of the user
 * @returns A list of images with their results
 */


export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  userId: UUID;
  email?: string;
  passwordHash?: string;
  oAuthProvider?: string;
  oAuthId?: string;
  role: UserRole;
  createdAt: OffsetDateTime;
  updatedAt: OffsetDateTime;
}

export interface AuthSignUpInput {
  email: string;
  passwordHash: string;
  oAuthProvider: string;
  oAuthId: string;
  role?: UserRole;
}

export interface AuthSignInInput {
  email: string;
  passwordHash: string;
  oAuthProvider: string;
  oAuthId: string;
}

export interface AuthSignUpPayload {
  user: User;
  accessToken: string;
}

export interface ImageInput {
  userId: UUID;
  filePath: string;
}

export interface Image {
  imageId: string;
  userId: UUID;
  filePath: string;
  uploadedAt: DateTime;
}

export interface ElaResult {
  id?: string;
  imageId?: string;
  tamperingLikelihood?: number;
  detectedEla?: boolean;
}

export interface ElaInput {
  imageId: string;
  tamperingLikelihood: number;
  detectedEla: boolean;
}

export interface NoiseAnalysisResult {
  id: string;
  imageId: string;
  tamperingLikelihood: number;
  detectedNoise: boolean;
}

export interface NoiseAnalysisInput {
  imageId: string;
  tamperingLikelihood: number;
  detectedNoise: boolean;
}

export interface Metadata {
  metadataId: string;
  imageId: string;
  metadata: JSON;
}

export interface MetadataInput {
  imageId: string;
  metadata: JSON;
}

export interface HistoricalWeather {
  id: string;
  imageId: string;
  historicalWeather?: string;
}

export interface HistoricalWeatherInput {
  imageId: string;
  historicalWeather: string;
}

export interface DeepLearningWeather {
  id: string;
  imageId: string;
  deepLearningWeather: string;
}

export interface DeepLearningWeatherInput {
  imageId: string;
  deepLearningWeather: string;
}

export interface Geolocation {
  id: string;
  imageId: string;
  latitude: number;
  longitude: number;
}

export interface GeolocationInput {
  imageId: string;
  latitude: number;
  longitude: number;
}

export interface ImageGeolocation {
  id: string;
  imageId: string;
  latitude: number;
  longitude: number;
}

export interface ImageWithResults {
  image: Image;
  elaResults: ElaResult[];
  noiseAnalysisResults: NoiseAnalysisResult[];
  metadata: Metadata[];
  historicalWeather: HistoricalWeather[];
  deepLearningWeather: DeepLearningWeather[];
  geolocation: ImageGeolocation[];
}



export async function getUserImagesWithResults(userId: string) {
  const query = `
    query GetUserImagesWithResults($userId: UUID!) {
      getUserImagesWithResults(userId: $userId) {
        image {
          imageId
          userId
          filePath
          uploadedAt
        }
        elaResults {
          id
          tamperingLikelihood
          detectedEla
        }
        noiseAnalysisResults {
          id
          tamperingLikelihood
          detectedNoise
        }
        metadata {
          metadataId
          metadata
        }
        historicalWeather {
          id
          historicalWeather
        }
        deepLearningWeather {
          id
          deepLearningWeather
        }
        geolocation {
          id
          latitude
          longitude
        }
      }
    }
  `;

  const variables = { userId };

  try {
    const response = await axios.post(
      GRAPHQL_API_URL,
      {
        query,
        variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.getUserImagesWithResults;
  } catch (error) {
    console.error('Error fetching images with results:', error);
    throw error;
  }
}
