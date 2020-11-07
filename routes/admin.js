const express = require("express");
const { model } = require("mongoose");
const fs = require("fs");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const nodemailer = require("nodemailer");
const { ensureAuthenticated } = require("../config/auth");

const Messages = require("../models/Message"); // Require Message Model
const Blog = require("../models/Blog"); // Require Blog Model
const TeamMember = require("../models/Team");
const Admin = require("../models/Admin"); // Require Admin Model
const Podcast = require("../models/Podcast"); // Require Podcast Model
const Subscriber = require("../models/Subscriber");
const { subscribe } = require(".");

// Login Page
router.get("/maverick-admin/login", function (req, res) {
  res.render("admin/auth/login");
});

router.post("/maverick-admin/login", function (req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/maverick-admin/dashboard",
    failureRedirect: "/maverick-admin/login",
    failureFlash: true,
  })(req, res, next);
});

// Dashboard
router.get("/maverick-admin/dashboard", ensureAuthenticated, function (
  req,
  res
) {
  try {
    Podcast.countDocuments(function (err, totalPodcasts) {
      Blog.countDocuments(function (err, totalBlog) {
        Admin.countDocuments(function (err, totalAdmins) {
          Subscriber.countDocuments(function (err, totalSubscribers) {
            if (err) {
              res.render("admin/auth/login", {
                error_msg: `Error encounted. Try logging in again`,
              });
            } else {
              res.render("admin/dashboard/main-dashboard", {
                totalBlog: totalBlog,
                totalPodcasts: totalPodcasts,
                totalAdmins: totalAdmins,
                totalSubscribers: totalSubscribers,
                admin_name: req.user.adminName,
                admin_image: req.user.adminImage,
                admin_email: req.user.adminEmail,
                admin_phone: req.user.adminTelephone,
                admin_id: req.user._id,
              });
            }
          });
        });
      });
    });
  } catch (err) {
    req.flash("error_msg", `Error encounted. Try logging in again`);
    res.render("admin/auth/login");
  }
});

// Profile
router.get("/maverick-admin/profile", ensureAuthenticated, function (req, res) {
  res.render("admin/dashboard/profile/profile", {
    admin_name: req.user.adminName,
    admin_image: req.user.adminImage,
    admin_email: req.user.adminEmail,
    admin_phone: req.user.adminTelephone,
    admin_bio: req.user.adminBio,
    admin_id: req.user._id,
  });
});

// req.flash("error_msg", `Error encounted. Try logging in again`);
//     res.redirect("/maverick-admin/login");

// Profile Settings Handler
router.post("/maverick-admin/update-profile", ensureAuthenticated, function (
  req,
  res
) {
  try {
    const editedProfile = {
      $set: {
        adminName: req.body.adminName,
        adminEmail: req.body.adminEmail,
        adminTelephone: req.body.adminPhone,
        adminBio: req.body.bio,
      },
    };
    Admin.updateOne({ _id: req.body._id }, editedProfile)
      .then((edited) => {
        if (edited) {
          req.flash("success_msg", `Details updated successfully`);
          res.redirect("/maverick-admin/profile");
        } else {
          req.flash("error_msg", `Error updating details`);
          res.redirect("/maverick-admin/profile");
        }
      })
      .catch((error) => {
        req.flash("error_msg", `Error updating details`);
        res.redirect("/maverick-admin/profile");
      });
  } catch (error) {
    req.flash("error_msg", `Error encounted. Try logging in again`);
    res.redirect("/maverick-admin/login");
  }
});

// Password Update
router.post("/maverick-admin/update-password", ensureAuthenticated, function (
  req,
  res
) {
  try {
    let errors = [];

    // Match Password
    bcrypt.compare(
      req.body.oldPassword,
      req.user.adminPassword,
      (err, isMatch) => {
        if (err) {
          res.render("admin/dashboard/profile/profile", {
            error_msg: `Bcrypt error.. Try again later`,
            admin_name: req.user.adminName,
            admin_image: req.user.adminImage,
            admin_email: req.user.adminEmail,
            admin_phone: req.user.adminTelephone,
            admin_id: req.user._id,
          });
        }
        if (isMatch) {
          // Check new password and confirm password match
          if (req.body.newPassword != req.body.confirmpassword) {
            errors.push({ msg: "Passwords do not match" });
          }

          // Check password length
          if (req.body.newPassword.length < 6) {
            errors.push({ msg: "Password should be at least 6 characters" });
          }

          if (errors.length > 0) {
            res.render("admin/dashboard/profile/profile", {
              admin_name: req.user.adminName,
              admin_image: req.user.adminImage,
              admin_email: req.user.adminEmail,
              admin_phone: req.user.adminTelephone,
              admin_id: req.user._id,
              errors,
            });
          } else {
            // Hash Password using BcryptJs
            bcrypt.genSalt(10, (errr, salt) =>
              // Hash Password
              bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
                if (err) {
                  res.render("admin/dashboard/profile/profile", {
                    admin_name: req.user.adminName,
                    admin_image: req.user.adminImage,
                    admin_email: req.user.adminEmail,
                    admin_phone: req.user.adminTelephone,
                    admin_id: req.user._id,
                    error_msg: `Bcrypt error.. Try again later`,
                  });
                }
                // Set Password to Hash
                const editedPassword = {
                  $set: {
                    adminPassword: hash,
                  },
                };

                // Update Password in Database
                Admin.updateOne({ _id: req.body._id }, editedPassword)
                  .then((edited) => {
                    if (edited) {
                      req.flash("success_msg", `Details updated successfully`);
                      res.redirect("/maverick-admin/profile");
                    } else {
                      req.flash("error_msg", `Error updating details`);
                      res.redirect("/maverick-admin/profile");
                    }
                  })
                  .catch((error) => {
                    req.flash("error_msg", `Error updating details`);
                    res.redirect("/maverick-admin/profile");
                  });
              })
            );
          }
        } else {
          req.flash("error_msg", `Incorrect Password`);
          res.redirect("/maverick-admin/profile");
        }
      }
    );
  } catch (error) {
    req.flash("error_msg", `Error encounted. Try logging in again`);
    res.redirect("/maverick-admin/login");
  }
});

// Logout
router.get("/maverick-admin/logout", ensureAuthenticated, function (req, res) {
  req.logout();
  req.flash("success_msg", "You logged out successfully");
  res.redirect("/maverick-admin/login");
});

// Add New Admin
router.get("/maverick-admin/add-new/admin", ensureAuthenticated, function (
  req,
  res
) {
  res.render("admin/dashboard/add-admin", {
    admin_name: req.user.adminName,
    admin_image: req.user.adminImage,
    admin_email: req.user.adminEmail,
    admin_phone: req.user.adminTelephone,
    admin_id: req.user._id,
  });
});

router.post("/maverick-admin/add-new/admin", ensureAuthenticated, function (
  req,
  res
) {
  try {
    const {
      adminName,
      adminTelephone,
      adminEmail,
      adminPassword,
      confirmpassword,
    } = req.body;

    let errors = [];
    // Check password match
    if (adminPassword !== confirmpassword) {
      errors.push({ msg: "Passwords do not match" });
    }

    // Check password length
    if (adminPassword.length < 6) {
      errors.push({ msg: "Password should be at least 6 characters" });
    }

    if (errors.length > 0) {
      res.render("admin/dashboard/add-admin", {
        errors,
        adminName,
        adminTelephone,
        adminEmail,
      });
    } else {
      // Registration on track
      Admin.findOne({ adminEmail: adminEmail }).then((admin) => {
        if (admin) {
          // Admin Exist
          errors.push({ msg: "This email already exists" });
          res.render("admin/dashboard/add-admin", {
            errors,
            adminName,
            adminTelephone,
            adminEmail,
          });
        } else {
          const image = req.files.adminImage;
          image.mv(
            "public/assets/team/admin/" + "maverick_image" + "-" + image.name,
            function (error) {
              if (error) {
                console.log("Picture Upload failed");
              } else {
                console.log("Picture Uploaded successfully");
              }
            }
          );
          const newAdmin = new Admin({
            adminName: req.body.adminName,
            adminTelephone: req.body.adminTelephone,
            adminEmail: req.body.adminEmail,
            adminImage: "maverick_image" + "-" + image.name,
            adminBio: 'I am a Systems Adminstrator at Maverick Edifice',
            adminPassword: req.body.adminPassword,
            timeRegistered:
              new Date().toLocaleTimeString() +
              " on " +
              new Date().toLocaleDateString(),
          });

          // Hash Password using BcryptJs
          bcrypt.genSalt(10, (errr, salt) =>
            bcrypt.hash(newAdmin.adminPassword, salt, (err, hash) => {
              if (err) {
                res.render("admin/dashboard/add-admin", {
                  admin_name: req.user.adminName,
                  admin_image: req.user.adminImage,
                  admin_email: req.user.adminEmail,
                  admin_phone: req.user.adminTelephone,
                  admin_id: req.user._id,
                  error_msg: `Bcrypt error.. Try again later`,
                });
              }
              // Set Password to Hash
              newAdmin.adminPassword = hash;

              // Save the New Admin into the Database
              newAdmin
                .save()
                .then((admin) => {
                  // req.flash(
                  //   "success_msg",
                  //   `${newAdmin.firstname} has been registered successfully`
                  // );

                  req.flash("success_msg", "Admin registered successfully");
                  res.redirect("/maverick-admin/add-new/admin");
                })
                .catch((err) => {
                  req.flash("error_msg", `Error adding admin. Try again later`);
                  res.redirect("/maverick-admin/add-new/admin");
                });
            })
          );
        }
      });
    }
  } catch (err) {
    res.render("admin/dashboard/add-admin", {
      admin_name: req.user.adminName,
      admin_image: req.user.adminImage,
      admin_email: req.user.adminEmail,
      admin_phone: req.user.adminTelephone,
      admin_id: req.user._id,
      error_msg: `Error registering admin`,
    });
  }
});

// Add New Team Member
router.get(
  "/maverick-admin/add-new/team-member",
  ensureAuthenticated,
  function (req, res) {
    res.render("admin/dashboard/team-member", {
      admin_name: req.user.adminName,
      admin_image: req.user.adminImage,
      admin_email: req.user.adminEmail,
      admin_phone: req.user.adminTelephone,
      admin_id: req.user._id,
    });
  }
);

// Add New Team Member Handler
router.post(
  "/maverick-admin/add-new/team-member",
  ensureAuthenticated,
  function (req, res) {
    const image = req.files.memberImage;
    image.mv(
      "public/assets/team/" + "maverick_image" + "-" + image.name,
      function (error) {
        if (error) {
          console.log("Picture Upload failed");
        } else {
          console.log("Picture Uploaded successfully");
        }
      }
    );
    const newTeamMember = new TeamMember({
      memberName: req.body.memberName,
      memberPosition: req.body.memberPosition,
      memberPositionCategory: req.body.memberPositionCategory,
      memberTelephone: req.body.memberTelephone,
      memberEmail: req.body.memberEmail,
      memberImage: "maverick_image" + "-" + image.name,
      memberDescription: req.body.memberDescription,
      memberPartner: req.body.memberPartner,
    });

    newTeamMember.save().then((uploadedTeamMember) => {
      req.flash("success_msg", "Team member added successfully");
      res.redirect("/maverick-admin/add-new/team-member");
    });
  }
);

// *************************** Uploads ******************************
// Add New Post
router.get("/maverick-admin/add-new/post", ensureAuthenticated, function (
  req,
  res
) {
  res.render("admin/dashboard/uploads/new-post", {
    admin_name: req.user.adminName,
    admin_image: req.user.adminImage,
    admin_email: req.user.adminEmail,
    admin_phone: req.user.adminTelephone,
    admin_id: req.user._id,
  });
});

// Add New Post Handler
router.post("/maverick-admin/add-new/post", ensureAuthenticated, function (
  req,
  res
) {
  const image = req.files.blogImage;
  image.mv(
    "public/assets/blog/" + "maverick_image" + "-" + image.name,
    function (error) {
      if (error) {
        console.log("Blog image uploaded successfully");
      } else {
        console.log("Blog Image upload failed");
      }
    }
  );
  const newBlogPost = new Blog({
    blogTitle: req.body.blogTitle,
    blogImage: "maverick_image" + "-" + image.name,
    blogText: req.body.blogText,
    blogTags: req.body.tags,
    postedBy: req.user.adminName,
    timePosted:
      new Date().toLocaleTimeString() + " on " + new Date().toDateString(),
  });

  newBlogPost.save().then((blogUploaded) => {
    req.flash("success_msg", "Blog uploaded successfully");
    res.redirect("/maverick-admin/add-new/post");
  });
});

// Add New Podcast
router.get("/maverick-admin/add-new/podcast", ensureAuthenticated, function (
  req,
  res
) {
  res.render("admin/dashboard/uploads/new-podcast", {
    admin_name: req.user.adminName,
    admin_image: req.user.adminImage,
    admin_email: req.user.adminEmail,
    admin_phone: req.user.adminTelephone,
    admin_id: req.user._id,
  });
});

// Add New Podcast Handler
router.post("/maverick-admin/add-new/podcast", ensureAuthenticated, function (
  req,
  res
) {
  // Upload Main Podcast File
  const podcast = req.files.podcastFile;
  podcast.mv(
    "public/assets/podcast/files/" + "maverick_podcast" + "-" + podcast.name,
    function (error) {
      if (error) {
        console.log("Podcast file upload failed");
      } else {
        console.log("Podcast File Uploaded Successfully");
      }
    }
  );

  // Upload Podcast image
  const image = req.files.podcastImage;
  image.mv(
    "public/assets/podcast/images/" +
      "maverick_podcast_image" +
      "-" +
      image.name,
    function (error) {
      if (error) {
        console.log("Podcast upload failed");
      } else {
        console.log("Podcast Image Uploaded Successfully");
      }
    }
  );

  // Create a new instance of the Podacst model
  const newPodcast = new Podcast({
    podcastTitle: req.body.podcastTitle,
    podcastAuthor: req.body.podcastAuthor,
    podcastImage: "maverick_podcast_image" + "-" + image.name,
    podcastFile: "maverick_podcast" + "-" + podcast.name,
    podcastDescription: req.body.podcastDescription,
    podcastTags: req.body.tags,
    postedBy: req.user.adminName,
    timeUploaded:
      new Date().toLocaleTimeString() + " on " + new Date().toDateString(),
  });

  newPodcast.save().then((podcastUploaded) => {
    req.flash("success_msg", `Podcast uploaded successfully`);
    res.redirect("/maverick-admin/add-new/podcast");
  });
});

// ======================= Management ==============================

// Manage Admins
router.get("/maverick-admin/management/admins", ensureAuthenticated, function (
  req,
  res
) {
  Admin.find(function (err, admins) {
    res.render("admin/dashboard/management/manage-admins", {
      admins: admins,
      admin_name: req.user.adminName,
      admin_image: req.user.adminImage,
      admin_email: req.user.adminEmail,
      admin_phone: req.user.adminTelephone,
      admin_id: req.user._id,
    });
  });
});

// Edit Admin
router.get(
  "/maverick-admin/management/edit-admin",
  ensureAuthenticated,
  function (req, res) {
    try {
      Admin.findOne({ _id: req.query.id }, function (err, adminToedit) {
        if (err) {
          Admin.find(function (err, admins) {
            res.render("admin/dashboard/management/manage-admins", {
              admins: admins,
              admin_name: req.user.adminName,
              admin_image: req.user.adminImage,
              admin_email: req.user.adminEmail,
              admin_phone: req.user.adminTelephone,
              admin_id: req.user._id,
              error_msg: "Operation failed...Try again later",
            });
          });
        } else if (adminToedit == undefined) {
          Admin.find(function (err, admins) {
            res.render("admin/dashboard/management/manage-admins", {
              admins: admins,
              admin_name: req.user.adminName,
              admin_image: req.user.adminImage,
              admin_email: req.user.adminEmail,
              admin_phone: req.user.adminTelephone,
              admin_id: req.user._id,
              error_msg: "Error fetching admin details...Try again later",
            });
          });
        } else {
          res.render("admin/dashboard/management/edit-admin", {
            admin: adminToedit,
            admin_name: req.user.adminName,
            admin_image: req.user.adminImage,
            admin_email: req.user.adminEmail,
            admin_phone: req.user.adminTelephone,
            admin_id: req.user._id,
          });
        }
      });
    } catch (err) {
      Admin.find(function (err, admins) {
        res.render("admin/dashboard/management/manage-admins", {
          admins: admins,
          admin_name: req.user.adminName,
          admin_image: req.user.adminImage,
          admin_email: req.user.adminEmail,
          admin_phone: req.user.adminTelephone,
          admin_id: req.user._id,
          error_msg: "Operation failed...Try again later",
        });
      });
    }
  }
);

// Edit Admin Handler
router.post(
  "/maverick-admin/management/edit-admin",
  ensureAuthenticated,
  function (req, res) {
    const image = req.files.adminImage;
    image.mv(
      "public/assets/team/admin/" + "maverick_image" + "-" + image.name,
      function (error) {
        if (error) {
          console.log("Picture Upload failed");
        } else {
          console.log("Picture Uploaded successfully");
        }
      }
    );
    const editedAdmin = {
      $set: {
        adminName: req.body.adminName,
        adminTelephone: req.body.adminTelephone,
        adminEmail: req.body.adminEmail,
        adminImage: "maverick_image" + "-" + image.name,
      },
    };

    Admin.updateOne({ _id: req.body._id }, editedAdmin)
      .then((edited) => {
        if (edited) {
          req.flash("success_msg", `Admin edited successfully`);
          res.redirect("/maverick-admin/management/admins");
        } else {
          req.flash("error_msg", `Operation failed. Try again later`);
          res.redirect("/maverick-admin/management/admins");
        }
      })
      .catch((error) => {
        req.flash("error_msg", `Operation failed. Try again later`);
        res.redirect("/maverick-admin/management/admins");
      });
  }
);

// Delete Admin Handler
router.get(
  "/maverick-admin/management/delete-admin",
  ensureAuthenticated,
  function (req, res) {
    try {
      Admin.findByIdAndRemove(
        req.query.id,
        { useFindAndModify: false },
        function (err, deleted) {
          if (err) {
            Admin.find(function (err, admins) {
              res.render("admin/dashboard/management/manage-admins", {
                admins: admins,
                admin_name: req.user.adminName,
                admin_image: req.user.adminImage,
                admin_email: req.user.adminEmail,
                admin_phone: req.user.adminTelephone,
                admin_id: req.user._id,
                error_msg: "Error deleting admin...Try again later",
              });
            });
          } else {
            Admin.find(function (err, admins) {
              res.render("admin/dashboard/management/manage-admins", {
                admins: admins,
                admin_name: req.user.adminName,
                admin_image: req.user.adminImage,
                admin_email: req.user.adminEmail,
                admin_phone: req.user.adminTelephone,
                admin_id: req.user._id,
                success_msg: "Admin deleted successfully",
              });
            });
          }
        }
      );
    } catch (err) {
      Admin.find(function (err, admins) {
        res.render("admin/dashboard/management/manage-admins", {
          admins: admins,
          admin_name: req.user.adminName,
          admin_image: req.user.adminImage,
          admin_email: req.user.adminEmail,
          admin_phone: req.user.adminTelephone,
          admin_id: req.user._id,
          error_msg: "Operation failed...Try again later",
        });
      });
    }
  }
);

// Manage Team
router.get("/maverick-admin/management/team", ensureAuthenticated, function (
  req,
  res
) {
  TeamMember.find(function (err, teamMembers) {
    res.render("admin/dashboard/management/manage-team", {
      team: teamMembers,
      admin_name: req.user.adminName,
      admin_image: req.user.adminImage,
      admin_email: req.user.adminEmail,
      admin_phone: req.user.adminTelephone,
      admin_id: req.user._id,
    });
  });
});

// Edit Member
router.get(
  "/maverick-admin/management/edit-member",
  ensureAuthenticated,
  function (req, res) {
    try {
      TeamMember.findOne({ _id: req.query.id }, function (err, member) {
        if (err) {
          TeamMember.find(function (err, teamMembers) {
            res.render("admin/dashboard/management/manage-team", {
              team: teamMembers,
              admin_name: req.user.adminName,
              admin_image: req.user.adminImage,
              admin_email: req.user.adminEmail,
              admin_phone: req.user.adminTelephone,
              admin_id: req.user._id,
              error_msg: `Operation failed...Try again later`,
            });
          });
        } else if (member == undefined) {
          TeamMember.find(function (err, teamMembers) {
            res.render("admin/dashboard/management/manage-team", {
              team: teamMembers,
              admin_name: req.user.adminName,
              admin_image: req.user.adminImage,
              admin_email: req.user.adminEmail,
              admin_phone: req.user.adminTelephone,
              admin_id: req.user._id,
              error_msg: `Error fetching member details...Try again later`,
            });
          });
        } else {
          res.render("admin/dashboard/management/edit-member", {
            member: member,
            admin_name: req.user.adminName,
            admin_image: req.user.adminImage,
            admin_email: req.user.adminEmail,
            admin_phone: req.user.adminTelephone,
            admin_id: req.user._id,
          });
        }
      });
    } catch (err) {
      TeamMember.find(function (err, teamMembers) {
        res.render("admin/dashboard/management/manage-team", {
          team: teamMembers,
          admin_name: req.user.adminName,
          admin_image: req.user.adminImage,
          admin_email: req.user.adminEmail,
          admin_phone: req.user.adminTelephone,
          admin_id: req.user._id,
          error_msg: `Operation failed...Try again later`,
        });
      });
    }
  }
);

// Edit Member Handler
router.post(
  "/maverick-admin/management/edit-member",
  ensureAuthenticated,
  function (req, res) {
    const image = req.files.memberImage;
    image.mv(
      "public/assets/team/" + "maverick_image" + "-" + image.name,
      function (error) {
        if (error) {
          console.log("Picture Upload failed");
        } else {
          console.log("Picture Uploaded successfully");
        }
      }
    );

    const editedMember = {
      $set: {
        memberName: req.body.memberName,
        memberPosition: req.body.memberPosition,
        memberPositionCategory: req.body.memberPositionCategory,
        memberTelephone: req.body.memberTelephone,
        memberEmail: req.body.memberEmail,
        memberImage: "maverick_image" + "-" + image.name,
        memberDescription: req.body.memberDescription,
        memberPartner: req.body.memberPartner,
      },
    };

    TeamMember.updateOne({ _id: req.body._id }, editedMember)
      .then((edited) => {
        if (edited) {
          req.flash("success_msg", "Team member edited successfully");
          res.redirect("/maverick-admin/management/team");
        } else {
          req.flash("error_msg", "Error updating member details");
          res.redirect("/maverick-admin/management/team");
        }
      })
      .catch((error) => {
        req.flash(
          "error_msg",
          "Error updating member details. Try again later"
        );
        res.redirect("/maverick-admin/management/team");
      });
  }
);

// Delete Member Handler
router.get(
  "/maverick-admin/management/delete-member",
  ensureAuthenticated,
  function (req, res) {
    try {
      TeamMember.findByIdAndRemove(
        req.query.id,
        { useFindAndModify: false },
        function (err, deleted) {
          if (err) {
            TeamMember.find(function (err, teamMembers) {
              res.render("admin/dashboard/management/manage-team", {
                team: teamMembers,
                admin_name: req.user.adminName,
                admin_image: req.user.adminImage,
                admin_email: req.user.adminEmail,
                admin_phone: req.user.adminTelephone,
                admin_id: req.user._id,
                error_msg: `Operation failed...Try again later`,
              });
            });
          } else {
            TeamMember.find(function (err, teamMembers) {
              res.render("admin/dashboard/management/manage-team", {
                team: teamMembers,
                admin_name: req.user.adminName,
                admin_image: req.user.adminImage,
                admin_email: req.user.adminEmail,
                admin_phone: req.user.adminTelephone,
                admin_id: req.user._id,
                success_msg: `Member deleted successfullly`,
              });
            });
          }
        }
      );
    } catch (err) {
      TeamMember.find(function (err, teamMembers) {
        res.render("admin/dashboard/management/manage-team", {
          team: teamMembers,
          admin_name: req.user.adminName,
          admin_image: req.user.adminImage,
          admin_email: req.user.adminEmail,
          admin_phone: req.user.adminTelephone,
          admin_id: req.user._id,
          error_msg: `Operation failed...Try again later`,
        });
      });
    }
  }
);

// Manage Blog
router.get("/maverick-admin/management/blog", ensureAuthenticated, function (
  req,
  res
) {
  Blog.find(function (err, allBlogs) {
    res.render("admin/dashboard/management/manage-blog", {
      blog: allBlogs,
      admin_name: req.user.adminName,
      admin_image: req.user.adminImage,
      admin_email: req.user.adminEmail,
      admin_phone: req.user.adminTelephone,
      admin_id: req.user._id,
    });
  });
});

// Edit Blog
router.get(
  "/maverick-admin/management/edit-blog",
  ensureAuthenticated,
  function (req, res) {
    try {
      Blog.findOne({ _id: req.query.id }, function (err, blogToedit) {
        if (err) {
          Blog.find(function (err, allBlogs) {
            res.render("admin/dashboard/management/manage-blog", {
              blog: allBlogs,
              admin_name: req.user.adminName,
              admin_image: req.user.adminImage,
              admin_email: req.user.adminEmail,
              admin_phone: req.user.adminTelephone,
              admin_id: req.user._id,
              error_msg: `Operation failed....Try again later`,
            });
          });
        } else if (blogToedit == undefined) {
          Blog.find(function (err, allBlogs) {
            res.render("admin/dashboard/management/manage-blog", {
              blog: allBlogs,
              admin_name: req.user.adminName,
              admin_image: req.user.adminImage,
              admin_email: req.user.adminEmail,
              admin_phone: req.user.adminTelephone,
              admin_id: req.user._id,
              error_msg: `Error fetching blog details`,
            });
          });
        } else {
          res.render("admin/dashboard/management/edit-blog", {
            blog: blogToedit,
            admin_name: req.user.adminName,
            admin_image: req.user.adminImage,
            admin_email: req.user.adminEmail,
            admin_phone: req.user.adminTelephone,
            admin_id: req.user._id,
          });
        }
      });
    } catch (err) {
      Blog.find(function (err, allBlogs) {
        res.render("admin/dashboard/management/manage-blog", {
          blog: allBlogs,
          admin_name: req.user.adminName,
          admin_image: req.user.adminImage,
          admin_email: req.user.adminEmail,
          admin_phone: req.user.adminTelephone,
          admin_id: req.user._id,
          error_msg: `Operation failed....Try again later`,
        });
      });
    }
  }
);

// Edit Blog Handler
router.post(
  "/maverick-admin/management/edit-blog",
  ensureAuthenticated,
  function (req, res) {
    const image = req.files.blogImage;
    image.mv(
      "public/assets/blog/" + "maverick_image" + "-" + image.name,
      function (error) {
        if (error) {
          console.log("Picture Upload failed");
        } else {
          console.log("Picture Uploaded successfully");
        }
      }
    );
    const editedBlogPost = {
      $set: {
        blogTitle: req.body.blogTitle,
        blogImage: "maverick_image" + "-" + image.name,
        blogText: req.body.blogText,
        blogTags: req.body.tags,
        postedBy: req.user.adminName,
      },
    };

    Blog.updateOne({ _id: req.body._id }, editedBlogPost)
      .then((edited) => {
        if (edited) {
          req.flash("success_msg", "Blog updated successfully");
          res.redirect("/maverick-admin/management/blog");
        } else {
          req.flash("error_msg", "Error updating blog");
          res.redirect("/maverick-admin/management/blog");
        }
      })
      .catch((error) => {
        req.flash("error_msg", "Error updating blog. Try again later");
        res.redirect("/maverick-admin/management/blog");
      });
  }
);

// Delete Blog Handler
router.post(
  "/maverick-admin/management/delete-blog",
  ensureAuthenticated,
  function (req, res) {
    try {
      Blog.findByIdAndRemove(
        req.query.id,
        { useFindAndModify: false },
        function (err, deleted) {
          if (err) {
            Blog.find(function (err, allBlogs) {
              res.render("admin/dashboard/management/manage-blog", {
                blog: allBlogs,
                admin_name: req.user.adminName,
                admin_image: req.user.adminImage,
                admin_email: req.user.adminEmail,
                admin_phone: req.user.adminTelephone,
                admin_id: req.user._id,
                error_msg: `Error deleting blog...Try again later`,
              });
            });
          } else {
            Blog.find(function (err, allBlogs) {
              res.render("admin/dashboard/management/manage-blog", {
                blog: allBlogs,
                admin_name: req.user.adminName,
                admin_image: req.user.adminImage,
                admin_email: req.user.adminEmail,
                admin_phone: req.user.adminTelephone,
                admin_id: req.user._id,
              });
            });
          }
        }
      );
    } catch (err) {
      req.flash("error_msg", "Error deleting blog. Try again later");
      res.redirect("/maverick-admin/management/blog");
    }
  }
);

// Manage Podcasts
router.get(
  "/maverick-admin/management/podcasts",
  ensureAuthenticated,
  function (req, res) {
    try {
      Podcast.find(function (err, allPodcasts) {
        if (err) {
          req.flash("error_msg", "Operation failed. Try again later");
          res.redirect("/maverick-admin/dashboard");
        } else {
          res.render("admin/dashboard/management/manage-podcast", {
            podcasts: allPodcasts,
            admin_name: req.user.adminName,
            admin_image: req.user.adminImage,
            admin_email: req.user.adminEmail,
            admin_phone: req.user.adminTelephone,
            admin_id: req.user._id,
          });
        }
      });
    } catch (err) {
      req.flash("error_msg", "Operation failed. Try again later");
      res.redirect("/maverick-admin/dashboard");
    }
  }
);

// Edit Podcast
router.get(
  "/maverick-admin/management/edit-podcast",
  ensureAuthenticated,
  function (req, res) {
    try {
      Podcast.findOne({ _id: req.query.id }, function (err, podcastToedit) {
        if (err) {
          Podcast.find(function (err, allPodcasts) {
            res.render("admin/dashboard/management/manage-podcast", {
              podcasts: allPodcasts,
              admin_name: req.user.adminName,
              admin_image: req.user.adminImage,
              admin_email: req.user.adminEmail,
              admin_phone: req.user.adminTelephone,
              admin_id: req.user._id,
              error_msg: `Operation failed...Try again later`,
            });
          });
        } else if (podcastToedit == undefined) {
          Podcast.find(function (err, allPodcasts) {
            res.render("admin/dashboard/management/manage-podcast", {
              podcasts: allPodcasts,
              admin_name: req.user.adminName,
              admin_image: req.user.adminImage,
              admin_email: req.user.adminEmail,
              admin_phone: req.user.adminTelephone,
              admin_id: req.user._id,
              error_msg: `Error fetching podcast details...Try again later`,
            });
          });
        } else {
          res.render("admin/dashboard/management/edit-podcast", {
            podcast: podcastToedit,
            admin_name: req.user.adminName,
            admin_image: req.user.adminImage,
            admin_email: req.user.adminEmail,
            admin_phone: req.user.adminTelephone,
            admin_id: req.user._id,
          });
        }
      });
    } catch (err) {
      Podcast.find(function (err, allPodcasts) {
        res.render("admin/dashboard/management/manage-podcast", {
          podcasts: allPodcasts,
          admin_name: req.user.adminName,
          admin_image: req.user.adminImage,
          admin_email: req.user.adminEmail,
          admin_phone: req.user.adminTelephone,
          admin_id: req.user._id,
          error_msg: `Operation failed...Try again later`,
        });
      });
    }
  }
);

// Edit Podcast Handler
router.post(
  "/maverick-admin/management/edit-podcast",
  ensureAuthenticated,
  function (req, res) {
    // Upload Main Podcast File
    const podcast = req.files.podcastFile;
    podcast.mv(
      "public/assets/podcast/files/" + "maverick_podcast" + "-" + podcast.name,
      function (error) {
        if (error) {
          console.log("Podcast file upload failed");
        } else {
          console.log("Podcast File Uploaded Successfully");
        }
      }
    );

    // Upload Podcast image
    const image = req.files.podcastImage;
    image.mv(
      "public/assets/podcast/images/" +
        "maverick_podcast_image" +
        "-" +
        image.name,
      function (error) {
        if (error) {
          console.log("Podcast upload failed");
        } else {
          console.log("Podcast Image Uploaded Successfully");
        }
      }
    );
    const editedPodcast = {
      $set: {
        podcastTitle: req.body.podcastTitle,
        podcastAuthor: req.body.podcastAuthor,
        podcastImage: "maverick_podcast_image" + "-" + image.name,
        podcastFile: "maverick_podcast" + "-" + podcast.name,
        podcastDescription: req.body.podcastDescription,
        podcastTags: req.body.tags,
      },
    };

    Podcast.updateOne({ _id: req.body._id }, editedPodcast)
      .then((edited) => {
        if (edited) {
          req.flash("success_msg", `Podcast updated successfully`);
          res.redirect("/maverick-admin/management/podcasts");
        } else {
          req.flash("error_msg", `Podcast update failed`);
          res.redirect("/maverick-admin/management/podcasts");
        }
      })
      .catch((error) => {
        req.flash("error_msg", `Operation Failed. Please try again later`);
        res.redirect("/maverick-admin/management/podcasts");
      });
  }
);

// Delete Blog Handler
router.get(
  "/maverick-admin/management/delete-podcast",
  ensureAuthenticated,
  function (req, res) {
    Podcast.findByIdAndRemove(
      req.query.id,
      { useFindAndModify: false },
      function (err, deleted) {
        if (err) {
          req.flash("error_msg", `Operation failed. Try again later`);
          res.redirect("/maverick-admin/management/blog");
        } else {
          req.flash("success_msg", `Podcast updated successfully`);
          res.redirect("/maverick-admin/management/podcasts");
        }
      }
    );
  }
);

// Messages
router.get("/maverick-admin/messages", ensureAuthenticated, function (
  req,
  res
) {
  Messages.find(function (err, messages) {
    res.render("admin/dashboard/messages", {
      messages: messages,
      admin_name: req.user.adminName,
      admin_image: req.user.adminImage,
      admin_email: req.user.adminEmail,
      admin_phone: req.user.adminTelephone,
      admin_id: req.user._id,
    });
  });
});

// Message Detail
router.get("/maverick-admin/message-detail", ensureAuthenticated, function (
  req,
  res
) {
  Messages.findOne({ _id: req.query.id }, function (err, message) {
    if (err) {
      Messages.find(function (err, messages) {
        res.render("admin/dashboard/messages", {
          messages: messages,
          admin_name: req.user.adminName,
          admin_image: req.user.adminImage,
          admin_email: req.user.adminEmail,
          admin_phone: req.user.adminTelephone,
          admin_id: req.user._id,
          error_msg: `Error fetching message details...Try again later`,
        });
      });
    } else if (message == undefined) {
      Messages.find(function (err, messages) {
        res.render("admin/dashboard/messages", {
          messages: messages,
          admin_name: req.user.adminName,
          admin_image: req.user.adminImage,
          admin_email: req.user.adminEmail,
          admin_phone: req.user.adminTelephone,
          admin_id: req.user._id,
          error_msg: `Error fetching message details...Try again later`,
        });
      });
    } else {
      res.render("admin/dashboard/message-detail", {
        message: message,
        admin_name: req.user.adminName,
        admin_image: req.user.adminImage,
        admin_email: req.user.adminEmail,
        admin_phone: req.user.adminTelephone,
        admin_id: req.user._id,
      });
    }
  });
});

// Broadcast Newsletters
router.get(
  "/maverick-admin/broadcast-newsletters",
  ensureAuthenticated,
  function (req, res) {
    res.render("admin/dashboard/subscription/broadcast-newsletters", {
      admin_name: req.user.adminName,
      admin_image: req.user.adminImage,
      admin_email: req.user.adminEmail,
      admin_phone: req.user.adminTelephone,
      admin_id: req.user._id,
    });
  }
);

router.post(
  "/maverick-admin/broadcast-newsletters",
  ensureAuthenticated,
  function (req, res) {
    Subscriber.find({}, function (err, subscribers) {
      if (err) {
        res.render("admin/dashboard/subscription/broadcast-newsletters", {
          admin_name: req.user.adminName,
          admin_image: req.user.adminImage,
          admin_email: req.user.adminEmail,
          admin_phone: req.user.adminTelephone,
          admin_id: req.user._id,
          error_msg: `Error broadcasting newsletters...Try again later`,
        });
      }
      var maillist = [];
      subscribers.forEach(function (subscriber) {
        maillist.push(subscriber.email);
        return maillist;
      });

      const output = `
      <p>Hi,</p>
      ${req.body.news}
      <br>
    `;

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "developermajesty@gmail.com", // generated ethereal user
          pass: "Majesty1@", // generated ethereal password
        },
      });

      let mailOptions = {
        from: '"Maverick Edifice" <developermajesty@gmail.com>', // sender address
        to: maillist, // list of receivers
        subject:
          "Test Transmission Of The Maverick Newsletter Subscription Service ", // Subject line
        text: "Hello world?", // plain text body
        html: output, // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          res.render("admin/dashboard/subscription/broadcast-newsletters", {
            error_msg:
              "Error broadcasting newsletters...Please try again later",
            admin_name: req.user.adminName,
            admin_image: req.user.adminImage,
            admin_email: req.user.adminEmail,
            admin_phone: req.user.adminTelephone,
            admin_id: req.user._id,
          });
        }

        res.render("admin/dashboard/subscription/broadcast-newsletters", {
          success_msg: "Message broadcasted to all subscribers successfully",
          admin_name: req.user.adminName,
          admin_image: req.user.adminImage,
          admin_email: req.user.adminEmail,
          admin_phone: req.user.adminTelephone,
          admin_id: req.user._id,
        });
      });
    });
  }
);

// Subscribers
router.get("/maverick-admin/subscribers", ensureAuthenticated, function (
  req,
  res
) {
  Subscriber.find(function (err, subscribers) {
    res.render("admin/dashboard/subscription/subscribers", {
      subscribers: subscribers,
      admin_name: req.user.adminName,
      admin_image: req.user.adminImage,
      admin_email: req.user.adminEmail,
      admin_phone: req.user.adminTelephone,
      admin_id: req.user._id,
    });
  });
});

module.exports = router;
