import React, { useState, useEffect, useContext, useRef } from "react";
import { PropTypes } from "prop-types";

import { toast } from "react-toastify";

import useMediaQuery from "@material-ui/core/useMediaQuery";

import MaterialTable from "material-table";
import TablePagination from "@material-ui/core/TablePagination";

import TableToolbar from "./TableToolbar";
import TableBodyMobileScreen from "./TableBodyMobileScreen";
import TableHeader from "./TableHeader";
import TablePaginationActions from "./TablePagination";

import { LoadingContext, ScrollTopContext } from "../context/context";

import http from "../../services/http";

function TableComplex(props) {
    const isMounted = useRef(true);

    const isMobileScreen = useMediaQuery(theme => theme.breakpoints.down("xs"));

    const [data, setData] = useState(props.data);
    const [currentPage, setCurrentPage] = useState(props.currentPage);
    const [path, setPath] = useState(props.path);
    const [perPage, setPerPage] = useState(props.perPage);
    const [total, setTotal] = useState(props.total);

    const [orderBy, setOrderBy] = useState(props.orderBy);
    const [order, setOrder] = useState(props.order);

    const [search, setSearch] = useState("");
    const [searchAutoFocus, setSearchAutoFocus] = useState(false);

    const { setLoading } = useContext(LoadingContext);
    const scrollTop = useContext(ScrollTopContext);

    const [request, setRequest] = useState(false);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setData(props.data);
        setCurrentPage(props.currentPage);
        setPath(props.path);
        setPerPage(props.perPage);
        setTotal(props.total);
        setSearch("");
    }, [props.data, props.currentPage, props.path, props.perPage, props.total]);

    useEffect(() => {
        if (request) {
            requestAndSetData();
        }
    }, [request]);

    useEffect(() => {
        scrollTop();
    }, [data, currentPage, path, perPage, total]);

    const requestAndSetData = async () => {
        try {
            const { customQuery, setExtractData } = props;
            const currentPageCopy = currentPage;

            setLoading(true);
            setData([]);
            setCurrentPage(1);

            const currentPageQuery = `page=${currentPageCopy}`;
            const perPageQuery = `&per_page=${perPage}`;
            const orderByQuery = orderBy ? `&order_by=${orderBy}` : "";
            const orderQuery = orderBy ? `&order_direction=${order}` : "";
            const searchQuery = search ? `&search=${search}` : "";
            const customRequestQuery = customQuery ? `&${customQuery}` : "";

            const requestPath = `${path}?${currentPageQuery}${perPageQuery}${orderByQuery}${orderQuery}${searchQuery}${customRequestQuery}`;

            const { data: dataRequest } = await http.get(requestPath);
            const result = setExtractData(dataRequest);
            if (isMounted.current) {
                setData(result.data);
                setCurrentPage(result.current_page);
                setPath(result.path);
                setPerPage(result.per_page);
                setTotal(result.total);
                setLoading(false);
                setRequest(false);
            }
        } catch (ex) {
            console.log(ex);
            toast.error("An unexpected error occured.");
        }
    };

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage + 1);
        setSearchAutoFocus(true);
        setRequest(true);
    };

    const handleChangeRowsPerPage = event => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
        setSearchAutoFocus(true);
        setRequest(true);
    };

    const handleColumnSort = field => {
        const isAsc = orderBy === field && order === "asc";
        const ordered = isAsc ? "desc" : "asc";
        setOrderBy(field);
        setOrder(ordered);
        setCurrentPage(1);
        setSearchAutoFocus(true);
        setRequest(true);
    };

    const handleSearch = searchText => {
        setSearch(searchText);
        setSearchAutoFocus(true);
        setRequest(true);
    };

    const { title, columns, loading } = props;
    return (
        <MaterialTable
            key={data.length}
            /* Remove title in mobile screen size  */
            title={isMobileScreen ? "" : title}
            columns={columns}
            data={data}
            options={{
                pageSize: perPage,
                padding: "dense",
                emptyRowsWhenPaging: false,
                thirdSortClick: false,
                exportButton: true,
                /* Remove header in mobile screen size  */
                header: isMobileScreen ? false : true
            }}
            components={{
                Toolbar: props => (
                    <TableToolbar
                        {...props}
                        searchText={search}
                        onSearch={handleSearch}
                        searchAutoFocus={searchAutoFocus}
                    />
                ),
                Header: props => (
                    <TableHeader
                        {...props}
                        onColumnSort={handleColumnSort}
                        order={order}
                        orderBy={orderBy}
                    />
                ),
                /* Override TableBody in mobile screen size  */
                ...(isMobileScreen
                    ? { Body: props => <TableBodyMobileScreen {...props} /> }
                    : {}),
                Pagination: props => (
                    <TablePagination
                        {...props}
                        rowsPerPageOptions={[10, 25, 50, 75, 100]}
                        colSpan={3}
                        count={total}
                        rowsPerPage={perPage}
                        page={currentPage - 1}
                        SelectProps={{
                            inputProps: {
                                "aria-label": "rows per page"
                            },
                            native: true
                        }}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                        ActionsComponent={TablePaginationActions}
                    />
                )
            }}
            localization={{
                body: {
                    emptyDataSourceMessage: loading
                        ? "Loading..."
                        : "No records to display"
                }
            }}
        />
    );
}

TableComplex.propTypes = {
    title: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
    setExtractData: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    path: PropTypes.string.isRequired,
    perPage: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    orderBy: PropTypes.string.isRequired,
    order: PropTypes.string.isRequired
};

export default TableComplex;
