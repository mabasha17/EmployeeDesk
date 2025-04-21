import Leave from "../models/Leave.js";

// Get all leave requests
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email")
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    console.error("Error getting all leaves:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get leave requests by employee
export const getEmployeeLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate("employee", "name email")
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    console.error("Error getting employee leaves:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create leave request
export const createLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason, type } = req.body;

    // Access _id consistently across the application
    const userId = req.user._id;

    console.log("Creating leave request:", {
      userId,
      startDate,
      endDate,
      reason,
      type,
      user: req.user, // Log full user object for debugging
    });

    // Validate leave type to match enum values in model
    const validTypes = ["sick", "vacation", "personal", "annual", "other"];
    const leaveType = validTypes.includes(type) ? type : "other";

    // Create leave object
    const leave = new Leave({
      employee: userId, // Consistently using _id
      startDate,
      endDate,
      reason,
      type: leaveType,
      status: "pending",
    });

    // Save the leave request
    const savedLeave = await leave.save();
    console.log("Leave saved successfully:", savedLeave);

    res.status(201).json(savedLeave);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.status(500).json({
      error: "Failed to create leave request",
      message: error.message,
    });
  }
};

// Update leave status
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("employee", "name email");
    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }
    res.json(leave);
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete leave request
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" });
    }
    res.status(200).json({ message: "Leave request deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete leave request" });
  }
};

export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id).populate("employee", "name email");
    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }
    res.json(leave);
  } catch (error) {
    console.error("Error getting leave by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get recent leave requests
export const getRecentLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email")
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(leaves);
  } catch (error) {
    console.error("Error getting recent leaves:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
