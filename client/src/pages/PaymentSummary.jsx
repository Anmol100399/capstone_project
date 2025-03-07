import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/event/${id}/ordersummary/paymentsummary`)
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
        console.error("Error fetching events:", error);
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

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      const qrCode = await generateQRCode(
        ticketDetails.ticketDetails.eventname,
        ticketDetails.ticketDetails.name
      );
      const updatedTicketDetails = {
        ...ticketDetails,
        ticketDetails: {
          ...ticketDetails.ticketDetails,
          qr: qrCode,
        },
      };

      const response = await axios.post(`/tickets`, updatedTicketDetails);
      alert("Ticket Created");
      setRedirect(true);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert("Generating Ticket Failed: Make sure you Login to get a ticket");
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

  useEffect(() => {
    if (redirect) {
      navigate('/tickets');
    }
  }, [redirect, navigate]);

  if (!event) return '';

  // Calculate total price
  const totalPrice = event.ticketPrice * ticketQuantity;

  return (
    <>
      <div>
        <Link to={'/event/' + event._id + '/ordersummary'}>
          <button
            className="inline-flex mt-12 gap-2 p-3 ml-12 bg-gray-100 justify-center items-center text-blue-700 font-bold rounded-lg shadow-md hover:bg-blue-500 hover:text-white transition-all"
          >
            <IoMdArrowBack className="w-6 h-6" />
            Back
          </button>
        </Link>
      </div>
      <div className="flex mt-8 ml-12 space-x-20">
        {/* Left Section - Your Details and Payment Option */}
        <div className="w-3/5 space-y-8">
          {/* Your Details Section */}
          <div className="bg-gray-100 shadow-lg p-8 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">Your Details</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={details.name}
                onChange={handleChangeDetails}
                placeholder="Name"
                className="input-field w-full h-12 bg-gray-50 border border-gray-300 rounded-md p-3"
              />
              <input
                type="email"
                name="email"
                value={details.email}
                onChange={handleChangeDetails}
                placeholder="Email"
                className="input-field w-full h-12 bg-gray-50 border border-gray-300 rounded-md p-3"
              />
              <input
                type="tel"
                name="contactNo"
                value={details.contactNo}
                onChange={handleChangeDetails}
                placeholder="Contact No"
                className="input-field w-full h-12 bg-gray-50 border border-gray-300 rounded-md p-3"
              />
            </div>
          </div>

          {/* Payment Option Section */}
          <div className="bg-gray-100 shadow-lg p-8 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">Payment Option</h2>
            <div className="space-y-4">
              <button
                type="button"
                className="px-8 py-3 text-black bg-blue-100 focus:outline border rounded-sm border-gray-300 w-full"
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
                className="input-field w-full h-12 bg-gray-50 border border-gray-300 rounded-md p-3"
              />
              <input
                type="text"
                name="cardNumber"
                value={payment.cardNumber}
                onChange={handleChangePayment}
                placeholder="Card Number"
                className="input-field w-full h-12 bg-gray-50 border border-gray-300 rounded-md p-3"
              />
              <div className="flex space-x-4">
                <input
                  type="text"
                  name="expiryDate"
                  value={payment.expiryDate}
                  onChange={handleChangePayment}
                  placeholder="Expiry Date (MM/YY)"
                  className="input-field w-2/3 h-12 bg-gray-50 border border-gray-300 rounded-md p-3"
                />
                <input
                  type="text"
                  name="cvv"
                  value={payment.cvv}
                  onChange={handleChangePayment}
                  placeholder="CVV"
                  className="input-field w-1/3 h-12 bg-gray-50 border border-gray-300 rounded-md p-3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div className="bg-white shadow-lg p-8 rounded-md w-1/4 h-fit">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Order Summary</h2>
          <div className="space-y-4">
            {/* Event Details */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">{event.title}</span>
              <span className="text-lg font-semibold text-blue-600">CAD {event.ticketPrice}$</span>
            </div>
            <p className="text-sm text-gray-500">
              {event.eventDate.split("T")[0]}, {event.eventTime}
            </p>
            <hr className="my-4 border-t border-gray-200" />

            {/* Ticket Quantity */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tickets</span>
              <span className="text-sm font-semibold text-gray-800">{ticketQuantity}</span>
            </div>

            {/* Total Price */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Total</span>
              <span className="text-xl font-bold text-blue-600">CAD {totalPrice}$</span>
            </div>
          </div>

          {/* Payment Button */}
          <button
            type="button"
            onClick={createTicket}
            className="w-full mt-8 p-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all"
          >
            Make Payment
          </button>
        </div>
      </div>
    </>
  );
}