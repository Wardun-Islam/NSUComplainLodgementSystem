import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { signUp } from "./ApiRequestHandler";
import Container from "@material-ui/core/Container";
import InputAdornments from "./CustomPasswordField";
import SimpleSelect from "./CustomSelector";
import CustomizedDialogs from "./PhotoPopUp";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";
import { useHistory } from "react-router-dom";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <a target="_blank" rel="noreferrer" href="https://bitbucket.org/nabeel_mohammed/summer21.cse327.2.4/src/master/">summer21.cse327.2.4</a>
      {" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  image: {
    position: "relative",
    margin: theme.spacing(1, 1, 1),
    textAlign: "center",
    height: 100,
    [theme.breakpoints.down("xs")]: {
      width: "100% !important", // Overrides inline-style
      height: 100,
    },
  },
    backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

export default function SignUp() {
  const history = useHistory();
  const [firstName, setfirstName] = React.useState("");
  const [firstNameValid, setfirstNameValid] = React.useState(true);
  const [firstNameErrorMessage, setfirstNameErrorMessage] = React.useState("");
  const [lastName, setlastName] = React.useState("");
  const [lastNameValid, setlastNameValid] = React.useState(true);
  const [lastNameErrorMessage, setlastNameErrorMessage] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [emailValid, setEmailValid] = React.useState(true);
  const [passwordValid, setPasswordValid] = React.useState(true);
  const [passwordValid2, setPasswordValid2] = React.useState(true);
  const [emailValidMessage, setEmailValidMessage] = React.useState("");
  const [passwordValidMessage, setPasswordValidMessage] = React.useState("");
  const [passwordValidMessage2, setPasswordValidMessage2] = React.useState("");
  const [accountType, setAccountType] = React.useState("");
  const [accountError, setAccountError] = React.useState(false);
  const [image, setImage] = React.useState(undefined);
  const [previewImage, setPreviewImage] = React.useState(undefined);
  const [errorDisplay, setErrorDisplay] = React.useState("none");
  const [loading, setLoding] = React.useState(false);
  const classes = useStyles();
  const webcamRef = React.useRef(null);
  const capture = React.useCallback(() => {
    const previewImage = webcamRef.current.getScreenshot();
    setPreviewImage(previewImage);
    setImage(dataURLtoFile(previewImage, Date.now() + ".jpeg"));
    console.log(dataURLtoFile(previewImage, Date.now() + ".jpeg"));
  }, [webcamRef, setPreviewImage]);

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

  const handleSelectChange = (event) => {
    setAccountType(event.target.value);
  };
  const handleCapture = (event) => {
    setImage(event.target.files[0]);
    setPreviewImage(URL.createObjectURL(event.target.files[0]));
    console.log(event.target.files[0]);
  };

  const onFastNameChanged = (event) => {
    setfirstName(event.target.value);
    setfirstNameValid(event.target.value.match(/^[a-zA-Z ]{2,30}$/));
    if (event.target.value.match(/^[a-zA-Z ]{2,30}$/))
      setfirstNameErrorMessage("");
    else setfirstNameErrorMessage("Invalid name");
  };

  const onLastNameChanged = (event) => {
    setlastName(event.target.value);
    setlastNameValid(event.target.value.match(/^[a-zA-Z ]{2,30}$/));
    if (event.target.value.match(/^[a-zA-Z ]{2,30}$/))
      setlastNameErrorMessage("");
    else setlastNameErrorMessage("Invalid name");
  };

  const onEmailChanged = (event) => {
    setEmail(event.target.value);
    setEmailValid(
      event.target.value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
    );
    if (event.target.value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i))
      setEmailValidMessage("");
    else setEmailValidMessage("Invalid email!");
  };

  const onPasswordChanged = (event) => {
    setPassword(event.target.value);
    setPasswordValid(
      event.target.value.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/i
      )
    );
    if (
      event.target.value.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/i
      )
    )
      setPasswordValidMessage("");
    else
      setPasswordValidMessage(
        "at least 8 characters must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number."
      );
    if (event.target.value === password2) {
      setPasswordValid2(true);
      setPasswordValidMessage2("");
    } else {
      setPasswordValid2(false);
      setPasswordValidMessage2("password not matched.");
    }
  };

  const onPasswordChanged2 = (event) => {
    setPassword2(event.target.value);
    setPasswordValid2(event.target.value === password);
    if (event.target.value === password) {
      setPasswordValid2(true);
      setPasswordValidMessage2("");
    } else {
      setPasswordValid2(true);
      setPasswordValidMessage2("password not matched.");
    }
  };

  const onSubmit = () => {
    console.log(accountType);
    if ((accountType === "student" && image!=null) || accountType === "teacher") {
      if (
        firstNameValid &&
        lastNameValid &&
        emailValid &&
        passwordValid &&
        passwordValid2 &&
        !accountError
      ) {
        console.log(image);
        setLoding(true);
        signUp({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
          password2: password2,
          accountType: accountType,
          image: image,
        })
          .then(function (response) {
            window.localStorage.setItem("token", response.data.session.token);
            console.log(window.localStorage.getItem("token"));
            setErrorDisplay("none");
            setLoding(false);
            console.log(response);
            history.push('/home');
          })
          .catch(function (error) {
            console.log(error);
            setErrorDisplay("block");
            setLoding(false);
          });
      } else {
        setErrorDisplay("block");
        console.log("error in field");
      }
    } else {
      setErrorDisplay("block");
      console.log("error in field");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                error={!firstNameValid}
                onChange={onFastNameChanged}
                helperText={firstNameErrorMessage}
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                error={!lastNameValid}
                onChange={onLastNameChanged}
                helperText={lastNameErrorMessage}
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="lname"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={!emailValid}
                onChange={onEmailChanged}
                helperText={emailValidMessage}
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12}>
              <InputAdornments
                password={password}
                onPasswordChanged={onPasswordChanged}
                passwordValidMessage={passwordValidMessage}
                passwordValid={passwordValid}
              />
            </Grid>
            <Grid item xs={12}>
              <InputAdornments
                password={password2}
                onPasswordChanged={onPasswordChanged2}
                passwordValidMessage={passwordValidMessage2}
                passwordValid={passwordValid2}
              />
            </Grid>
            <Grid item xs={12}>
              <SimpleSelect
                handleSelectChange={handleSelectChange}
                accountType={accountType}
                accountError={accountError}
              />
            </Grid>
            <Grid container justify="center">
              {previewImage && (
                <img
                  className={classes.image}
                  src={previewImage}
                  alt="Recent photograph"
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <CustomizedDialogs
                handleCapture={handleCapture}
                webcamRef={webcamRef}
                capture={capture}
              />
            </Grid>
          </Grid>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onSubmit}
          >
            Sign Up
          </Button>
          <Grid container justify="center">
            <Box display={errorDisplay} mb={1}>
              <Typography variant="caption" display="block" color="error">
                Invalid input.
              </Typography>
            </Box>
          </Grid>
          <Grid container justify="center">
            <Grid item>
               <Link to="/signin">Already have an account? Sign in</Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
}
