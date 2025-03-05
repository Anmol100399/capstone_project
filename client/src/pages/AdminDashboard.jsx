import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:4000/admin/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await axios.post(`http://localhost:4000/event/${eventId}/approve`);
      fetchEvents(); // Refresh the list after approval
    } catch (error) {
      console.error("Failed to approve event:", error);
    }
  };

  const handleReject = async (eventId) => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejection.");
      return;
    }
    try {
      await axios.post(`http://localhost:4000/event/${eventId}/reject`, {
        rejectionReason,
      });
      setRejectionReason(""); // Clear the reason
      setSelectedEventId(null); // Close the modal
      fetchEvents(); // Refresh the list after rejection
    } catch (error) {
      console.error("Failed to reject event:", error);
    }
  };

  const handleViewDetails = (eventId) => {
    navigate(`/event/${eventId}`); // Navigate to the event details page
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Event Image */}
            {event.image ? (
              <img
                src={`http://localhost:4000/${event.image}`} // Ensure the correct path
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <img
                src="../src/assets/event.jpg" // Default image
                alt="Default Event"
                className="w-full h-50 object-cover"
              />
            )}

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {event.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {event.description}
              </p>

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
              <div className="flex justify-between">
                <button
                  onClick={() => handleApprove(event._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Approve
                </button>
                <button
                  onClick={() => setSelectedEventId(event._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleViewDetails(event._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rejection Reason Modal */}
      {selectedEventId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Rejection Reason</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              placeholder="Enter reason for rejection..."
            />
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEventId(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedEventId)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
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