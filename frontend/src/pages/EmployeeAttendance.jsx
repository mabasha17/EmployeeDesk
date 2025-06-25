import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { fetchEmployeeAttendance, createAttendance } from "../utils/api";

const EmployeeAttendance = () => {
  const { token } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [date] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const data = await fetchEmployeeAttendance(token);
        setAttendance(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load attendance records");
        setLoading(false);
      }
    };

    loadAttendance();
  }, [token]);

  const handleCheckIn = async () => {
    try {
      const currentTime = new Date().toTimeString().split(" ")[0];
      setCheckInTime(currentTime);
      await createAttendance({ date, checkIn: currentTime }, token);
      const updatedData = await fetchEmployeeAttendance(token);
      setAttendance(updatedData);
    } catch (err) {
      setError("Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    try {
      const currentTime = new Date().toTimeString().split(" ")[0];
      setCheckOutTime(currentTime);
      // Update the latest attendance record with check-out time
      const latestRecord = attendance[0];
      if (latestRecord && !latestRecord.checkOut) {
        await createAttendance(
          { ...latestRecord, checkOut: currentTime },
          token
        );
        const updatedData = await fetchEmployeeAttendance(token);
        setAttendance(updatedData);
      }
    } catch (err) {
      setError("Failed to check out");
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Attendance</h1>

      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleCheckIn}
            disabled={checkInTime}
            className={`px-4 py-2 rounded ${
              checkInTime
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!checkInTime || checkOutTime}
            className={`px-4 py-2 rounded ${
              !checkInTime || checkOutTime
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            Check Out
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {checkInTime && <p>Checked in at: {checkInTime}</p>}
          {checkOutTime && <p>Checked out at: {checkOutTime}</p>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left">Date</th>
              <th className="px-6 py-3 border-b text-left">Check In</th>
              <th className="px-6 py-3 border-b text-left">Check Out</th>
              <th className="px-6 py-3 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record._id} className="hover:bg-gray-50">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
