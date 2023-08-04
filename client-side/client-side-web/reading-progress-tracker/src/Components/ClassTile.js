import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import p1 from "../images/p1.jpg";
import Box from "@material-ui/core/Box";
import { useHistory } from "react-router-dom";
const useStyles = makeStyles({
  root: {
    width: 345,
  },
  media: {
    height: 150,
  },
});

export default function ClassTile({ classInfo }) {
  const classes = useStyles();
  const history = useHistory();

  return (
    <Box m={1}>
      <Card className={classes.root} onClick={() => {history.push("/class:"+classInfo.class_room_id)}}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={p1}
            title="Contemplative Reptile"
          />
          <CardContent style={{ backgroundColor: "#867AE9" }}>
            <Typography gutterBottom variant="h5" component="h2">
              {classInfo.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Class Code: {classInfo.class_room_id}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Section: {classInfo.section}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}
