import React, { useContext } from "react";

import { useHistory } from "react-router-dom";

import { DashboardContext } from "../../../../context/context";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

function MenuTodayPatientRegistered(props) {
    const history = useHistory();
    const { dashboard } = useContext(DashboardContext);

    const handleClose = async () => {
        props.onClose();
        history.push("/home/patients");
    };

    return (
        <Menu {...props}>
            <MenuItem onClick={handleClose}>
                {dashboard
                    ? `${dashboard.today_patient_registered} ${
                          dashboard.today_patient_registered > 1
                              ? "Patients"
                              : "Patient"
                      } Registered Today`
                    : ""}
            </MenuItem>
        </Menu>
    );
}

export default MenuTodayPatientRegistered;
