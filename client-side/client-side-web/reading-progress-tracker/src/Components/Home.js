import React, { useEffect } from "react";
import TopNavBar from "./TopNavBar";
import ClassTile from "./ClassTile";
import Box from "@material-ui/core/Box";
import CreateClass from "./CreateClass";
import JoinClass from "./JoinClass";
import LoadingPage from "./LoadingPage";
import {
  getUser,
  createClassroom,
  getClassroom,
  joinClassroom,
} from "./ApiRequestHandler";
import { useHistory } from "react-router-dom";
import ErrorDisplay from "./ErrorDisplay";


export default function Home() {
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const [hasData, setHasData] = React.useState(false);
  const [classList, setClassList] = React.useState([]);
  const [userName, setUserName] = React.useState(" ");
  const [userImage, setUserImage] = React.useState(null);
  const [userType, setUserType] = React.useState(null);
  const [openError, setOpenError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(false);

  useEffect(() => {
    getUser({ token: window.localStorage.getItem("token") })
      .then(function (response) {
        console.log(response);
        setUserName(
          response.data.user.first_name + " " + response.data.user.last_name
        );
        setUserType(response.data.user.account_type);
        setUserImage(response.data.user.user_image);
        getClassroom({ token: window.localStorage.getItem("token") })
          .then(function (response) {
            console.log(response);
            setClassList(response.data.classroom);
            setHasData(true);
          })
          .catch(function (error) {
            console.log(error);
            setHasData(true);
            setErrorMessage("Getting classroom from database is failed.");
            setOpenError(true);
          });
      })
      .catch(function (error) {
        console.log(error);
        window.localStorage.removeItem("token");
        history.push("/signin");
      });
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
    console.log(open);
  };

  const closeError = () => {
    setOpenError(false);
  };

  const confirmError = () => {
    setOpenError(false);
  };

  const handleStudentConfirm = ({ classCode }) => {
    setOpen(false);
    setHasData(false);
    joinClassroom({
      classCode: classCode,
      token: window.localStorage.getItem("token"),
    })
      .then(function (response) {
        console.log(response);
        getClassroom({ token: window.localStorage.getItem("token") })
          .then(function (response) {
            console.log(response);
            setClassList(response.data.classroom);
            setHasData(true);
          })
          .catch(function (error) {
            console.log(error);
            setHasData(true);
            setErrorMessage("Getting classroom from database is failed.");
            setOpenError(true);
          });
      })
      .catch(function (error) {
        console.log(error);
        setHasData(true);
        setErrorMessage("Class join failed.");
        setOpenError(true);
      });
  };

  const handleTeacherConfirm = ({
    classroomName: className,
    section: section,
  }) => {
    setOpen(false);
    setHasData(false);
    createClassroom({
      classroomName: className,
      section: section,
      token: window.localStorage.getItem("token"),
    })
      .then(function (response) {
        console.log(response);
        getClassroom({ token: window.localStorage.getItem("token") })
          .then(function (response) {
            console.log(response);
            setClassList(response.data.classroom);
            setHasData(true);
          })
          .catch(function (error) {
            console.log(error);
            setHasData(true);
            setErrorMessage("Getting classroom from database is failed.");
            setOpenError(true);
          });
      })
      .catch(function (error) {
        console.log(error);
        setHasData(true);
        setErrorMessage("Class creation failed.");
        setOpenError(true);
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {!hasData ? (
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
          <TopNavBar
            handleClickOpen={handleClickOpen}
            userName={userName}
            userImage={userImage}
            classList={classList}
          />
          <Box display="flex" flexWrap="wrap" pl={2.5}>
            {classList.length ? (
              classList.map((c, index) => <ClassTile classInfo={c} />)
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
                height="100vh"
              >
                You are not enlisted in any class.
              </Box>
            )}
          </Box>
          {userType === "student" ? (
            <JoinClass
              onClose={handleClose}
              open={open}
              handleConfirm={handleStudentConfirm}
            />
          ) : (
            <CreateClass
              onClose={handleClose}
              open={open}
              handleConfirm={handleTeacherConfirm}
            />
          )}
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
