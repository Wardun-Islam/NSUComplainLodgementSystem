import React, { Component, Fragment } from "react";
import PhotoSizeSelectActualIcon from "@material-ui/icons/PhotoSizeSelectActual";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import PhotoCamera from "@material-ui/icons/PhotoCamera";

const styles = (theme) => ({
    input: {
        display: "none",
    },
    image: {
        position: "relative",
        margin: theme.spacing(2, 2, 1),
        textAlign: "center",
        height: 100,
        [theme.breakpoints.down("xs")]: {
            width: "100% !important", // Overrides inline-style
            height: 100,
        },
    },
});

class MediaCapture extends Component {
    // eslint-disable-next-line no-useless-constructor
    constructor(props) {
        super(props);
    }

    render() {
        const { classes } = this.props;
        return (
            <Box display="flex" flexDirection="column">
                <Fragment>
                    <input
                        accept="image/*"
                        className={classes.input}
                        id="contained-button-photo"
                        onChange={this.props.handleImageCapture}
                        type="file"
                    />
                    <label htmlFor="contained-button-photo">
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            component="span"
                            className={classes.button}
                            startIcon={<PhotoSizeSelectActualIcon />}
                        >
                            Choose image
                        </Button>
                    </label>
                </Fragment>
            </Box>
        );
    }
}

export default withStyles(styles, { withTheme: true })(MediaCapture);
