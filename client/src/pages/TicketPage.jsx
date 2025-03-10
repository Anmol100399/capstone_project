import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { RiDeleteBinLine } from "react-icons/ri";
import axios from "axios";

export default function TicketPage() {
  const [tickets, setTickets] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Get event ID and ticketQuantity from location state
  const eventId = location.state?.eventId;
  const ticketQuantity = location.state?.ticketQuantity || 1;

  // Redirect if eventId is missing
  useEffect(() => {
    if (!eventId) {
      alert("Event ID is missing. Redirecting to homepage.");
      navigate("/"); // Redirect to homepage or a fallback page
    }
  }, [eventId, navigate]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get("/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const deleteTicket = async (ticketId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this ticket?");
    if (!isConfirmed) return;

    try {
      await axios.delete(`/tickets/${ticketId}`);
      fetchTickets();
      alert("Ticket Deleted");
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  return (
    <div className="flex flex-col flex-grow p-4 sm:p-8 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="mb-6 sm:mb-8">
        {/* Pass event ID and ticketQuantity to PaymentSummary */}
        <Link
          to={{
            pathname: `/event/${eventId}/ordersummary/paymentsummary`,
            search: `?tickets=${ticketQuantity}`, // Pass ticketQuantity as a query parameter
          }}
        >
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base">
            <IoMdArrowBack className="w-5 h-5" />
            Back
          </button>
        </Link>
      </div>

      {/* Ticket List */}
      <div className="flex flex-col gap-4 sm:gap-6 items-center">
        {tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="relative w-full max-w-2xl bg-white shadow-lg rounded-lg overflow-hidden flex flex-col sm:flex-row border border-gray-300"
          >
            {/* Left Section: QR Code */}
            <div className="w-full sm:w-1/3 bg-gray-200 flex items-center justify-center p-4">
              <img
                src={ticket.ticketDetails.qr}
                alt="QR Code"
                className="w-32 h-32 sm:w-full sm:h-auto object-contain"
              />
            </div>

            {/* Right Section: Ticket Details */}
            <div className="w-full sm:w-2/3 p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {ticket.ticketDetails.eventname.toUpperCase()}
                </h2>
                <p className="text-sm sm:text-lg text-gray-600 mt-2">
                  {new Date(ticket.ticketDetails.eventdate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
                <p className="text-sm sm:text-lg text-gray-600">
                  {ticket.ticketDetails.eventtime}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between mt-4 gap-2 sm:gap-0">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Name:</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-800">
                    {ticket.ticketDetails.name.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Price:</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-800">
                    CAD {ticket.ticketDetails.ticketprice}$
                  </p>
                </div>
              </div>

              <button
                onClick={() => deleteTicket(ticket._id)}
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all w-full text-sm sm:text-base"
              >
                <RiDeleteBinLine className="w-4 h-4 sm:w-5 sm:h-5" />
                Delete Ticket
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Tickets Message */}
      {tickets.length === 0 && (
        <div className="text-center text-gray-500 mt-8 text-sm sm:text-base">
          No tickets found. Create a new ticket to see it here!
        </div>
      )}
    </div>
  );
}