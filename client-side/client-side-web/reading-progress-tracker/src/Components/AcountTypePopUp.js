import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";

const account_types = ["student", "teacher"];

export default function SimpleDialog(props) {
  const { onClose, open, handleConfirm } = props;
  const [selectedValue, setSelectedValue] = React.useState("student");

  const onConfirm = () => {
    const selected = selectedValue;
    console.log(selected);
    setSelectedValue("student");
    handleConfirm(selected);
  };

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (value) => {
    setSelectedValue(value);
    console.log(value);
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <DialogTitle id="simple-dialog-title">Select account type</DialogTitle>
      <List>
        {account_types.map((account_type) => (
          <ListItem
            button
            onClick={() => handleListItemClick(account_type)}
            key={account_type}
          >
            <ListItemText primary={account_type.toUpperCase()} />
          </ListItem>
        ))}
      </List>
      <DialogActions>
        <Button onClick={onConfirm} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  handleConfirm: PropTypes.func.isRequired,
};
