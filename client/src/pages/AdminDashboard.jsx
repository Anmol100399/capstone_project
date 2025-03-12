import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // For showing event details
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false); // For rejection reason popup
  const [eventToReject, setEventToReject] = useState(null); // Event ID for rejection

  // Fetch events from the server
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token retrieved:", token); // Debugging: Log the token

      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get("https://memorable-moments.onrender.com/admin/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Events fetched:", response.data); // Debugging: Log the events
      setEvents(response.data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setError("Failed to fetch events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle event approval
  const handleApprove = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://memorable-moments.onrender.com/event/${eventId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error("Failed to approve event:", error);
    }
  };

  // Handle event rejection
  const handleReject = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://memorable-moments.onrender.com/event/${eventToReject}/reject`,
        { rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRejectionReason(""); // Clear the rejection reason input
      setShowRejectionModal(false); // Close the rejection modal
      alert("Rejection reason has been sent to the user's email."); // Show success alert
      fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error("Failed to reject event:", error);
    }
  };

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Events</h2>

      {loading && <p className="text-gray-600">Loading events...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && events.length === 0 && !error && (
        <p className="text-gray-600">No events found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Event Image */}
            {event.image ? (
              <img
                src={`https://memorable-moments.onrender.com/${event.image}`}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <img
                src="/assets/event.jpg"
                alt="Default Event"
                className="w-full h-48 object-cover"
              />
            )}

            {/* Event Details */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{event.description}</p>

              {/* Event Status */}
              <div className="text-sm text-gray-500 mb-4">
                <strong>Status:</strong>{" "}
                <span
                  className={`font-semibold ${
                    event.status === "Approved"
                      ? "text-green-600"
                      : event.status === "Rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {event.status}
                </span>
              </div>

              {/* Buttons: Approve, Reject, Details */}
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => handleApprove(event._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setEventToReject(event._id);
                    setShowRejectionModal(true);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h2>
            <p className="text-gray-600 text-sm mb-4">{selectedEvent.description}</p>
            <button
              onClick={() => setSelectedEvent(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Enter Rejection Reason</h2>
            <textarea
              placeholder="Enter rejection reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows="3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}