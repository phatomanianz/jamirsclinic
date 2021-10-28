import React, { useContext } from "react";

import { useHistory } from "react-router-dom";

import { DashboardContext } from "../../../../context/context";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

function MenuTodayAppointment(props) {
    const history = useHistory();
    const { dashboard } = useContext(DashboardContext);

    const handleClose = async () => {
        props.onClose();
        history.push("/home/appointments/today");
    };

    return (
        <Menu {...props}>
            <MenuItem onClick={handleClose}>
                {dashboard
                    ? `${dashboard.today_appointment} ${
                          dashboard.today_appointment > 1
                              ? "Appointments"
                              : "Appointment"
                      } Today`
                    : ""}
            </MenuItem>
        </Menu>
    );
}

export default MenuTodayAppointment;
