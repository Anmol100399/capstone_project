import { useState } from "react";

export default function CreateEvent() {
  const [tableData1, setTableData1] = useState([]);
  const [tableData2, setTableData2] = useState([]);
  
  return (
    <div className="p-6 bg-white shadow-md rounded-md w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create Event</h2>
      <form>
        {/* First Name Field */}
        <div className="mb-4">
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter first name"
          />
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter password"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Submit
          </button>
          <button type="reset" className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
