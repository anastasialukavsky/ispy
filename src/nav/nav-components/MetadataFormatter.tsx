import React from 'react';

interface MetadataFormatterProps {
  metadata: Record<string, any>;
}

const MetadataFormatter: React.FC<MetadataFormatterProps> = ({ metadata }) => {
  // Helper to format values nicely (handle arrays and objects)
  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    } else if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2); 
    }
    return value?.toString() ?? 'N/A'; 
  };

  return (
      <table className='metadata-table'>
        <thead>
          <tr>
            <th className='metadata-key'>Property</th>
            <th className='metadata-key'>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(metadata).map(([key, value], index) => (
            <tr key={index}>
              <td className='metadata-key'>{key}</td>
              <td className='metadata-value'>{formatValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
  );
};

export default MetadataFormatter;
