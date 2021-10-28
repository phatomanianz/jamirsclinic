import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import Login from "./main_inner/Login";
import Home from "./main_inner/home/Home";
import NotFound from "./main_inner/NotFound";

import {
    LoadingContext,
    SettingsContext,
    AuthUserContext
} from "../context/context";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import ProtectedRoute from "../common/ProtectedRoute";

// Fonts
import "fontsource-roboto/latin-300-normal.css";
import "fontsource-roboto/latin-400-normal.css";
import "fontsource-roboto/latin-500-normal.css";
import "fontsource-roboto/latin-700-normal.css";
// Icons
import "material-design-icons/iconfont/material-icons.css";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import http from "../../services/http";

const theme = createMuiTheme({});

const apiSettings = "api/settings";

export default function Main() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState(null);
    const [authUser, setAuthUser] = useState(null);

    useEffect(() => {
        getSettingsData();
    }, []);

    const getSettingsData = async () => {
        try {
            const { data } = await http.get(apiSettings);
            setSettings(data.setting);
        } catch (ex) {
            toast.error("An unexpected error occured.");
            console.log(ex);
        }
    };

    return (
        <AuthUserContext.Provider value={{ authUser, setAuthUser }}>
            <SettingsContext.Provider
                value={{ settings, setSettings: getSettingsData }}
            >
                <LoadingContext.Provider value={{ loading, setLoading }}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <Router>
                            <Switch>
                                <Route path="/login" component={Login} />
                                <ProtectedRoute path="/home" component={Home} />
                                <Route path="/404" component={NotFound} />
                                <Redirect path="/" exact to="/login" />
                                <Redirect to="/404" />
                            </Switch>
                        </Router>
                        <ToastContainer />
                    </ThemeProvider>
                </LoadingContext.Provider>
            </SettingsContext.Provider>
        </AuthUserContext.Provider>
    );
}

if (document.getElementById("app")) {
    ReactDOM.render(<Main />, document.getElementById("app"));
}
