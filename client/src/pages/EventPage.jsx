import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AiFillCalendar } from "react-icons/ai";
import { MdLocationPin } from "react-icons/md";
import { FaCopy, FaWhatsappSquare, FaFacebook } from "react-icons/fa";

export default function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/event/${id}`)
      .then((response) => {
        setEvent(response.data);
      })
      .catch((error) => {
        console.error("Error fetching event:", error);
      });
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const handleWhatsAppShare = () => {
    window.open(`whatsapp://send?text=${encodeURIComponent(window.location.href)}`);
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
  };

  if (!event) return <div className="text-center py-10 text-lg text-gray-600">Loading event details...</div>;

  return (
    <div className="flex flex-col sm:flex-row mx-auto max-w-5xl p-4 sm:p-6 md:p-10 bg-white shadow-lg rounded-xl mt-6 sm:mt-10">
      {/* Main Content */}
      <div className="w-full">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition self-start"
        >
          ← Back
        </button>

        {/* Event Image */}
        {event.image && (
          <img
            src={`https://memorable-moments.onrender.com/${event.image}`}
            alt={event.title}
            className="w-full rounded-lg object-cover h-48 sm:h-64 md:h-80 shadow-md mb-6"
          />
        )}

        {/* Event Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">{event.title}</h1>

        {/* Ticket Price */}
        <p className="text-lg sm:text-xl text-gray-700 text-center mb-4">
          {event.ticketPrice === 0 ? "Free" : `CAD ${event.ticketPrice}$`}
        </p>

        {/* Event Description */}
        <p className="text-sm sm:text-md text-gray-600 text-center mb-4">{event.description}</p>

        {/* Organized By */}
        <p className="text-sm sm:text-md text-gray-800 font-semibold text-center mb-6">Organized by: {event.organizedBy}</p>

        {/* Date, Time, and Location */}
        <div className="flex flex-col sm:flex-row justify-between bg-gray-100 p-4 sm:p-6 rounded-lg shadow-sm mb-6 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <AiFillCalendar className="text-blue-600 h-5 w-5 sm:h-6 sm:w-6" />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-md">Date & Time</h3>
              <p className="text-gray-700 text-sm sm:text-md">{event.eventDate.split("T")[0]} at {event.eventTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MdLocationPin className="text-red-600 h-5 w-5 sm:h-6 sm:w-6" />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-md">Location</h3>
              <p className="text-gray-700 text-sm sm:text-md">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Book Ticket Button (Visible on all screens) */}
        <Link to={`/event/${event._id}/ordersummary`} className="block w-full">
          <button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 sm:py-3 rounded-lg text-md sm:text-lg font-semibold hover:opacity-90 transition">
            Book Ticket
          </button>
        </Link>

        {/* Share Buttons */}
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 text-center mb-4">Share this Event</h3>
          <div className="flex justify-center gap-4 sm:gap-6">
            <button onClick={handleCopyLink} className="bg-gray-200 p-2 sm:p-3 rounded-lg hover:bg-gray-300 transition">
              <FaCopy className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
            </button>
            <button onClick={handleWhatsAppShare} className="bg-green-500 p-2 sm:p-3 rounded-lg hover:bg-green-600 transition">
              <FaWhatsappSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>
            <button onClick={handleFacebookShare} className="bg-blue-600 p-2 sm:p-3 rounded-lg hover:bg-blue-700 transition">
              <FaFacebook className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Event Preview Section (Hidden on Phone Screens) */}
      <div className="hidden sm:block sm:w-1/3 lg:w-1/4 ml-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Event Preview</h3>
        <p className="text-sm text-gray-700">
          This is a preview of the event details. It will only be visible on tablet and desktop screens.
        </p>
      </div>
    </div>
  );
}
