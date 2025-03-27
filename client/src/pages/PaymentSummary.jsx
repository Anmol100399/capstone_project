import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { UserContext } from '../UserContext';
import Qrcode from 'qrcode';

export default function PaymentSummary() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const ticketQuantity = Number(searchParams.get('tickets')) || 1;
  const [event, setEvent] = useState(null);
  const { user, loading: userLoading } = useContext(UserContext);
  const [details, setDetails] = useState({
    name: '',
    email: '',
    contactNo: '',
  });
  const [ticketDetails, setTicketDetails] = useState({
    userid: '',
    eventid: '',
    ticketDetails: {
      name: '',
      email: '',
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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/login', { state: { from: `/event/${id}/ordersummary/paymentsummary` } });
    }
  }, [user, userLoading, navigate, id]);

  // Set user details when user is available
  useEffect(() => {
    if (user) {
      setDetails({
        name: user.username || '',
        email: user.email || '',
        contactNo: '',
      });
      setTicketDetails(prev => ({
        ...prev,
        userid: user._id,
        ticketDetails: {
          ...prev.ticketDetails,
          name: user.username || '',
          email: user.email || '',
        }
      }));
    }
  }, [user]);

  // Fetch event data
  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/event/${id}`);
        if (!response.data) {
          throw new Error('Event not found');
        }
        setEvent(response.data);
        setTicketDetails(prev => ({
          ...prev,
          eventid: response.data._id,
          ticketDetails: {
            ...prev.ticketDetails,
            eventname: response.data.title,
            eventdate: new Date(response.data.eventDate).toISOString().split('T')[0],
            eventtime: response.data.eventTime,
            ticketprice: response.data.ticketPrice,
          }
        }));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load event details');
        console.error('Event fetch error:', err);
      }
    };

    fetchEvent();
  }, [id]);

  const handleChangeDetails = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePayment = (e) => {
    const { name, value } = e.target;
    setPayment(prev => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    if (!details.name || !details.email || !details.contactNo) {
      setError('Please fill out all your details');
      return false;
    }
    if (!payment.nameOnCard || !payment.cardNumber || !payment.expiryDate || !payment.cvv) {
      setError('Please fill out all payment details');
      return false;
    }
    setError('');
    return true;
  };

  const generateQRCode = async (eventName, userName) => {
    try {
      return await Qrcode.toDataURL(`Event: ${eventName}\nAttendee: ${userName}\nDate: ${new Date().toLocaleDateString()}`);
    } catch (err) {
      console.error('QR generation error:', err);
      return '';
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    if (!user) {
      setError('Please login to purchase tickets');
      return;
    }

    try {
      const qrCode = await generateQRCode(ticketDetails.ticketDetails.eventname, details.name);
      
      const ticketData = {
        userid: user._id,
        eventid: id,
        ticketDetails: {
          ...ticketDetails.ticketDetails,
          name: details.name,
          email: details.email,
          qr: qrCode,
        },
        count: ticketQuantity
      };

      const response = await axios.post('/tickets', ticketData, {
        withCredentials: true
      });

      if (response.data) {
        alert(`Successfully purchased ${ticketQuantity} ticket(s)!`);
        navigate('/tickets');
      }
    } catch (err) {
      console.error('Ticket creation error:', err);
      setError(err.response?.data?.error || 'Failed to create ticket. Please try again.');
    }
  };

  if (userLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  if (!event) {
    return <div className="text-center py-10">Loading event details...</div>;
  }

  const totalPrice = (event.ticketPrice * ticketQuantity).toFixed(2);
  const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to={`/event/${id}/ordersummary`} className="inline-flex items-center gap-2 mb-8">
        <IoMdArrowBack className="w-5 h-5" />
        <span>Back to Order Summary</span>
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Your Details</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={details.name}
                onChange={handleChangeDetails}
                placeholder="Full Name"
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="email"
                name="email"
                value={details.email}
                onChange={handleChangeDetails}
                placeholder="Email"
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="tel"
                name="contactNo"
                value={details.contactNo}
                onChange={handleChangeDetails}
                placeholder="Phone Number"
                className="w-full p-3 border rounded"
                required
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-4">
              <div className="border rounded p-4 bg-gray-50">
                Credit/Debit Card
              </div>
              <input
                type="text"
                name="nameOnCard"
                value={payment.nameOnCard}
                onChange={handleChangePayment}
                placeholder="Name on Card"
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="text"
                name="cardNumber"
                value={payment.cardNumber}
                onChange={handleChangePayment}
                placeholder="Card Number"
                className="w-full p-3 border rounded"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="expiryDate"
                  value={payment.expiryDate}
                  onChange={handleChangePayment}
                  placeholder="MM/YY"
                  className="w-full p-3 border rounded"
                  required
                />
                <input
                  type="text"
                  name="cvv"
                  value={payment.cvv}
                  onChange={handleChangePayment}
                  placeholder="CVV"
                  className="w-full p-3 border rounded"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="mb-4">
            <h3 className="font-semibold">{event.title}</h3>
            <p className="text-gray-600 text-sm mt-1">
              {eventDate} at {event.eventTime}
            </p>
            <p className="text-blue-600 font-semibold mt-2">
              CAD {event.ticketPrice.toFixed(2)}
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Tickets:</span>
              <span>{ticketQuantity}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total:</span>
              <span>CAD {totalPrice}</span>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-4">{error}</div>
          )}

          <button
            onClick={createTicket}
            disabled={
              !details.name ||
              !details.email ||
              !details.contactNo ||
              !payment.nameOnCard ||
              !payment.cardNumber ||
              !payment.expiryDate ||
              !payment.cvv
            }
            className="w-full bg-blue-600 text-white py-3 rounded mt-6 disabled:bg-gray-300"
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
}