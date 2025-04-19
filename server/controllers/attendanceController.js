import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

// Get all attendance records
export const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    console.error("Error getting attendance records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get attendance reports
export const getAttendanceReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const reports = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance reports" });
  }
};

// Create bulk attendance records
export const createBulkAttendance = async (req, res) => {
  try {
    const { date, employeeIds } = req.body;
    const attendanceRecords = await Promise.all(
      employeeIds.map(async (employeeId) => {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
          throw new Error(`Employee with ID ${employeeId} not found`);
        }
        return new Attendance({
          employeeId,
          employeeName: employee.name,
          date: new Date(date),
          status: "absent",
        });
      })
    );
    await Attendance.insertMany(attendanceRecords);
    res.status(201).json(attendanceRecords);
  } catch (error) {
    res.status(400).json({ error: "Failed to create bulk attendance records" });
  }
};

// Get attendance by employee
export const getEmployeeAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.userId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const attendance = await Attendance.find({
      employeeId: employee.employeeId,
    }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    console.error("Error getting employee attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get employee attendance history
export const getEmployeeAttendanceHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const history = await Attendance.find({
      employeeId: req.user.employeeId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ date: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance history" });
  }
};

// Check in an employee
export const checkIn = async (req, res) => {
  try {
    const { employeeId, date } = req.body;
    const checkInTime = new Date();

    const attendance = await Attendance.findOneAndUpdate(
      {
        employeeId,
        date: { $gte: new Date(date).setHours(0, 0, 0, 0) },
      },
      {
        checkIn: checkInTime,
        status: checkInTime.getHours() > 9 ? "late" : "present",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    res.status(200).json(attendance);
  } catch (error) {
    res.status(400).json({ error: "Failed to check in" });
  }
};

// Check out an employee
export const checkOut = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        checkOut: new Date(),
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    res.status(200).json(attendance);
  } catch (error) {
    res.status(400).json({ error: "Failed to check out" });
  }
};

// Update attendance status
export const updateAttendanceStatus = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    res.status(200).json(attendance);
  } catch (error) {
    res.status(400).json({ error: "Failed to update attendance status" });
  }
};

// Create attendance record
export const createAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.userId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const { date, checkIn, checkOut, status, notes } = req.body;
    const attendance = new Attendance({
      employeeId: employee.employeeId,
      employeeName: employee.name,
      date,
      checkIn,
      checkOut,
      status,
      notes,
    });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    console.error("Error creating attendance record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update attendance record
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, status, notes } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { checkIn, checkOut, status, notes, updatedAt: Date.now() },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    res.json(attendance);
  } catch (error) {
    console.error("Error updating attendance record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete attendance record
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
