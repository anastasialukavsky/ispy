import React from 'react'

type TamperingResultProps = {
  tamperingResult: string;
};
export const TamperingResult = ({ tamperingResult }: TamperingResultProps) => {
  return <p>{tamperingResult}</p>;
};
