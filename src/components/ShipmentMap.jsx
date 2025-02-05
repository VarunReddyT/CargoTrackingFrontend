import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const ShipmentMap = () => {
  const { shipmentId } = useParams();
  const [shipment, setShipment] = useState(null);
  const [route, setRoute] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentETA, setCurrentETA] = useState('');
  const [updatedLocation, setUpdatedLocation] = useState({ latitude: '', longitude: '', location: ''});
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  useEffect(() => {
    fetchShipmentDetails();
  }, [shipmentId]);

  const fetchShipmentDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/shipment/${shipmentId}`);
      setShipment(response.data);
      setRoute(response.data.route || []);
      setCurrentLocation(response.data.currentLocation || {});
      setCurrentETA(response.data.currentETA ? new Date(response.data.currentETA).toLocaleDateString() : 'N/A');
    } catch (error) {
      console.error('Error fetching shipment details', error);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      if (updatedLocation.latitude && updatedLocation.longitude && updatedLocation.location && currentETA) {
        await axios.post(`http://localhost:4000/shipment/${shipmentId}/update-location`, { currentLocation: updatedLocation, currentETA: currentETA });
        fetchShipmentDetails();
        setShowUpdateForm(false);
      } else {
        alert('Please fill in all fields.');
      }
    } catch (error) {
      console.error('Error updating location', error);
    }
  };

  const handleShowUpdateForm = () => setShowUpdateForm(true);

  const handleCloseForm = () => setShowUpdateForm(false);

  const validRoute = route.filter(point => point && point.latitude && point.longitude);

  const mapCenter = currentLocation && currentLocation.latitude && currentLocation.longitude
    ? [parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude)]
    : [51.505, -0.09];

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      {shipment ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Shipment Location - {shipment.shipmentId}</h2>
          <div className="flex items-center mb-4">
            <p className="mr-4">
              Current Location: {currentLocation ? `${currentLocation.location} (${currentLocation.latitude}, ${currentLocation.longitude})` : 'Loading...'}
            </p>
            <p className="mr-4">ETA: {currentETA}</p>
            <button onClick={handleShowUpdateForm} className="p-2 bg-yellow-500 text-white rounded">Update Location</button>
          </div>

          {!showUpdateForm ? (
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100vh', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {currentLocation && currentLocation.latitude && currentLocation.longitude && (
                <Marker position={[parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude)]}>
                  <Popup>
                    <span>Current Location: {`${currentLocation.latitude}, ${currentLocation.longitude}`}</span>
                  </Popup>
                </Marker>
              )}
              
              {validRoute.length > 0 && (
                <>
                  <Polyline positions={validRoute.map(point => [point.latitude, point.longitude])} color="blue" />
                  {validRoute.map((point, index) => (
                    <Marker key={index} position={[parseFloat(point.latitude), parseFloat(point.longitude)]}>
                      <Popup>
                        <span>{point.location || `Key Location ${index + 1}`}</span>
                      </Popup>
                    </Marker>
                  ))}
                </>
              )}
            </MapContainer>
          ) : (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96 z-60">
                <h2 className="text-xl font-bold mb-4">Update Location</h2>
                <form onSubmit={e => { e.preventDefault(); handleUpdateLocation(); }} className="space-y-3">
                  <label htmlFor="updatedLocationLat" className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    id="updatedLocationLat"
                    type="text"
                    value={updatedLocation.latitude}
                    onChange={e => setUpdatedLocation({ ...updatedLocation, latitude: e.target.value })}
                    required
                    className="p-2 border rounded w-full"
                    placeholder='Latitude'
                  />
                  <label htmlFor="updatedLocationLng" className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    id="updatedLocationLng"
                    type="text"
                    value={updatedLocation.longitude}
                    onChange={e => setUpdatedLocation({ ...updatedLocation, longitude: e.target.value })}
                    required
                    className="p-2 border rounded w-full"
                    placeholder='Longitude'
                  />
                  <label htmlFor="updatedLocationName" className="block text-sm font-medium text-gray-700">Location Name</label>
                  <input
                    id="updatedLocationName"
                    type="text"
                    value={updatedLocation.location}
                    onChange={e => setUpdatedLocation({ ...updatedLocation, location: e.target.value })}
                    required
                    className="p-2 border rounded w-full"
                    placeholder='Location Name'
                  />
                  <label htmlFor="updatedETA" className="block text-sm font-medium text-gray-700">ETA</label>
                  <input
                    id="updatedETA"
                    type="date"
                    value={updatedLocation.currentETA}
                    onChange={e => setCurrentETA(e.target.value)}
                    required
                    className="p-2 border rounded w-full"
                    placeholder='YYYY-MM-DD'
                  />
                  <div className="flex justify-between">
                    <button type="button" onClick={handleCloseForm} className="p-2 bg-red-500 text-white rounded">Cancel</button>
                    <button type="submit" className="p-2 bg-green-500 text-white rounded">Update</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Loading shipment data...</p>
      )}
    </div>
  );
};

export default ShipmentMap;
