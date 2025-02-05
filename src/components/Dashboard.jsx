import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    shipmentId: '',
    containerId: '',
    currentLocation: '',
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
    try {
      await axios.post("http://localhost:4000/shipment", formData);
      fetchShipments();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding shipment', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Shipment Dashboard</h2>
      <div className="flex items-center gap-4 mb-4">
        <input type="text" placeholder="Filter by Container ID..." onChange={handleFilterChange} className="p-2 border rounded w-full" />
        <button onClick={() => setShowForm(true)} className="p-2 bg-blue-500 text-white rounded">Add Shipment</button>
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
            </tr>
          </thead>
          <tbody>
            {filteredShipments.map(shipment => (
              <tr key={shipment._id} className="border text-center">
                <td className="border p-2">{shipment.shipmentId}</td>
                <td className="border p-2">{shipment.containerId}</td>
                <td className="border p-2">{shipment.currentLocation}</td>
                <td className="border p-2">{new Date(shipment.currentETA).toLocaleDateString()}</td>
                <td className="border p-2">{shipment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Shipment</h2>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <label htmlFor="shipmentId" className="block text-sm font-medium text-gray-700">Shipment ID</label>
              <input name="shipmentId" placeholder="Shipment ID" required onChange={handleFormChange} className="p-2 border rounded w-full" />

              <label htmlFor="containerId" className="block text-sm font-medium text-gray-700">Container ID</label>
              <input name="containerId" placeholder="Container ID" required onChange={handleFormChange} className="p-2 border rounded w-full" />

              <label htmlFor="currentLocation" className="block text-sm font-medium text-gray-700">Current Location</label>
              <input name="currentLocation" placeholder="Current Location" required onChange={handleFormChange} className="p-2 border rounded w-full" />

              <label htmlFor="currentETA" className="block text-sm font-medium text-gray-700">ETA</label>
              <input name="currentETA" type="date" required onChange={handleFormChange} className="p-2 border rounded w-full" />

              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" onChange={handleFormChange} className="p-2 border rounded w-full">
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Delayed">Delayed</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="flex justify-between">
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