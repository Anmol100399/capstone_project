import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token retrieved:", token); // Debugging: Log the token

      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get("/admin/events", {
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

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Events</h2>

      {loading && <p className="text-gray-600">Loading events...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && events.length === 0 && !error && (
        <p className="text-gray-600">No events found.</p>
      )}

      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{event.description}</p>

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
                    onClick={() => handleReject(event._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}