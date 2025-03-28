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
  const [payment, setPayment] = useState({
    nameOnCard: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/login', { 
        state: { 
          from: `/event/${id}/ordersummary/paymentsummary?tickets=${ticketQuantity}`,
          eventId: id // Pass event ID to login page
        } 
      });
    }
  }, [user, userLoading, navigate, id, ticketQuantity]);

  // Set user details when user is available
  useEffect(() => {
    if (user) {
      setDetails(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || '',
        contactNo: user.contactNo || prev.contactNo
      }));
    }
  }, [user]);

  // Fetch event data
  useEffect(() => {
    if (!id) {
      console.log("Event ID is missing but proceeding with ticket creation");
      return;
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/event/${id}`);
        if (!response.data) {
          throw new Error('Event not found');
        }
        setEvent(response.data);
        setError('');
      } catch (err) {
        console.error('Event fetch error:', err);
        // Continue even if event fetch fails
      } finally {
        setLoading(false);
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
    
    // Format card number with spaces every 4 digits
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (!/^\d*$/.test(value.replace(/\s/g, ''))) return;
      setPayment(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    // Format expiry date with slash
    if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{0,2})/, '$1/$2')
        .substring(0, 5);
      setPayment(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    // Basic validation for CVV (numbers only)
    if (name === 'cvv' && !/^\d*$/.test(value)) return;

    setPayment(prev => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    if (!details.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(details.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!details.contactNo.trim() || !/^\d{10,15}$/.test(details.contactNo)) {
      setError('Please enter a valid phone number (10-15 digits)');
      return false;
    }

    if (!payment.nameOnCard.trim()) {
      setError('Please enter the name on card');
      return false;
    }
    
    if (!/^\d{16}$/.test(payment.cardNumber.replace(/\s/g, ''))) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(payment.expiryDate)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (!/^\d{3,4}$/.test(payment.cvv)) {
      setError('Please enter a valid CVV (3-4 digits)');
      return false;
    }

    setError('');
    return true;
  };

  const generateQRCode = async (eventName, userName) => {
    try {
      return await Qrcode.toDataURL(`Event: ${eventName || 'Unknown Event'}\nAttendee: ${userName}\nDate: ${new Date().toLocaleDateString()}`);
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
      setLoading(true);
      const qrCode = await generateQRCode(event?.title, details.name);
      
      const ticketData = {
        userid: user._id,
        eventid: id || 'unknown-event',
        ticketDetails: {
          name: details.name,
          email: details.email,
          eventname: event?.title || 'Unknown Event',
          eventdate: event?.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          eventtime: event?.eventTime || '00:00',
          ticketprice: event?.ticketPrice || 0,
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
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return <div className="text-center py-10">Loading user information...</div>;
  }

  if (loading && !event) {
    return <div className="text-center py-10">Loading event details...</div>;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-10 text-red-600">
          <h2 className="text-xl font-bold mb-4">{error}</h2>
          <Link 
            to={id ? `/event/${id}` : '/'} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {id ? 'Back to Event' : 'Return to Homepage'}
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = ((event?.ticketPrice || 0) * ticketQuantity).toFixed(2);
  const eventDate = event?.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC' // Ensure correct date display
  }) : 'Date not specified';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link 
        to={id ? `/event/${id}/ordersummary` : '/'} 
        className="mt-11 mb-11 inline-flex items-center gap-2 p-3 text-blue-700 font-semibold bg-gray-100 rounded-md hover:bg-gray-200 transition"
      >
        <IoMdArrowBack className="w-6 h-6" />
        <span className="text-lg">Back</span>
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-gray-100 w-full md:w-full mb-12 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Your Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={details.name}
                  onChange={handleChangeDetails}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={details.email}
                  onChange={handleChangeDetails}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="contactNo"
                  value={details.contactNo}
                  onChange={handleChangeDetails}
                  placeholder="1234567890"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-100 w-full md:w-full mb-12 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded p-4 bg-gray-50">
                <div className="flex items-center">
                  <input type="radio" id="creditCard" name="paymentMethod" className="h-4 w-4 text-blue-600" checked readOnly />
                  <label htmlFor="creditCard" className="ml-2 block text-sm font-medium text-gray-700">Credit/Debit Card</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                <input
                  type="text"
                  name="nameOnCard"
                  value={payment.nameOnCard}
                  onChange={handleChangePayment}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={payment.cardNumber}
                  onChange={handleChangePayment}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={payment.expiryDate}
                    onChange={handleChangePayment}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={payment.cvv}
                    onChange={handleChangePayment}
                    placeholder="123"
                    maxLength={4}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-100 p-6 rounded-lg shadow-lg h-fit md:w-full sticky top-4">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          {event ? (
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-gray-600 mt-1">
                {eventDate} at {event.eventTime}
              </p>
              <p className="text-blue-600 font-semibold mt-2">
                CAD {event.ticketPrice.toFixed(2)} per ticket
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Event details not available</h3>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tickets:</span>
              <span className="font-medium">{ticketQuantity}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4">
              <span>Total:</span>
              <span>CAD {totalPrice}</span>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-4 p-2 bg-red-50 rounded">{error}</div>
          )}

          <button
            onClick={createTicket}
            disabled={
              loading ||
              !details.name ||
              !details.email ||
              !details.contactNo ||
              !payment.nameOnCard ||
              !payment.cardNumber ||
              !payment.expiryDate ||
              !payment.cvv
            }
            className={`w-full py-3 px-4 rounded-md mt-6 text-lg font-medium ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 
              (!details.name || !details.email || !details.contactNo || 
               !payment.nameOnCard || !payment.cardNumber || 
               !payment.expiryDate || !payment.cvv) ? 
                'bg-gray-300 cursor-not-allowed' : 
                'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}