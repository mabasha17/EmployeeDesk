import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchAttendance, deleteAttendance } from "../utils/api";
import { FaTrash, FaSearch } from "react-icons/fa";

const AdminAttendance = () => {
  const { token } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const data = await fetchAttendance(token);
        setAttendance(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load attendance records");
        setLoading(false);
      }
    };

    loadAttendance();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await deleteAttendance(id, token);
      setAttendance(attendance.filter((record) => record._id !== id));
    } catch (err) {
      setError("Failed to delete attendance record");
    }
  };

  const filteredAttendance = attendance.filter(
    (record) =>
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.date.includes(searchTerm)
  );

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Attendance Records</h1>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or date..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left">Employee</th>
              <th className="px-6 py-3 border-b text-left">Date</th>
              <th className="px-6 py-3 border-b text-left">Check In</th>
              <th className="px-6 py-3 border-b text-left">Check Out</th>
              <th className="px-6 py-3 border-b text-left">Status</th>
              <th className="px-6 py-3 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map((record) => (
              <tr key={record._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">{record.employeeName}</td>
                <td className="px-6 py-4 border-b">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 border-b">{record.checkIn}</td>
                <td className="px-6 py-4 border-b">{record.checkOut || "-"}</td>
                <td className="px-6 py-4 border-b">
                  <span
                    className={`px-2 py-1 rounded ${
                      record.status === "Present"
                        ? "bg-green-100 text-green-800"
                        : record.status === "Absent"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 border-b">
                  <button
                    onClick={() => handleDelete(record._id)}
                    className="text-red-500 hover:text-red-700 mr-2"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendance;
