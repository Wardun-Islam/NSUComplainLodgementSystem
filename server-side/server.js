const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const knex = require("knex");
const crypto = require("crypto");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const { createNodeRedisClient } = require("handy-redis");
const nodemailer = require("nodemailer");
const cors = require("cors");
const requestify = require("requestify");

// Database Setup
const db = knex({
  client: "pg",
  connection: "postgres://postgres:1234@localhost:5432/reading-progress-tracker-db",
});
const redisClient = createNodeRedisClient({
  host: "redis-12322.c259.us-central1-2.gce.cloud.redislabs.com",
  port: Number(12322),
  password: "2NOM5P9G3app2fnAsjFqAlpwdaIQPvEj",
});

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(fileUpload());
app.use(cors());
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile("img.png", {
    root: __dirname,
  });
});

//----------------/post/assignment_student_image----------//

app.post("/post/assignment_student_image", (req, res) => {
  const { assignmentId, page_number } = req.body;
  const { authorization } = req.headers;
  console.log(req.body);
  console.log(req.files);
  var image = null;
  var image_name = null;
  if (req.files) {
    image = req.files.image;
    image_name = req.files.image.name;
  }

  if (!authorization || !assignmentId || !page_number || !image) {
    console.log("Some data are missing for make post an assignment");
    return res.status(400).json({
      resistered: false,
      reason: "Some data are missing for make post an assignment",
    });
  }

  if (authorization) {
    redisClient
      .get(authorization)
      .then((value) => {
        var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
        console.log(decoded.user_id);
        console.log(value);
        if (decoded.user_id === value) {
          db.select()
            .from("users")
            .where("user_id", "=", value)
            .then((data) => {
              if (data[0] != null && data[0].account_type === "student") {
                image_name = Date.now().toString() + image_name;
                const image_upload_path =
                  __dirname + "/public/assignment_image/" + image_name;
                var image_link =
                  "http://localhost:4000/assignment_image/" + image_name;

                image
                  .mv(image_upload_path)
                  .then(() => {
                    //let imageLinkList = req.body.imageLinkList;
                    console.log(data[0]);
                    const user = data[0];
                    let imageLinkList = [image_link, user.user_image];

                    let results = [];
                    let return_results = [];
                    let imageArray = [];
                    for (let i = 0; i < imageLinkList.length; i++) {
                      imageArray.push(
                        axios({
                          method: "get",
                          url: imageLinkList[i],
                          responseType: "arraybuffer",
                        })
                      );
                    }

                    Promise.all(imageArray)
                      .then(function (response) {
                        const baseImageData = response.pop();
                        const baseImage =
                          "data:" +
                          baseImageData.headers["content-type"] +
                          ";base64," +
                          Buffer.from(baseImageData.data, "binary").toString(
                            "base64"
                          );
                        response.map((res) => {
                          const targetImage =
                            "data:" +
                            res.headers["content-type"] +
                            ";base64," +
                            Buffer.from(res.data, "binary").toString("base64");

                          const options = {
                            method: "POST",
                            url: "https://face-verification2.p.rapidapi.com/faceverification",
                            headers: {
                              "content-type":
                                "application/x-www-form-urlencoded",
                              "x-rapidapi-host":
                                "face-verification2.p.rapidapi.com",
                              "x-rapidapi-key":
                                "02bbcb3687msh976510d46a35802p15145ejsn75713d852f93",
                              useQueryString: true,
                            },
                            form: {
                              image1Base64: baseImage,
                              image2Base64: targetImage,
                            },
                          };

                          results.push(
                            new Promise(function (resolve, reject) {
                              request(
                                options,
                                function (error, response, body) {
                                  if (error) return reject(error);
                                  resolve(body);
                                }
                              );
                            })
                          );
                        });

                        Promise.all(results)
                          .then(function (data) {
                            data.map((result) => {
                              return_results.push(
                                JSON.parse(result).data.similarPercent > 90
                              );
                            });
                            db("assignment_student_image")
                              .insert({
                                asi_id: Date.now().toString(),
                                assignment_id: assignmentId,
                                student_id: user.user_id,
                                page_number: page_number,
                                is_user: return_results[0],
                                post_date: new Date().getTime(),
                                image_link: image_link,
                              })
                              .returning("assignment_id")
                              .then((assignment_id) => {
                                if (assignment_id) {
                                  res.status(200).json({
                                    post: true,
                                  });
                                } else {
                                  console.log(
                                    "failed to store in database due to database error"
                                  );
                                  return res.status(400).json({
                                    post: false,
                                    reason:
                                      "failed to store in database due to database error",
                                  });
                                }
                              })
                              .catch((error) => {
                                console.log("error 1");
                                console.log(error);
                                return res.status(400).json({
                                  post: false,
                                  reason: error,
                                });
                              });
                            console.log(return_results);
                          })
                          .catch(function (error) {
                            console.error(error);
                          });
                      })
                      .catch(function (error) {
                        console.error(error);
                      });
                  })
                  .catch((err) => {
                    console.log("error 2");
                    console.log(err);
                    if (err.detail) {
                      fs.unlink(image_upload_path, (delete_err) => {
                        if (delete_err) {
                          console.log("File uploaded but not deleted");
                          console.log(delete_err);
                        }
                        return res.status(400).json({
                          post: false,
                          reason: err.detail,
                        });
                      });
                    } else {
                      return res.status(400).json({
                        post: false,
                        reason: err,
                      });
                    }
                  });
              } else {
                console.log("authorization code is not valid.");
                return res.status(400).send({
                  post: false,
                  reason: "authorization code is not valid.",
                });
              }
            })
            .catch((err) => {
              console.log(err);
              return res.status(400).send({
                post: false,
                reason: err,
              });
            });
        } else {
          return res.status(400).send({
            post: false,
            reason: "authorization code is not valid.",
          });
        }
      })
      .catch((err) => {
        return res.status(400).send({
          post: false,
          reason: err,
        });
      });
  } else {
    return res.status(400).send({
      post: false,
      reason: "no authorization code found.",
    });
  }
});

//------------microsoft face api------//

const request = require("request");
const axios = require("axios").default;

app.get("/face-verification", function (req, res) {
  let imageLinkList = req.body.imageLinkList;
  // let imageLinkList = [
  //   "http://localhost:4000/users_image/teacher/1631195013770186561361_4624137624270050_7701942483650771542_n.jpg",
  //   "http://localhost:4000/users_image/student/1631181769288186503074_188494006477558_480962108962125401_n.jpg",
  //   "http://localhost:4000/users_image/student/1631098477753187723650_513963496298866_4416803757601633302_n.jpg",
  //   "https://image.shutterstock.com/image-photo/barcelona-feb-23-lionel-messi-260nw-1900547713.jpg",
  //   "https://thumbs.dreamstime.com/b/close-up-portrait-nice-person-bristle-show-finger-okey-sign-isolated-pink-color-background-203466939.jpg",
  //   "http://localhost:4000/users_image/student/1631471608478187146171_4158989807471465_1743531222552345495_n.jpg",
  // ];

  let results = [];
  let return_results = [];
  let imageArray = [];
  for (let i = 0; i < imageLinkList.length; i++) {
    imageArray.push(
      axios({
        method: "get",
        url: imageLinkList[i],
        responseType: "arraybuffer",
      })
    );
  }
console.log(imageArray);
  Promise.all(imageArray)
    .then(function (response) {
      const baseImageData = response.pop();
      const baseImage =
        "data:" +
        baseImageData.headers["content-type"] +
        ";base64," +
        Buffer.from(baseImageData.data, "binary").toString("base64");
      response.map((res) => {
        const targetImage =
          "data:" +
          res.headers["content-type"] +
          ";base64," +
          Buffer.from(res.data, "binary").toString("base64");

        const options = {
          method: "POST",
          url: "https://face-verification2.p.rapidapi.com/faceverification",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "x-rapidapi-host": "face-verification2.p.rapidapi.com",
            "x-rapidapi-key":
              "02bbcb3687msh976510d46a35802p15145ejsn75713d852f93",
            useQueryString: true,
          },
          form: {
            image1Base64: baseImage,
            image2Base64: targetImage,
          },
        };

        results.push(
          new Promise(function (resolve, reject) {
            request(options, function (error, response, body) {
              if (error) return reject(error);
              resolve(body);
            });
          })
        );
      });

      Promise.all(results)
        .then(function (data) {
          data.map((result) => {
            return_results.push(JSON.parse(result).data.similarPercent > 90);
          });
          res.status(200).json({
            result: return_results,
          });
          console.log(return_results);
        })
        .catch(function (error) {
          console.error(error);
        });
    })
    .catch(function (error) {
      console.error(error);
    });
});

//check google user IsUser --------------------
app.get("/user", function (req, res) {
  const token = req.query.token;
  if (token != null) {
    requestify
      .get("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + token)
      .then(function (response) {
        const email = response.getBody().email;
        db.select("email")
          .from("users")
          .where("email", "=", email)
          .then((data) => {
            if (data[0] != null) {
              return res.status(200).json({
                isUser: true,
              });
            } else {
              res.status(200).json({
                isUser: false,
              });
            }
          })
          .catch((err) => {
            return res.status(200).json({
              isUser: false,
            });
          });
      })
      .catch((err) => {
        return res.status(200).json({
          isUser: false,
        });
      });
  } else {
    return res.status(200).json({
      isUser: false,
    });
  }
});

//---------------get user------------

app.post("/get/user", (req, res) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (authorization) {
    redisClient
      .get(authorization)
      .then((value) => {
        var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
        console.log(decoded.user_id);
        console.log(value);
        if (decoded.user_id === value) {
          db.select()
            .from("users")
            .where("user_id", "=", value)
            .then((data) => {
              if (data[0] != null) {
                console.log(data[0]);
                const user = {
                  email: data[0].email,
                  first_name: data[0].first_name,
                  last_name: data[0].last_name,
                  account_type: data[0].account_type,
                  user_image: data[0].user_image,
                };
                return res.status(200).send({
                  user: user,
                });
              } else {
                return res.status(400).send({
                  user: null,
                  reason: "authorization code is not valid.",
                });
              }
            })
            .catch((err) => {
              return res.status(400).send({
                user: null,
                reason: err,
              });
            });
        } else
          return res.status(400).send({
            user: null,
            reason: "authorization code is not valid.",
          });
      })
      .catch((err) => {
        return res.status(400).send({
          classroon_add: "failed",
          reason: err,
        });
      });
  } else {
    return res.status(400).send({
      user: null,
      reason: "no authorization code found.",
    });
  }
});



//-------------------"/get/students/images"--------------//


app.post("/get/students/images", (req, res) => {
  const { assignment_id, student_id } = req.body;
          db.select()
            .from("assignment_student_image")
            .where({
              assignment_id: assignment_id,
              student_id: student_id,
            })
            .then((data) => {
              console.log(data);
              return res.status(200).send({
                studentImage: data,
              });
            })
            .catch((err) => {
              return res.status(400).send({
                studentImage: null,
                reason: err,
              });
            });
});




//------------------"/get/students"------------------//

app.post("/get/students", (req, res) => {
  const { assignment_id } = req.body;
  const { authorization } = req.headers;
  console.log(authorization);
  if (authorization) {
    redisClient
      .get(authorization)
      .then((value) => {
        var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
        console.log(decoded.user_id);
        console.log(value);
        if (decoded.user_id === value) {
          //           select first_name, last_name, user_image from assignment
          //           join class_student on assignment.class_id = class_student.class_id
          //           join users on class_student.student_id=users.user_id
          //           where assignment_id = '1631522916078'

          db.select("user_id","first_name", "last_name", "user_image")
            .from("assignment")
            .join(
              "class_student",
              "assignment.class_id",
              "class_student.class_id"
            )
            .join("users", "class_student.student_id", "users.user_id")
            .where("assignment_id", "=", assignment_id)
            .then((data) => {
              console.log(data);
              return res.status(200).send({
                students: data,
              });
            })
            .catch((err) => {
              console.log(err);
              return res.status(400).send({
                students: null,
                reason: "authorization code is not valid.",
              });
            });
        } else
          return res.status(400).send({
            students: null,
            reason: "authorization code is not valid.",
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).send({
          students: null,
          reason: err,
        });
      });
  } else {
    return res.status(400).send({
      students: null,
      reason: "no authorization code found.",
    });
  }
});













//-----------post comment--------------//
//post/comment

app.post("/post/comment", (req, res) => {
  const { assignment_id, comment } = req.body;
  const { authorization } = req.headers;
  if (!authorization || !assignment_id) {
    console.log("Some data are missing for make post an assignment");
    return res.status(400).json({
      resistered: false,
      reason: "Some data are missing for make post an assignment",
    });
  }

  if (authorization) {
    redisClient
      .get(authorization)
      .then((value) => {
        var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
        if (decoded.user_id === value) {
          db.select("account_type", "user_id")
            .from("users")
            .where("user_id", "=", value)
            .then((data) => {
              if (data[0]) {
                console.log(data[0].user_id);
                db("comments")
                  .insert({
                    comment_id: Date.now().toString(),
                    assignment_id: assignment_id,
                    comment: comment,
                    comment_time: new Date(),
                    commenter_id: data[0].user_id,
                    record_link: null,
                  })
                  .returning("comment_id")
                  .then((comment_id) => {
                    if (comment_id) {
                      res.status(200).json({
                        post: true,
                      });
                    } else {
                      console.log(
                        "failed to store in database due to database error"
                      );
                      return res.status(400).json({
                        post: false,
                        reason:
                          "failed to store in database due to database error",
                      });
                    }
                  })
                  .catch((error) => {
                    console.log("error 2");
                    console.log(error);
                    return res.status(400).json({
                      post: false,
                      reason: error,
                    });
                  });
              } else {
                console.log("error 1");
                return res.status(400).send({
                  post: false,
                  reason: err,
                });
              }
            })
            .catch((err) => {
              console.log(err);
              return res.status(400).send({
                post: false,
                reason: err,
              });
            });
        } else {
          return res.status(400).send({
            post: false,
            reason: "authorization code is not valid.",
          });
        }
      })
      .catch((err) => {
        return res.status(400).send({
          post: false,
          reason: err,
        });
      });
  } else {
    return res.status(400).send({
      post: false,
      reason: "no authorization code found.",
    });
  }
});

//------------------"/post/comment_record"----------------//

app.post("/post/comment_record", (req, res) => {
  const { assignment_id } = req.body;
  const { authorization } = req.headers;
  const record = req.files.pdf;
  const record_name = req.files.pdf.name;
  console.log(req.files.recordBlob);
  record_name = Date.now().toString() + record_name;
  const record_upload_path = __dirname + "/public/record/" + "/" + record_name;
  var pdf_link = "http://localhost:4000/record/" + record_name;
});

//-----------"/get/comments"--------------//

app.post("/get/comments", (req, res) => {
  const { assignment_id } = req.body;
  console.log(assignment_id);
  db("comments")
    .join("users", "users.user_id", "comments.commenter_id")
    .select(
      "users.first_name",
      "users.last_name",
      "comments.comment",
      "comments.comment_time",
      "comments.record_link"
    )
    .where("comments.assignment_id", "=", assignment_id)
    .then((data) => {
      console.log(data);
      return res.status(200).json({
        comments: data,
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({
        comments: null,
        reason: error,
      });
    });
});

//-----------------post assignment-------------//
//post/assignment

app.post("/post/assignment", (req, res) => {
  const { post_description, class_id } = req.body;
  const { authorization } = req.headers;
  console.log(req.body);
  console.log(req.files);
  var pdf = null;
  var pdf_name = null;
  if (req.files) {
    pdf = req.files.pdf;
    pdf_name = req.files.pdf.name;
  }

  if (!authorization || !post_description || !class_id || !pdf) {
    console.log("Some data are missing for make post an assignment");
    return res.status(400).json({
      resistered: false,
      reason: "Some data are missing for make post an assignment",
    });
  }

  pdf_name = Date.now().toString() + pdf_name;
  const pdf_upload_path = __dirname + "/public/pdf/" + "/" + pdf_name;
  var pdf_link = "http://localhost:4000/pdf/" + pdf_name;

  if (authorization) {
    redisClient
      .get(authorization)
      .then((value) => {
        var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
        console.log(decoded.user_id);
        console.log(value);
        if (decoded.user_id === value) {
          db.select("account_type", "user_id")
            .from("users")
            .where("user_id", "=", value)
            .then((data) => {
              if (data[0] != null && data[0].account_type === "teacher") {
                db("class_room")
                  .where({
                    teacher_id: data[0].user_id,
                    class_room_id: class_id,
                  })
                  .then((data) => {
                    if (data[0] != null) {
                      pdf
                        .mv(pdf_upload_path)
                        .then(() => {
                          return db("assignment")
                            .insert({
                              assignment_id: Date.now().toString(),
                              class_id: class_id,
                              post_description: post_description,
                              post_date: new Date(),
                              pdf_link: pdf_link,
                            })
                            .returning("assignment_id")
                            .then((assignment_id) => {
                              if (assignment_id) {
                                res.status(200).json({
                                  post: true,
                                });
                              } else {
                                console.log(
                                  "failed to store in database due to database error"
                                );
                                return res.status(400).json({
                                  post: false,
                                  reason:
                                    "failed to store in database due to database error",
                                });
                              }
                            })
                            .catch((error) => {
                              console.log("error 1");
                              console.log(error);
                              return res.status(400).json({
                                post: false,
                                reason: error,
                              });
                            });
                        })
                        .catch((err) => {
                          console.log("error 2");
                          console.log(err);
                          if (err.detail) {
                            fs.unlink(uploadPath, (delete_err) => {
                              if (delete_err) {
                                console.log("File uploaded but not deleted");
                                console.log(delete_err);
                              }
                              return res.status(400).json({
                                post: false,
                                reason: err.detail,
                              });
                            });
                          } else {
                            return res.status(400).json({
                              post: false,
                              reason: err,
                            });
                          }
                        });
                    } else {
                      console.log(
                        "teacher is not authorized to post in this class"
                      );
                      return res.status(400).send({
                        post: false,
                        reason:
                          "teacher is not authorized to post in this class",
                      });
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                    return res.status(400).send({
                      post: false,
                      reason: err,
                    });
                  });
              } else {
                console.log("authorization code is not valid.");
                return res.status(400).send({
                  post: false,
                  reason: "authorization code is not valid.",
                });
              }
            })
            .catch((err) => {
              console.log(err);
              return res.status(400).send({
                post: false,
                reason: err,
              });
            });
        } else {
          return res.status(400).send({
            post: false,
            reason: "authorization code is not valid.",
          });
        }
      })
      .catch((err) => {
        return res.status(400).send({
          post: false,
          reason: err,
        });
      });
  } else {
    return res.status(400).send({
      post: false,
      reason: "no authorization code found.",
    });
  }
});

//-----------"/get/assignment"--------------//

app.post("/get/assignment", (req, res) => {
  const { assignment_id } = req.body;
  console.log(assignment_id);
  db("assignment")
    .where({
      assignment_id: assignment_id,
    })
    .then((data) => {
      console.log(data);
      return res.status(200).json({
        assignment: data[0],
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({
        assignment: null,
        reason: error,
      });
    });
});

//-----------"/get/assignments"--------------//

app.post("/get/assignments", (req, res) => {
  const { class_id } = req.body;
  const { authorization } = req.headers;
  console.log(req.body);

  if (!authorization || !class_id) {
    console.log("Some data are missing for make get an assignment");
    return res.status(400).json({
      assignments: null,
      reason: "Some data are missing for make get an assignment",
    });
  }

  if (authorization) {
    redisClient
      .get(authorization)
      .then((value) => {
        var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
        console.log(decoded.user_id);
        console.log(value);
        if (decoded.user_id === value) {
          db.select("account_type", "user_id")
            .from("users")
            .where("user_id", "=", value)
            .then((data) => {
              if (data[0] != null) {
                if (data[0].account_type === "teacher") {
                  db.select("teacher_id")
                    .from("class_room")
                    .where({
                      teacher_id: data[0].user_id,
                      class_room_id: class_id,
                    })
                    .then((data) => {
                      if (data[0] != null) {
                        db("assignment")
                          .where({
                            class_id: class_id,
                          })
                          .then((assignments) => {
                            return res.status(200).json({
                              assignments: assignments,
                            });
                          })
                          .catch((error) => {
                            console.log(error);
                            return res.status(400).json({
                              assignments: null,
                              reason: error,
                            });
                          });
                      } else {
                        console.log(
                          "user is not authorized to get the assignments"
                        );
                        return res.status(400).send({
                          assignments: null,
                          reason:
                            "user is not authorized to get the assignments",
                        });
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                      return res.status(400).send({
                        assignments: null,
                        reason: err,
                      });
                    });
                } else {
                  db.select("student_id")
                    .from("class_student")
                    .where({
                      student_id: data[0].user_id,
                      class_id: class_id,
                    })
                    .then((data) => {
                      if (data[0] != null) {
                        db("assignment")
                          .where({
                            class_id: class_id,
                          })
                          .then((assignments) => {
                            return res.status(200).json({
                              assignments: assignments,
                            });
                          })
                          .catch((error) => {
                            console.log(error);
                            return res.status(400).json({
                              assignments: null,
                              reason: error,
                            });
                          });
                      } else {
                        console.log(
                          "user is not authorized to get the assignments"
                        );
                        return res.status(400).send({
                          assignments: null,
                          reason:
                            "user is not authorized to get the assignments",
                        });
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                      return res.status(400).send({
                        assignments: null,
                        reason: err,
                      });
                    });
                }
              } else {
                console.log("user is not authorized to get this class");
                return res.status(400).send({
                  assignments: null,
                  reason: "user is not authorized to get this class",
                });
              }
            })
            .catch((err) => {
              console.log(err);
              return res.status(400).send({
                assignments: null,
                reason: err,
              });
            });
        } else {
          return res.status(400).send({
            assignments: null,
            reason: "authorization code is not valid.",
          });
        }
      })
      .catch((err) => {
        return res.status(400).send({
          assignments: null,
          reason: err,
        });
      });
  } else {
    return res.status(400).send({
      assignments: null,
      reason: "no authorization code found.",
    });
  }
});

//----------------get classroom_info---------//
///get/classroom_info

app.post("/get/classroom_info", (req, res) => {
  const { authorization } = req.headers;
  const { class_id } = req.body;
  console.log(authorization);
  if (authorization) {
    redisClient
      .get(authorization)
      .then((value) => {
        var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
        console.log(decoded.user_id);
        console.log(value);
        if (decoded.user_id === value) {
          db.select("account_type", "user_id")
            .from("users")
            .where("user_id", "=", value)
            .then((data) => {
              if (data[0] != null) {
                console.log(data[0].account_type);
                if (data[0].account_type === "teacher") {
                  if (data[0] != null) {
                    db("class_room")
                      .where({
                        teacher_id: data[0].user_id,
                        class_room_id: class_id,
                      })
                      .then((data) => {
                        if (data[0] != null) {
                          return res.status(200).send({
                            class_info: data,
                          });
                        } else {
                          return res.status(400).send({
                            class_info: null,
                            reason:
                              "this teacher is not authorized for this class.",
                          });
                        }
                      })
                      .catch((err) => {
                        return res.status(400).send({
                          class_info: null,
                          reason: err,
                        });
                      });
                  } else {
                    return res.status(400).send({
                      class_info: null,
                      reason: "this teacher is not authorized for this class.",
                    });
                  }
                } else {
                  console.log(data[0].user_id);
                  console.log(class_id);
                  db("class_student")
                    .where({
                      student_id: data[0].user_id,
                      class_id: class_id,
                    })
                    .then((data) => {
                      console.log(data);
                      if (data[0] != null) {
                        db("class_room")
                          .where("class_room_id", class_id)
                          .then((data) => {
                            return res.status(200).send({
                              class_info: data,
                            });
                          })
                          .catch((err) => {
                            return res.status(400).send({
                              class_info: null,
                              reason: err,
                            });
                          });
                      } else {
                        return res.status(400).send({
                          class_info: null,
                          reason:
                            "this student is not authorized for this class.",
                        });
                      }
                    })
                    .catch((err) => {
                      return res.status(400).send({
                        class_info: null,
                        reason: err,
                      });
                    });
                }
              } else {
                return res.status(400).send({
                  class_info: null,
                  reason: "authorization code is not valid.",
                });
              }
            })
            .catch((err) => {
              return res.status(400).send({
                class_info: null,
                reason: err,
              });
            });
        } else
          return res.status(400).send({
            class_info: null,
            reason: "authorization code is not valid.",
          });
      })
      .catch((err) => {
        return res.status(400).send({
          classroon_add: "failed",
          reason: err,
        });
      });
  } else {
    return res.status(400).send({
      user: null,
      reason: "no authorization code found.",
    });
  }
});

//---------------get classroom------------//

app.post("/get/classroom", (req, res) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (authorization) {
    redisClient
      .get(authorization)
      .then((value) => {
        var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
        console.log(decoded.user_id);
        console.log(value);
        if (decoded.user_id === value) {
          db.select("account_type", "user_id")
            .from("users")
            .where("user_id", "=", value)
            .then((data) => {
              if (data[0] != null) {
                console.log(data[0].account_type);
                if (data[0].account_type === "teacher") {
                  db("class_room")
                    .where("teacher_id", data[0].user_id)
                    .then((data) => {
                      return res.status(200).send({
                        classroom: data,
                      });
                    })
                    .catch((err) => {
                      return res.status(400).send({
                        classroom: null,
                        reason: err,
                      });
                    });
                } else {
                  db("class_student")
                    .where("student_id", data[0].user_id)
                    .then((data) => {
                      let class_room_ids = data.map((class_data) => {
                        return class_data.class_id;
                      });
                      db("class_room")
                        .whereIn("class_room_id", class_room_ids)
                        .then((data) => {
                          return res.status(200).send({
                            classroom: data,
                          });
                        })
                        .catch((err) => {
                          return res.status(400).send({
                            classroom: null,
                            reason: err,
                          });
                        });
                    })
                    .catch((err) => {
                      return res.status(400).send({
                        classroom: null,
                        reason: err,
                      });
                    });
                }
              } else {
                return res.status(400).send({
                  classroom: null,
                  reason: "authorization code is not valid.",
                });
              }
            })
            .catch((err) => {
              return res.status(400).send({
                classroom: null,
                reason: err,
              });
            });
        } else
          return res.status(400).send({
            classroom: null,
            reason: "authorization code is not valid.",
          });
      })
      .catch((err) => {
        return res.status(400).send({
          classroon_add: "failed",
          reason: err,
        });
      });
  } else {
    return res.status(400).send({
      user: null,
      reason: "no authorization code found.",
    });
  }
});

//---------------/join/classroom------------//

app.post("/join/classroom", (req, res) => {
  const { authorization } = req.headers;
  const { class_code } = req.body;
  let user_id;
  if (class_code && authorization) {
    redisClient
      .get(authorization)
      .then((value) => {
        var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
        console.log(decoded.user_id);
        user_id = value;
        if (decoded.user_id === value) {
          db.select("account_type")
            .from("users")
            .where("user_id", "=", value)
            .then((data) => {
              if (data[0] != null) {
                console.log(data[0].account_type);
                if (data[0].account_type === "student") {
                  db.select("class_room_id")
                    .from("class_room")
                    .where("class_room_id", "=", class_code)
                    .then((data) => {
                      if (data[0] != null) {
                        console.log(data[0]);
                        if (data[0].class_room_id === class_code) {
                          db("class_student")
                            .insert({
                              class_id: data[0].class_room_id,
                              student_id: user_id,
                              joined_date: new Date(),
                            })
                            .returning("class_id")
                            .then((class_id) => {
                              return res.status(200).send({
                                classroom_join: "successful",
                              });
                            })
                            .catch((err) => {
                              console.log(err);
                              return res.status(400).send({
                                classroom_join: "failed",
                                reason: err,
                              });
                            });
                        } else {
                          return res.status(400).send({
                            classroom_join: "failed",
                            reason: "wrong classcode.",
                          });
                        }
                      } else {
                        return res.status(400).send({
                          classroom_join: "failed",
                          reason: "invalid classcode.",
                        });
                      }
                    })
                    .catch((err) => {
                      return res.status(400).send({
                        classroom_join: "failed",
                        reason: err,
                      });
                    });
                } else {
                  return res.status(400).send({
                    classroom_join: "failed",
                    reason: "teacher are not allowed to join class.",
                  });
                }
              } else {
                return res.status(400).send({
                  classroom_join: "failed",
                  reason: "authorization code is not valid.",
                });
              }
            })
            .catch((err) => {
              return res.status(400).send({
                classroom_join: "failed",
                reason: err,
              });
            });
        } else
          return res.status(400).send({
            classroom_join: "failed",
            reason: "authorization code is not valid.",
          });
      })
      .catch((err) => {
        return res.status(400).send({
          classroom_join: "failed",
          reason: err,
        });
      });
  } else {
    return res.status(400).send({
      classroom_join: "failed",
      reason: "no authorization code found.",
    });
  }
});

//---------------add classroom------------

app.post("/add/classroom", (req, res) => {
  const { authorization } = req.headers;
  const { class_room_name, section } = req.body;
  if (class_room_name && authorization) {
    redisClient
      .get(authorization)
      .then((value) => {
        var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
        console.log(decoded.user_id);
        if (decoded.user_id === value) {
          db.select("account_type")
            .from("users")
            .where("user_id", "=", value)
            .then((data) => {
              if (data[0] != null) {
                console.log(data[0].account_type);
                if (data[0].account_type === "teacher") {
                  db("class_room")
                    .insert({
                      class_room_id: Date.now().toString(),
                      name: class_room_name,
                      section: section,
                      teacher_id: value,
                      created: new Date(),
                    })
                    .returning("class_room_id")
                    .then((class_room_id) => {
                      return res.status(200).send({
                        classroon_add: "successful",
                      });
                    })
                    .catch((err) => {
                      return res.status(400).send({
                        classroon_add: "failed",
                        reason: err,
                      });
                    });
                } else {
                  return res.status(400).send({
                    classroon_add: "failed",
                    reason: "student are not allowed to create class.",
                  });
                }
              } else {
                return res.status(400).send({
                  classroon_add: "failed",
                  reason: "authorization code is not valid.",
                });
              }
            })
            .catch((err) => {
              return res.status(400).send({
                classroon_add: "failed",
                reason: err,
              });
            });
        } else
          return res.status(400).send({
            classroon_add: "failed",
            reason: "authorization code is not valid.",
          });
      })
      .catch((err) => {
        return res.status(400).send({
          classroon_add: "failed",
          reason: err,
        });
      });
  } else {
    return res.status(400).send({
      classroon_add: "failed",
      reason: "no authorization code found.",
    });
  }
});

//-----------update user------------------//

app.post("/update/user", (req, res) => {
  const { first_name, last_name, account_type, image } = req.body;
  const { authorization } = req.headers;
  console.log(req.body);

  var user_image_name = null;
  var user_image = null;
  if (req.files) {
    user_image_name = req.files.user_image.name;
    user_image = req.files.user_image;
  }
  console.log(image);
  if (!first_name || !last_name || !account_type) {
    return res.status(400).json({
      update: false,
      reason: "incorrect form submission",
    });
  }

  if (
    !first_name.match(/^[a-zA-Z ]{2,30}$/) ||
    !last_name.match(/^[a-zA-Z ]{2,30}$/) ||
    (account_type !== "student" && account_type !== "teacher")
  ) {
    return res.status(400).json({
      update: false,
      reason: "incorrect form submission",
    });
  }

  if (account_type === "student" && user_image === null && !image) {
    console.log("student but no image");
    return res.status(400).json({
      update: false,
      reason: "image is required for student account",
    });
  }

  const user_image_name_initial = Date.now().toString();
  var uploadPath = null;
  var image_link = null;

  if (user_image) {
    user_image_name = user_image_name_initial + user_image_name;
    uploadPath =
      __dirname + "/public/users_image/" + account_type + "/" + user_image_name;
    image_link =
      "http://localhost:4000/users_image/" +
      account_type +
      "/" +
      user_image_name;
  }

  if (authorization) {
    console.log("authorization");
    redisClient
      .get(authorization)
      .then((value) => {
        var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
        if (decoded.user_id === value) {
          console.log("redis valid");
          if (image) {
            console.log("has image link");
            db("users")
              .where({
                user_id: value,
              })
              .update(
                {
                  first_name: first_name,
                  last_name: last_name,
                  user_image: image,
                },
                ["user_id"]
              )
              .then((user_id) => {
                if (user_id[0] != null) {
                  return res.status(200).json({
                    update: true,
                  });
                } else {
                  return res.status(400).json({
                    update: false,
                    reason: {
                      database_error: true,
                      file_upload_error: false,
                      detail: "failed to update user.",
                    },
                  });
                }
              })
              .catch((err) => {
                return res.status(400).json({
                  update: false,
                  reason: {
                    database_error: true,
                    file_upload_error: false,
                    detail: err.detail,
                  },
                });
              });
          } else if (!image && !user_image && account_type == "teacher") {
            console.log("has no image");
            db("users")
              .where({
                user_id: value,
              })
              .then((user) => {
                if (user[0]) {
                  if (
                    !user[0].user_image ||
                    user[0].user_image.includes("google")
                  ) {
                    db("users")
                      .where({
                        user_id: value,
                      })
                      .update(
                        {
                          first_name: first_name,
                          last_name: last_name,
                          user_image: null,
                        },
                        ["user_image"]
                      )
                      .then((data) => {
                        console.log(data[0].user_image);
                        if (data[0].user_image == null) {
                          console.log(data[0].user_image);
                          return res.status(200).json({
                            update: true,
                          });
                        } else {
                          return res.status(400).json({
                            update: false,
                            reason: {
                              database_error: true,
                              file_upload_error: false,
                              detail: "failed to update user.",
                            },
                          });
                        }
                      })
                      .catch((err) => {
                        console.log(err);
                        return res.status(400).json({
                          update: false,
                          reason: {
                            database_error: true,
                            file_upload_error: false,
                            detail: err.detail,
                          },
                        });
                      });
                  } else {
                    const deleteimage = user[0].user_image.split("/");
                    const delete_path =
                      __dirname +
                      "/public/users_image/" +
                      account_type +
                      "/" +
                      deleteimage[deleteimage.length - 1];
                    console.log(delete_path);
                    fs.unlink(delete_path, (delete_err) => {
                      if (delete_err) {
                        console.log("File  not deleted");
                        return res.status(400).json({
                          update: false,
                          reason: {
                            database_error: true,
                            file_upload_error: false,
                            detail: delete_err,
                          },
                        });
                      } else {
                        db("users")
                          .where({
                            user_id: value,
                          })
                          .update(
                            {
                              first_name: first_name,
                              last_name: last_name,
                              user_image: null,
                            },
                            ["user_image"]
                          )
                          .then((data) => {
                            console.log(data[0].user_image);
                            if (data[0].user_image == null) {
                              console.log(data[0].user_image);
                              return res.status(200).json({
                                update: true,
                              });
                            } else {
                              return res.status(400).json({
                                update: false,
                                reason: {
                                  database_error: true,
                                  file_upload_error: false,
                                  detail: "failed to update user.",
                                },
                              });
                            }
                          })
                          .catch((err) => {
                            console.log(err);
                            return res.status(400).json({
                              update: false,
                              reason: {
                                database_error: true,
                                file_upload_error: false,
                                detail: err.detail,
                              },
                            });
                          });
                      }
                    });
                  }
                } else {
                  return res.status(400).send({
                    update: "failed",
                    reason: "user not found.",
                  });
                }
              })
              .catch((err) => {
                return res.status(400).send({
                  update: "failed",
                  reason: err,
                });
              });
          } else {
            // delete image and store new image and data.
            //-----------------------------
            db("users")
              .where({
                user_id: value,
              })
              .then((user) => {
                if (user[0]) {
                  console.log("has image file");
                  console.log(user[0]);
                  if (
                    user[0].user_image &&
                    !user[0].user_image.includes("google")
                  ) {
                    const deleteimage = user[0].user_image.split("/");
                    const delete_path =
                      __dirname +
                      "/public/users_image/" +
                      account_type +
                      "/" +
                      deleteimage[deleteimage.length - 1];
                    console.log(delete_path);
                    fs.unlink(delete_path, (delete_err) => {
                      if (delete_err) {
                        console.log("File  not deleted");
                        return res.status(400).json({
                          update: false,
                          reason: {
                            database_error: true,
                            file_upload_error: false,
                            detail: delete_err,
                          },
                        });
                      } else {
                        user_image
                          .mv(uploadPath)
                          .then(() => {
                            db("users")
                              .where({
                                user_id: value,
                              })
                              .update(
                                {
                                  first_name: first_name,
                                  last_name: last_name,
                                  user_image: image_link,
                                },
                                ["user_image"]
                              )
                              .then((data) => {
                                console.log(data[0].user_image);
                                if (data[0].user_image != null) {
                                  console.log(data[0].user_image);
                                  return res.status(200).json({
                                    update: true,
                                  });
                                } else {
                                  console.log("error 8");
                                  return res.status(400).json({
                                    update: false,
                                    reason: {
                                      database_error: true,
                                      file_upload_error: false,
                                      detail: "failed to update user.",
                                    },
                                  });
                                }
                              })
                              .catch((err) => {
                                console.log("error 7");
                                console.log(err);
                                return res.status(400).json({
                                  update: false,
                                  reason: {
                                    database_error: true,
                                    file_upload_error: false,
                                    detail: err.detail,
                                  },
                                });
                              });
                          })
                          .catch((err) => {
                            if (err.detail) {
                              fs.unlink(uploadPath, (delete_err) => {
                                if (delete_err) {
                                  console.log("File uploaded but not deleted");
                                }
                                console.log("error 6");
                                return res.status(400).json({
                                  update: false,
                                  reason: {
                                    database_error: true,
                                    file_upload_error: false,
                                    detail: err.detail,
                                  },
                                });
                              });
                            } else {
                              console.log("error 5");
                              console.log(err);
                              return res.status(400).json({
                                update: false,
                                reason: {
                                  database_error: false,
                                  file_upload_error: true,
                                  detail: "failed to upload user image",
                                },
                              });
                            }
                          });
                      }
                    });
                  } else {
                    user_image
                      .mv(uploadPath)
                      .then(() => {
                        db("users")
                          .where({
                            user_id: value,
                          })
                          .update(
                            {
                              first_name: first_name,
                              last_name: last_name,
                              user_image: image_link,
                            },
                            ["user_image"]
                          )
                          .then((data) => {
                            console.log(data[0].user_image);
                            if (data[0].user_image != null) {
                              console.log(data[0].user_image);
                              return res.status(200).json({
                                update: true,
                              });
                            } else {
                              console.log("error 4");
                              return res.status(400).json({
                                update: false,
                                reason: {
                                  database_error: true,
                                  file_upload_error: false,
                                  detail: "failed to update user.",
                                },
                              });
                            }
                          })
                          .catch((err) => {
                            console.log("error 3");
                            console.log(err);
                            return res.status(400).json({
                              update: false,
                              reason: {
                                database_error: true,
                                file_upload_error: false,
                                detail: err.detail,
                              },
                            });
                          });
                      })
                      .catch((err) => {
                        if (err.detail) {
                          fs.unlink(uploadPath, (delete_err) => {
                            if (delete_err) {
                              console.log("File uploaded but not deleted");
                            }
                            return res.status(400).json({
                              update: false,
                              reason: {
                                database_error: true,
                                file_upload_error: false,
                                detail: err.detail,
                              },
                            });
                          });
                        } else {
                          console.log("error 3");
                          console.log(err);
                          return res.status(400).json({
                            update: false,
                            reason: {
                              database_error: false,
                              file_upload_error: true,
                              detail: "failed to upload user image",
                            },
                          });
                        }
                      });
                  }
                } else {
                  console.log("error 2");
                  return res.status(400).send({
                    update: "failed",
                    reason: "user not found.",
                  });
                }
              })
              .catch((err) => {
                console.log("error 1");
                console.log(err);
                return res.status(400).send({
                  update: "failed",
                  reason: err,
                });
              });
          }
        } else {
          console.log("redis invalid");
          return res.status(400).send({
            update: "failed",
            reason: "authorization code is not valid.",
          });
        }
      })
      .catch((err) => {
        console.log("redis error");
        return res.status(400).send({
          update: "failed",
          reason: err,
        });
      });
  } else {
    console.log("authorization failed");
    return res.status(400).send({
      update: "failed",
      reason: "no authorization code found.",
    });
  }
});

// SIgnIn -------------------

const signToken = (user_id) => {
  const jwtPayload = {
    user_id,
  };
  return jwt.sign(jwtPayload, "JWT_SECRET_KEY", {
    expiresIn: "2 days",
  });
};

const createSession = (user_id) => {
  const token = signToken(user_id);
  if (user_id && token) {
    return redisClient
      .set(token, user_id)
      .then((value) => {
        if (value === "OK") {
          return Promise.resolve({
            success: "true",
            user_id: user_id,
            token: token,
          });
        } else {
          return Promise.reject({
            signin: "failed",
            reason: "failed to store session",
          });
        }
      })
      .catch((err) =>
        Promise.reject({
          signin: "failed",
          reason: "failed to store session",
        })
      );
  } else {
    return Promise.reject({
      signin: "failed",
      reason: "user id or token is missing",
    });
  }
};

const handleSignin = (email, password) => {
  if (
    !email ||
    !password ||
    !email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
  ) {
    return Promise.reject({
      signin: "failed",
      reason: "incorrect form submission",
    });
  }
  return db
    .select("user_id", "password_hash")
    .from("users")
    .where("email", "=", email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].password_hash);
      if (isValid) {
        return {
          user_id: data[0].user_id,
        };
      } else {
        return Promise.reject({
          signin: "failed",
          reason: "wrong credentials",
        });
      }
    })
    .catch((err) =>
      Promise.reject({
        signin: "failed",
        reason: err,
      })
    );
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  redisClient
    .get(authorization)
    .then((value) => {
      var decoded = jwt.verify(authorization, "JWT_SECRET_KEY");
      if (decoded.user_id === value) {
        return res.json({
          signin: "successed",
          user_id: value,
        });
      } else
        return res.status(400).send({
          signin: "failed",
          reason: "Unauthorized user",
        });
    })
    .catch((err) => {
      return res.status(400).send({
        signin: "failed",
        reason: err,
      });
    });
};

app.post("/signin", (req, res) => {
  const { authorization } = req.headers;
  const { email, password } = req.body;
  return email && password
    ? handleSignin(email, password)
        .then((data) => {
          return data.user_id
            ? createSession(data.user_id)
            : Promise.reject(data);
        })
        .then((session) => res.json(session))
        .catch((err) => res.status(400).json(err))
    : getAuthTokenId(req, res);
});

// register -------------------

app.post("/register", (req, res) => {
  const { first_name, last_name, email, password, password2, account_type } =
    req.body;
  // console.log(req.body);
  // console.log(req.files);
  var user_image_name = null;
  var user_image = null;
  if (req.files) {
    user_image_name = req.files.user_image.name;
    user_image = req.files.user_image;
  }

  if (!first_name || !last_name || !email || !password || !account_type) {
    return res.status(400).json({
      resistered: false,
      reason: "incorrect form submission",
    });
  }

  if (
    !first_name.match(/^[a-zA-Z ]{2,30}$/) ||
    !last_name.match(/^[a-zA-Z ]{2,30}$/) ||
    !email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) ||
    !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/i) ||
    password !== password2 ||
    (account_type !== "student" && account_type !== "teacher")
  ) {
    return res.status(400).json({
      resistered: false,
      reason: "incorrect form submission",
    });
  }

  if (account_type === "student" && user_image === null) {
    return res.status(400).json({
      resistered: false,
      reason: "image is required for student account",
    });
  }

  const user_id = crypto.randomBytes(16).toString("hex");
  const user_image_name_initial = Date.now().toString();
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);
  var uploadPath = null;
  var image_link = null;
  if (user_image) {
    user_image_name = user_image_name_initial + user_image_name;
    uploadPath =
      __dirname + "/public/users_image/" + account_type + "/" + user_image_name;
    image_link =
      "http://localhost:4000/users_image/" +
      account_type +
      "/" +
      user_image_name;
  }

  if (user_id === null || password_hash === null) {
    return res.status(400).json({
      resistered: false,
      reason: "error in creating user_id or password hash",
    });
  }

  if (user_image) {
    user_image
      .mv(uploadPath)
      .then(() => {
        return db("users")
          .insert({
            user_id: user_id,
            first_name: first_name,
            last_name: last_name,
            email: email,
            password_hash: password_hash,
            account_type: account_type,
            joined_date: new Date(),
            user_image: image_link,
          })
          .returning("user_id");
      })
      .then((user_id) => {
        createSession(user_id[0])
          .then((session) =>
            res.json({
              resistered: true,
              session: session,
            })
          )
          .catch((err) => res.status(400).json(err));
      })
      .catch((err) => {
        if (err.detail) {
          fs.unlink(uploadPath, (delete_err) => {
            if (delete_err) {
              console.log("File uploaded but not deleted");
            }
            return res.status(400).json({
              resistered: false,
              reason: {
                database_error: true,
                file_upload_error: false,
                detail: err.detail,
              },
            });
          });
        } else {
          console.log(err);
          return res.status(400).json({
            resistered: false,
            reason: {
              database_error: false,
              file_upload_error: true,
              detail: "failed to upload user image",
            },
          });
        }
      });
  } else {
    return db("users")
      .insert({
        user_id: user_id,
        first_name: first_name,
        last_name: last_name,
        email: email,
        password_hash: password_hash,
        account_type: account_type,
        joined_date: new Date(),
      })
      .returning("user_id")
      .then((user_id) => {
        console.log(user_id);
        createSession(user_id[0])
          .then((session) =>
            res.json({
              resistered: true,
              session: session,
            })
          )
          .catch((err) => res.status(400).json(err));
      })
      .catch((err) => {
        return res.status(400).json({
          resistered: false,
          reason: {
            database_error: true,
            file_upload_error: false,
            detail: err.detail,
          },
        });
      });
  }
});

//-----------------google register---------------
app.post("/register/google", (req, res) => {
  const { token, account_type } = req.body;
  console.log(token);
  console.log(account_type);
  const user_id = crypto.randomBytes(16).toString("hex");

  if (true) {
    requestify
      .get("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + token)
      .then(function (response) {
        const first_name = response.getBody().given_name;
        const last_name = response.getBody().family_name;
        const email = response.getBody().email;
        const user_image = response.getBody().picture;
        db("users")
          .insert({
            user_id: user_id,
            first_name: first_name,
            last_name: last_name,
            email: email,
            account_type: account_type,
            joined_date: new Date(),
            user_image: user_image,
          })
          .returning("user_id")
          .then((user_id) => {
            console.log(user_id[0]);
            createSession(user_id[0])
              .then((session) => res.json(session))
              .catch((err) => res.status(400).json(err));
          })
          .catch((err) => {
            console.log(err);
            return res.status(400).json({
              resistered: false,
              reason: {
                database_error: true,
                token_error: false,
                detail: err,
              },
            });
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({
          resistered: false,
          reason: {
            database_error: false,
            token_error: true,
            detail: err,
          },
        });
      });
  } else {
    return res.status(400).json({
      resistered: false,
      reason: {
        database_error: false,
        token_error: true,
      },
    });
  }
});

//----------------------google signIn ----------------//
app.post("/signin/google", (req, res) => {
  const { token } = req.body;
  console.log("token_recived: " + token);
  if (token != null) {
    requestify
      .get("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + token)
      .then(function (response) {
        const email = response.getBody().email;
        db.select("user_id")
          .from("users")
          .where("email", "=", email)
          .then((data) => {
            console.log("database_user_id: ");
            console.log(data);
            if (data[0] != null) {
              const user_id = data[0].user_id;
              createSession(user_id)
                .then((session) => res.json(session))
                .catch((err) => res.status(400).json(err));
            } else {
              return res.status(400).send({
                signin: "failed",
                reason: "Cannot found user with this email.",
              });
            }
          })
          .catch((err) => {
            return res.status(400).send({
              signin: "failed",
              reason: err,
            });
          });
      })
      .catch((err) => {
        return res.status(400).send({
          signin: "failed",
          reason: err,
        });
      });
  } else {
    return res.status(400).send({
      signin: "failed",
      reason: "No token found.",
    });
  }
});

//-------------------------------

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nahid.sangram@northsouth.edu",
    pass: "mail12@@",
  },
});

const resetPasswordTemplate = (email, token) => {
  const url = `http://localhost:3000/password/reset/${token}`;
  const from = "nahid.sangram@northsouth.edu";
  const to = user.email;
  const subject = "Password Reset";
  const html = `
        <p>Hey ${user.email},</p>
        <p>We heard that you forgot your password. Sorry about that!</p>
        <p>But don’t worry! You can use the following link to reset your password:</p>
        <a href=${url}>${url}</a>
        <p>If you don’t use this link within 1 hour, it will expire.</p>
    `;
};

app.post("/resetpassword", (req, res) => {
  const { email } = req.body;
  console.log(email);
  db.select("user_id")
    .from("users")
    .where("email", "=", email)
    .then((data) => {
      const user_id = data[0].user_id;
      if (user_id) {
        const jwtPayload = {
          user_id,
        };
        const token = jwt.sign(jwtPayload, "JWT_SECRET_KEY", {
          expiresIn: "5m",
        });
        // res.status(200).json({token: token});
        transporter
          .sendMail({
            from: "nahid.sangram@northsouth.edu", // sender address
            to: email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
          })
          .then((info) => {
            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) =>
      res.status(400).json({
        send: "failed",
        reason: err,
      })
    );
});

app.listen(4000, () => {
  console.log("app is running on port 4000");
});
