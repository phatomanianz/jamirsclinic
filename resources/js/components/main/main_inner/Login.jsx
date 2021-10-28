import React, { useState, useEffect, useContext } from "react";
import { Redirect, useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";
import Collapse from "@material-ui/core/Collapse";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Container from "@material-ui/core/Container";
import CloseIcon from "@material-ui/icons/Close";
import LinearProgress from "@material-ui/core/LinearProgress";
import CircularProgress from "@material-ui/core/CircularProgress";

import TextInput from "../../common/TextInput";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { SettingsContext } from "../../context/context";
import auth from "../../../services/auth";

const useStyles = makeStyles(theme => ({
    root: {
        height: "100vh"
    },
    paper: {
        marginTop: theme.spacing(3),
        padding: theme.spacing(4),
        [theme.breakpoints.down("xs")]: {
            padding: theme.spacing(2)
        },
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    }
}));

function Login() {
    const classes = useStyles();
    const history = useHistory();

    const [loading, setLoading] = useState(true);
    const [loadingForm, setLoadingForm] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [invalidCredentials, setInvalidCredentials] = useState(null);

    const { settings } = useContext(SettingsContext);

    const handleSubmit = async ({ email, password }, { setSubmitting }) => {
        try {
            setLoadingForm(true);
            await auth.login(email, password);
            setSubmitting(false);
            setLoggedIn(true);
        } catch (ex) {
            if (ex.response && ex.response.status === 401) {
                setInvalidCredentials(ex.response.data);
                setLoadingForm(false);
            }
        }
    };

    useEffect(() => {
        async function validateIfLoggedIn() {
            if (await auth.validateUser()) {
                setLoggedIn(true);
            } else {
                setLoggedIn(false);
            }
            setLoading(false);
        }
        validateIfLoggedIn();
    }, []);

    return loading ? (
        <Box
            className={classes.root}
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <CircularProgress />
        </Box>
    ) : loggedIn ? (
        <Redirect
            to={
                history.location.state
                    ? history.location.state.from.pathname
                    : "/home/dashboard"
            }
        />
    ) : (
        <React.Fragment>
            {loadingForm && <LinearProgress />}
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                bgcolor="primary.main"
                color="primary.contrastText"
                className={classes.root}
            >
                <Typography variant="h5">
                    {settings && settings.name}
                </Typography>
                <Container component="main" maxWidth="xs">
                    <Paper>
                        <div className={classes.paper}>
                            <Avatar className={classes.avatar}>
                                <LockOutlinedIcon />
                            </Avatar>
                            <Typography component="h1" variant="h5">
                                Sign in
                            </Typography>
                            <Box width="100%" mt={3}>
                                <Collapse in={Boolean(invalidCredentials)}>
                                    <Alert
                                        action={
                                            <IconButton
                                                aria-label="close"
                                                color="inherit"
                                                size="small"
                                                onClick={() => {
                                                    setInvalidCredentials(null);
                                                }}
                                            >
                                                <CloseIcon fontSize="inherit" />
                                            </IconButton>
                                        }
                                        severity="error"
                                    >
                                        {invalidCredentials &&
                                            invalidCredentials.message}
                                    </Alert>
                                </Collapse>
                            </Box>
                            <Formik
                                initialValues={{
                                    email: "",
                                    password: ""
                                }}
                                validationSchema={Yup.object({
                                    email: Yup.string()
                                        .email()
                                        .required("Required")
                                        .label("Email"),
                                    password: Yup.string().required("Required")
                                })}
                                onSubmit={handleSubmit}
                            >
                                <Form>
                                    <TextInput
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        size="small"
                                        id="email"
                                        label="Email"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                    />
                                    <TextInput
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        size="small"
                                        name="password"
                                        label="Password"
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                    />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        className={classes.submit}
                                    >
                                        Sign In
                                    </Button>
                                </Form>
                            </Formik>
                        </div>
                    </Paper>
                </Container>
            </Box>
        </React.Fragment>
    );
}

export default Login;
