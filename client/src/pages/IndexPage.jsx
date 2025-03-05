import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { BsArrowRightShort } from "react-icons/bs";
import { BiLike } from "react-icons/bi";
import { UserContext } from "../UserContext";

export default function IndexPage() {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);

  // Fetch approved events from the server
  useEffect(() => {
    axios
      .get("/events?status=Approved") // Fetch only approved events
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, []);

  // Like functionality
  const handleLike = (eventId) => {
    axios
      .post(`/event/${eventId}`)
      .then((response) => {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === eventId ? { ...event, likes: event.likes + 1 } : event
          )
        );
      })
      .catch((error) => {
        console.error("Error liking ", error);
      });
  };

  // Delete event functionality
  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`/events/${eventId}`);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
      alert("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Hero Image Carousel
  const heroImages = [
    "../src/assets/Image0.jpg",
    "../src/assets/Image1.jpeg",
    "../src/assets/Image2.jpeg",
    "../src/assets/Image3.jpeg",
  ];

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
          {/* Duplicate images for infinite scroll */}
          {heroImages.map((image, index) => (
            <img
              key={index + heroImages.length} // To ensure unique key for duplicated images
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
          {events.length > 0 ? (
            events.map((event) => {
              const eventDate = new Date(event.eventDate);
              const currentDate = new Date();

              // Check if the event date is in the future or today
              if (eventDate >= currentDate) {
                return (
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
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {event.title.toUpperCase()}
                      </h2>
                      <p className="text-gray-600 text-sm mb-4">
                        {event.description.length > 100
                          ? `${event.description.substring(0, 100)}...`
                          : event.description}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-gray-500">
                          {event.eventDate.split("T")[0]}, {event.eventTime}
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          {event.ticketPrice === 0
                            ? "Free"
                            : `CAD ${event.ticketPrice}$`}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-gray-500">
                          Organized By:{" "}
                          <span className="font-semibold">{event.organizedBy}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Created By:{" "}
                          <span className="font-semibold">{event.owner.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleLike(event._id)}
                          className="flex items-center text-gray-600 hover:text-red-600 transition-colors duration-200"
                        >
                          <BiLike className="w-5 h-5 mr-2" />
                          <span>{event.likes}</span>
                        </button>
                        <Link
                          to={`/event/${event._id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                        >
                          <span>Book Ticket</span>
                          <BsArrowRightShort className="w-5 h-5 ml-2" />
                        </Link>
                      </div>

                      {/* Delete Event Button (for admins or event owners) */}
                      {user && (user.role === "admin" || user._id === event.owner) && (
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 w-full"
                        >
                          Delete Event
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })
          ) : (
            <p className="text-gray-600">No events available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
