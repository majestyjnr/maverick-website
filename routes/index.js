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
  Podcast.find(function (err, podcast) {
    Blog.find()
      .limit(5)
      .then((blog) => {
        res.render("index", {
          blog: blog,
          podcast: podcast,
        });
      });
  });
});

// =========================== Resources ==============================
router.get("/blog", function (req, res) {
  Podcast.find(function (err, podcast) {
    Blog.find(function (err, allPosts) {
      res.render("top-navigations/resources/blog", {
        blog: allPosts,
        podcast: podcast,
      });
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
        Admin.findOne(
          { adminName: detail.postedBy },
          function (err, blogPoster) {
            Podcast.find(function (err, podcast) {
              Blog.find(function (err, allPosts) {
                if (err) {
                  throw err;
                } else {
                  res.render("top-navigations/resources/blog-detail", {
                    admin: blogPoster,
                    podcast: podcast,
                    blog: detail,
                    allBlogs: allPosts,
                  });
                }
              });
            });
          }
        );
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
  Blog.find(function (err, allPosts) {
    Podcast.find(function (err, allPodcasts) {
      res.render("top-navigations/resources/podcast", {
        podcast: allPodcasts,
        blog: allPosts,
      });
    });
  });
});

router.get("/s", function (req, res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Podcast.find({ podcastTitle: regex }, function (err, podcastsFound) {
      if (err) {
      } else {
        Blog.find(function (err, allPosts) {
          Podcast.find(function (err, allPodcasts) {
            res.render("top-navigations/resources/search", {
              podcast: allPodcasts,
              blog: allPosts,
              searched: podcastsFound,
            });
          });
        });
      }
    });
  }
});

router.get("/sb", function (req, res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Blog.find({ blogTitle: regex }, function (err, blogFound) {
      if (err) {
      } else {
        Blog.find(function (err, allPosts) {
          Podcast.find(function (err, allPodcasts) {
            res.render("top-navigations/resources/searchblog", {
              podcast: allPodcasts,
              blog: allPosts,
              searched: blogFound,
            });
          });
        });
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
        Admin.findOne(
          { adminName: detail.postedBy },
          function (err, podcastPoster) {
            Blog.find(function (err, allPosts) {
              Podcast.find(function (err, allPodcasts) {
                res.render("top-navigations/resources/podcast-detail", {
                  podcast: detail,
                  allPodcasts: allPodcasts,
                  blog: allPosts,
                  admin: podcastPoster,
                });
              }).limit(5);
            });
          }
        );
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
  Podcast.find(function (err, podcast) {
    Blog.find(function (err, allPosts) {
      res.render("top-navigations/contact/contact-us", {
        blog: allPosts,
        podcast: podcast,
      });
    });
  });
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
  Podcast.find(function (err, podcast) {
    Blog.find(function (err, allPosts) {
      TeamMember.find(function (err, teamMembers) {
        res.render("middle/who", {
          team: teamMembers,
          blog: allPosts,
          podcast: podcast,
        });
      });
    });
  });
});

router.get("/What", function (req, res) {
  Podcast.find(function (err, podcast) {
    Blog.find(function (err, allPosts) {
      res.render("middle/what", {
        blog: allPosts,
        podcast: podcast,
      });
    });
  });
});

router.get("/Why", function (req, res) {
  Podcast.find(function (err, podcast) {
    Blog.find(function (err, allPosts) {
      res.render("middle/why", {
        blog: allPosts,
        podcast: podcast,
      });
    });
  });
});

router.get("/How", function (req, res) {
  Podcast.find(function (err, podcast) {
    Blog.find(function (err, allPosts) {
      res.render("middle/how", {
        podcast: podcast,
        blog: allPosts,
      });
    });
  });
});

router.get("/Work-culture", function (req, res) {
  Podcast.find(function (err, podcast) {
    Blog.find(function (err, allPosts) {
      res.render("middle/work-culture", {
        podcast: podcast,
        blog: allPosts,
      });
    });
  });
});

router.get("/Products", function (req, res) {
  Podcast.find(function (err, podcast) {
    Blog.find(function (err, allPosts) {
      res.render("middle/products", {
        podcast: podcast,
        blog: allPosts,
      });
    });
  });
});

// =========================== Footer ==========================
router.get("/services", function (req, res) {
  Podcast.find(function (err, podcast) {
    Blog.find(function (err, allPosts) {
      res.render("footer/services/services", {
        podcast: podcast,
        blog: allPosts,
      });
    });
  });
});

router.get("/services/web-development", function (req, res) {
  res.render("footer/services/service-detail-web");
});

router.get("/our-team", function (req, res) {
  Podcast.find(function (err, podcast) {
    Blog.find(function (err, allPosts) {
      TeamMember.find(function (err, teamMembers) {
        res.render("footer/team/our-team", {
          team: teamMembers,
          blog: allPosts,
          podcast: podcast,
        });
      });
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
        Podcast.find(function (err, podcast) {
          Blog.find(function (err, allPosts) {
            TeamMember.findOne(
              { memberName: member.memberPartner },
              function (err, partner) {
                res.render("footer/team/team-member-detail", {
                  member: member,
                  partner: partner,
                  podcast: podcast,
                  blog: allPosts,
                });
              }
            );
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
router.post("/subscribe", function (req, res) {
  const newSubscriber = new Subscriber({
    name: req.body.name,
    email: req.body.email,
    timeSubscribed:
      new Date().toLocaleTimeString() + " on " + new Date().toDateString(),
  });

  newSubscriber.save().then((subscribed) => {
    res.send({
      text: "Your subcription was successful",
      _id: subscribed.insertedId,
    });
  });
});

router.get("/careers", function (req, res) {
  Podcast.find(function (err, podcast) {
    Blog.find(function (err, allPosts) {
      res.render("footer/careers", {
        podcast: podcast,
        blog: allPosts,
      });
    });
  });
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

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
