import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Box from "@material-ui/core/Box";

const StyledTableBody = withStyles({
    root: {
        display: "block"
    }
})(TableBody);

const StyledTableRow = withStyles(theme => ({
    root: {
        display: "block"
    }
}))(TableRow);

const StyledTableRowStriped = withStyles(theme => ({
    root: {
        "&:nth-of-type(odd)": {
            backgroundColor: theme.palette.action.hover
        },
        display: "block"
    }
}))(TableRow);

const StyledTableCell = withStyles({
    root: {
        display: "block"
    }
})(TableCell);

export default function TableBodyMobileScreen(props) {
    const localization = {
        ...TableBodyMobileScreen.defaultProps.localization,
        ...props.localization
    };

    return (
        <StyledTableBody>
            {props.renderData.length > 0 ? (
                props.renderData.map((row, index) => (
                    <StyledTableRowStriped key={index}>
                        {props.columns.map(column => (
                            <StyledTableCell
                                key={column.field}
                                padding={
                                    column.disablePadding ? "none" : "default"
                                }
                                size={
                                    props.options.padding === "default"
                                        ? "medium"
                                        : "small"
                                }
                            >
                                <Box display="flex">
                                    <Box width="50%">{column.title}</Box>
                                    <Box width="50%">
                                        {column.render
                                            ? column.render(row)
                                            : row[column.field]}
                                    </Box>
                                </Box>
                            </StyledTableCell>
                        ))}
                    </StyledTableRowStriped>
                ))
            ) : (
                <StyledTableRow>
                    <StyledTableCell
                        align="center"
                        size={
                            props.options.padding === "default"
                                ? "medium"
                                : "small"
                        }
                    >
                        {localization.emptyDataSourceMessage}
                    </StyledTableCell>
                </StyledTableRow>
            )}
        </StyledTableBody>
    );
}

TableBodyMobileScreen.defaultProps = {
    renderData: [],
    localization: {
        emptyDataSourceMessage: "No records to display"
    }
};

TableBodyMobileScreen.propTypes = {
    columns: PropTypes.array.isRequired,
    localization: PropTypes.object,
    renderData: PropTypes.array
};
