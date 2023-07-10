const { login, register } = require("../Controllers/auth");
const { Router } = require("express");
const { auth } = require("../middlewares/auth");
const router = Router();
const session = require("../Session/session");
const nodemailer = require("nodemailer");
const multer = require("multer");
const ImageModel = require("../Models/images");
const UserModel = require("../Models/user");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname + "/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

router.post("/signup", register);
router.post("/signin", login);

router.get("/", (req, res) => {
  res.render("home", {
    name: session.name.substring(0, session.name.indexOf(" "))
      ? session.name.substring(0, session.name.indexOf(" "))
      : session.name,
    isLoggedIn: session.isLoggedIn,
    email: session.email,
    username: session.username,
  });
});

router.get("/about", (req, res) => {
  res.render("about", {
    name: session.name.substring(0, session.name.indexOf(" "))
      ? session.name.substring(0, session.name.indexOf(" "))
      : session.name,
    isLoggedIn: session.isLoggedIn,
    email: session.email,
    username: session.username,
  });
});

router.get("/test", (req, res) => {
  res.render("test", {
    name: session.name.substring(0, session.name.indexOf(" "))
      ? session.name.substring(0, session.name.indexOf(" "))
      : session.name,
    isLoggedIn: session.isLoggedIn,
    email: session.email,
    username: session.username,
  });
});

router.get("/login", (req, res) => {
  if (session.isLoggedIn) {
    return;
  } else {
    res.render("login");
  }
});

router.get("/logout", (req, res) => {
  session.isLoggedIn = false;
  console.log(session.isLoggedIn);
  res.clearCookie("accessToken");
  res.redirect("/");
});

router.get("/faq", (req, res) => {
  res.render("faq", {
    name: session.name.substring(0, session.name.indexOf(" "))
      ? session.name.substring(0, session.name.indexOf(" "))
      : session.name,
    isLoggedIn: session.isLoggedIn,
    email: session.email,
    username: session.username,
  });
});

router.get("/contact", (req, res) => {
  res.render("contact", {
    name: session.name.substring(0, session.name.indexOf(" "))
      ? session.name.substring(0, session.name.indexOf(" "))
      : session.name,
    isLoggedIn: session.isLoggedIn,
    email: session.email,
    username: session.username,
  });
});

router.use("/", auth);

router.post("/sendMail", (req, res) => {
  const { name, email, message } = req.body;
  console.log(name, email, message);
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vaibhav.pandey0806@gmail.com",
      pass: "farimahhzsrpxeff",
    },
  });

  let mailOptions = {
    from: "vaibhav.pandey0806@gmail.com",
    to: email,
    subject: "Query Received | Wandrlust",
    text: `Hi, ${name}!\nWe have recieved your query and we'll be working on it and replying to you very soon!\n\nQuery: ${message}\nFrom: ${email}\n\n\nRegards,\nWandrlust Team`,
  };
  transporter.sendMail(mailOptions, (err, success) => {
    if (err) {
      console.log("Mail not sent.", err);
    } else {
      console.log(
        "Success, email has been sent, and your account has been verified!!",
        success
      );
    }
  });
  res.redirect("/contact");
});

router.post("/uploadPhoto", upload.single("myImage"), (req, res) => {
  const obj = {
    img: {
      data: fs.readFileSync(
        path.join(__dirname + "/uploads/" + req.file.filename)
      ),
      contentType: "image/*",
    },
  };
  const newImage = new ImageModel({
    image: obj.img,
    caption: req.body.caption,
    description: req.body.description,
    author: session._id,
  });
  newImage.save((err) => {
    err ? console.log(err) : res.redirect("/feed");
  });
});

router.get("/locations", (req, res) => {
  if (session.isLoggedIn) {
    res.render("location", {
      name: session.name.substring(0, session.name.indexOf(" "))
        ? session.name.substring(0, session.name.indexOf(" "))
        : session.name,
      isLoggedIn: session.isLoggedIn,
      email: session.email,
      username: session.username,
    });
  } else {
    res.redirect("/");
  }
});

router.get("/post", (req, res) => {
  ImageModel.find({ author: session._id }, (err, images) => {
    if (err) {
      console.log(err);
      res.status(500).send({ message: `An error occurred ${err}` });
    } else {
      images = images.reverse();
      if (session.isLoggedIn) {
        res.render("post", {
          images: images,
          name: session.name.substring(0, session.name.indexOf(" "))
            ? session.name.substring(0, session.name.indexOf(" "))
            : session.name,
          isLoggedIn: session.isLoggedIn,
          email: session.email,
          username: session.username,
          age: session.age,
        });
      } else {
        res.redirect("/");
      }
    }
  });
});

router.get("/profile", (req, res) => {
  ImageModel.find({ author: session._id }, (err, images) => {
    if (err) {
      console.log(err);
      res.status(500).send({ message: `An error occurred ${err}` });
    } else {
      images = images.reverse();
      if (session.isLoggedIn) {
        res.render("profile", {
          images: images,
          name: session.name,
          isLoggedIn: session.isLoggedIn,
          email: session.email,
          username: session.username,
          phonenumber: session.phonenumber,
          age: session.age,
          id: session._id,
          followers: session.followers,
          following: session.following,
        });
      } else {
        res.redirect("/");
      }
    }
  });
});

router.get("/feed", (req, res) => {
  ImageModel.find({}, (err, images) => {
    if (err) {
      console.log(err);
      res.status(500).send({ message: `An error occurred ${err}` });
    } else {
      images = images.reverse();
      UserModel.find({}, (err, users) => {
        if (err) {
          console.log(err);
        } else {
          if (session.isLoggedIn) {
            res.render("feed", {
              images: images,
              users: users,
              name: session.name.substring(0, session.name.indexOf(" "))
                ? session.name.substring(0, session.name.indexOf(" "))
                : session.name,
              isLoggedIn: session.isLoggedIn,
              email: session.email,
              username: session.username,
              _id: session._id,
            });
          } else {
            res.redirect("/");
          }
        }
      });
    }
  }).populate("author");
});

router.put("/like", (req, res) => {
  ImageModel.findByIdAndUpdate(
    req.body.imageId,
    {
      $push: { likes: session._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});

router.get("/todo", (req, res) => {
  res.render("todo", {
    name: session.name.substring(0, session.name.indexOf(" "))
      ? session.name.substring(0, session.name.indexOf(" "))
      : session.name,
    isLoggedIn: session.isLoggedIn,
    email: session.email,
    username: session.username,
  });
});

router.delete("/deletePost", async (req, res) => {
  const deleted = await ImageModel.findByIdAndRemove(req.body.imageId);
});

router.put("/dislike", (req, res) => {
  ImageModel.findByIdAndUpdate(
    req.body.imageId,
    {
      $pull: { likes: session._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});

router.put("/follow", async (req, res) => {
  await UserModel.findByIdAndUpdate(
    req.body.followingId,
    {
      $push: { followers: session._id },
    },
    {
      new: true,
    }
  );

  await UserModel.findByIdAndUpdate(
    session._id,
    {
      $push: { following: req.body.followingId },
    },
    {
      new: true,
    }
  );
});

router.put("/unfollow", async (req, res) => {
  await UserModel.findByIdAndUpdate(req.body.followingId, {
    $pull: { followers: session._id },
  });

  await UserModel.findByIdAndUpdate(session._id, {
    $pull: {
      following: req.body.followingId,
    },
  });
});

router.get("/budget", (req, res) => {
  if (session.isLoggedIn) {
    res.render("budget", {
      name: session.name.substring(0, session.name.indexOf(" "))
        ? session.name.substring(0, session.name.indexOf(" "))
        : session.name,
      isLoggedIn: session.isLoggedIn,
      email: session.email,
      username: session.username,
    });
  } else {
    res.redirect("/");
  }
});

router.post("/editprofile", async (req, res) => {
  console.log(req.body);
  const updated = await UserModel.findByIdAndUpdate(req.body.id, {
    $set: {
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phonenumber,
    },
  });
  console.log(updated);
  res.redirect("/profile");
});

router.get("/users", async (req, res) => {
  UserModel.find({}, (err, users) => {
    if (err) {
      console.log(err);
    } else {
      if (session.isLoggedIn) {
        res.render("users", {
          users: users,
          name: session.name.substring(0, session.name.indexOf(" "))
            ? session.name.substring(0, session.name.indexOf(" "))
            : session.name,
          isLoggedIn: session.isLoggedIn,
          email: session.email,
          username: session.username,
          _id: session._id,
        });
      } else {
        res.redirect("/");
      }
    }
  });
});

router.get("/chatHome", (req, res) => {
  res.render("chatHome", {
    name: session.name.substring(0, session.name.indexOf(" "))
      ? session.name.substring(0, session.name.indexOf(" "))
      : session.name,
    isLoggedIn: session.isLoggedIn,
    email: session.email,
    username: session.username,
  });
});

router.get("/chat", (req, res) => {
  res.render("chat", {
    name: session.name.substring(0, session.name.indexOf(" "))
      ? session.name.substring(0, session.name.indexOf(" "))
      : session.name,
    isLoggedIn: session.isLoggedIn,
    email: session.email,
    username: session.username,
  });
});

router.post("/filter", (req, res) => {
  UserModel.find({}, (err, users) => {
    if (err) {
      console.log(err);
    } else {
      if (session.isLoggedIn) {
        res.send({
          status: 200,
          users: users,
        });
      }
    }
  });
});

router.get("*", (req, res) => {
  res.render("error", {
    name: session.name.substring(0, session.name.indexOf(" "))
      ? session.name.substring(0, session.name.indexOf(" "))
      : session.name,
    isLoggedIn: session.isLoggedIn,
    email: session.email,
    username: session.username,
  });
});

module.exports = router;
