import Salary from "../models/Salary.js";

export const getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().populate("employee", "name email");
    res.json(salaries);
  } catch (error) {
    console.error("Error getting all salaries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createSalary = async (req, res) => {
  try {
    const { employee, basicSalary, allowances, deductions } = req.body;
    const salary = new Salary({
      employee,
      basicSalary,
      allowances,
      deductions,
    });
    await salary.save();
    // Fetch the saved salary with populated employee data
    const savedSalary = await Salary.findById(salary._id).populate(
      "employee",
      "name email"
    );
    res.status(201).json(savedSalary);
  } catch (error) {
    console.error("Error creating salary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { basicSalary, allowances, deductions } = req.body;

    const updatedSalary = await Salary.findByIdAndUpdate(
      id,
      { basicSalary, allowances, deductions },
      { new: true }
    ).populate("employee", "name email");

    if (!updatedSalary) {
      return res.status(404).json({ error: "Salary not found" });
    }

    res.json(updatedSalary);
  } catch (error) {
    console.error("Error updating salary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSalaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await Salary.findById(id).populate("employee", "name email");
    if (!salary) {
      return res.status(404).json({ error: "Salary not found" });
    }
    res.json(salary);
  } catch (error) {
    console.error("Error getting salary by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEmployeeSalary = async (req, res) => {
  try {
    const salary = await Salary.findOne({ employee: req.user.userId })
      .populate("employee", "name email")
      .sort({ createdAt: -1 });
    if (!salary) {
      return res.status(404).json({ error: "Salary not found" });
    }
    res.json(salary);
  } catch (error) {
    console.error("Error getting employee salary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEmployeeSalaryHistory = async (req, res) => {
  try {
    const salaries = await Salary.find({ employee: req.user.userId })
      .populate("employee", "name email")
      .sort({ createdAt: -1 });
    res.json(salaries);
  } catch (error) {
    console.error("Error getting employee salary history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSalary = await Salary.findByIdAndDelete(id).populate(
      "employee",
      "name email"
    );

    if (!deletedSalary) {
      return res.status(404).json({ error: "Salary not found" });
    }

    res.json(deletedSalary);
  } catch (error) {
    console.error("Error deleting salary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
