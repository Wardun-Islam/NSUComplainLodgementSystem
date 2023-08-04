import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import TopAppBar from "./AppBar";
import Box from "@material-ui/core/Box";
import LoadingPage from "./LoadingPage";
import ErrorDisplay from "./ErrorDisplay";
import {
  getClassInfo,
  getUser,
  postAssignment,
  getAssignments,
} from "./ApiRequestHandler";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CloseIcon from "@material-ui/icons/Close";
import AssignmentIcon from "@material-ui/icons/Assignment";
import CardActionArea from "@material-ui/core/CardActionArea";

const useStyles = makeStyles({
  root: {
    maxWidth: "100%",
  },
  media: {
    height: 140,
  },
});

export default function ClassPage() {
  const history = useHistory();
  const { class_id } = useParams();
  const [classInfo, setClassInfo] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [openError, setOpenError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [userType, setUserType] = React.useState("");
  const [postDecription, setPostDecription] = React.useState(null);
  const [inputError, setInputError] = React.useState(false);
  const [pdf, setPdf] = React.useState(null);
  const [assignments, setAssignments] = React.useState(null);
  const classes = useStyles();

  useEffect(() => {
    getClassInfo({
      token: window.localStorage.getItem("token"),
      class_id: class_id.split(":")[1],
    })
      .then(function (response) {
        console.log(response.data.class_info);
        setClassInfo(response.data.class_info[0]);
        getUser({ token: window.localStorage.getItem("token") })
          .then(function (response) {
            console.log(response);
            setUserType(response.data.user.account_type);
            setLoading(false);
          })
          .catch(function (error) {
            console.log(error);
            window.localStorage.removeItem("token");
            history.push("/signin");
          });
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
        setErrorMessage("Getting classroom from database is failed.");
        setOpenError(true);
      });

    console.log("getting assignments");
    getAssignments({
      token: window.localStorage.getItem("token"),
      class_id: class_id.split(":")[1],
    })
      .then(function (response) {
        console.log(response.data);
        setAssignments(response.data.assignments);
      })
      .catch(function (error) {
        console.log(error);
        setAssignments(null);
      });
  }, []);

  const closeError = () => {
    setOpenError(false);
  };

  const confirmError = () => {
    setOpenError(false);
  };

  const onPostDecriptionChange = (event) => {
    setPostDecription(event.target.value);
    if (pdf && event.target.value) setInputError(false);
  };
  const handlePdfCloseClick = () => {
    setPdf(null);
  };

  const onFileChange = (e) => {
    const files = e.target.files;
    console.log(files);
    files.length > 0 && setPdf(files[0]);
    if (files.length && postDecription) setInputError(false);
  };

  const onPostClicked = () => {
    setLoading(true);
    if (pdf && postDecription) {
      console.log(pdf);
      console.log(postDecription);
      postAssignment({
        postDescription: postDecription,
        pdf: pdf,
        class_id: classInfo.class_room_id,
        token: window.localStorage.getItem("token"),
      })
        .then(function (response) {
          console.log(response.data);
          setPdf(null);
          setPostDecription(null);
          setLoading(false);
          getAssignments({
            token: window.localStorage.getItem("token"),
            class_id: class_id.split(":")[1],
          })
            .then(function (response) {
              console.log(response.data);
              setAssignments(response.data.assignments);
            })
            .catch(function (error) {
              console.log(error);
              setAssignments(null);
            });
        })
        .catch(function (error) {
          console.log(error);
          setLoading(false);
          setErrorMessage("Assignment post failed.");
          setOpenError(true);
        });
    } else {
      setInputError(true);
      setLoading(false);
    }
  };

  return (
    <div>
      <TopAppBar title={"Classroom"} />
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <LoadingPage />
        </Box>
      ) : (
        <div>
          <React.Fragment>
            <CssBaseline />
            <Container maxWidth="md">
              <Box
                display="flex"
                alignItems="center"
                flexDirection="column"
                mt={1}
              >
                <Box width="100%">
                  <Card className={classes.root}>
                    <CardContent
                      style={{ backgroundColor: "#3482F2", padding: "20px" }}
                    >
                      <Typography variant="h3" style={{ color: "#ffffff" }}>
                        {classInfo.name}
                      </Typography>
                      <Typography variant="h4" style={{ color: "#ffffff" }}>
                        {classInfo.section}
                      </Typography>
                      <Typography variant="h6" style={{ color: "#ffffff" }}>
                        {"Class code: " + classInfo.class_room_id}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box width="100%" pt={1}>
                  {userType === "teacher" && (
                    <Card className={classes.root}>
                      <CardContent>
                        <TextField
                          fullWidth
                          label="Announce a new class Assignment"
                          multiline
                          rows={5}
                          variant="outlined"
                          onChange={onPostDecriptionChange}
                        />
                        {pdf && (
                          <Box
                            display="flex"
                            p={1}
                            mt={1}
                            border={1}
                            width="100%"
                          >
                            <Box flexGrow={1}>{pdf.name}</Box>
                            <Box alignSelf="flex-end">
                              <IconButton
                                onClick={handlePdfCloseClick}
                                size="small"
                                style={{
                                  padding: "0px",
                                  margin: "0px",
                                }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        )}
                        {inputError && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="error"
                            style={{
                              padding: "3px 0px 0px 0px",
                              textAlign: "center",
                              margin: "0px",
                            }}
                          >
                            Invalid input.
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions disableSpacing>
                        <input
                          style={{
                            display: "none",
                          }}
                          id="icon-button-file"
                          type="file"
                          accept=".pdf"
                          onChange={onFileChange}
                        />
                        <label htmlFor="icon-button-file">
                          <Button
                            style={{ marginLeft: "10px" }}
                            variant="contained"
                            color="primary"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                          >
                            Attach Pdf
                          </Button>
                        </label>

                        <Button
                          onClick={onPostClicked}
                          variant="contained"
                          size="small"
                          color="primary"
                          style={{
                            marginLeft: "auto",
                            marginRight: "10px",
                          }}
                        >
                          POST
                        </Button>
                      </CardActions>
                    </Card>
                  )}
                </Box>
              </Box>

              {assignments !== null ? (
                assignments.map((assignment, i) => {
                  return (
                    <Box width="100%" key={i} pt={1} pb={1}>
                      <Card onClick={() =>{history.push("/assignment:"+assignment.assignment_id);}} >
                        <CardActionArea>
                          <CardContent
                            style={{ padding: "3px", margin: "0px" }}
                          >
                            <Box
                              display="flex"
                              flexDirection="row"
                              p={2}
                              alignItems="center"
                            >
                              <AssignmentIcon
                                style={{
                                  marginRight: "20px",
                                }}
                              />
                              <Box display="flex" flexDirection="column">
                                <Typography>
                                  {assignment.post_description}
                                </Typography>
                                <Typography>
                                  {new Date(
                                    assignment.post_date
                                  ).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Box>
                  );
                })
              ) : (
                <Box
                  display="flex"
                  p={3}
                  flexDirection="column"
                  alignItems="center"
                >
                  No assignments posted yet.
                </Box>
              )}
            </Container>
          </React.Fragment>
          <ErrorDisplay
            onClose={closeError}
            open={openError}
            handleConfirm={confirmError}
            message={errorMessage}
          />
        </div>
      )}
    </div>
  );
}
