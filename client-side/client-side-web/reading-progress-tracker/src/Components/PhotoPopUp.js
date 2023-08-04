import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import Box from "@material-ui/core/Box";
import MediaCapture from "./MediaCapture";
import Webcam from "react-webcam";

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  optionButton: {
    margin: 2,
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default function CustomizedDialogs(props) {
  const [open, setOpen] = React.useState(false);
  const [webCapture, setWebCapture] = React.useState(false);

  const handleImageCapture = (e) => {
    setOpen(false);
    props.handleCapture(e);
  };

  const handleWebCameraCapture = (e) => {
    setWebCapture(true);
  };

  const captureImage = (e) => {
    setOpen(false);
    setWebCapture(false);
    props.capture(e);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setWebCapture(false);
  };

  return (
    <div>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          component="span"
          onClick={handleClickOpen}
          startIcon={<PhotoCamera />}
        >
          Select Photo
        </Button>
      </Box>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="md"
      >
        {webCapture ? (
          <Box display="flex" flexDirection="column">
            <Webcam
              audio={false}
              ref={props.webcamRef}
              screenshotFormat="image/jpeg"
            />
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              onClick={captureImage}
            >
              <PhotoCamera />
            </IconButton>
          </Box>
        ) : (
          <div>
            <DialogTitle id="customized-dialog-title" onClose={handleClose}>
              Add Photo!
            </DialogTitle>
            <DialogContent dividers>
              <Box display="flex" justifyContent="center" alignItems="center">
                <MediaCapture handleImageCapture={handleImageCapture} />
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                m={2}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component="span"
                  onClick={handleWebCameraCapture}
                  startIcon={<PhotoCamera />}
                >
                  Capture photo
                </Button>
              </Box>
            </DialogContent>
          </div>
        )}
      </Dialog>
    </div>
  );
}
