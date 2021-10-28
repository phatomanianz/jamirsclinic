import React from "react";

import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from "@material-ui/pickers";
import moment from "@date-io/moment";

function DatePicker(props) {
    return (
        <MuiPickersUtilsProvider utils={moment}>
            <KeyboardDatePicker
                {...props}
                KeyboardButtonProps={{
                    "aria-label": "change date"
                }}
            />
        </MuiPickersUtilsProvider>
    );
}

export default DatePicker;
