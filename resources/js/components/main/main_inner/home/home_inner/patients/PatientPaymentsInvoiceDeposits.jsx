import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { LoadingContext } from "../../../../../context/context";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TableComplex from "../../../../../common/TableComplex";
import DepositAddEdit from "./common/DepositAddEdit";
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

const renderColumns = (onClickEdit, onClickDelete) => [
    {
        title: "Date",
        field: "date"
    },
    {
        title: "Amount",
        field: "amount"
    },
    {
        title: "Type",
        field: "type"
    },
    {
        title: "Options",
        field: "options",
        sorting: false,
        render: deposit => (
            <React.Fragment>
                <Tooltip title="Edit" placement="top">
                    <IconButton
                        aria-label="Edit"
                        color="primary"
                        size="small"
                        onClick={() => {
                            onClickEdit(deposit);
                        }}
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
                            onClickDelete(deposit.id);
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </React.Fragment>
        )
    }
];

const apiInvoices = "/api/invoices";
const apiDeposits = "/api/invoices";

function PatientPaymentsInvoiceDeposits({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();

    const history = useHistory();
    const params = useParams();

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [path, setPath] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const { loading, setLoading } = useContext(LoadingContext);

    const [openAddDepositModal, setOpenAddDepositModal] = useState(false);
    const [openEditDepositModal, setOpenEditDepositModal] = useState(false);
    const [editDeposit, setEditDeposit] = useState(null);
    const [
        openDeleteDepositModalWarning,
        setOpenDeleteDepositModalWarning
    ] = useState(false);
    const [deleteDepositID, setDeleteDepositID] = useState(null);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        setActiveTab(`patientlist`);
        getInvoiceDepositsData();
    }, [activeTabTrigger]);

    const getInvoiceDepositsData = async () => {
        try {
            setLoading(true);
            setData([]);
            setCurrentPage(1);
            setPath("");
            setPerPage(10);
            setTotal(0);

            const { data } = await http.get(
                `${apiInvoices}/${params.invoiceID}/deposits/show`
            );
            setExtractData(data);

            if (params.patientID != data.patient_id) {
                history.push("home/404");
            }
        } catch (ex) {
            if (ex.response && ex.response.status === 404) {
                history.push("home/404");
            } else {
                toast.error("An unexpected error occured.");
                console.log(ex);
            }
        }
        if (isMounted.current) {
            setLoading(false);
        }
    };

    const extractData = ({ deposits }) => {
        return deposits;
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

    /* Add deposit section */
    const handleClickAddDeposit = () => {
        setOpenAddDepositModal(true);
    };

    const handleCloseAddDepositModal = isAdded => {
        setOpenAddDepositModal(false);
        if (isAdded) {
            getInvoiceDepositsData();
        }
    };

    /* Edit deposit section */
    const handleClickEditDeposit = deposit => {
        setOpenEditDepositModal(true);
        setEditDeposit(deposit);
    };

    const handleCloseEditDepositModal = isAdded => {
        setOpenEditDepositModal(false);
        setEditDeposit(null);
        if (isAdded) {
            getInvoiceDepositsData();
        }
    };

    /* Delete deposit section */
    const handleClickDeleteDeposit = id => {
        setOpenDeleteDepositModalWarning(true);
        setDeleteDepositID(id);
    };

    const handleCloseDeleteDepositModalWarning = () => {
        setOpenDeleteDepositModalWarning(false);
        setDeleteDepositID(null);
    };

    const handleClickDeletedDeposit = async () => {
        try {
            setOpenDeleteDepositModalWarning(false);
            setLoading(true);
            await http.delete(
                `${apiDeposits}/${params.invoiceID}/deposits/${deleteDepositID}`
            );
            if (isMounted.current) {
                setDeleteDepositID(null);
                setLoading(false);
                toast.success("Deposit deleted successfully");
                getInvoiceDepositsData();
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
            {/* Add deposit dialog*/}
            <DepositAddEdit
                open={openAddDepositModal}
                onClose={handleCloseAddDepositModal}
                action="add"
                invoiceID={params.invoiceID}
            />
            {/* Edit deposit dialog*/}
            <DepositAddEdit
                open={openEditDepositModal}
                onClose={handleCloseEditDepositModal}
                action="edit"
                invoiceID={params.invoiceID}
                deposit={editDeposit}
            />
            {/* Delete deposit dialog*/}
            <Dialog
                open={openDeleteDepositModalWarning}
                onClose={handleCloseDeleteDepositModalWarning}
                title="Delete Deposit"
                description="Are you sure you want to delete this deposit?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleClickDeletedDeposit}
            />
            <Box mb={2}>
                <TitleHeader
                    backButton={true}
                    titleIcon={AccountBalanceWalletIcon}
                    title={`Deposits of Invoice ID: ${params.invoiceID}`}
                />
            </Box>
            <Box mb={2}>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddCircleIcon />}
                    onClick={handleClickAddDeposit}
                >
                    Add New
                </Button>
            </Box>
            <TableComplex
                title="Deposits List"
                columns={renderColumns(
                    handleClickEditDeposit,
                    handleClickDeleteDeposit
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

export default PatientPaymentsInvoiceDeposits;
