import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
  },
}));

export default function SimpleSelect({
  handleSelectChange,
  accountType,
  accountError,
}) {
  const classes = useStyles();

  return (
    <div>
      <FormControl
        required
        variant="outlined"
        className={classes.formControl}
        fullWidth
        error={accountError}
      >
        <InputLabel id="select-outlined-label">Account Type</InputLabel>
        <Select
          labelId="select-outlined-label"
          id="select-outlined"
          value={accountType}
          onChange={handleSelectChange}
          label="Account Type"
        >
          <MenuItem value={"teacher"}>Teacher</MenuItem>
          <MenuItem value={"student"}>Student</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
