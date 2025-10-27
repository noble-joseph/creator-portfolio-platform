import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaDollarSign, FaCheck, FaTimes } from 'react-icons/fa';
import apiClient from '../utils/api';

const BookingSystem = ({ creator, isOwner = false }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    service: '',
    description: '',
    startDate: '',
    endDate: '',
    duration: 1,
    location: 'remote',
    address: '',
    requirements: [],
    deliverables: []
  });
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (creator?.monetization?.isBookable) {
      fetchBookings();
    }
  }, [creator]);

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get(`/api/booking/creator/${creator._id}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/api/booking', {
        creatorId: creator._id,
        ...bookingData,
        totalAmount: bookingData.duration * (creator.hourlyRate || 50)
      });

      if (response.ok) {
        alert('Booking request sent successfully!');
        setShowBookingForm(false);
        setBookingData({
          service: '',
          description: '',
          startDate: '',
          endDate: '',
          duration: 1,
          location: 'remote',
          address: '',
          requirements: [],
          deliverables: []
        });
        fetchBookings();
      } else {
        alert('Failed to send booking request');
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert('Failed to send booking request');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const response = await apiClient.post(`/api/booking/${bookingId}/${action}`);
      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error);
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed': return 'bg-green-500/20 text-green-400';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-purple-500/20 text-purple-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!creator?.monetization?.isBookable) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Book Me Button */}
      {!isOwner && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowBookingForm(true)}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/30 flex items-center justify-center space-x-2"
        >
          <FaCalendarAlt className="w-5 h-5" />
          <span>Book {creator.name}</span>
        </motion.button>
      )}

      {/* Booking Form Modal */}
      <AnimatePresence>
        {showBookingForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Book {creator.name}</h2>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Service Type
                  </label>
                  <input
                    type="text"
                    value={bookingData.service}
                    onChange={(e) => setBookingData(prev => ({ ...prev, service: e.target.value }))}
                    placeholder="e.g., Music Production, Photo Shoot"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Description
                  </label>
                  <textarea
                    value={bookingData.description}
                    onChange={(e) => setBookingData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project in detail..."
                    rows="4"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={bookingData.duration}
                      onChange={(e) => setBookingData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location Type
                  </label>
                  <select
                    value={bookingData.location}
                    onChange={(e) => setBookingData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="remote">Remote</option>
                    <option value="on-site">On-Site</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>

                {bookingData.location !== 'remote' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={bookingData.address}
                      onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter the address"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Pricing Summary */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Pricing Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Duration:</span>
                      <span>{bookingData.duration} hours</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Hourly Rate:</span>
                      <span>${creator.hourlyRate || 50}/hour</span>
                    </div>
                    <div className="flex justify-between text-white font-semibold text-lg border-t border-gray-600 pt-2">
                      <span>Total:</span>
                      <span>${bookingData.duration * (creator.hourlyRate || 50)}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Booking Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings Management (for owner) */}
      {isOwner && bookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4">Booking Requests</h3>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{booking.service}</h4>
                    <p className="text-gray-400 text-sm">from {booking.client?.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{booking.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaClock className="w-3 h-3" />
                      <span>{booking.duration}h</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaDollarSign className="w-3 h-3" />
                      <span>${booking.totalAmount}</span>
                    </span>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBookingAction(booking._id, 'confirm')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors flex items-center space-x-1"
                    >
                      <FaCheck className="w-3 h-3" />
                      <span>Confirm</span>
                    </button>
                    <button
                      onClick={() => handleBookingAction(booking._id, 'decline')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors flex items-center space-x-1"
                    >
                      <FaTimes className="w-3 h-3" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BookingSystem;
