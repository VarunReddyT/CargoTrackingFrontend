import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shipmentId: '',
    containerId: '',
    latitude: '',
    longitude: '',
    location: '',
    currentETA: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await axios.get("http://localhost:4000/shipments");
      setShipments(response.data);
    } catch (error) {
      console.error('Error fetching shipments', error);
    }
  };

  const handleNavigation = (shipment) => {
    console.log(shipment);
    navigate(`/shipment-location/${shipment.shipmentId}`);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSort = (field) => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
    setShipments([...shipments].sort((a, b) => (
      newSortOrder === 'asc' ? a[field] > b[field] : a[field] < b[field]
    ) ? 1 : -1));
  };

  const filteredShipments = shipments.filter(shipment =>
    shipment.shipmentId.toLowerCase().includes(filter.toLowerCase())
  );

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newCurrentLocation = {
      latitude: formData.latitude,
      longitude: formData.longitude,
      location: formData.location
    };

    const dataToSubmit = {
      ...formData,
      currentLocation: newCurrentLocation,
    };

    try {
      await axios.post("http://localhost:4000/shipment", dataToSubmit);
      fetchShipments();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding shipment', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-2xl font-bold mb-4">Cargo Shipment Dashboard</h2>
        <button onClick={() => setShowForm(true)} className="p-2 bg-blue-500 text-white rounded">Add Shipment</button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <input type="text" placeholder="Filter by Container ID..." onChange={handleFilterChange} className="p-2 border rounded w-full sm:w-1/2 lg:w-1/3" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('shipmentId')}>Shipment ID</th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('containerId')}>Container ID</th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('currentLocation')}>Current Location</th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('currentETA')}>ETA</th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('status')}>Status</th>
              <th className="border p-2 cursor-pointer">Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredShipments.map(shipment => (
              <tr key={shipment._id} className="border text-center">
                <td className="border p-2">{shipment.shipmentId}</td>
                <td className="border p-2">{shipment.containerId}</td>
                <td className="border p-2">{shipment.currentLocation.location}</td>
                <td className="border p-2">{new Date(shipment.currentETA).toLocaleDateString()}</td>
                <td className="border p-2">{shipment.status}</td>
                <td className="border p-2">
                  <button className="p-2 bg-blue-500 text-white rounded" onClick={() => { handleNavigation(shipment) }}>Check/Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-screen overflow-auto">
            <h2 className="text-xl font-bold mb-4">Add Shipment</h2>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="shipmentId" className="block text-sm font-medium text-gray-700">Shipment ID</label>
                  <input name="shipmentId" placeholder="Shipment ID" required onChange={handleFormChange} className="p-2 border rounded w-full" />
                </div>
                <div className="flex-1">
                  <label htmlFor="containerId" className="block text-sm font-medium text-gray-700">Container ID</label>
                  <input name="containerId" placeholder="Container ID" required onChange={handleFormChange} className="p-2 border rounded w-full" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input name="latitude" type="text" required onChange={handleFormChange} className="p-2 border rounded w-full" />
                </div>
                <div className="flex-1">
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input name="longitude" type="text" required onChange={handleFormChange} className="p-2 border rounded w-full" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                  <input name="location" placeholder="Current Location" required onChange={handleFormChange} className="p-2 border rounded w-full" />
                </div>
                <div className="flex-1">
                  <label htmlFor="currentETA" className="block text-sm font-medium text-gray-700">ETA</label>
                  <input name="currentETA" type="date" required onChange={handleFormChange} className="p-2 border rounded w-full" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" onChange={handleFormChange} className="p-2 border rounded w-full">
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button onClick={() => setShowForm(false)} className="p-2 bg-red-500 text-white rounded">Cancel</button>
                <button type="submit" className="p-2 bg-green-500 text-white rounded">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default Dashboard;
