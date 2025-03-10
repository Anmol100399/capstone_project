import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { UserContext } from '../UserContext';
import Qrcode from 'qrcode';

export default function PaymentSummary() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const ticketQuantity = Number(searchParams.get('tickets')) || 1; // Get ticketQuantity from query parameter
  const [event, setEvent] = useState(null);
  const { user } = useContext(UserContext);
  const [details, setDetails] = useState({
    name: '',
    email: '',
    contactNo: '',
  });
  const [ticketDetails, setTicketDetails] = useState({
    eventid: '',
    ticketDetails: {
      name: user ? user.name : '',
      email: user ? user.email : '',
      eventname: '',
      eventdate: '',
      eventtime: '',
      ticketprice: '',
      qr: '',
    },
  });
  const [payment, setPayment] = useState({
    nameOnCard: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState(''); // State to store error messages
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    axios
      .get(`/event/${id}`) // Correct endpoint
      .then((response) => {
        setEvent(response.data);
        setTicketDetails((prevTicketDetails) => ({
          ...prevTicketDetails,
          eventid: response.data._id,
          ticketDetails: {
            ...prevTicketDetails.ticketDetails,
            eventname: response.data.title,
            eventdate: response.data.eventDate.split("T")[0],
            eventtime: response.data.eventTime,
            ticketprice: response.data.ticketPrice,
          },
        }));
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setError("Event not found. Please check the event ID.");
        } else {
          setError("An error occurred while fetching event details.");
        }
        console.error("Error fetching event:", error);
      });
  }, [id]);

  useEffect(() => {
    setTicketDetails((prevTicketDetails) => ({
      ...prevTicketDetails,
      ticketDetails: {
        ...prevTicketDetails.ticketDetails,
        name: user ? user.name : '',
        email: user ? user.email : '',
      },
    }));
  }, [user]);

  const handleChangeDetails = (e) => {
    const { name, value } = e.target;
    setDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleChangePayment = (e) => {
    const { name, value } = e.target;
    setPayment((prevPayment) => ({
      ...prevPayment,
      [name]: value,
    }));
  };

  const validateFields = () => {
    if (!details.name || !details.email || !details.contactNo) {
      setError('Please fill out all your details.');
      return false;
    }
    if (!payment.nameOnCard || !payment.cardNumber || !payment.expiryDate || !payment.cvv) {
      setError('Please fill out all credit card details.');
      return false;
    }
    setError(''); // Clear any previous errors
    return true;
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!validateFields()) return; // Stop if validation fails

    try {
      // Loop through the number of tickets selected
      for (let i = 0; i < ticketQuantity; i++) {
        // Generate a unique QR code for each ticket
        const qrCode = await generateQRCode(
          ticketDetails.ticketDetails.eventname,
          `${ticketDetails.ticketDetails.name} - Ticket ${i + 1}` // Add a unique identifier for each ticket
        );

        // Update ticket details with the QR code
        const updatedTicketDetails = {
          ...ticketDetails,
          ticketDetails: {
            ...ticketDetails.ticketDetails,
            qr: qrCode,
          },
        };

        // Create the ticket
        await axios.post(`/tickets`, updatedTicketDetails);
      }

      alert(`${ticketQuantity} Tickets Created Successfully`);
      // Navigate to TicketPage with eventId and ticketQuantity
      navigate('/tickets', {
        state: { eventId: id, ticketQuantity },
      });
    } catch (error) {
      console.error('Error creating tickets:', error);
      alert("Generating Tickets Failed: Make sure you are logged in to get tickets");
    }
  };

  const generateQRCode = async (name, eventName) => {
    try {
      const qrCodeData = await Qrcode.toDataURL(
        `Event Name: ${name} \n Name: ${eventName}`
      );
      return qrCodeData;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  };

  if (error) {
    return <div className="text-center py-10 text-lg text-red-600">{error}</div>;
  }

  if (!event) {
    return <div className="text-center py-10 text-lg text-gray-600">Loading event details...</div>;
  }

  // Calculate total price
  const totalPrice = event.ticketPrice * ticketQuantity;

  // Format the event date correctly (fix for timezone issue)
  const formattedEventDate = new Date(event.eventDate).toLocaleDateString("en-US", {
    timeZone: 'UTC', // Ensure the date is treated as UTC
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div>
        <Link to={'/event/' + event._id + '/ordersummary'}>
          <button
            className="inline-flex mt-12 gap-2 p-3 ml-4 sm:ml-12 bg-gray-100 justify-center items-center text-blue-700 font-bold rounded-lg shadow-md hover:bg-blue-500 hover:text-white transition-all"
          >
            <IoMdArrowBack className="w-6 h-6" />
            <span className="text-sm sm:text-base">Back</span>
          </button>
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row mt-8 mx-4 sm:mx-12 space-y-8 lg:space-y-0 lg:space-x-20">
        {/* Left Section - Your Details and Payment Option */}
        <div className="w-full lg:w-3/5 space-y-8">
          {/* Your Details Section */}
          <div className="bg-gray-100 shadow-lg p-6 sm:p-8 rounded-md">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Your Details</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={details.name}
                onChange={handleChangeDetails}
                placeholder="Name"
                className="input-field w-full h-12 bg-gray-50 border border-gray-300 rounded-md p-3 text-sm sm:text-base"
              />
              <input
                type="email"
                name="email"
                value={details.email}
                onChange={handleChangeDetails}
                placeholder="Email"
                className="input-field w-full h-12 bg-gray-50 border border-gray-300 rounded-md p-3 text-sm sm:text-base"
              />
              <input
                type="tel"
                name="contactNo"
                value={details.contactNo}
                onChange={handleChangeDetails}
                placeholder="Contact No"
                className="input-field w-full h-12 bg-gray-50 border border-gray-300 rounded-md p-3 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Payment Option Section */}
          <div className="bg-gray-100 shadow-lg p-6 sm:p-8 rounded-md">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Payment Option</h2>
            <div className="space-y-4">
              <button
                type="button"
                className="px-8 py-3 text-black bg-blue-100 focus:outline border rounded-sm border-gray-300 w-full text-sm sm:text-base"
                disabled
              >
                Credit / Debit Card
              </button>
              <input
                type="text"
                name="nameOnCard"
                value={payment.nameOnCard}
                onChange={handleChangePayment}
                placeholder="Name on Card"
                className="input-field w-full h-12 bg-gray-50 border border-gray-300 rounded-md p-3 text-sm sm:text-base"
              />
              <input
                type="text"
                name="cardNumber"
                value={payment.cardNumber}
                onChange={handleChangePayment}
                placeholder="Card Number"
                className="input-field w-full h-12 bg-gray-50 border border-gray-300 rounded-md p-3 text-sm sm:text-base"
              />
              <div className="flex space-x-4">
                <input
                  type="text"
                  name="expiryDate"
                  value={payment.expiryDate}
                  onChange={handleChangePayment}
                  placeholder="Expiry Date (MM/YY)"
                  className="input-field w-2/3 h-12 bg-gray-50 border border-gray-300 rounded-md p-3 text-sm sm:text-base"
                />
                <input
                  type="text"
                  name="cvv"
                  value={payment.cvv}
                  onChange={handleChangePayment}
                  placeholder="CVV"
                  className="input-field w-1/3 h-12 bg-gray-50 border border-gray-300 rounded-md p-3 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div className="w-full lg:w-1/4 bg-blue-100 p-6 rounded-lg shadow-lg h-fit">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Order Summary</h2>
          
          {/* Event Details */}
          <div className="flex justify-between text-lg font-semibold mb-4">
            <span>{event.title}</span>
            <span className="text-blue-400">CAD {event.ticketPrice}$</span>
          </div>
          
          {/* Event Date and Time */}
          <div className="text-sm text-gray-600 mb-4">
            <p>{formattedEventDate}</p> {/* Use the correctly formatted date */}
            <p>{event.eventTime}</p>
          </div>
          
          <hr className="border-gray-300 mb-4" />

          {/* Ticket Quantity */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm">Tickets</span>
            <span className="text-sm font-semibold text-gray-800">{ticketQuantity}</span>
          </div>

          {/* Total Price */}
          <div className="flex justify-between font-semibold text-lg mb-6">
            <span>SUB TOTAL</span>
            <span className="text-blue-800">CAD {totalPrice}$</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Payment Button */}
          <button
            type="button"
            onClick={createTicket}
            className={`w-full p-3 text-white rounded-md ${
              !details.name || !details.email || !details.contactNo || 
              !payment.nameOnCard || !payment.cardNumber || !payment.expiryDate || !payment.cvv
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
            disabled={
              !details.name || !details.email || !details.contactNo || 
              !payment.nameOnCard || !payment.cardNumber || !payment.expiryDate || !payment.cvv
            }
          >
            Make Payment
          </button>
        </div>
      </div>
    </>
  );
}