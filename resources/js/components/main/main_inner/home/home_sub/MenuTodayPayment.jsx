import React, { useContext } from "react";

import { useHistory } from "react-router-dom";

import { DashboardContext } from "../../../../context/context";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

function MenuTodayPayment(props) {
    const history = useHistory();
    const { dashboard } = useContext(DashboardContext);

    const handleClose = async () => {
        props.onClose();
        history.push("/home/payments");
    };

    return (
        <Menu {...props}>
            <MenuItem onClick={handleClose}>
                {dashboard
                    ? `${dashboard.today_payment} ${
                          dashboard.today_payment > 1 ? "Payments" : "Payment"
                      } Today`
                    : ""}
            </MenuItem>
        </Menu>
    );
}

export default MenuTodayPayment;
