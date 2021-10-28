import React, { useState, useEffect, useContext } from "react";

import { Route, Redirect, useHistory } from "react-router-dom";

import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

import { AuthUserContext } from "../context/context";

import auth from "../../services/auth";

const useStyles = makeStyles({
    box: {
        height: "100vh"
    }
});

function ProtectedRoute({ component: Component, render, ...rest }) {
    const classes = useStyles();
    const history = useHistory();

    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(true);

    const { setAuthUser } = useContext(AuthUserContext);

    useEffect(() => {
        async function validateIfLoggedIn() {
            const data = await auth.validateUser();
            if (data) {
                setLoggedIn(true);
                setAuthUser(data.user);
            } else {
                setLoggedIn(false);
            }
            setLoading(false);
        }
        validateIfLoggedIn();
    }, []);

    return loading ? (
        <Box
            className={classes.box}
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <CircularProgress />
        </Box>
    ) : loggedIn ? (
        <Route
            {...rest}
            render={props => {
                return Component ? <Component {...props} /> : render(props);
            }}
        />
    ) : (
        <Redirect
            to={{
                pathname: "/login",
                state: { from: history.location }
            }}
        />
    );
}

export default ProtectedRoute;
