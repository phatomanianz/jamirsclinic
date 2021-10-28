import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import PrintIcon from "@material-ui/icons/Print";
import VisibilityIcon from "@material-ui/icons/Visibility";

import ReactToPrint from "react-to-print";

import {
    SettingsContext,
    LoadingContext
} from "../../../../../context/context";
import http from "../../../../../../services/http";
import utils from "../../../../../../utilities/utils";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TextFieldDisabledDarker from "../../../../../common/TextFieldDisabledDarker";
import TableSimple from "../../../../../common/TableSimple";
import PrintHeader from "../settings/common/PrintHeader";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    invoiceWrapper: {
        width: theme.spacing(35)
    },
    dispalyNone: {
        display: "none"
    }
}));

const renderTransactionTableColumns = () => [
    {
        title: "#",
        field: "number"
    },
    {
        title: "Treatment ID",
        field: "treatment_id"
    },
    {
        title: "Treatment name",
        field: "treatment_name"
    },
    {
        title: "Price",
        field: "price"
    },
    {
        title: "Quantity",
        field: "quantity"
    },

    {
        title: "Amount",
        field: "amount"
    }
];

const renderDeposits = deposits => {
    if (deposits.length < 1) {
        return null;
    }

    if (deposits.length === 1) {
        return (
            <React.Fragment>
                <Grid item xs={12}>
                    <TextFieldDisabledDarker
                        type="text"
                        size="small"
                        variant="outlined"
                        label="Deposit 1 date"
                        value={deposits[0].date}
                        fullWidth
                        disabled
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextFieldDisabledDarker
                        type="text"
                        size="small"
                        label="Deposit 1 amount"
                        variant="outlined"
                        value={deposits[0].amount}
                        fullWidth
                        disabled
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextFieldDisabledDarker
                        type="text"
                        size="small"
                        label="Deposit 1 type"
                        variant="outlined"
                        value={deposits[0].type}
                        fullWidth
                        disabled
                    />
                </Grid>
            </React.Fragment>
        );
    } else {
        return deposits.map((deposit, index) => {
            return (
                <Grid key={deposit.id} item xs={12}>
                    <Box p={2} border={1} borderColor="grey.300">
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextFieldDisabledDarker
                                    type="text"
                                    size="small"
                                    variant="outlined"
                                    label={`Deposit ${index + 1} date`}
                                    value={deposit.date}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldDisabledDarker
                                    type="text"
                                    size="small"
                                    label={`Deposit ${index + 1} amount`}
                                    variant="outlined"
                                    value={deposit.amount}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldDisabledDarker
                                    type="text"
                                    size="small"
                                    label={`Deposit ${index + 1} type`}
                                    variant="outlined"
                                    value={deposit.type}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            );
        });
    }
};

const apiInvoices = "api/invoices";

function PaymentView({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        if (params.patientID) {
            setActiveTab("patientlist");
        } else {
            setActiveTab("paymentlist");
        }
    }, [activeTabTrigger]);

    const [patientID, setPatientID] = useState("");
    const [patientName, setPatientName] = useState("");
    const [patientAddress, setPatientAddress] = useState("");
    const [patientPhone, setPatientPhone] = useState("");
    const [userID, setUserID] = useState("");
    const [userName, setUserName] = useState("");
    const [invoiceID, setInvoiceID] = useState("");
    const [dateInvoice, setDateInvoice] = useState("");
    const [subTotal, setSubTotal] = useState("");
    const [discountType, setDiscountType] = useState("");
    const [discount, setDiscount] = useState("");
    const [grandTotal, setGrandTotal] = useState("");
    const [due, setDue] = useState("");
    const [note, setNote] = useState("");
    const [deposits, setDeposits] = useState([]);
    const [depositTotalAmount, setDepositTotalAmount] = useState("");
    const [transactions, setTransactions] = useState([]);

    const invoiceForPrintRef = useRef();
    const { settings } = useContext(SettingsContext);
    const { loading, setLoading } = useContext(LoadingContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        const getPayment = async () => {
            try {
                setLoading(true);
                const { data } = await http.get(
                    `${apiInvoices}/${params.invoiceID}`
                );
                const {
                    id,
                    date,
                    patient_id,
                    patient_name,
                    patient_address,
                    patient_phone,
                    user_id,
                    user_name,
                    sub_total,
                    discount: invoiceDiscount,
                    discount_type: invoiceDiscountType,
                    grand_total,
                    due: invoiceDue,
                    note: invoiceNote,
                    transactions: invoiceTransactions,
                    deposits: invoiceDeposits
                } = data.invoice;
                if (isMounted.current) {
                    setPatientID(patient_id);
                    setPatientName(patient_name);
                    setPatientAddress(patient_address);
                    setPatientPhone(patient_phone);
                    setUserID(user_id);
                    setUserName(user_name);
                    setInvoiceID(id);
                    setDateInvoice(date);
                    setSubTotal(sub_total);
                    setDiscountType(
                        invoiceDiscountType === "none"
                            ? "N/A"
                            : invoiceDiscountType
                    );
                    setDiscount(invoiceDiscount);
                    setGrandTotal(grand_total);
                    setDue(invoiceDue);
                    setNote(invoiceNote !== null ? invoiceNote : "");
                    setDeposits(invoiceDeposits);
                    if (invoiceDeposits.length > 0) {
                        let total = 0;
                        invoiceDeposits.forEach(deposit => {
                            total += parseFloat(deposit.amount);
                        });
                        setDepositTotalAmount(total);
                    }
                    setTransactions(
                        invoiceTransactions.map(
                            (
                                {
                                    treatment_id,
                                    treatment_name,
                                    quantity,
                                    sold_price
                                },
                                index
                            ) => {
                                return {
                                    number: index + 1,
                                    treatment_id:
                                        treatment_id !== null
                                            ? treatment_id
                                            : "Deleted",
                                    treatment_name:
                                        treatment_name !== null
                                            ? treatment_name
                                            : "Deleted",
                                    quantity,
                                    price: sold_price,
                                    amount: utils.round(quantity * sold_price)
                                };
                            }
                        )
                    );

                    if (params.patientID) {
                        if (params.patientID != patient_id) {
                            history.push("/home/404");
                        }
                    }
                }
            } catch (ex) {
                if (ex.response && ex.response.status === 404) {
                    history.push("/home/404");
                } else {
                    toast.error("An unexpected error occured.");
                    console.log(ex);
                }
            }
            if (isMounted.current) {
                setLoading(false);
            }
        };
        getPayment();
    }, []);

    return (
        <React.Fragment>
            <Box className={classes.root}>
                <TitleHeader
                    backButton={true}
                    titleIcon={VisibilityIcon}
                    title="Invoice Information"
                />
                <Box mt={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Paper>
                                <Box p={2}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextFieldDisabledDarker
                                                size="small"
                                                variant="outlined"
                                                label="Invoice ID"
                                                value={invoiceID}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextFieldDisabledDarker
                                                type="text"
                                                size="small"
                                                variant="outlined"
                                                label="Date"
                                                value={dateInvoice}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextFieldDisabledDarker
                                                size="small"
                                                variant="outlined"
                                                label="Patient ID"
                                                value={patientID}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextFieldDisabledDarker
                                                type="text"
                                                size="small"
                                                variant="outlined"
                                                label="Patient name"
                                                value={patientName}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextFieldDisabledDarker
                                                size="small"
                                                variant="outlined"
                                                label="User ID"
                                                value={userID}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextFieldDisabledDarker
                                                type="text"
                                                size="small"
                                                variant="outlined"
                                                label="User name"
                                                value={userName}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box
                                                border={1}
                                                borderColor="grey.300"
                                            >
                                                <TableSimple
                                                    table={{
                                                        size: "small"
                                                    }}
                                                    tableBodyRow={{
                                                        hover: true
                                                    }}
                                                    columns={renderTransactionTableColumns()}
                                                    rows={transactions}
                                                    emptyDataRowsMessage={
                                                        loading
                                                            ? "Loading..."
                                                            : "Empty"
                                                    }
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper>
                                <Box p={2}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextFieldDisabledDarker
                                                type="text"
                                                size="small"
                                                label="Sub total"
                                                variant="outlined"
                                                value={subTotal}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextFieldDisabledDarker
                                                type="text"
                                                size="small"
                                                label="Discount type"
                                                variant="outlined"
                                                value={discountType}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        {discountType !== "N/A" && (
                                            <Grid item xs={12}>
                                                <TextFieldDisabledDarker
                                                    type="text"
                                                    size="small"
                                                    label={`Discount ${discountType}`}
                                                    variant="outlined"
                                                    value={discount}
                                                    fullWidth
                                                    disabled
                                                />
                                            </Grid>
                                        )}
                                        <Grid item xs={12}>
                                            <TextFieldDisabledDarker
                                                type="text"
                                                size="small"
                                                label="Grand total"
                                                variant="outlined"
                                                value={grandTotal}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextFieldDisabledDarker
                                                type="text"
                                                size="small"
                                                label="Note"
                                                variant="outlined"
                                                value={note}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        {renderDeposits(deposits)}
                                        <Grid item xs={12}>
                                            <ReactToPrint
                                                trigger={() => (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        startIcon={
                                                            <PrintIcon />
                                                        }
                                                        className={
                                                            classes.submit
                                                        }
                                                        fullWidth
                                                    >
                                                        Print
                                                    </Button>
                                                )}
                                                content={() =>
                                                    invoiceForPrintRef.current
                                                }
                                                documentTitle={`invoice-${invoiceID}`}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

            {/* ONLY SHOW WHILE PRINTING */}
            <Box className={classes.dispalyNone}>
                <Box p={5} ref={invoiceForPrintRef}>
                    <PrintHeader />
                    <Box
                        mt={3}
                        mx="auto"
                        p={1}
                        borderBottom={2}
                        className={classes.invoiceWrapper}
                    >
                        <Typography variant="h6" align="center">
                            PAYMENT INVOICE
                        </Typography>
                    </Box>
                    <Box mt={3}>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    <strong>Patient name:</strong> {patientName}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    <strong>Invoice:</strong> {invoiceID}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    <strong>Patient ID:</strong> {patientID}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    <strong>Date:</strong> {dateInvoice}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    <strong>Address:</strong> {patientAddress}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    <strong>Issued by:</strong>{" "}
                                    {`${userID}/${userName}`}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    <strong>Phone:</strong> {patientPhone}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box mt={3} mb={3}>
                        <Divider />
                    </Box>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <TableSimple
                                table={{
                                    size: "small"
                                }}
                                columns={renderTransactionTableColumns()}
                                rows={transactions}
                                emptyDataRowsMessage={
                                    loading ? "Loading..." : "Empty"
                                }
                            />
                        </Grid>
                    </Grid>
                    <Box mt={4.5} mb={3}>
                        <Divider />
                    </Box>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Typography variant="body1" align="right">
                                <strong>Sub Total: </strong>
                                {settings && settings.currency} {subTotal}
                            </Typography>
                        </Grid>
                        {discountType !== "N/A" ? (
                            <Grid item xs={12}>
                                <Typography variant="body1" align="right">
                                    <strong>Discount: </strong>
                                    {settings && settings.currency} {discount}
                                </Typography>
                            </Grid>
                        ) : null}
                        <Grid item xs={12}>
                            <Typography variant="body1" align="right">
                                <strong>Grand Total: </strong>
                                {settings && settings.currency} {grandTotal}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body1" align="right">
                                <strong>Amount Received: </strong>
                                {settings && settings.currency}{" "}
                                {depositTotalAmount}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body1" align="right">
                                <strong>Amount to be Paid: </strong>
                                {settings && settings.currency} {due}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </React.Fragment>
    );
}

export default PaymentView;
