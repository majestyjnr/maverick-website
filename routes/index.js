const express = require("express");
const router = express.Router();
const Messages = require("../models/Message"); // Messages Model
const Blog = require("../models/Blog"); // Blog Model
const TeamMember = require("../models/Team"); // Team Model
const Podcast = require("../models/Podcast"); // Podcat Model
const Admin = require("../models/Admin");
const Subscriber = require("../models/Subscriber");
const { subscribe } = require("./admin");

//=========================== Index Page ==============================
router.get("/", function (req, res) {
  Blog.find()
    .limit(5)
    .then((blog) => {
      res.render("index", { blog: blog });
    });
});

// =========================== Resources ==============================
router.get("/blog", function (req, res) {
  Blog.find(function (err, allPosts) {
    res.render("top-navigations/resources/blog", {
      blog: allPosts,
    });
  });
});

router.get("/blog-detail", function (req, res) {
  try {
    Blog.findOne({ _id: req.query.id }, function (err, detail) {
      if (err) {
        res.render("top-navigations/resources/404", {
          error_msg: "Ooooops..... The page could not be found",
        });
      } else if (detail == undefined) {
        res.render("top-navigations/resources/404", {
          error_msg: "Ooooops..... The page could not be found",
        });
      } else {
        Admin.findOne({ adminName: detail.postedBy }, function (
          err,
          blogPoster
        ) {
          Blog.find(function(err, allPosts){
            if(err){
              throw err;
            }else{
              res.render("top-navigations/resources/blog-detail", {
                admin: blogPoster,
                blog: detail,
                allBlogs: allPosts
              });
            }
          })
        });
      }
    });
    // throw error;
  } catch (error) {
    res.render("top-navigations/resources/404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get("/podcast", function (req, res) {
  Podcast.find(function (err, allPodcasts) {
    res.render("top-navigations/resources/podcast", {
      podcast: allPodcasts,
    });
  });
});

router.post("/search", function (req, res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");

    Podcast.find({ podcastTitle: regex }, function (err, podcastsFound) {
      if (err) {
        
      } else {
        Podcast.find(function (err, allPodcasts) {
          res.render("top-navigations/resources/search", {
            podcast: allPodcasts,
            searched: podcastsFound
          });
        });

        // Movies.find(function (err, movies) {
        //   movies = movies.reverse();
        //   res.render("account/search-results", {
        //     fullname: req.user.fullname,
        //     email: req.user.email,
        //     profilepicture: req.user.profilepicture,
        //     subscription: req.user.subscriptiontype,
        //     searched: moviesFound, // Search Results
        //     ID: req.user.id,
        //   });
        // });
      }
    });
  }
});

router.get("/podcast-detail", function (req, res) {
  try {
    Podcast.findOne({ _id: req.query.id }, function (err, detail) {
      if (err) {
        res.render("top-navigations/resources/404", {
          error_msg: "Ooooops..... The page could not be found",
        });
      } else if (detail == undefined) {
        res.render("top-navigations/resources/404", {
          error_msg: "Ooooops..... The page could not be found",
        });
      } else {
        Admin.findOne({ adminName: detail.postedBy }, function (
          err,
          podcastPoster
        ) {
          Podcast.find(function (err, allPodcasts) {
            res.render("top-navigations/resources/podcast-detail", {
              podcast: detail,
              allPodcasts: allPodcasts,
              admin: podcastPoster,
            });
          }).limit(5);
        });
      }
    });
  } catch (error) {
    res.render("top-navigations/resources/404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

// =========================== Contact Us =============================
router.get("/contact-us", function (req, res) {
  res.render("top-navigations/contact/contact-us");
});

router.post("/send-message", function (req, res) {
  const newMessage = new Messages({
    fullname: req.body.fullname,
    email: req.body.email,
    phone: req.body.phone,
    subject: req.body.subject,
    message: req.body.message,
    isRead: false,
    timeSent:
      new Date().toLocaleTimeString() + " on " + new Date().toDateString(),
  });

  newMessage.save().then((messageSent) => {
    res.send({
      text:
        "Message sent successfully. You will hear from Maverick Edifice soon",
      _id: messageSent.insertedId,
    });
  });
});

// ============================ Middle Section ========================
router.get("/Who", function (req, res) {
  TeamMember.find(function (err, teamMembers) {
  res.render("middle/who", {
    team: teamMembers,
  });
  });
});

router.get("/What", function (req, res) {
  res.render("middle/what");
});

router.get("/Why", function (req, res) {
  res.render("middle/why");
});

router.get("/How", function (req, res) {
  res.render("middle/how");
});

router.get("/Work-culture", function (req, res) {
  res.render("middle/work-culture");
});

router.get("/Products", function (req, res) {
  res.render("middle/products");
});

// =========================== Footer ==========================
router.get("/services", function (req, res) {
  res.render("footer/services/services");
});

router.get("/services/web-development", function (req, res) {
  res.render("footer/services/service-detail-web");
});

router.get("/our-team", function (req, res) {
  TeamMember.find(function (err, teamMembers) {
    res.render("footer/team/our-team", {
      team: teamMembers,
    });
  });
});

router.get("/team-member-detail", function (req, res) {
  try {
    TeamMember.findOne({ _id: req.query.id }, function (err, member) {
      if (err) {
        res.render("top-navigations/resources/404", {
          error_msg: "Ooooops..... The page could not be found",
        });
      } else if (member == undefined) {
        res.render("top-navigations/resources/404", {
          error_msg: "Ooooops..... The page could not be found",
        });
      } else {
        TeamMember.findOne({ memberName: member.memberPartner }, function (
          err,
          partner
        ) {
          res.render("footer/team/team-member-detail", {
            member: member,
            partner: partner,
          });
        });
      }
    });
  } catch (error) {
    res.render("top-navigations/resources/404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

//================== Subscription Handler ======================
router.post("/subscribe", function(req, res){
  const newSubscriber = new Subscriber({
    name: req.body.name,
    email: req.body.email,
    timeSubscribed: new Date().toLocaleTimeString() + ' on ' + new Date().toDateString()
  });

  newSubscriber.save().then((subscribed)=>{
    res.send({
      text:
        "Your subcription was successful",
      _id: subscribed.insertedId,
    });
  })
})

router.get("/careers", function (req, res) {
  res.render("footer/careers");
});

router.get("/policy/privacy", function (req, res) {
  res.render("footer/policy/privacy");
});

router.get("/policy/terms", function (req, res) {
  res.render("footer/policy/terms");
});

router.get("/faq", function (req, res) {
  res.render("footer/faq");
});

module.exports = router;
