import React, { useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import { SettingsContext } from "../../../../../../context/context";

const useStyles = makeStyles(theme => ({
    logo: {
        height: theme.spacing(15),
        width: theme.spacing(25)
    }
}));

function PrintHeader(props) {
    const classes = useStyles();
    const { settings } = useContext(SettingsContext);

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <Box>
                <Typography variant="h4">
                    {settings && settings.name}
                </Typography>
            </Box>
            <Box mt={1}>
                <Typography>{settings && settings.address}</Typography>
            </Box>
            <Box mt={0.5}>
                <Typography>Phone: {settings && settings.phone}</Typography>
            </Box>
            <Box mt={0.5}>
                <Typography>Email: {settings && settings.email}</Typography>
            </Box>
            {settings && settings.logo && (
                <Box mt={1.5}>
                    <img src={settings.logo} className={classes.logo} />
                </Box>
            )}
            {props.children}
        </Box>
    );
}

export default PrintHeader;
