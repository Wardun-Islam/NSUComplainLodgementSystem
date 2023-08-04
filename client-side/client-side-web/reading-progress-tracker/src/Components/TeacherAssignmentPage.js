import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import PdfViewer from "./PdfViewer";
import StudentList from "./StudentList";
import { Typography } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nav-tabpanel-${index}`}
      aria-labelledby={`nav-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={0}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `nav-tab-${index}`,
    "aria-controls": `nav-tabpanel-${index}`,
  };
}

function LinkTab(props) {
  return (
    <Tab
      component="a"
      onClick={(event) => {
        event.preventDefault();
      }}
      {...props}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  tab: {
    "& .MuiBox-root": {
      padding: "0px",
    },
  },
}));

export default function NavTabs({ assignment, userType }) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="sticky">
        <Tabs
          variant="fullWidth"
          value={value}
          onChange={handleChange}
          aria-label="nav tabs example"
        >
          <LinkTab label="Assignment" href="/drafts" {...a11yProps(0)} />
          <LinkTab label="Students" href="/trash" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} classes={{ root: classes.tab }}>
        <PdfViewer assignment={assignment} userType={userType} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box display="flex" justifyContent="center" width="100%">
          <Box
            display="flex"
            justifyContent="center"
            paddingTop={"20px"}
            width="50%"
          >
            <Box display="flex" flexDirection="column" width="100%">
              <Typography variant="h4" gutterBottom>
                Students
              </Typography>
              <Divider />
              <Box display="block">
                <StudentList assignment_id={assignment.assignment_id} />
              </Box>
            </Box>
          </Box>
        </Box>
      </TabPanel>
    </div>
  );
}
