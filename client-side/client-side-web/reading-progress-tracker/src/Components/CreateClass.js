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

const account_types = ["student", "teacher"];

export default function CreateClass(props) {
  const { onClose, open, handleConfirm } = props;
  const [className, setclassName] = React.useState("");
  const [section, setSection] = React.useState(0);
  const [classNameValid, setclassNameValid] = React.useState(true);
  const [classNameValidMessage, setclassNameValidMessage] = React.useState("");
  const [error, setError] = React.useState('none');
  const onClassNameChanged = (event) => {
    setclassName(event.target.value);
    setclassNameValid(event.target.value.match(/^[^-\s][\w\s-]+$/));
    if (event.target.value.match(/^[^-\s][\w\s-]+$/))
      setclassNameValidMessage("");
    else setclassNameValidMessage("Invalid class name");
  };

  const onSectionChanged = (event) => {
    setSection(event.target.value);
  };

  const onConfirm = () => {
    if (className.match(/^[^-\s][\w\s-]+$/)) {
      handleConfirm({classroomName:className, section:section});
    } else {
      setError('block');
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
      <DialogTitle id="simple-dialog-title">Create Class</DialogTitle>
      <Box display="flex" flexDirection="column" ml={10} mr={10}>
        <TextField
          error={!classNameValid}
          variant="outlined"
          margin="normal"
          required
          id="class_name"
          label="Class Name"
          name="class_name"
          autoFocus
          onChange={onClassNameChanged}
          helperText={classNameValidMessage}
        />
        <TextField
          variant="outlined"
          margin="normal"
          id="section"
          label="Section"
          name="section"
          autoFocus
          onChange={onSectionChanged}
        />
        <Box display={error} mb={1}>
          <Typography variant="caption" display="block" color="error">
            invalid input.
          </Typography>
        </Box>
        <DialogActions>
          <Button onClick={onConfirm} color="primary">
            Create
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

CreateClass.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  handleConfirm: PropTypes.func.isRequired,
};
