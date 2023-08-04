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

export default function JoinClass(props) {
  const { onClose, open, handleConfirm } = props;
  const [classCode, setclassCode] = React.useState("");
  const [classCodeValid, setclassCodeValid] = React.useState(true);
  const [classCodeValidMessage, setclassCodeValidMessage] = React.useState("");
  const [error, setError] = React.useState("none");
  const onClassCodeChanged = (event) => {
    setclassCode(event.target.value);
    setclassCodeValid(
      !(!event.target.value || event.target.value.length === 0)
    );
    if (!event.target.value || event.target.value.length === 0)
      setclassCodeValidMessage("enter class code");
    else setclassCodeValidMessage("");
  };

  const onConfirm = () => {
    if (!(!classCode || classCode === 0)) {
      handleConfirm({ classCode: classCode });
    } else {
      setError("block");
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      minWidth={"lg"}
      fullWidth={true}
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <DialogTitle id="simple-dialog-title">Join Class</DialogTitle>
      <Box display="flex" flexDirection="column" ml={10} mr={10}>
        <TextField
          error={!classCodeValid}
          variant="outlined"
          margin="normal"
          required
          id="class_code"
          label="Class Code"
          name="class_code"
          autoFocus
          onChange={onClassCodeChanged}
          helperText={classCodeValidMessage}
        />
        <Box display={error} mb={1}>
          <Typography variant="caption" display="block" color="error">
            invalid input.
          </Typography>
        </Box>

        <DialogActions>
          <Button onClick={onConfirm} color="primary">
            Join
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

JoinClass.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  handleConfirm: PropTypes.func.isRequired,
};
