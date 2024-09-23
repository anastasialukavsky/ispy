import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

interface GeolocationProps {
 geolocation: {
    latitude: number;
    longitude: number;
} | null
  metadata: any;
}

const GeolocationDisplay = ({ geolocation, metadata }: GeolocationProps) => {
  if (!geolocation) {
    return <p className='text-white text-6xl'>No geolocation data available.</p>;
  }

  const { latitude, longitude } = geolocation;

  return (
    <div className='geolocation-display'>
      <h3>Geolocation Information</h3>
      <div className='map-container' style={{ height: '500px', width: '500px' }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[latitude, longitude]}>
            <Popup>
              Image was taken here: [{latitude}, {longitude}]
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default GeolocationDisplay;
