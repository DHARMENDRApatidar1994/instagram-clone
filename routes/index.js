var express = require('express');
var router = express.Router();
const upload = require("../helpers/multer").single("avatar");
const fs = require("fs");

const User = require("../models/userModel")

const nodemailer = require("nodemailer");



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/signup", function (req, res, next) {
  res.render("signup")
})


router.post("/signup", async function (req, res, next) {
  const user = await User.findOne({ name: req.body.name });
  if (user) return res.send("user already exists.");
  User.create(req.body)
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      res.send(err)
    });
  // res.json(req.body);
});

/* GET profile page. */
router.get('/homepage/:id', async function (req, res, next) {
  const user = await User.findOne(req.body.photo, req.body.name);
  res.render('homepage', { title: 'Instagram', user });
});


router.post('/login', async function (req, res, next) {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.send("user not found.");
    const matchPassword = user.password === req.body.password;
    if (!matchPassword) return res.send("wrong credientials");
    // user.password = undefined;
    // Uber.create(req.body)
    // res.json(user);
    res.redirect("/homepage");
  } catch (error) {
    res.send(err);
  }

  // res.json(req.body);
});

/* GET forgetpassword page. */
router.get('/forgetpassword', function (req, res, next) {
  res.render('forget', { title: "forget password" });
});

// post send-mail page.
router.post("/send-link", async function (req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.send("User not found");

  const mailurl = `${req.protocol}://${req.get("host")}/forgetpassword/${user._id
    }`;



  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "patidardharmendra1994@gmail.com",
      pass: "oudxrxuapedmllud",
    },
  });

  const mailOptions = {
    from: "Temp Mail Pvt. Ltd.<dharmendra.temp@gmail.com>",
    to: req.body.email,
    subject: "Password Reset Link",
    text: "Do not share this link to anyone.",
    html:
      `<h1>Hi patidardharmendra1994,</h1>
  <p>Sorry to hear you’re having trouble logging into Instagram. We got a message that you forgot your password.<br> If this was you, you can get right back into your account or reset your password now.</p>
  <a href=${mailurl}><button>Reset Your Password </button></a>`,
  };

  transport.sendMail(mailOptions, (err, info) => {
    if (err) return res.send(err);
    console.log(info);
    return res.send(
      "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1> <br> <a href='/signin'>Signin</a>"
    );
  });
});


/* GET forgetpassword page. */
router.get('/forgetpassword/:id', async function (req, res, next) {
  res.render("getpassword", { title: "Forget Password", id: req.params.id });
});

/*POST forgetpassword page. */
router.post('/forgetpassword/:id', async function (req, res, next) {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/",);
});

router.get('/profile/:id', async function (req, res, next) {
  const user = await User.findOne(req.body.username, req.body.name);
  res.render('profile', { title: 'Instagram', user });
});

// post upload page
router.post("/upload/:userID", async function (req, res, next) {
  upload(req, res, async function (err) {
    if (err) {
      console.log("ERROR>>>>>>", err.massage)
      res.send(err.massage)
    }
    var currentUser = await User.findOne({ _id: req.params.userID })
    if (req.file) {
      if (currentUser.avatar !== 'default.png')
        fs.unlinkSync("./public/images/" + currentUser.avatar);
      currentUser.avatar = req.file.filename;
      await currentUser.save()
        .then(() => {
          res.redirect(`/profile/${req.params.userID}`);
        })
        .catch((err) => {
          res.send(err);
        });
    }
  });
});

/* GET update page. */
router.get('/update', async function (req, res, next) {
  const user = await User.findOne(req.body)
  res.render('update', { user });
});

// post update/:id page
router.post("/createupdate", async function (req, res, next) {
  console.log(req.body)
  const user = await User.findOneAndUpdate({
    name: req.body.name, username: req.body.username,
    number: req.body.number, gender: req.body.gender
  });
  await user.save()
  res.redirect("/profile/" + user._id);
});

/* GET reset page. */
router.get("/resetpassword/:id", async function (req, res, next) {
  const user = await User.findOne(req.body)
  res.render("reset", { id: req.params.id, user });
});

// post reset password page
router.post("/reset/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    const matchPassword = user.password === req.body.password;
    if (!matchPassword) return res.send("wrong credientials");
    // console.log(user,req.body)
    const usr = await User.findByIdAndUpdate(req.params.id, { password: req.body.newpassword });
    await usr.save()
    res.redirect("/");
  } catch (error) {
    res.send(error)
  }
});

/* GET signout page. */
router.get('/signout', function (req, res, next) {
  res.redirect('/');
});

/* GET delete account page. */
router.get("/deleteaccount/:id", async function (req, res, next) {
  const user = await User.findOneAndDelete(req.params.id)
  res.redirect("/");
});

module.exports = router;
