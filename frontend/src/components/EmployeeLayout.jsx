import React from "react"; // eslint-disable-line no-unused-vars
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";

const EmployeeLayout = () => {
  return (
    <div className="d-flex">
      <EmployeeSidebar />
      <div className="content flex-grow-1 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeeLayout;
