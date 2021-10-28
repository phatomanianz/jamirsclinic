import React from "react";

import { useHistory } from "react-router-dom";

import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

function TitleHeader(props) {
    const history = useHistory();

    props = { ...TitleHeader.defaultProps, ...props };

    const handleBackButton = () => history.goBack();

    return (
        <Paper>
            <Box p={1} display="flex" alignItems="center">
                {props.backButton && (
                    <Box mr={0.5}>
                        <Tooltip title="Back">
                            <IconButton
                                aria-label="Back button"
                                component="span"
                                size="small"
                                onClick={handleBackButton}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                {props.titleIcon && (
                    <Hidden smDown implementation="css">
                        <Box mr={0.5} display="flex" alignItems="center">
                            <props.titleIcon />
                        </Box>
                    </Hidden>
                )}
                {props.renderTitle ? (
                    props.renderTitle(props)
                ) : (
                    <Typography variant="h6" align={props.titleAlign} noWrap>
                        {props.title}
                    </Typography>
                )}
            </Box>
            {props.children && (
                <Box p={1} mt={1}>
                    {props.children}
                </Box>
            )}
        </Paper>
    );
}

TitleHeader.defaultProps = {
    backButton: true,
    titleIcon: false,
    title: "",
    titleAlign: "inherit",
    renderTitle: null
};

export default TitleHeader;
