import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Avatar from "@material-ui/core/Avatar";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Box from "@material-ui/core/Box";
import { green } from "@material-ui/core/colors";
import AddIcon from "@material-ui/icons/Add";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  list: {
    width: 250,
  },
  avatar: {
    color: "#fff",
    backgroundColor: green[500],
  },
}));

export default function TopNavBar({
  handleClickOpen,
  userName,
  userImage,
  classList,
}) {
  const history = useHistory();
  const classes = useStyles();
  const [state, setState] = React.useState({
    left: false,
  });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    setAnchorEl(null);
    history.push("/profile");
  };

  const handleLogout = () => {
    setAnchorEl(null);
    window.localStorage.removeItem("token");
    history.push("/signin");
  };

  const openCreateClass = () => {
    console.log("c");
    handleClickOpen(true);
  };
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, left: open });
  };

  const list = (classList) => (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List
        component="nav"
        aria-labelledby="classes"
        subheader={
          <ListSubheader component="div">
            <Box m={1} />
            <Typography variant="h6" p={3}>
              Classes
            </Typography>
            <Box m={2} />
          </ListSubheader>
        }
      >
        <Divider />
        {classList.map((c, index) => (
          <ListItem
            button
            key={c.name}
            onClick={() => {
              history.push("/class:" + c.class_room_id);
            }}
          >
            <ListItemAvatar>
              <Avatar>
                <Avatar aria-label="recipe" className={classes.avatar}>
                  {c.name.toUpperCase().charAt(0)}
                </Avatar>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={c.name} secondary={c.section} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <div className={classes.root}>
      <React.Fragment>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              onClick={toggleDrawer(true)}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Classroom
            </Typography>
            <IconButton
              aria-label="join class"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={openCreateClass}
              color="inherit"
            >
              <AddIcon />
            </IconButton>
            <Box m={1} />
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuClick}
              color="inherit"
            >
              {userImage ? (
                <Avatar alt="Account" src={userImage} />
              ) : (
                <Avatar aria-label="recipe" className={classes.avatar}>
                  {userName.toUpperCase().charAt(0)}
                </Avatar>
              )}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer open={state.left} onClose={toggleDrawer(false)}>
          {list(classList)}
        </Drawer>
      </React.Fragment>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleProfile}>Profile</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </div>
  );
}
