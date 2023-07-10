const { Router } = require("express");
const ImageModel = require("../Models/images");
const UserModel = require("../Models/user");
const AdminModel = require("../Models/admin");
const router = Router();
const createError = require("http-errors");
const session = require("../Session/session");
const admin = require("../Session/admin");

router.post("/signin", async (req, res) => {
  const adminUser = await AdminModel.findOne({
    username: req.body.username,
  });
  if (!adminUser.username) {
    return next(createError(404, "Admin not found!"));
  }
  if (adminUser.password === req.body.password) {
    admin.isAdmin = true;
    admin.username = adminUser.username;
  }
  console.log("Admin login");
  res.redirect("/admin");
});

router.get("/", (req, res) => {
  if (admin.isAdmin) {
    ImageModel.find({}, (err, images) => {
      if (err) {
        console.log(err);
        res.status(500).send({ message: `An error occurred ${err}` });
      } else {
        images = images.reverse();
        UserModel.find({}, (err, users) => {
          if (err) {
            console.log(err);
            res.status(500).send({ message: `An error occurred ${err}` });
          } else {
            if (admin.isAdmin) {
              res.render("admin", {
                users: users,
                images: images,
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
  } else {
    res.redirect("admin/login");
  }
});

router.put("/blockUserAdmin", async (req, res) => {
  if (admin.isAdmin) {
    const blocked = await UserModel.findByIdAndUpdate(
      req.body.userId,
      {
        $set: { blocked: true },
      },
      {
        new: true,
      }
    );
  } else {
    return next(createError(404, "You are not the Admin"));
  }
});

router.put("/unBlockUserAdmin", async (req, res) => {
  if (admin.isAdmin) {
    const blocked = await UserModel.findByIdAndUpdate(req.body.userId, {
      $set: { blocked: false },
    });
  } else {
    return next(createError(404, "You are not the Admin"));
  }
});

router.get("/logout", (req, res) => {
  console.log("Logout");
  admin.isAdmin = false;
  res.redirect("/");
});

router.get("/login", (req, res) => {
  res.render("adminLogin");
});

router.delete("/deletePostAdmin", async (req, res) => {
  if (admin.isAdmin) {
    const deleted = await ImageModel.findByIdAndRemove(req.body.imageId);
  } else {
    return next(createError(404, "Image Not Found!"));
  }
});

module.exports = router;
