import React from "react";

const ScrollTopContext = React.createContext(() => {});

const LoadingContext = React.createContext({
    loading: false,
    setLoading: () => {}
});

const AuthUserContext = React.createContext({
    authUser: {},
    setAuthUser: () => {}
});

const SettingsContext = React.createContext({
    settings: {},
    setSettings: () => {}
});

const DashboardContext = React.createContext({
    dashboard: {},
    setDashboard: () => {}
});

export {
    AuthUserContext,
    LoadingContext,
    ScrollTopContext,
    SettingsContext,
    DashboardContext
};
