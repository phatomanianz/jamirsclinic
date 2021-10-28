import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useHistory, useRouteMatch, Link } from "react-router-dom";

import { toast } from "react-toastify";

import DepositAddEdit from "./common/DepositAddEdit";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import TableCell from "@material-ui/core/TableCell";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import VisibilityIcon from "@material-ui/icons/Visibility";
import PrintIcon from "@material-ui/icons/Print";
import PaymentIcon from "@material-ui/icons/Payment";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import MoneyIcon from "@material-ui/icons/Money";

import RenderByUserRole from "../../../../../common/RenderByUserRole";
import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import DatePicker from "../../../../../common/DatePicker";
import TableSimple from "../../../../../common/TableSimple";
import DialogCustom from "../../../../../common/Dialog";
import PrintHeader from "../settings/common/PrintHeader";

import ReactToPrint from "react-to-print";

import {
    LoadingContext,
    SettingsContext,
    AuthUserContext
} from "../../../../../context/context";
import http from "../../../../../../services/http";
import utils from "../../../../../../utilities/utils";

import moment from "moment";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden",
        marginBottom: theme.spacing(3)
    },
    flexWrapper: {
        [theme.breakpoints.only("xs")]: {
            flexDirection: "column"
        }
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    amountIcon: {
        fontSize: theme.spacing(6)
    },
    amountValueTypography: {
        fontSize: theme.spacing(3)
    },
    borderBottom: {
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: theme.palette.grey[500]
    },
    dispalyNone: {
        display: "none"
    }
}));

const StyledHeadTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white
    }
}))(TableCell);

const StyledHeadTableCellForPrintInvoice = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
    }
}))(TableCell);

const renderAllBillsColumns = (url, onClickDelete) => {
    return [
        { title: "Date", field: "date" },
        {
            title: "Invoice #",
            field: "id"
        },
        {
            title: "Bill Amount",
            field: "total"
        },
        {
            title: "Total Deposit",
            field: "deposits"
        },
        {
            title: "Due",
            field: "due"
        },
        {
            title: "Options",
            field: "id",
            render: id => (
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
                    <RenderByUserRole
                        redirect={false}
                        notAllowedUser={["patient"]}
                    >
                        <Tooltip title="Deposits" placement="top">
                            <Box color="success.main" component="span">
                                <IconButton
                                    aria-label="Deposits"
                                    color="inherit"
                                    size="small"
                                    component={Link}
                                    to={`${url}/${id}/deposits`}
                                >
                                    <AccountBalanceWalletIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Tooltip>
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
                    </RenderByUserRole>
                </React.Fragment>
            )
        }
    ];
};

const renderInvoicesTableColumns = () => [
    { title: "Date", field: "date" },
    {
        title: "Invoice #",
        field: "id"
    },
    {
        title: "Bill Amount",
        field: "total"
    },
    {
        title: "Deposit",
        field: "deposits"
    }
];

const apiPatientsUrl = "api/patients";
const apiInvoicesUrl = "api/invoices";
const currentDate = moment().format("MM-DD-YYYY");

function PatientPayments({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();

    const params = useParams();
    const history = useHistory();
    const match = useRouteMatch();

    const { authUser } = useContext(AuthUserContext);

    useEffect(() => {
        if (authUser && authUser.role === "patient") {
            setActiveTab("role_patients_payments");
        } else {
            setActiveTab("patientlist");
        }
    }, [activeTabTrigger]);

    const [patient, setPatient] = useState({});
    const [invoicesUnfiltered, setInvoicesUnfiltered] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [totalInvoice, setTotalInvoice] = useState({});

    const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);
    const [
        openDeleteInvoiceModalWarning,
        setOpenDeleteInvoiceModalWarning
    ] = useState(false);

    const [selectedDateFrom, setSelectedDateFrom] = useState(null);
    const [selectedDateFromError, setSelectedDateFromError] = useState(null);
    const [selectedDateTo, setSelectedDateTo] = useState(null);
    const [selectedDateToError, setSelectedDateToError] = useState(null);

    const [openAddDepositModal, setOpenAddDepositModal] = useState(false);

    const invoiceForPrintRef = useRef();
    const { loading, setLoading } = useContext(LoadingContext);
    const { settings } = useContext(SettingsContext);

    useEffect(() => {
        setLoading(false);
        async function getInitialInvoicesData() {
            const data = await getPatientInvoicesData();
            setInvoicesUnfiltered(data);
        }
        getInitialInvoicesData();

        return () => {
            isMounted.current = false;
        };
    }, []);

    const getPatientInvoicesData = async (dateFrom = "", dateTo = "") => {
        let invoicesConverted = [];
        try {
            setLoading(true);
            setInvoices([]);
            const queryParams =
                dateFrom !== "" && dateTo !== ""
                    ? `?date_from=${dateFrom}&date_to=${dateTo}`
                    : "";
            const { data } = await http.get(
                `${apiPatientsUrl}/${params.patientID}/invoices/show${queryParams}`
            );
            const {
                patient: patientRequest,
                invoices: invoicesRequest,
                total_invoice
            } = data;
            invoicesConverted = utils.convertPropertyNumberToString(
                invoicesRequest,
                "id"
            );
            if (isMounted.current) {
                setPatient(patientRequest);
                setInvoices(invoicesConverted);
                setTotalInvoice(total_invoice);
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
        return invoicesConverted;
    };

    /* Invoices section */
    const handleDateFromChange = date => {
        setSelectedDateFrom(date);
        setSelectedDateFromError(null);
    };

    const handleDateToChange = date => {
        setSelectedDateTo(date);
        setSelectedDateToError(null);
    };

    const handleDateSearchSubmit = e => {
        e.preventDefault();

        if (selectedDateFrom !== null || selectedDateTo !== null) {
            let error = false;

            if (selectedDateFrom === null) {
                setSelectedDateFromError("Required");
                error = true;
            }

            if (selectedDateTo === null) {
                setSelectedDateToError("Required");
                error = true;
            }

            if (error) {
                return;
            }

            const dateFromFormatted = moment(
                selectedDateFrom,
                "MM-DD-YYYY",
                true
            ).format("YYYY-MM-DD");

            if (dateFromFormatted === "Invalid date") {
                return;
            }

            const dateToFormatted = moment(
                selectedDateTo,
                "MM-DD-YYYY",
                true
            ).format("YYYY-MM-DD");

            if (dateToFormatted === "Invalid date") {
                return;
            }

            getPatientInvoicesData(dateFromFormatted, dateToFormatted);
        } else {
            setSelectedDateFromError(null);
            setSelectedDateToError(null);
            getPatientInvoicesData();
        }
    };

    const handleCloseDeleteInvoiceModalWarning = () => {
        setOpenDeleteInvoiceModalWarning(false);
        setDeleteInvoiceId(null);
    };

    const handleOnClickDeleteInvoice = id => {
        setOpenDeleteInvoiceModalWarning(true);
        setDeleteInvoiceId(id);
    };

    const handleOnClickDeletedInvoice = async () => {
        try {
            setOpenDeleteInvoiceModalWarning(false);
            setLoading(true);
            await http.delete(`${apiInvoicesUrl}/${deleteInvoiceId}`);
            if (isMounted.current) {
                setDeleteInvoiceId(null);
                setLoading(false);
                toast.success("Invoice deleted successfully");
                const data = await getPatientInvoicesData();
                setInvoicesUnfiltered(data);
            }
        } catch (ex) {
            if (isMounted.current) {
                setLoading(false);
            }
            toast.error("An unexpected error occured");
            console.log(ex);
        }
    };

    /* Add deposit section */
    const handleClickAddDeposit = () => {
        setOpenAddDepositModal(true);
    };

    const handleCloseAddDepositModal = isAdded => {
        setOpenAddDepositModal(false);
        if (isAdded) {
            getPatientInvoicesData();
        }
    };

    return (
        <React.Fragment>
            <Grid
                container
                justify="center"
                alignItems="center"
                className={classes.root}
            >
                {/* Add deposit dialog*/}
                <DepositAddEdit
                    open={openAddDepositModal}
                    onClose={handleCloseAddDepositModal}
                    action="add"
                    invoices={invoicesUnfiltered}
                />
                {/* Delete invoice dialog*/}
                <DialogCustom
                    open={openDeleteInvoiceModalWarning}
                    onClose={handleCloseDeleteInvoiceModalWarning}
                    title="Delete Invoice"
                    description="Are you sure you want to delete this invoice?"
                    buttonSecondaryText="No"
                    buttonPrimaryText="Yes"
                    onClickButtonPrimary={handleOnClickDeletedInvoice}
                />
                <Grid item xs={12}>
                    <Box mb={2}>
                        <TitleHeader
                            backButton={true}
                            titleIcon={PaymentIcon}
                            title="Payment History"
                        />
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Box mb={2}>
                                <Paper>
                                    <Box p={1}>
                                        <Grid container spacing={2}>
                                            <RenderByUserRole
                                                redirect={false}
                                                notAllowedUser={[
                                                    "admin",
                                                    "doctor",
                                                    "receptionist"
                                                ]}
                                            >
                                                <Grid item xs={12} lg={4}>
                                                    <ReactToPrint
                                                        trigger={() => (
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                size="small"
                                                                startIcon={
                                                                    <PrintIcon />
                                                                }
                                                            >
                                                                Print Invoice
                                                            </Button>
                                                        )}
                                                        content={() =>
                                                            invoiceForPrintRef.current
                                                        }
                                                        documentTitle={`invoice of ${patient.name}/${patient.id}`}
                                                    />
                                                </Grid>
                                            </RenderByUserRole>
                                            <RenderByUserRole
                                                redirect={false}
                                                notAllowedUser={["patient"]}
                                            >
                                                <Grid item xs={12} lg={4}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        component={Link}
                                                        to={`${match.url}/add`}
                                                        startIcon={
                                                            <AddCircleIcon />
                                                        }
                                                    >
                                                        Add Payment
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={12} lg={8}>
                                                    <Box
                                                        display="flex"
                                                        flexDirection="row"
                                                        className={
                                                            classes.flexWrapper
                                                        }
                                                    >
                                                        <Box>
                                                            <ReactToPrint
                                                                trigger={() => (
                                                                    <Button
                                                                        variant="contained"
                                                                        color="secondary"
                                                                        size="small"
                                                                        startIcon={
                                                                            <PrintIcon />
                                                                        }
                                                                    >
                                                                        Print
                                                                        Invoice
                                                                    </Button>
                                                                )}
                                                                content={() =>
                                                                    invoiceForPrintRef.current
                                                                }
                                                                documentTitle={`invoice of ${patient.name}/${patient.id}`}
                                                            />
                                                        </Box>
                                                        <Box p={1}></Box>
                                                        <Box>
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                size="small"
                                                                startIcon={
                                                                    <AddCircleIcon />
                                                                }
                                                                onClick={
                                                                    handleClickAddDeposit
                                                                }
                                                            >
                                                                Deposit
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </RenderByUserRole>
                                        </Grid>
                                    </Box>
                                </Paper>
                            </Box>
                            <Box mb={2}>
                                <Paper>
                                    <Box p={2}>
                                        <form onSubmit={handleDateSearchSubmit}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={4}>
                                                    <DatePicker
                                                        size="small"
                                                        inputVariant="outlined"
                                                        id="from"
                                                        name="from"
                                                        label="From"
                                                        format="MM-DD-YYYY"
                                                        value={selectedDateFrom}
                                                        fullWidth
                                                        onChange={
                                                            handleDateFromChange
                                                        }
                                                        {...(selectedDateFromError
                                                            ? {
                                                                  error: true,
                                                                  helperText: selectedDateFromError
                                                              }
                                                            : {})}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <DatePicker
                                                        size="small"
                                                        inputVariant="outlined"
                                                        id="to"
                                                        name="to"
                                                        label="To"
                                                        format="MM-DD-YYYY"
                                                        value={selectedDateTo}
                                                        fullWidth
                                                        onChange={
                                                            handleDateToChange
                                                        }
                                                        {...(selectedDateToError
                                                            ? {
                                                                  error: true,
                                                                  helperText: selectedDateToError
                                                              }
                                                            : {})}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Button
                                                        fullWidth
                                                        size="small"
                                                        type="submit"
                                                        variant="outlined"
                                                        color="primary"
                                                    >
                                                        Submit
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </form>
                                    </Box>
                                </Paper>
                            </Box>
                            <Box>
                                <Paper>
                                    <Box
                                        display="flex"
                                        flexDirection="row"
                                        alignItems="center"
                                        p={1}
                                        mb={1}
                                    >
                                        <MoneyIcon />
                                        <Typography variant="h6">
                                            &nbsp; All Bills
                                        </Typography>
                                    </Box>
                                    <TableSimple
                                        tableContainer={{
                                            component: Paper
                                        }}
                                        table={{ size: "small" }}
                                        customHeadTableCell={
                                            StyledHeadTableCell
                                        }
                                        tableBodyRow={{ hover: true }}
                                        columns={renderAllBillsColumns(
                                            match.url,
                                            handleOnClickDeleteInvoice
                                        )}
                                        rows={invoices}
                                        emptyDataRowsMessage={
                                            loading
                                                ? "Loading..."
                                                : "No records to display"
                                        }
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Paper>
                                        <Box
                                            p={1}
                                            className={classes.borderBottom}
                                        >
                                            <Typography variant="body2">
                                                <strong>Patient ID:</strong>{" "}
                                                {patient.id}
                                            </Typography>
                                        </Box>
                                        <Box
                                            p={1}
                                            className={classes.borderBottom}
                                        >
                                            <Typography variant="body2">
                                                <strong>Patient Name:</strong>{" "}
                                                {patient.name}
                                            </Typography>
                                        </Box>
                                        <Box
                                            p={1}
                                            className={classes.borderBottom}
                                        >
                                            <Typography variant="body2">
                                                <strong>Address:</strong>{" "}
                                                {patient.address}
                                            </Typography>
                                        </Box>
                                        <Box
                                            p={1}
                                            className={classes.borderBottom}
                                        >
                                            <Typography variant="body2">
                                                <strong>Email:</strong>{" "}
                                                {patient.email}
                                            </Typography>
                                        </Box>
                                        <Box
                                            p={1}
                                            className={classes.borderBottom}
                                        >
                                            <Typography variant="body2">
                                                <strong>Phone:</strong>{" "}
                                                {patient.phone}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box
                                        p={1}
                                        bgcolor="primary.main"
                                        color="primary.contrastText"
                                    >
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Box
                                                    display="flex"
                                                    flexDirection="column"
                                                    alignItems="center"
                                                >
                                                    <MoneyIcon
                                                        className={
                                                            classes.amountIcon
                                                        }
                                                    />
                                                    <Typography
                                                        variant="body1"
                                                        align="center"
                                                    >
                                                        Total Bill Amount
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={8}>
                                                <Box p={1}>
                                                    <Typography
                                                        variant="h5"
                                                        className={
                                                            classes.amountValueTypography
                                                        }
                                                    >
                                                        {settings !== null
                                                            ? settings.currency
                                                            : ""}{" "}
                                                        {
                                                            totalInvoice.total_bill
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box
                                        p={1}
                                        bgcolor="primary.main"
                                        color="primary.contrastText"
                                    >
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Box
                                                    display="flex"
                                                    flexDirection="column"
                                                    alignItems="center"
                                                >
                                                    <MoneyIcon
                                                        className={
                                                            classes.amountIcon
                                                        }
                                                    />
                                                    <Typography
                                                        variant="body1"
                                                        align="center"
                                                    >
                                                        Total Deposit Amount
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={8}>
                                                <Box p={1}>
                                                    <Typography
                                                        variant="h5"
                                                        className={
                                                            classes.amountValueTypography
                                                        }
                                                    >
                                                        {settings !== null
                                                            ? settings.currency
                                                            : ""}{" "}
                                                        {
                                                            totalInvoice.total_deposit
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box
                                        p={1}
                                        bgcolor="primary.main"
                                        color="primary.contrastText"
                                        border={2}
                                        borderColor="secondary.main"
                                    >
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Box
                                                    display="flex"
                                                    flexDirection="column"
                                                    alignItems="center"
                                                >
                                                    <MoneyIcon
                                                        className={
                                                            classes.amountIcon
                                                        }
                                                    />
                                                    <Typography
                                                        variant="body1"
                                                        align="center"
                                                    >
                                                        Due Amount
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={8}>
                                                <Box p={1}>
                                                    <Typography
                                                        variant="h5"
                                                        className={
                                                            classes.amountValueTypography
                                                        }
                                                    >
                                                        {settings !== null
                                                            ? settings.currency
                                                            : ""}{" "}
                                                        {totalInvoice.total_due}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* ONLY SHOW WHILE PRINTING */}
            <Box className={classes.dispalyNone}>
                <Box p={5} ref={invoiceForPrintRef}>
                    <PrintHeader />
                    <Box mt={3}>
                        <Grid container spacing={1}>
                            <Grid item xs={4}>
                                <Box pr={2}>
                                    <Typography variant="h6" gutterBottom>
                                        Payment To:
                                    </Typography>
                                    <Typography variant="body1">
                                        {settings && settings.name}
                                    </Typography>
                                    <Typography variant="body1">
                                        {settings && settings.address}
                                    </Typography>
                                    <Typography variant="body1">
                                        {settings && settings.phone}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box pr={2}>
                                    <Typography variant="h6" gutterBottom>
                                        Bill To:
                                    </Typography>
                                    <Typography variant="body1">
                                        {patient.name}
                                    </Typography>
                                    <Typography variant="body1">
                                        {patient.address}
                                    </Typography>
                                    <Typography variant="body1">
                                        {patient.phone}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box pr={2}>
                                    <Typography variant="h6" gutterBottom>
                                        INVOICE INFO:
                                    </Typography>
                                    <Typography variant="body1">
                                        Date: {currentDate}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box mt={3}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <TableSimple
                                    table={{
                                        size: "small"
                                    }}
                                    customHeadTableCell={
                                        StyledHeadTableCellForPrintInvoice
                                    }
                                    columns={renderInvoicesTableColumns()}
                                    rows={invoices}
                                    emptyDataRowsMessage={
                                        loading ? "Loading..." : "Empty"
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Box>
                    <Box mt={3}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Typography variant="body1" align="right">
                                    <strong>Grand Total: </strong>
                                    {settings && settings.currency}{" "}
                                    {totalInvoice.total_bill}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1" align="right">
                                    <strong>Amount Received: </strong>
                                    {settings && settings.currency}{" "}
                                    {totalInvoice.total_deposit}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1" align="right">
                                    <strong>Amount to be Paid: </strong>
                                    {settings && settings.currency}{" "}
                                    {totalInvoice.total_due}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Box>
        </React.Fragment>
    );
}

export default PatientPayments;
