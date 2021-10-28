import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useRouteMatch } from "react-router-dom";

import { toast } from "react-toastify";

import { LoadingContext } from "../../../../../context/context";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import WorkIcon from "@material-ui/icons/Work";
import VisibilityIcon from "@material-ui/icons/Visibility";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TableComplex from "../../../../../common/TableComplex";
import Dialog from "../../../../../common/Dialog";
import http from "../../../../../../services/http";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    }
}));

const renderColumns = (url, onClickDelete) => [
    {
        title: "Date",
        field: "date"
    },
    {
        title: "Patient ID",
        field: "patient_id"
    },
    {
        title: "Patient Name",
        field: "patient_name"
    },
    {
        title: "Description",
        field: "description"
    },
    {
        title: "Note",
        field: "note"
    },
    {
        title: "Options",
        field: "options",
        sorting: false,
        render: ({ id }) => (
            <React.Fragment>
                <Tooltip title="View" placement="top">
                    <IconButton
                        aria-label="View"
                        color="default"
                        size="small"
                        component={Link}
                        to={`${url}/${id}/view`}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                &nbsp;&nbsp;
                <Tooltip title="Edit" placement="top">
                    <IconButton
                        aria-label="Edit"
                        color="primary"
                        size="small"
                        component={Link}
                        to={`${url}/${id}/edit`}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                &nbsp;&nbsp;
                <Tooltip title="Delete" placement="top">
                    <IconButton
                        aria-label="Delete"
                        color="secondary"
                        size="small"
                        onClick={() => {
                            onClickDelete(id);
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </React.Fragment>
        )
    }
];

const apiCaseHistoriesUrl = "/api/casehistories";

function CaseHistories({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const match = useRouteMatch();

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [path, setPath] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const { loading, setLoading } = useContext(LoadingContext);

    const [deleteCaseHistoryID, setDeleteCaseHistoryID] = useState(null);
    const [openModalWarning, setOpenModalWarning] = useState(false);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        setActiveTab(`casehistories`);
        getCaseHistoriesData();
    }, [activeTabTrigger]);

    const getCaseHistoriesData = async () => {
        try {
            setLoading(true);
            setData([]);
            setCurrentPage(1);
            setPath("");
            setPerPage(10);
            setTotal(0);

            const { data } = await http.get(apiCaseHistoriesUrl);
            setExtractData(data);
        } catch (ex) {
            toast.error("An unexpected error occured");
            console.log(ex);
        }
        if (isMounted.current) {
            setLoading(false);
        }
    };

    const extractData = ({ case_histories }) => {
        return case_histories;
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
        setDeleteCaseHistoryID(null);
    };

    const handleOnClickDeleteCaseHistory = id => {
        setOpenModalWarning(true);
        setDeleteCaseHistoryID(id);
    };

    const handleOnClickDeletedCaseHistory = async () => {
        try {
            setOpenModalWarning(false);
            setLoading(true);
            await http.delete(`${apiCaseHistoriesUrl}/${deleteCaseHistoryID}`);
            if (isMounted.current) {
                setDeleteCaseHistoryID(null);
                setLoading(false);
                toast.success("Case History deleted successfully");
                getCaseHistoriesData();
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
                title="Delete Case History"
                description="Are you sure you want to delete this case history?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedCaseHistory}
            />
            <Box mb={2}>
                <TitleHeader
                    backButton={false}
                    titleIcon={WorkIcon}
                    title="Case Histories"
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
                title="Case Histories List"
                columns={renderColumns(
                    match.url,
                    handleOnClickDeleteCaseHistory
                )}
                setExtractData={extractData}
                loading={loading}
                currentPage={currentPage}
                path={path}
                perPage={perPage}
                data={data}
                total={total}
                orderBy="id"
                order="desc"
            />
        </Box>
    );
}

export default CaseHistories;
