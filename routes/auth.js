const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secretKey = "secret";

//REGISTER

router.post("/register", async (req, res) => {
  try {
    //Generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //New user
    const newuser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      profilePicture: req.body.profilePicture,
      coverPicture: req.body.coverPicture,
      followers: req.body.followers,
      following: req.body.following,
    });
    console.log(newuser);
    //Save user and respond
    const user = await newuser.save();

    const token = jwt.sign({ userId: user._id }, secretKey);
    res.cookie("token", token);

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    if (req.cookies.token) {
      //   console.log(req.cookies.token);
      const decoded = jwt.verify(req.cookies.token, secretKey);
      const { userId } = decoded;
      const user = await User.findById(userId);
      if (user) return res.status(200).json(user);
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("user not found");
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user?.password
    );
    !validPassword && res.status(400).json("wrong password");

    const token = jwt.sign({ userId: user._id }, secretKey);
    res.cookie("token", token);
    // const salt = await bcrypt.genSalt(10);

    // const token = await bcrypt.hash(user, salt);

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json("Account not found");
  }
});

module.exports = router;
