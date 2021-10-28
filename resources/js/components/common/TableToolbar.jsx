import React, { useState, useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";

const useStyles = makeStyles(theme => ({
    root: {
        paddingRight: theme.spacing(1)
    },
    spacer: {
        flex: "1 1 10%"
    },
    title: {
        overflow: "hidden"
    },
    searchField: {
        minWidth: 150,
        paddingLeft: theme.spacing(2)
    }
}));

function TableToolbar(props) {
    const classes = useStyles();
    const [searchText, setSearchtext] = useState(props.searchText);

    useEffect(() => {
        setSearchtext(props.searchText);
    }, [props.searchText]);

    const onSearchChange = searchText => {
        props.onSearch(searchText);
    };

    const renderSearch = () => {
        const localization = {
            ...TableToolbar.defaultProps.localization,
            ...props.localization
        };
        if (props.search) {
            return (
                <TextField
                    autoFocus={props.searchAutoFocus}
                    className={classes.searchField}
                    value={searchText}
                    onChange={event => onSearchChange(event.target.value)}
                    placeholder={localization.searchPlaceholder}
                    variant={props.searchFieldVariant}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Tooltip title={localization.searchTooltip}>
                                    <props.icons.Search fontSize="small" />
                                </Tooltip>
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    disabled={!searchText}
                                    onClick={() => onSearchChange("")}
                                >
                                    <props.icons.ResetSearch fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                        style: props.searchFieldStyle,
                        inputProps: {
                            "aria-label": "Search"
                        }
                    }}
                />
            );
        } else {
            return null;
        }
    };

    const renderToolbarTitle = title => {
        const toolBarTitle =
            typeof title === "string" ? (
                <Typography
                    variant="h6"
                    style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}
                >
                    {title}
                </Typography>
            ) : (
                title
            );

        return <div className={classes.title}>{toolBarTitle}</div>;
    };

    const title = props.title ? props.title : null;
    return (
        <Toolbar className={classes.root}>
            {title && renderToolbarTitle(title)}
            <div className={classes.spacer} />
            {renderSearch()}
        </Toolbar>
    );
}

TableToolbar.defaultProps = {
    localization: {
        searchTooltip: "Search",
        searchPlaceholder: "Search"
    },
    search: true,
    showTitle: true,
    searchText: "",
    searchAutoFocus: false,
    searchFieldVariant: "standard",
    title: "No Title!"
};

TableToolbar.propTypes = {
    localization: PropTypes.object.isRequired,
    searchText: PropTypes.string,
    onSearchChanged: PropTypes.func.isRequired,
    search: PropTypes.bool.isRequired,
    searchFieldStyle: PropTypes.object,
    searchFieldVariant: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    showTitle: PropTypes.bool.isRequired,
    classes: PropTypes.object,
    searchAutoFocus: PropTypes.bool
};

export default TableToolbar;
