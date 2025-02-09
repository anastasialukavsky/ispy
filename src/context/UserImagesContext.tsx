// import React, { createContext, useContext, useState, useMemo } from 'react';
// import {
//   getUserImagesWithResults,
//   ImageWithResults,
// } from '../graphql/service/imageService';

// interface UserImagesContextType {
//   imagesWithResults: ImageWithResults[];
//   fetchImagesWithResults: (userId: string) => Promise<void>;
//   loading?: boolean;
//   error?: string | null;
// }

// const UserImagesContext = createContext<UserImagesContextType | undefined>(
//   undefined
// );

// export const UserImagesProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [imagesWithResults, setImagesWithResults] = useState<
//     ImageWithResults[]
//   >([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchImagesWithResults = async (userId: string) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const data = await getUserImagesWithResults(userId);
//       setImagesWithResults(data);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const value = useMemo(
//   //   () => ({ imagesWithResults, fetchImagesWithResults}),
//   //   [imagesWithResults]
//   // );

//   return (
//     <UserImagesContext.Provider
//       value={{ imagesWithResults, fetchImagesWithResults }}
//     >
//       {children}
//     </UserImagesContext.Provider>
//   );
// };

// export const useUserImages = () => {
//   const context = useContext(UserImagesContext);
//   if (!context) {
//     throw new Error('useUserImages must be used within a UserImagesProvider');
//   }
//   return context;
// };
