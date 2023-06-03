const { sendVerificationEmail } = require("../helpers/mailer");
const { generateToken } = require("../helpers/tokens");
const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
      password,
    } = req.body;

    // validations
    if (!validateEmail(email))
      return res.status(400).json({ message: "invalid email" });
    if (!validateLength(first_name, 2, 30))
      return res.status(400).json({ message: "first name must be between 2 and 30 characters" });
    if (!validateLength(last_name, 2, 30))
      return res.status(400).json({ message: "last name must be between 2 and 30 characters" });
    if (!validateLength(password, 6, 40))
      return res.status(400).json({ message: "password must be between 6 and 40 characters" });

    const emailExist = await User.findOne({ email });
    if (emailExist)
      return res.status(400).json({ message: "This email address already exists!" });

    const hashedPassword = await bcrypt.hash(password, 12);

    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);

    const user = await new User({
      first_name,
      last_name,
      email,
      username: newUsername,
      bYear,
      bMonth,
      bDay,
      gender,
      password: hashedPassword,
    }).save();

    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );

    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;

    // sendVerificationEmail(user.email, user.first_name, url);
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Register success, please activate your email to continue.",
    });
  } catch (error) {
    console.log(
      error,
      "is the error that occured in the register function in the user file which is in the controller folder"
    );
    res.status(500).json({ message: error.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const check = await User.findById(user.id);
    if (check.verified === true) return res.status(400).json({ message: "this email is already activated!" });
    else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res.status(200).json({message: "Your Crystalfb account has been activated successfuly" });
    }
  } catch (error) {
    console.log(error,'is the error that occured in the activateAccount function in the user file controllers folder.')
    return res.status(500).json({message: 'Internal server error!'})
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({message: 'The email that you have entered is not connected to an acccount!'})
    console.log(user,'is the user')
    const passwordCheck = await bcrypt.compare(password, user.password)
    if(!passwordCheck) return res.status(400).json({message: "Incorrect password"})
    return res.status(200).res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Register success, please activate your email to continue.",
    });
  } catch (err) {
    console.log(err,'is the error occured in the login function in the user controllers')
    return res.status(500).json('Internal server error!')
  }
};
