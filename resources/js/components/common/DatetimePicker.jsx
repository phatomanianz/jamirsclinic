import React from "react";

import {
    MuiPickersUtilsProvider,
    KeyboardDateTimePicker
} from "@material-ui/pickers";
import moment from "@date-io/moment";

function DatetimePicker(props) {
    return (
        <MuiPickersUtilsProvider utils={moment}>
            <KeyboardDateTimePicker
                {...props}
                KeyboardButtonProps={{
                    "aria-label": "change date & time"
                }}
            />
        </MuiPickersUtilsProvider>
    );
}

export default DatetimePicker;
