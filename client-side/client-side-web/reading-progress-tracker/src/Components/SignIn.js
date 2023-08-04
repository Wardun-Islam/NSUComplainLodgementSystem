import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import GoogleButton from "react-google-button";
import InputAdornments from "./CustomPasswordField";
import SimpleDialog from "./AcountTypePopUp";
// import CreateClass from "./CreateClass";
import GoogleLogin from "react-google-login";
import { useGoogleLogout } from "react-google-login";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  signIn,
  isUser,
  googleRegister,
  googleSignIn,
} from "./ApiRequestHandler";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <a
        target="_blank"
        href="https://bitbucket.org/nabeel_mohammed/summer21.cse327.2.4/src/master/"
      >
        summer21.cse327.2.4
      </a>{" "}
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
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(1, 0, 2),
  },
  googleButton: {
    margin: theme.spacing(1, 0, 2),
    textAlign: "center",
  },
  ORText: {
    margin: theme.spacing(2, 0, 0),
    textAlign: "center",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

export default function SignIn() {
  const history = useHistory();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [emailValid, setEmailValid] = React.useState(true);
  const [passwordValid, setPasswordValid] = React.useState(true);
  const [formValid, setFormValid] = React.useState(true);
  const [emailValidMessage, setEmailValidMessage] = React.useState("");
  const [passwordValidMessage, setPasswordValidMessage] = React.useState("");
  const [user, setUser] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("student");
  const [isSignedIn, setSignedIn] = React.useState(false);
  const [errorDisplay, setErrorDisplay] = React.useState("none");
  const [loading, setLoding] = React.useState(false);
  const [token, setToken] = React.useState(null);
  const clientId =
    "1012449316406-tjqn7al8amip1o54og2ircnqh9ed6cch.apps.googleusercontent.com";
  const onLogoutSuccess = (res) => {
    console.log(res);
  };
  const onFailure = (err) => {
    console.log(err);
  };
  const { signOut } = useGoogleLogout({
    onFailure,
    clientId,
    onLogoutSuccess,
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleConfirm = (value) => {
    setSelectedValue(value);
    setOpen(false);
    googleRegister({ token: token, account_type: value })
      .then(function (response) {
        console.log(response);
        window.localStorage.setItem("token", response.data.token);
        console.log(window.localStorage.getItem("token"));
        setErrorDisplay("none");
        setLoding(false);
        history.push("/home");
      })
      .catch(function (error) {
        console.log(error);
        setErrorDisplay("block");
        setLoding(false);
      });
  };

  const handleClose = () => {
    setOpen(false);
    if (user) {
      signOut();
      setSignedIn(false);
    }
  };

  const responseGoogle = (response) => {
    console.log("responseGoogle");
    //var res = response.profileObj;
    //console.log(res);
    //setUser(res);
    if (response.tokenId) {
      const tokenID = response.tokenId;
      setToken(response.tokenId);
      setSignedIn(true);
      setLoding(true);
      isUser({ token: tokenID })
        .then(function (response) {
          if (response.data.isUser) {
            console.log("google");
            setLoding(false);
            setErrorDisplay("none");
            googleSignIn({ token: token })
              .then(function (response) {
                console.log(response);
                window.localStorage.setItem("token", response.data.token);
                console.log(window.localStorage.getItem("token"));
                setErrorDisplay("none");
                setLoding(false);
                history.push("/home");
              })
              .catch(function (error) {
                console.log(error);
                setLoding(false);
              });
          } else {
            handleClickOpen();
          }
        })
        .catch(function (error) {
          console.log(error);
          setErrorDisplay("block");
          setLoding(false);
        });
    }
  };

  const checkEmail = (email) => {
    setEmailValid(email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i));
    if (email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i))
      setEmailValidMessage("");
    else setEmailValidMessage("Invalid email!");
  };
  const onEmailChanged = (event) => {
    setEmail(event.target.value);
    checkEmail(event.target.value);
  };

  const checkPassword = (password) => {
    setPasswordValid(
      password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/i)
    );
    if (password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/i))
      setPasswordValidMessage("");
    else
      setPasswordValidMessage(
        "at least 8 characters must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number."
      );
  };

  const onPasswordChanged = (event) => {
    setPassword(event.target.value);
    checkPassword(event.target.value);
  };

  const onSubmit = () => {
    checkEmail(email);
    checkPassword(password);
    if (passwordValid && emailValid) {
      setLoding(true);
      signIn({ email: email, password: password })
        .then(function (response) {
          window.localStorage.setItem("token", response.data.token);
          console.log(window.localStorage.getItem("token"));
          setErrorDisplay("none");
          setLoding(false);
          history.push("/home");
        })
        .catch(function (error) {
          console.log(error);
          setErrorDisplay("block");
          setLoding(false);
        });
    }
  };

  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        <form className={classes.form} noValidate>
          <TextField
            error={!emailValid}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={onEmailChanged}
            helperText={emailValidMessage}
          />
          <SimpleDialog
            open={open}
            onClose={handleClose}
            handleConfirm={handleConfirm}
          />
          <InputAdornments
            password={password}
            onPasswordChanged={onPasswordChanged}
            passwordValidMessage={passwordValidMessage}
            passwordValid={passwordValid}
          />
          <Box display={errorDisplay}>
            <Typography variant="caption" display="block" color="error">
              Invalid email or password.
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onSubmit}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link to="/forgetpassword">Forgot password?</Link>
            </Grid>
            <Grid item>
              <Link to="/signup">Don't have an account? Sign Up</Link>
            </Grid>
          </Grid>
          <Typography className={classes.ORText} color="textSecondary">
            OR
          </Typography>
          <Box align="center" p={1}>
            <GoogleLogin
              clientId="1012449316406-tjqn7al8amip1o54og2ircnqh9ed6cch.apps.googleusercontent.com"
              buttonText="Sign In with Google"
              onSuccess={responseGoogle}
              isSignedIn={isSignedIn}
              onFailure={responseGoogle}
              cookiePolicy={"single_host_origin"}
            />
          </Box>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
}
