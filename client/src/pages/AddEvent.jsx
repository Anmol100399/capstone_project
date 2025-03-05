import { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function AddEvent() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate(); // Initialize useNavigate
  const [formData, setFormData] = useState({
    owner: user ? user.name : '',
    title: '',
    optional: '',
    description: '',
    organizedBy: '',
    eventDate: '',
    eventTime: '',
    location: '',
    ticketPrice: 0,
    image: '',
    likes: 0,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prevState) => ({ ...prevState, image: file }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prevState) => ({ ...prevState, [name]: files[0] }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    axios
      .post('/createEvent', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => {
        console.log('Event posted successfully:', response.data);
        navigate('/'); // Redirect to IndexPage after successful submission
      })
      .catch((error) => {
        console.error('Error posting event:', error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden flex">
        {/* Left Section - Form */}
        <div className="w-1/2 p-10">
          <h1 className="font-bold text-4xl mb-8 text-gray-800 text-center">Create an Event</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {[
              { label: 'Title', name: 'title', type: 'text' },
              { label: 'Optional', name: 'optional', type: 'text' },
              { label: 'Organized By', name: 'organizedBy', type: 'text' },
              { label: 'Event Date', name: 'eventDate', type: 'date' },
              { label: 'Event Time', name: 'eventTime', type: 'time' },
              { label: 'Location', name: 'location', type: 'text' },
              { label: 'Ticket Price', name: 'ticketPrice', type: 'number' },
            ].map(({ label, name, type }) => (
              <label key={name} className="flex flex-col text-gray-700 font-medium">
                {label}:
                <input
                  type={type}
                  name={name}
                  className="rounded-lg mt-2 p-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                  value={formData[name]}
                  onChange={handleChange}
                />
              </label>
            ))}

            <label className="flex flex-col text-gray-700 font-medium">
              Description:
              <textarea
                name="description"
                className="rounded-lg mt-2 p-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200 h-32 resize-none"
                value={formData.description}
                onChange={handleChange}
              />
            </label>

            <label className="flex flex-col text-gray-700 font-medium">
              Image:
              <input
                type="file"
                name="image"
                className="rounded-lg mt-2 p-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                onChange={handleImageUpload}
              />
            </label>

            <button
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 mt-6"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Right Section - Preview */}
        <div className="w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-10">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Your Event Preview</h2>
            <div className="mt-8">
              <div className="bg-white bg-opacity-20 rounded-lg p-6">
                <h3 className="text-2xl font-semibold mb-4">Event Details</h3>
                <p className="text-lg">Title: {formData.title}</p>
                <p className="text-lg">Date: {formData.eventDate}</p>
                <p className="text-lg">Location: {formData.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}