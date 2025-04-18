import { Link } from "react-router-dom";
import { FaCalendarAlt, FaUser } from "react-icons/fa";

const EmployeePortal = () => {
  return (
    <div className="flex flex-col space-y-4">
      <Link to="/employee/leaves" className="text-gray-600 hover:text-blue-600">
        <div className="flex items-center space-x-2 p-4 hover:bg-gray-100 rounded-lg">
          <FaCalendarAlt className="text-xl" />
          <span>Leaves</span>
        </div>
      </Link>
      <Link
        to="/employee/profile"
        className="text-gray-600 hover:text-blue-600"
      >
        <div className="flex items-center space-x-2 p-4 hover:bg-gray-100 rounded-lg">
          <FaUser className="text-xl" />
          <span>Profile</span>
        </div>
      </Link>
    </div>
  );
};

export default EmployeePortal;
