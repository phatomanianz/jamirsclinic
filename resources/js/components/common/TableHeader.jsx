import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";

const useStyles = makeStyles(theme => ({
    visuallyHidden: {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: 1,
        margin: -1,
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        top: 20,
        width: 1
    }
}));

export default function TableHeader(props) {
    const classes = useStyles();

    return (
        <TableHead>
            <TableRow>
                {props.columns.map(column => (
                    <TableCell
                        key={column.field}
                        align={column.numeric ? "right" : "left"}
                        padding={column.disablePadding ? "none" : "default"}
                        size={
                            props.options.padding === "default"
                                ? "medium"
                                : "small"
                        }
                        sortDirection={
                            props.orderBy === column.field ? props.order : false
                        }
                    >
                        {column.sorting !== false ? (
                            <TableSortLabel
                                active={props.orderBy === column.field}
                                direction={
                                    props.orderBy === column.field
                                        ? props.order
                                        : "asc"
                                }
                                onClick={() => props.onColumnSort(column.field)}
                            >
                                {column.title}
                                {props.orderBy === column.field ? (
                                    <span className={classes.visuallyHidden}>
                                        {props.order === "desc"
                                            ? "sorted descending"
                                            : "sorted ascending"}
                                    </span>
                                ) : null}
                            </TableSortLabel>
                        ) : (
                            column.title
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

TableHeader.propTypes = {
    columns: PropTypes.array.isRequired,
    onColumnSort: PropTypes.func.isRequired
};
