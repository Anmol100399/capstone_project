import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { BsArrowRightShort } from "react-icons/bs";
import { BiLike } from "react-icons/bi";
import { UserContext } from "../UserContext";

export default function IndexPage() {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch approved events from the server
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get("/events?status=Approved");
        
        // Safely process events with guaranteed owner data
        const processedEvents = data.map(event => {
          // Ensure owner object exists and has username
          const ownerName = event.owner?.username 
            ? event.owner.username.toUpperCase() 
            : 'ORGANIZER';
            
          return {
            ...event,
            safeOwner: {
              id: event.owner?._id || null,
              username: ownerName
            },
            isUpcoming: new Date(event.eventDate) >= new Date()
          };
        });
        
        setEvents(processedEvents);
      } catch (err) {
        console.error("Event fetch error:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Like functionality
  const handleLike = async (eventId) => {
    try {
      const { data } = await axios.post(`/event/${eventId}/like`);
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId ? { ...event, likes: data.likes } : event
        )
      );
    } catch (error) {
      console.error("Error liking event:", error);
    }
  };

  // Delete event functionality
  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`/events/${eventId}`);
      setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
      alert("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Hero Image Carousel
  const heroImages = [
    "/assets/Image0.jpg",
    "/assets/Image1.jpeg",
    "/assets/Image2.jpeg",
    "/assets/Image3.jpeg",
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-0 m-0">
      {/* Hero Image Carousel */}
      <div className="w-screen h-screen overflow-hidden relative">
        <div className="carousel-container w-full h-full flex absolute top-0 left-0 animate-scroll">
          {heroImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.filter(event => event.isUpcoming).length > 0 ? (
            events.filter(event => event.isUpcoming).map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
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

                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {event.title?.toUpperCase() || 'EVENT'}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {event.description?.substring(0, 100) || 'No description available'}
                    {event.description?.length > 100 ? '...' : ''}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">
                      {event.eventDate?.split("T")[0] || 'Date not set'}, {event.eventTime || 'Time not set'}
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      {event.ticketPrice === 0 ? (
                        <span className="text-green-600 font-bold">Free</span>
                      ) : (
                        <span className="text-blue-600 font-bold">
                          CAD {event.ticketPrice?.toFixed(2) || '0.00'}$
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">
                      Organized By: <span className="font-semibold">{event.organizedBy || 'Unknown'}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Created By: <span className="font-semibold">{event.safeOwner.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleLike(event._id)}
                      className="flex items-center text-gray-600 hover:text-red-600 transition-colors duration-200"
                    >
                      <BiLike className="w-5 h-5 mr-2" />
                      <span>{event.likes || 0}</span>
                    </button>
                    <Link
                      to={`/event/${event._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                    >
                      <span>Book Ticket</span>
                      <BsArrowRightShort className="w-5 h-5 ml-2" />
                    </Link>
                  </div>

                  {user && (user.role === "admin" || user._id === event.safeOwner.id) && (
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 w-full"
                    >
                      Delete Event
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 col-span-full text-center">No upcoming events available.</p>
          )}
        </div>
      </div>
    </div>
  );
}