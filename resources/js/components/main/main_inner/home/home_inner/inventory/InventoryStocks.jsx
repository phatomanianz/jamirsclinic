import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useRouteMatch } from "react-router-dom";

import { toast } from "react-toastify";

import { LoadingContext } from "../../../../../context/context";

import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import EditIcon from "@material-ui/icons/Edit";
import ListIcon from "@material-ui/icons/List";
import DeleteIcon from "@material-ui/icons/Delete";

import RenderByUserRole from "../../../../../common/RenderByUserRole";
import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TableComplex from "../../../../../common/TableComplex";
import Dialog from "../../../../../common/Dialog";
import http from "../../../../../../services/http";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    noWrap: {
        whiteSpace: "nowrap"
    },
    buttonSpacing: {
        marginRight: theme.spacing(0.4)
    }
}));

const renderColumns = (url, onClickDelete) => [
    {
        title: "Treatment ID",
        field: "treatment_id"
    },
    {
        title: "Treatment Name",
        field: "treatment_name"
    },
    {
        title: "Quantity",
        field: "quantity"
    },
    {
        title: "Options",
        field: "options",
        sorting: false,
        render: ({ id }) => (
            <React.Fragment>
                <Tooltip title="Edit" placement="top">
                    <IconButton
                        aria-label="delete"
                        color="primary"
                        size="small"
                        component={Link}
                        to={`${url}/${id}/edit`}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <RenderByUserRole
                    redirect={false}
                    notAllowedUser={["doctor", "receptionist"]}
                >
                    &nbsp;&nbsp;
                    <Tooltip title="Delete" placement="top">
                        <IconButton
                            aria-label="delete"
                            color="secondary"
                            size="small"
                            onClick={() => {
                                onClickDelete(id);
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </RenderByUserRole>
            </React.Fragment>
        )
    }
];

const apiUrl = "/api/stocks";

function InventoryStocks({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const match = useRouteMatch();

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [path, setPath] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const { loading, setLoading } = useContext(LoadingContext);

    const [deleteStockId, setDeleteStockId] = useState(null);
    const [openModalWarning, setOpenModalWarning] = useState(false);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        setActiveTab("inventorystocks");
        getStocksData();
    }, [activeTabTrigger]);

    const getStocksData = async () => {
        try {
            setLoading(true);
            setData([]);
            setCurrentPage(1);
            setPath("");
            setPerPage(10);
            setTotal(0);

            const { data } = await http.get(apiUrl);
            setExtractData(data);
        } catch (ex) {
            toast.error("An unexpected error occured");
            console.log(ex);
        }
        if (isMounted.current) {
            setLoading(false);
        }
    };

    const extractData = ({ stocks }) => {
        return stocks;
    };

    const setExtractData = data => {
        const {
            data: requestedData,
            current_page,
            path,
            per_page,
            total
        } = extractData(data);
        if (isMounted.current) {
            setLoading(false);
            setData(requestedData);
            setCurrentPage(current_page);
            setPath(path);
            setPerPage(per_page);
            setTotal(total);
        }
    };

    const handleCloseModalWarning = () => {
        setOpenModalWarning(false);
        setDeleteStockId(null);
    };

    const handleOnClickDeleteStocks = id => {
        setOpenModalWarning(true);
        setDeleteStockId(id);
    };

    const handleOnClickDeletedStocks = async () => {
        try {
            setOpenModalWarning(false);
            setLoading(true);
            await http.delete(`${apiUrl}/${deleteStockId}`);
            if (isMounted.current) {
                setDeleteStockId(null);
                setLoading(false);
                toast.success("Stocks deleted successfully");
                getStocksData();
            }
        } catch (ex) {
            if (isMounted.current) {
                setLoading(false);
            }
            toast.error("An unexpected error occured");
            console.log(ex);
        }
    };

    return (
        <Box className={classes.root}>
            <Dialog
                open={openModalWarning}
                onClose={handleCloseModalWarning}
                title="Delete Stocks"
                description="Are you sure you want to delete this stocks?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedStocks}
            />
            <Box mb={2}>
                <TitleHeader
                    backButton={false}
                    titleIcon={ListIcon}
                    title="Stocks"
                />
            </Box>
            <Box mb={2}>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    component={Link}
                    to={`${match.url}/add`}
                    startIcon={<AddCircleIcon />}
                >
                    Add New
                </Button>
            </Box>
            <TableComplex
                title="Stock List"
                columns={renderColumns(match.url, handleOnClickDeleteStocks)}
                setExtractData={extractData}
                loading={loading}
                currentPage={currentPage}
                path={path}
                perPage={perPage}
                data={data}
                total={total}
                orderBy="treatment_id"
                order="desc"
            />
        </Box>
    );
}

export default InventoryStocks;
