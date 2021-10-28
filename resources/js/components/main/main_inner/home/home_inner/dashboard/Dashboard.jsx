import React, { useContext, useEffect } from "react";

import DashboardMain from "./dashboard_sub/DashboardMain";
import DashboardPatient from "./dashboard_sub/DashboardPatient";

import { AuthUserContext } from "../../../../../context/context";

function Dashboard({ setActiveTab, activeTabTrigger }) {
    const { authUser } = useContext(AuthUserContext);

    useEffect(() => {
        setActiveTab("dashboard");
    }, [activeTabTrigger]);

    if (authUser && authUser.role === "patient") {
        return (
            <DashboardPatient
                setActiveTab={setActiveTab}
                activeTabTrigger={activeTabTrigger}
            />
        );
    } else {
        return (
            <DashboardMain
                setActiveTab={setActiveTab}
                activeTabTrigger={activeTabTrigger}
            />
        );
    }
}

export default Dashboard;
