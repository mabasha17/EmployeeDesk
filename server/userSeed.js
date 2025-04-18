import User from "./models/User.js";
import bcrypt from "bcrypt";

const userRegister = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "mabasha@gmail.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    const hashPassword = await bcrypt.hash("admin", 10);
    const newUser = new User({
      name: "Mabasha",
      email: "mabasha@gmail.com",
      password: hashPassword,
      role: "admin",
    });
    await newUser.save();
    console.log("Admin user seeded successfully");
  } catch (error) {
    console.log("Error seeding admin user:", error);
  }
};

export default userRegister;
