import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { RiDeleteBinLine } from "react-icons/ri";
import axios from "axios";

export default function TicketPage() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

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
    <div className="max-w-full mx-auto px-6">
      <div className="mt-12">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 p-3 text-blue-700 font-semibold bg-gray-100 rounded-md hover:bg-gray-200 transition"
        >
          <IoMdArrowBack className="w-6 h-6" />
          <span className="text-lg">Back</span>
        </button>
      </div>

      <div className="mt-8 space-y-6 flex flex-wrap justify-center">
        {tickets.length === 0 ? (
          <div className="text-center py-10 text-gray-600 w-full">
            No tickets found. Create a new ticket to see it here!
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="relative flex w-[800px] bg-white shadow-lg border border-gray-300 rounded-lg overflow-hidden"
            >
              <div className="w-2/3 p-6 flex flex-col justify-between">
                <h2 className="text-2xl font-bold text-gray-800">{ticket.ticketDetails.eventname.toUpperCase()}</h2>
                <div className="mt-2 text-gray-600">
                  <p>
                    {new Date(ticket.ticketDetails.eventdate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC"
                    })}
                  </p>
                  <p>{ticket.ticketDetails.eventtime}</p>
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold">{ticket.ticketDetails.name.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-semibold">CAD {ticket.ticketDetails.ticketprice}$</p>
                  </div>
                </div>
              </div>
              
              <div className="w-1/3 flex flex-col items-center justify-center bg-gray-100 p-4 border-l border-dashed">
                <img src={ticket.ticketDetails.qr} alt="QR Code" className="w-24 h-24" />
                <button
                  onClick={() => deleteTicket(ticket._id)}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
                >
                  <RiDeleteBinLine className="w-5 h-5" />
                  Delete Ticket
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
