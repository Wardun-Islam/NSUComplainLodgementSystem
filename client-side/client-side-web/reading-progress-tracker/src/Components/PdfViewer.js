import React, { useState, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import RecordButton from "./RecordButton";
import {
  postComment,
  getComments,
  postCommentRecord,
  getUser,
  postAssignmentStudentImage,
} from "./ApiRequestHandler";
import LoadingPage from "./LoadingPage";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Webcam from "react-webcam";

export default function PdfViewer({ assignment, userType }) {
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const pageNumberRef = useRef(1);
  const [scale, setScale] = useState(1.0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const webcamRef = React.useRef(null);
  const history = useHistory();

  
  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const capture = React.useCallback(() => {
    const previewImage = webcamRef.current.getScreenshot({
      width: 1920,
      height: 1080,
    });
    if (assignment && previewImage && pageNumber) {
      console.log(previewImage);
      postAssignmentStudentImage({
        assignmentId: assignment.assignment_id,
        image: dataURLtoFile(previewImage, Date.now() + ".jpeg"),
        page_number: pageNumberRef.current,
        token: window.localStorage.getItem("token"),
      })
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [webcamRef]);

  useEffect(() => {
    pageNumberRef.current = pageNumber;
  }, [pageNumber]);


  useEffect(() => {
    setLoading(true);

    getComments({
      assignment_id: assignment.assignment_id,
      token: window.localStorage.getItem("token"),
    })
      .then(function (response) {
        console.log(response);
        setComments(response.data.comments);
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
      var interval;

    if (userType === "student") {
       interval = setInterval(() => {
        capture();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, []);

  const options = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const onCommentChange = (e) => {
    setComment(e.target.value);
  };

  const postRecording = (recordedBlob) => {
    if (recordedBlob !== null) {
      setLoading(true);
      postCommentRecord({
        assignmentId: assignment.assignment_id,
        recordBlob: recordedBlob,
        token: window.localStorage.getItem("token"),
      })
        .then((data) => {
          console.log(data);
          getComments({
            assignment_id: assignment.assignment_id,
            token: window.localStorage.getItem("token"),
          })
            .then(function (response) {
              console.log(response);
              setComments(response.data.comments);
              setComment("");
              setLoading(false);
            })
            .catch(function (error) {
              console.log(error);
              setLoading(false);
            });
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  };

  const onTextPostClicked = () => {
    if (comment != null && comment.length > 0) {
      setLoading(true);
      postComment({
        assignmentId: assignment.assignment_id,
        comment: comment,
        token: window.localStorage.getItem("token"),
      })
        .then((data) => {
          console.log(data);
          getComments({
            assignment_id: assignment.assignment_id,
            token: window.localStorage.getItem("token"),
          })
            .then(function (response) {
              console.log(response);
              setComments(response.data.comments);
              setComment("");
              setLoading(false);
              setLoading(false);
            })
            .catch(function (error) {
              console.log(error);
              setLoading(false);
            });
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function handleZoomOut({ numPages }) {
    if (scale > 0.5) setScale(scale - 0.5);
  }
  function handleZoomIn({ numPages }) {
    if (scale < 5.0) setScale(scale + 0.5);
  }
  function handlePrevClick() {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
    else setPageNumber(numPages);
  }
  function handleNextClick() {
    if (pageNumber < numPages) setPageNumber(pageNumber + 1);
    else setPageNumber(1);
  }

  return (
    <div>
      {userType === "student" && (
        <Box
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            padding: 0,
            paddingRight: "10px",
            margin: 0,
          }}
          zIndex="tooltip"
        >
          <Webcam
            width={100}
            height={80}
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
          />
        </Box>
      )}

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
          <Box padding={1} display="flex" flexDirection="row" width="100%">
            <Box
              padding={0}
              display="flex"
              flexDirection="column"
              alignItems="center"
              width="70%"
            >
              <Box>
                <IconButton
                  onClick={handleZoomOut}
                  size="small"
                  style={{
                    marginRight: "4px",
                  }}
                >
                  <ZoomOutIcon />
                </IconButton>
                {scale * 100}%
                <IconButton
                  onClick={handleZoomIn}
                  size="small"
                  style={{
                    marginLeft: "4px",
                  }}
                >
                  <ZoomInIcon />
                </IconButton>
              </Box>
              <Box
                border={2}
                justifyContent="center"
                overflow="auto"
                height={userType === "student" ? "90vh" : "84vh"}
                width="100%"
                style={{
                  backgroundColor: "#242345",
                }}
              >
                <Document
                  file={assignment.pdf_link}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  <Page width={500} scale={scale} pageNumber={pageNumber} />
                </Document>
              </Box>
              <Box>
                <IconButton
                  onClick={handlePrevClick}
                  //size="small"
                  style={{
                    padding: "0px",
                    margin: "0px",
                  }}
                >
                  <NavigateBeforeIcon />
                </IconButton>
                {pageNumber} of {numPages}
                <IconButton
                  onClick={handleNextClick}
                  //size="small"
                  style={{
                    padding: "0px",
                    margin: "0px",
                  }}
                >
                  <NavigateNextIcon />
                </IconButton>
              </Box>
            </Box>
            <Box
              height={userType === "student" ? "96vh" : "91vh"}
              width="30%"
              border={2}
              padding={4}
              marginBottom={1}
              overflow="auto"
            >
              <Box display="flex" justifyContent="end" flexDirection="column">
                <h3>Add Comments</h3>
                <Box marginTop={1}>
                  <TextField
                    value={comment}
                    fullWidth
                    label="Comments"
                    multiline
                    rows={3}
                    variant="outlined"
                    onChange={onCommentChange}
                  />
                </Box>
                <Button
                  onClick={onTextPostClicked}
                  variant="contained"
                  size="small"
                  color="primary"
                  style={{
                    marginLeft: "auto",
                    marginTop: "10px",
                  }}
                >
                  POST
                </Button>
              </Box>
              Record your comments instead typing
              <Box>
                <RecordButton postRecording={postRecording} />
              </Box>
              {comments.length > 0 &&
                comments.map((c) => {
                  return (
                    <Box display="flex" flexDirection="column">
                      <Divider />
                      <Box display="flex">
                        <Box pt={1} pl={1} flexGrow="1">
                          <Typography variant="subtitle2" gutterBottom>
                            {c.first_name} {c.last_name}
                          </Typography>
                        </Box>
                        <Box alignSelf="flex-end">
                          <Typography
                            variant="caption"
                            display="block"
                            gutterBottom
                          >
                            {new Date(c.comment_time).toLocaleDateString(
                              "en-us",
                              options
                            )}
                          </Typography>
                        </Box>
                      </Box>
                      <Box p={1}>
                        <Typography variant="body1" gutterBottom>
                          {c.comment}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
            </Box>
          </Box>
        </div>
      )}
    </div>
  );
}
