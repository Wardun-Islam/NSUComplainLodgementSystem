import React from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import { Typography } from "@material-ui/core";

export default function StudentTile({image, name}) {
  
  return (
    <Card style={{margin:"5px"}}>
      <CardActionArea disableSpacing>
        <Box padding={1} display="flex" alignItems="center">
          <Box paddingRight={2} marginLeft={1}>
            <Avatar alt={name} src={image} />
          </Box>
          <Box>
            <Typography>{name}</Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
