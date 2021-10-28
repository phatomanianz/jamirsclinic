import React from "react";
import { PropTypes } from "prop-types";

import useMediaQuery from "@material-ui/core/useMediaQuery";
import { withStyles } from "@material-ui/core/styles";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
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

const ResponsiveTableBody = props => {
    const { isMobileScreen, children, ...rest } = props;

    return isMobileScreen ? (
        <StyledTableBody {...rest}>{children}</StyledTableBody>
    ) : (
        <TableBody {...rest}>{children}</TableBody>
    );
};

const ResponsiveTableRow = props => {
    const { isMobileScreen, children, striped, ...rest } = props;

    return isMobileScreen ? (
        striped ? (
            <StyledTableRowStriped {...rest}>{children}</StyledTableRowStriped>
        ) : (
            <StyledTableRow {...rest}>{children}</StyledTableRow>
        )
    ) : (
        <TableRow {...rest}>{children}</TableRow>
    );
};

const ResponsiveTableCell = props => {
    const { isMobileScreen, children, ...rest } = props;

    return isMobileScreen ? (
        <StyledTableCell {...rest}>{children}</StyledTableCell>
    ) : (
        <TableCell {...rest}>{children}</TableCell>
    );
};

function TableSimple(props) {
    const isMobileScreen = useMediaQuery(theme => theme.breakpoints.down("xs"));

    props = { ...TableSimple.defaultProps, ...props };
    const { customHeadTableCell: CustomHeadTableCell } = props;

    return (
        <TableContainer {...props.tableContainer}>
            <Table {...props.table}>
                {isMobileScreen ? null : (
                    <TableHead {...props.tableHead}>
                        <TableRow {...props.tableHeadRow}>
                            {props.columns.map(column =>
                                CustomHeadTableCell ? (
                                    <CustomHeadTableCell
                                        {...props.tableHeadCell}
                                        key={column.field + column.title}
                                        align={
                                            column.align
                                                ? column.align
                                                : "inherit"
                                        }
                                    >
                                        {column.title}
                                    </CustomHeadTableCell>
                                ) : (
                                    <TableCell
                                        {...props.tableHeadCell}
                                        key={column.field + column.title}
                                        align={
                                            column.align
                                                ? column.align
                                                : "inherit"
                                        }
                                    >
                                        {column.title}
                                    </TableCell>
                                )
                            )}
                        </TableRow>
                    </TableHead>
                )}
                <ResponsiveTableBody
                    isMobileScreen={isMobileScreen}
                    {...props.tableBody}
                >
                    {props.rows.length > 0 ? (
                        props.rows.map((row, index) => (
                            <ResponsiveTableRow
                                {...props.tableBodyRow}
                                key={index}
                                isMobileScreen={isMobileScreen}
                                striped
                            >
                                {props.columns.map((column, index) => (
                                    <ResponsiveTableCell
                                        {...props.tableBodyCell}
                                        isMobileScreen={isMobileScreen}
                                        key={index}
                                    >
                                        {isMobileScreen ? (
                                            <Box display="flex">
                                                <Box width="50%">
                                                    {column.title}
                                                </Box>
                                                <Box width="50%">
                                                    {column.render
                                                        ? column.render(
                                                              column.field
                                                                  ? row[
                                                                        column
                                                                            .field
                                                                    ]
                                                                  : row
                                                          )
                                                        : row[column.field]}
                                                </Box>
                                            </Box>
                                        ) : column.render ? (
                                            column.render(
                                                column.field
                                                    ? row[column.field]
                                                    : row
                                            )
                                        ) : (
                                            row[column.field]
                                        )}
                                    </ResponsiveTableCell>
                                ))}
                            </ResponsiveTableRow>
                        ))
                    ) : (
                        <ResponsiveTableRow isMobileScreen={isMobileScreen}>
                            <ResponsiveTableCell
                                isMobileScreen={isMobileScreen}
                                align="center"
                                colSpan={props.columns.length}
                            >
                                {props.emptyDataRowsMessage}
                            </ResponsiveTableCell>
                        </ResponsiveTableRow>
                    )}
                </ResponsiveTableBody>
            </Table>
        </TableContainer>
    );
}

TableSimple.defaultProps = {
    emptyDataRowsMessage: "No records to display"
};

TableSimple.propTypes = {
    columns: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
    emptyDataRowsMessage: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ])
};

export default TableSimple;
