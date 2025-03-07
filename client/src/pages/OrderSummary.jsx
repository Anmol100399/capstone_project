import axios from 'axios';
import { useEffect, useState } from 'react';
import { IoMdArrowBack } from "react-icons/io";
import { Link, useParams } from 'react-router-dom';

export default function OrderSummary() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1); // Default ticket quantity
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/event/${id}/ordersummary`)
      .then((response) => {
        setEvent(response.data);
      })
      .catch((error) => {
        console.error("Error fetching event:", error);
      });
  }, [id]);

  const handleCheckboxChange = (e) => {
    setIsCheckboxChecked(e.target.checked);
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setTicketQuantity(prevQuantity => prevQuantity + 1);
    } else if (type === 'decrease' && ticketQuantity > 1) {
      setTicketQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  const totalPrice = (event?.ticketPrice || 0) * ticketQuantity;

  if (!event) return '';

  return (
    <div className="max-w-7xl mx-auto px-6">
      <Link to={`/event/${event._id}`} className="mt-12 inline-flex items-center gap-2 p-3 text-blue-700 font-semibold bg-gray-100 rounded-md hover:bg-gray-200 transition">
        <IoMdArrowBack className="w-6 h-6" />
        <span className="text-lg">Back to Event</span>
      </Link>
      
      <div className="flex flex-col md:flex-row mt-8 gap-6">
        
        {/* Terms & Conditions Section */}
        <div className="p-6 bg-gray-100 w-full md:w-3/4 mb-12 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Terms & Conditions</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Refunds will be provided for ticket cancellations made up to 14 days before the event date. After this period, no refunds will be issued. Contact our customer support for a refund request.</li>
            <li>Tickets will be delivered to your email as e-tickets. Show the e-ticket or print it for entry.</li>
            <li>Each person can buy a maximum of 2 tickets to ensure fair distribution.</li>
            <li>In case of cancellation or postponement, attendees will be notified by email. Refunds will be processed for canceled events.</li>
            <li>Postponed events will not be refunded. Your ticket remains valid for the new event date.</li>
            <li>Your privacy matters. By using our app, you agree to our privacy policy.</li>
            <li>Before purchasing, review and accept our terms and conditions.</li>
          </ul>
        </div>

        {/* Booking Summary Section */}
        <div className="bg-blue-100 w-full md:w-1/4 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Booking Summary</h2>
          <div className="flex justify-between text-lg font-semibold mb-6">
            <span>{event.title}</span>
            <span>CAD {event.ticketPrice}$</span>
          </div>
          <hr className="border-gray-300 mb-4" />

          {/* Ticket Quantity Control */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm">Tickets </span>
            <div className="flex items-center gap-4">
              <button
                className={`px-2 py-0.25 text-white bg-blue-700 rounded-md ${ticketQuantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleQuantityChange('decrease')}
                disabled={ticketQuantity <= 1}
              >
                -
              </button>
              <span className="text-lg">{ticketQuantity}</span>
              <button
                className="px-2 py-0.25 text-white bg-blue-700 rounded-md"
                onClick={() => handleQuantityChange('increase')}
              >
                +
              </button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="flex justify-between font-semibold text-lg">
            <span>SUB TOTAL</span>
            <span>CAD {totalPrice}$</span>
          </div>
          
          {/* Checkbox and Proceed Button */}
          <div className="flex items-center mt-4 mb-5">
            <input
              className="h-5 w-5"
              type="checkbox"
              onChange={handleCheckboxChange}
            />
            <span className="text-sm ml-2">
              I have verified the event details and accept the terms & conditions.
            </span>
          </div>

          <Link
            to={`/event/${event._id}/ordersummary/paymentsummary?tickets=${ticketQuantity}`} // Pass ticketQuantity as query parameter
          >
            <button
              className={`w-full p-3 text-white rounded-md ${isCheckboxChecked ? 'bg-blue-700' : 'bg-gray-300'}`}
              disabled={!isCheckboxChecked}
            >
              Proceed to Payment
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}