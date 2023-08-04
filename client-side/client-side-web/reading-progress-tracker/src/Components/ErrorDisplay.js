import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import PersonIcon from "@material-ui/icons/Person";
import AddIcon from "@material-ui/icons/Add";
import Typography from "@material-ui/core/Typography";
import { blue } from "@material-ui/core/colors";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";

export default function ErrorDisplay(props) {
  const { onClose, open, handleConfirm, message } = props;

  const onConfirm = () => {
    handleConfirm();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      fullWidth={true}
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      titleStyle={{ textAlign: "center" }}
      open={open}
    >
      <DialogTitle id="simple-dialog-title">
        <Typography align="center">Error!</Typography>
      </DialogTitle>

      <Typography align="center" color="error">
        {message}
      </Typography>
      <DialogActions>
        <Button onClick={onConfirm} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ErrorDisplay.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};
