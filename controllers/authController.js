const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");


// ================= REGISTER =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    res.status(201).json({ message: "User Registered Successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= LOGIN (PHONE BASED) =================
exports.loginUser = async (req, res) => {
  const phone = req.body.phone.trim();
  const password = req.body.password;

  const user = await User.findOne({ phone });

  if (!user)
    return res.status(400).json({ message: "enter correct phone number" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res.status(400).json({ message: "wrong password" });

  const token = generateToken(user._id, user.role);

  res.json({
    token,
    role: user.role
  });
};


