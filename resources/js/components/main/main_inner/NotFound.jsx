import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
    }
}));

function NotFound() {
    const classes = useStyles();

    return (
        <Container maxWidth="lg" className={classes.container}>
            <Typography variant="h6" color="textSecondary">
                404 | Not Found
            </Typography>
        </Container>
    );
}

export default NotFound;
