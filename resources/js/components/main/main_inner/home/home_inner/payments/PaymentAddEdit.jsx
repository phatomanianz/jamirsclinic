import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useHistory, useRouteMatch } from "react-router-dom";

import { toast } from "react-toastify";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import TableCell from "@material-ui/core/TableCell";
import Box from "@material-ui/core/Box";
import InputAdornment from "@material-ui/core/InputAdornment";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

import {
    LoadingContext,
    DashboardContext
} from "../../../../../context/context";
import http from "../../../../../../services/http";
import utils from "../../../../../../utilities/utils";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TextFieldDisabledDark from "../../../../../common/TextFieldDisabledDark";
import DatePicker from "../../../../../common/DatePicker";
import SelectInput from "../../../../../common/SelectInput";
import TableSimple from "../../../../../common/TableSimple";
import moment from "moment";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    }
}));

const StyledHeadTableCellError = withStyles(theme => ({
    head: {
        color: theme.palette.error.main
    }
}))(TableCell);

const renderTransactionTableColumns = (
    onChangeQuantity,
    onClickAddQuantity,
    onClickMinusQuantity,
    onClickDelete
) => {
    return [
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
            align: "center",
            render: ({ quantity, quantityError, treatment_id }) => (
                <Box minWidth="110px">
                    <TextField
                        size="small"
                        variant="outlined"
                        value={quantity}
                        {...(quantityError
                            ? {
                                  error: true,
                                  helperText: quantityError
                              }
                            : {})}
                        onChange={event =>
                            onChangeQuantity(event, treatment_id)
                        }
                        inputProps={{ style: { textAlign: "center" } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconButton
                                        aria-label="add quantity"
                                        edge="start"
                                        size="small"
                                        onClick={() =>
                                            onClickAddQuantity(treatment_id)
                                        }
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="minus quantity"
                                        edge="end"
                                        size="small"
                                        disabled={quantity > 1 ? false : true}
                                        onClick={() =>
                                            onClickMinusQuantity(treatment_id)
                                        }
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
            )
        },
        {
            title: "Amount",
            field: "amount"
        },
        {
            title: "Action",
            field: "treatment_id",
            render: treatment_id => (
                <Tooltip title="Delete" placement="top">
                    <IconButton
                        aria-label="Delete"
                        color="secondary"
                        size="small"
                        onClick={() => {
                            onClickDelete(treatment_id);
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        }
    ];
};

const renderDeposits = (
    deposits,
    onDateChange,
    onAmountChange,
    onTypeChange,
    action
) => {
    if (deposits.length < 1) {
        return null;
    }

    if (deposits.length === 1) {
        return (
            <React.Fragment>
                <Grid item xs={12}>
                    <DatePicker
                        size="small"
                        inputVariant="outlined"
                        label={`Deposit ${action === "edit" ? "1" : ""} date *`}
                        format="MM-DD-YYYY"
                        value={deposits[0].date}
                        onChange={date => onDateChange(date, 0)}
                        fullWidth
                        {...(deposits[0].dateError
                            ? {
                                  error: true,
                                  helperText: deposits[0].dateError
                              }
                            : {})}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        type="text"
                        size="small"
                        label={`Deposit ${
                            action === "edit" ? "1" : ""
                        } amount *`}
                        variant="outlined"
                        value={deposits[0].amount}
                        onChange={e => onAmountChange(e, 0)}
                        fullWidth
                        {...(deposits[0].amountError
                            ? {
                                  error: true,
                                  helperText: deposits[0].amountError
                              }
                            : {})}
                    />
                </Grid>
                <Grid item xs={12}>
                    <SelectInput
                        noFormikValidation
                        value={deposits[0].type}
                        onChange={e => onTypeChange(e, 0)}
                        variant="outlined"
                        size="small"
                        id="deposit_type"
                        name="deposit_type"
                        inputLabel={`Deposit ${
                            action === "edit" ? "1" : ""
                        } type *`}
                        inputLabelId="deposit_type"
                        items={[
                            {
                                label: "Cash",
                                value: "cash"
                            },
                            {
                                label: "Bank",
                                value: "bank"
                            }
                        ]}
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
                                <DatePicker
                                    size="small"
                                    inputVariant="outlined"
                                    label={`Deposit ${index + 1} date *`}
                                    format="MM-DD-YYYY"
                                    value={deposit.date}
                                    onChange={() => onDateChange(indexOf)}
                                    fullWidth
                                    {...(deposit.dateError
                                        ? {
                                              error: true,
                                              helperText: deposit.dateError
                                          }
                                        : {})}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    type="text"
                                    size="small"
                                    label={`Deposit ${index + 1} amount *`}
                                    variant="outlined"
                                    value={deposit.amount}
                                    onChange={() => onAmountChange(index)}
                                    fullWidth
                                    {...(deposit.amountError
                                        ? {
                                              error: true,
                                              helperText: deposit.amountError
                                          }
                                        : {})}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <SelectInput
                                    noFormikValidation
                                    value={deposit.type}
                                    onChange={() => onTypeChange(index)}
                                    variant="outlined"
                                    size="small"
                                    id="deposit_type"
                                    name="deposit_type"
                                    inputLabel={`Deposit ${index + 1} type *`}
                                    inputLabelId="deposit_type"
                                    items={[
                                        {
                                            label: "Cash",
                                            value: "cash"
                                        },
                                        {
                                            label: "Bank",
                                            value: "bank"
                                        }
                                    ]}
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
const apiPatients = "api/patients";
const apiTreatments = "api/treatments";
const currentDate = moment();

function PaymentAddEdit({ setActiveTab, activeTabTrigger, action }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const match = useRouteMatch();
    const history = useHistory();

    useEffect(() => {
        if (params.patientID) {
            setActiveTab("patientlist");
        } else {
            if (action === "add") {
                setActiveTab("paymentadd");
            } else {
                setActiveTab("paymentlist");
            }
        }
    }, [activeTabTrigger]);

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [errorSelectedPatient, setErrorSelectedPatient] = useState(false);
    const [
        patientsAutocompleteDisabled,
        setPatientsAutocompleteDisabled
    ] = useState(false);

    const [invoiceID, setInvoiceID] = useState("");
    const [dateInvoice, setDateInvoice] = useState(currentDate);
    const [dateInvoiceError, setDateInvoiceError] = useState(null);

    const [treatments, setTreatments] = useState([]);
    const [resetTreatment, setResetTreatment] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [transactionsError, setTransactionsError] = useState(null);

    const [subTotal, setSubTotal] = useState("");
    const [discountType, setDiscountType] = useState("none");
    const [discount, setDiscount] = useState("");
    const [discountError, setDiscountError] = useState(null);
    const [grandTotal, setGrandTotal] = useState("");
    const [note, setNote] = useState("");
    const [deposits, setDeposits] = useState([
        {
            date: currentDate,
            dateError: null,
            amount: "",
            amountError: null,
            type: "cash"
        }
    ]);

    const [loadingLocal, setLoadingLocal] = useState(false);
    const { loading, setLoading } = useContext(LoadingContext);
    const { setDashboard } = useContext(DashboardContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        const actionEffect = async () => {
            if (params.patientID) {
                if (action === "add") {
                    getSelectedPatientData(params.patientID);
                } else {
                    getPaymentData(params.invoiceID);
                }
                setPatientsAutocompleteDisabled(true);
            } else {
                getPatients();
                if (action === "edit") {
                    getPaymentData(params.invoiceID);
                }
            }
            getTreatments();
        };
        actionEffect();
    }, [action]);

    useEffect(() => {
        let newSubTotal = 0;
        let newDiscount = 0;
        let newGrandTotal = 0;
        transactions.forEach(transaction => {
            newSubTotal += transaction.amount;
        });
        switch (discountType) {
            case "amount":
                newDiscount = parseFloat(discount) ? parseFloat(discount) : 0;
                break;
            case "percent":
                newDiscount = parseInt(discount)
                    ? (parseInt(discount) / 100) * newSubTotal
                    : 0;
                break;
            default:
            // Do nothing...
        }
        newGrandTotal = utils.round(newSubTotal - newDiscount);

        setSubTotal(newSubTotal);
        setGrandTotal(newGrandTotal);
    }, [transactions, discountType, discount]);

    const getPatients = async (search = "") => {
        try {
            setLoadingLocal(true);
            const { data } = await http.get(
                `${apiPatients}?${
                    search ? `search=${search}&` : ""
                }not_paginate=1`
            );
            const patientsRequest = utils.convertPropertyNumberToString(
                data.patients,
                "id"
            );

            if (isMounted.current) {
                if (selectedPatient) {
                    utils.includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
                        patientsRequest,
                        selectedPatient,
                        setPatients
                    );
                } else {
                    setPatients(patientsRequest);
                }
            }
        } catch (ex) {
            toast.error("An unexpected error occured.");
            console.log(ex);
        }
        if (isMounted.current) {
            setLoadingLocal(false);
        }
    };

    const getTreatments = async (search = "") => {
        try {
            setLoadingLocal(true);
            const { data } = await http.get(
                `${apiTreatments}?${
                    search ? `search=${search}&` : ""
                }not_paginate=1`
            );
            if (isMounted.current) {
                setTreatments(
                    utils.convertPropertyNumberToString(data.treatments, "id")
                );
            }
        } catch (ex) {
            toast.error("An unexpected error occured.");
            console.log(ex);
        }
        if (isMounted.current) {
            setLoadingLocal(false);
        }
    };

    const getSelectedPatientData = async () => {
        try {
            setLoading(true);
            const { data } = await http.get(
                `${apiPatients}/${params.patientID}`
            );
            const { id, name } = data.patient;
            if (isMounted.current) {
                setSelectedPatient({ id: id.toString(), name });
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

    const getPaymentData = async invoiceID => {
        try {
            setLoading(true);
            const { data } = await http.get(`${apiInvoices}/${invoiceID}`);
            const {
                id,
                date,
                patient_id,
                patient_name,
                sub_total,
                discount: invoiceDiscount,
                discount_type,
                grand_total,
                note: invoiceNote,
                transactions: invoiceTransactions,
                deposits: invoiceDeposits
            } = data.invoice;
            const invoiceSelectedPatient = {
                id: patient_id.toString(),
                name: patient_name
            };
            if (isMounted.current) {
                setInvoiceID(id);
                setDateInvoice(moment(date, "MM-DD-YYYY"));
                setSelectedPatient(invoiceSelectedPatient);
                setSubTotal(sub_total);
                if (discount_type.includes("%")) {
                    setDiscount(discount_type.replace("%", ""));
                    setDiscountType("percent");
                } else {
                    setDiscount(invoiceDiscount);
                    setDiscountType(discount_type);
                }
                setGrandTotal(grand_total);
                setNote(invoiceNote !== null ? invoiceNote : "");
                setDeposits(
                    invoiceDeposits
                        ? invoiceDeposits.map(deposit => {
                              deposit.date = moment(deposit.date, "MM-DD-YYYY");
                              return deposit;
                          })
                        : []
                );
                setTransactions(
                    invoiceTransactions.map(
                        ({
                            treatment_id,
                            treatment_name,
                            quantity,
                            sold_price
                        }) => {
                            return {
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
                    if (params.patientID != invoiceSelectedPatient.id) {
                        history.push("/home/404");
                    }
                } else {
                    utils.includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
                        patients,
                        invoiceSelectedPatient,
                        setPatients
                    );
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

    const handleChangePatient = (event, patient) => {
        setSelectedPatient(patient);
    };

    const handleInputChangePatient = (event, value, reason) => {
        getPatients(value);
        setErrorSelectedPatient(false);
    };

    const handleChangeTreatment = (event, treatmentToBeAdded) => {
        let isTreatmentExists = false;
        const newTransactions = transactions.map(transaction => {
            if (transaction.treatment_id === treatmentToBeAdded.id) {
                const newQuantity = transaction.quantity + 1;
                transaction.quantity = newQuantity;
                transaction.amount = utils.round(
                    newQuantity * transaction.price
                );
                isTreatmentExists = true;
            }
            return transaction;
        });

        if (isTreatmentExists) {
            setTransactions(newTransactions);
        } else {
            const { id, name, selling_price } = treatmentToBeAdded;
            setTransactions([
                ...transactions,
                {
                    treatment_id: id,
                    treatment_name: name,
                    quantity: 1,
                    quantityError: null,
                    price: selling_price,
                    amount: utils.round(1 * selling_price)
                }
            ]);
        }
        getTreatments();
        setResetTreatment(!resetTreatment);
        setTransactionsError(null);
    };

    const handleChangeQuantity = (event, treatment_id) => {
        const newQuantity = parseInt(event.target.value);
        if (Number.isInteger(newQuantity)) {
            setTransactions(
                transactions.map(transaction => {
                    if (transaction.treatment_id === treatment_id) {
                        transaction.quantity = newQuantity;
                        transaction.quantityError = null;
                        transaction.amount = utils.round(
                            newQuantity * transaction.price
                        );
                    }
                    return transaction;
                })
            );
        }
    };

    const handleClickAddTransactionQuantity = treatment_id => {
        setTransactions(
            transactions.map(transaction => {
                if (transaction.treatment_id === treatment_id) {
                    const newQuantity = transaction.quantity + 1;
                    transaction.quantity = newQuantity;
                    transaction.quantityError = null;
                    transaction.amount = utils.round(
                        newQuantity * transaction.price
                    );
                }
                return transaction;
            })
        );
    };

    const handleClickMinusTransactionQuantity = treatment_id => {
        setTransactions(
            transactions.map(transaction => {
                if (
                    transaction.treatment_id === treatment_id &&
                    transaction.quantity > 1
                ) {
                    const newQuantity = transaction.quantity - 1;
                    transaction.quantity = newQuantity;
                    transaction.quantityError = null;
                    transaction.amount = utils.round(
                        newQuantity * transaction.price
                    );
                }
                return transaction;
            })
        );
    };

    const handleClickDeleteTransactionRow = treatment_id => {
        setTransactions(
            transactions.filter(
                transaction => transaction.treatment_id !== treatment_id
            )
        );
    };

    const handleInputChangeTreatment = (event, value, reason) => {
        getTreatments(value);
    };

    const handleChangeDateInvoice = date => {
        setDateInvoice(date);
        setDateInvoiceError(null);
    };

    const handleChangeDiscountType = e => {
        const newDiscountType = e.target.value;
        setDiscountType(newDiscountType);
        setDiscount("");
        setDiscountError(null);
    };

    const handleChangeDiscount = e => {
        const newDiscount = e.target.value;
        switch (discountType) {
            case "amount":
                if (utils.validateAmount(newDiscount)) {
                    setDiscount(newDiscount);
                }
                break;
            case "percent":
                const newDiscountParsedToInteger = parseInt(newDiscount);
                if (
                    (Number.isInteger(newDiscountParsedToInteger) &&
                        newDiscountParsedToInteger >= 1 &&
                        newDiscountParsedToInteger <= 100) ||
                    !newDiscount.trim().length
                ) {
                    setDiscount(newDiscount);
                }
                break;
            default:
                setDiscount("");
        }
        setDiscountError(null);
    };

    const handleChangeNote = e => setNote(e.target.value);

    const handleChangeDateDeposit = (date, depositIndex) => {
        deposits[depositIndex].date = date;
        deposits[depositIndex].dateError = null;
        setDeposits([...deposits]);
    };

    const handleChangeAmountDeposit = (e, depositIndex) => {
        const newAmountDeposit = e.target.value;
        if (utils.validateAmount(newAmountDeposit)) {
            deposits[depositIndex].amount = newAmountDeposit;
            deposits[depositIndex].amountError = null;
            setDeposits([...deposits]);
        }
    };

    const handleChangeTypeDeposit = (e, depositIndex) => {
        deposits[depositIndex].type = e.target.value;
        setDeposits([...deposits]);
    };

    const resetFormData = () => {
        if (isMounted.current) {
            setSelectedPatient(null);
            setDateInvoice(currentDate);
            setDateInvoiceError(null);
            setTransactions([]);
            setTransactionsError(null);
            setSubTotal("");
            setDiscountType("none");
            setDiscount("");
            setDiscountError(null);
            setGrandTotal("");
            setNote("");
            setDeposits([
                {
                    date: currentDate,
                    dateError: null,
                    amount: "",
                    amountError: null,
                    type: "cash"
                }
            ]);
            if (!params.patientID) {
                setSelectedPatient(null);
            }
        }
    };

    const handleSubmit = async e => {
        try {
            e.preventDefault();

            // Validate invoice date
            if (dateInvoice === null) {
                setDateInvoiceError("Required");
            }
            const invoiceDateFormatted = moment(
                dateInvoice,
                "MM-DD-YYYY",
                true
            ).format("YYYY-MM-DD");
            if (invoiceDateFormatted === "Invalid date") {
                return;
            }

            // Validate patient
            if (selectedPatient === null) {
                setErrorSelectedPatient(true);
                return;
            }

            // Validate transactions
            if (transactions.length < 1) {
                setTransactionsError("Required");
                return;
            }

            // Validate Discount
            if (discountType !== "none" && discount === "") {
                setDiscountError("Required");
                return;
            }

            // Validate deposits
            let isErrorDeposits = false;
            const validatedDeposits = deposits.map(deposit => {
                // Validate date
                if (deposit.date === null) {
                    deposit.dateError = "Required";
                    isErrorDeposits = true;
                } else {
                    const formattedDate = moment(
                        deposit.date,
                        "MM-DD-YYYY",
                        true
                    ).format("YYYY-MM-DD");
                    if (formattedDate === "Invalid date") {
                        deposit.dateError = null;
                        isErrorDeposits = true;
                    }
                }

                // Validate amount
                if (deposit.amount === "") {
                    deposit.amountError = "Required";
                    isErrorDeposits = true;
                }

                return deposit;
            });
            if (isErrorDeposits) {
                setDeposits(validatedDeposits);
                return;
            }

            // All inputes are valid here
            const values = {
                patient_id: selectedPatient.id,
                invoice_date: dateInvoice.format("YYYY-MM-DD"),
                discount: discount ? discount : 0,
                discount_type: discountType,
                transactions,
                note,
                ...(action === "add"
                    ? {
                          deposit: deposits[0].amount,
                          deposit_type: deposits[0].type,
                          deposit_date: deposits[0].date.format("YYYY-MM-DD")
                      }
                    : {
                          deposits: deposits.map(
                              ({ id, date, amount, type }) => {
                                  return {
                                      id,
                                      date: date.format("YYYY-MM-DD"),
                                      amount,
                                      type
                                  };
                              }
                          )
                      })
            };

            let invoiceIDForRedirectToView = null;
            setLoading(true);
            if (action === "add") {
                const { data } = await http.post(apiInvoices, values);
                invoiceIDForRedirectToView = data.invoice.id;
                toast.success(`New invoice added successfully`);
                resetFormData();
            } else {
                values._method = "PATCH";
                await http.post(`${apiInvoices}/${invoiceID}`, values);
                invoiceIDForRedirectToView = invoiceID;
                toast.success("Invoice edited succesfully");
            }
            const urlFormattedToInvoiceView =
                action === "add"
                    ? match.url.replace(
                          "add",
                          `${invoiceIDForRedirectToView}/view`
                      )
                    : match.url.replace("edit", "view");
            history.push(urlFormattedToInvoiceView);
        } catch (ex) {
            if (ex.response && ex.response.status === 422) {
                const errors = ex.response.data.errors;
                // Check if error is from transactions
                let isTransactionQuantityError = false;
                for (let error in errors) {
                    if (errors.hasOwnProperty(error)) {
                        if (
                            error.includes("transactions") &&
                            error.includes("quantity")
                        ) {
                            const index = error.substr(13, 1);
                            transactions[index].quantityError = errors[error];
                            isTransactionQuantityError = true;
                        }
                    }
                }
                if (isTransactionQuantityError) {
                    if (isMounted.current) {
                        setTransactions([...transactions]);
                    }
                }
            } else {
                toast.error("An unexpected error occured.");
                console.log(ex);
            }
        }

        setDashboard(false);

        if (isMounted.current) {
            setLoading(false);
        }
    };

    return (
        <Box className={classes.root}>
            <TitleHeader
                backButton={true}
                titleIcon={action === "add" ? AddCircleIcon : EditIcon}
                title={action === "add" ? "Add New Payment" : "Edit Payment"}
            />
            <form onSubmit={handleSubmit}>
                <Box mt={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Paper>
                                        <Box p={2}>
                                            <Grid container spacing={2}>
                                                {action === "edit" && (
                                                    <Grid item xs={12} md={6}>
                                                        <TextFieldDisabledDark
                                                            size="small"
                                                            label="Invoice ID"
                                                            name="invoice_id"
                                                            id="invoice_id"
                                                            variant="outlined"
                                                            value={invoiceID}
                                                            fullWidth
                                                            disabled
                                                        />
                                                    </Grid>
                                                )}
                                                <Grid
                                                    item
                                                    xs={12}
                                                    md={
                                                        action === "edit"
                                                            ? 6
                                                            : 12
                                                    }
                                                >
                                                    <DatePicker
                                                        size="small"
                                                        inputVariant="outlined"
                                                        id="invoice_date"
                                                        name="invoice_date"
                                                        label="Invoice Date *"
                                                        format="MM-DD-YYYY"
                                                        value={dateInvoice}
                                                        onChange={
                                                            handleChangeDateInvoice
                                                        }
                                                        fullWidth
                                                        {...(dateInvoiceError
                                                            ? {
                                                                  error: true,
                                                                  helperText: dateInvoiceError
                                                              }
                                                            : {})}
                                                    />
                                                </Grid>
                                                {patientsAutocompleteDisabled ? (
                                                    <React.Fragment>
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            md={6}
                                                        >
                                                            <TextFieldDisabledDark
                                                                size="small"
                                                                variant="outlined"
                                                                label="Patient name *"
                                                                disabled
                                                                fullWidth
                                                                value={
                                                                    selectedPatient !==
                                                                    null
                                                                        ? selectedPatient.name
                                                                        : ""
                                                                }
                                                            />
                                                        </Grid>
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            md={6}
                                                        >
                                                            <TextFieldDisabledDark
                                                                size="small"
                                                                variant="outlined"
                                                                label="Patient ID *"
                                                                disabled
                                                                fullWidth
                                                                value={
                                                                    selectedPatient !==
                                                                    null
                                                                        ? selectedPatient.id
                                                                        : ""
                                                                }
                                                            />
                                                        </Grid>
                                                    </React.Fragment>
                                                ) : (
                                                    <React.Fragment>
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            md={6}
                                                        >
                                                            <Autocomplete
                                                                onChange={
                                                                    handleChangePatient
                                                                }
                                                                onInputChange={
                                                                    handleInputChangePatient
                                                                }
                                                                value={
                                                                    selectedPatient
                                                                }
                                                                getOptionSelected={(
                                                                    option,
                                                                    value
                                                                ) =>
                                                                    option.id ===
                                                                    value.id
                                                                }
                                                                options={
                                                                    patients
                                                                }
                                                                getOptionLabel={option =>
                                                                    option.name
                                                                }
                                                                loading={
                                                                    loadingLocal
                                                                }
                                                                blurOnSelect
                                                                renderInput={params => (
                                                                    <TextField
                                                                        {...params}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        label="Patient name *"
                                                                        fullWidth
                                                                        {...(errorSelectedPatient
                                                                            ? {
                                                                                  error: true,
                                                                                  helperText:
                                                                                      "Patient is required"
                                                                              }
                                                                            : {})}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            md={6}
                                                        >
                                                            <Autocomplete
                                                                onChange={
                                                                    handleChangePatient
                                                                }
                                                                onInputChange={
                                                                    handleInputChangePatient
                                                                }
                                                                value={
                                                                    selectedPatient
                                                                }
                                                                getOptionSelected={(
                                                                    option,
                                                                    value
                                                                ) =>
                                                                    option.id ===
                                                                    value.id
                                                                }
                                                                options={
                                                                    patients
                                                                }
                                                                getOptionLabel={option =>
                                                                    option.id
                                                                }
                                                                loading={
                                                                    loadingLocal
                                                                }
                                                                blurOnSelect
                                                                renderInput={params => (
                                                                    <TextField
                                                                        {...params}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        label="Patient ID *"
                                                                        fullWidth
                                                                        {...(errorSelectedPatient
                                                                            ? {
                                                                                  error: true,
                                                                                  helperText:
                                                                                      "Patient is required"
                                                                              }
                                                                            : {})}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                    </React.Fragment>
                                                )}
                                            </Grid>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12}>
                                    <Paper>
                                        <Box p={2}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        key={resetTreatment}
                                                        onChange={
                                                            handleChangeTreatment
                                                        }
                                                        onInputChange={
                                                            handleInputChangeTreatment
                                                        }
                                                        options={treatments}
                                                        getOptionSelected={(
                                                            option,
                                                            value
                                                        ) =>
                                                            option.id ===
                                                            value.id
                                                        }
                                                        getOptionLabel={option =>
                                                            option.name
                                                        }
                                                        loading={loadingLocal}
                                                        blurOnSelect
                                                        renderInput={params => (
                                                            <TextField
                                                                {...params}
                                                                size="small"
                                                                variant="outlined"
                                                                label="Treatment name"
                                                                placeholder="Search"
                                                                fullWidth
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        key={resetTreatment}
                                                        onChange={
                                                            handleChangeTreatment
                                                        }
                                                        onInputChange={
                                                            handleInputChangeTreatment
                                                        }
                                                        options={treatments}
                                                        getOptionSelected={(
                                                            option,
                                                            value
                                                        ) =>
                                                            option.id ===
                                                            value.id
                                                        }
                                                        getOptionLabel={option =>
                                                            option.id
                                                        }
                                                        loading={loadingLocal}
                                                        blurOnSelect
                                                        renderInput={params => (
                                                            <TextField
                                                                {...params}
                                                                size="small"
                                                                variant="outlined"
                                                                label="Treatment ID"
                                                                placeholder="Search"
                                                                fullWidth
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Box
                                                        border={1}
                                                        borderColor={
                                                            transactionsError
                                                                ? "error.main"
                                                                : "grey.300"
                                                        }
                                                    >
                                                        <TableSimple
                                                            table={{
                                                                size: "small"
                                                            }}
                                                            customHeadTableCell={
                                                                transactionsError
                                                                    ? StyledHeadTableCellError
                                                                    : false
                                                            }
                                                            tableBodyRow={{
                                                                hover: true
                                                            }}
                                                            columns={renderTransactionTableColumns(
                                                                handleChangeQuantity,
                                                                handleClickAddTransactionQuantity,
                                                                handleClickMinusTransactionQuantity,
                                                                handleClickDeleteTransactionRow
                                                            )}
                                                            rows={transactions}
                                                            emptyDataRowsMessage={
                                                                loading &&
                                                                action ===
                                                                    "edit" ? (
                                                                    "Loading..."
                                                                ) : transactionsError ? (
                                                                    <Box color="error.main">
                                                                        {
                                                                            transactionsError
                                                                        }
                                                                    </Box>
                                                                ) : (
                                                                    "Empty"
                                                                )
                                                            }
                                                        />
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper>
                                <Box p={2}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextFieldDisabledDark
                                                size="small"
                                                label="Sub total"
                                                name="sub_total"
                                                id="sub_total"
                                                variant="outlined"
                                                value={subTotal}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <SelectInput
                                                noFormikValidation
                                                value={discountType}
                                                onChange={
                                                    handleChangeDiscountType
                                                }
                                                variant="outlined"
                                                size="small"
                                                inputLabel="Discount type *"
                                                inputLabelId="discount_type_Label"
                                                id="discount_type"
                                                name="discount_type"
                                                items={[
                                                    {
                                                        label: "N/A",
                                                        value: "none"
                                                    },
                                                    {
                                                        label: "Amount",
                                                        value: "amount"
                                                    },
                                                    {
                                                        label: "Percent",
                                                        value: "percent"
                                                    }
                                                ]}
                                            />
                                        </Grid>
                                        {discountType !== "none" && (
                                            <Grid item xs={12}>
                                                <TextField
                                                    type="text"
                                                    size="small"
                                                    label={`Discount ${discountType}`}
                                                    name="discount"
                                                    id="discount"
                                                    variant="outlined"
                                                    value={discount}
                                                    onChange={
                                                        handleChangeDiscount
                                                    }
                                                    fullWidth
                                                    {...(discountError
                                                        ? {
                                                              error: true,
                                                              helperText: discountError
                                                          }
                                                        : {})}
                                                />
                                            </Grid>
                                        )}
                                        <Grid item xs={12}>
                                            <TextFieldDisabledDark
                                                size="small"
                                                label="Grand total"
                                                name="grand_total"
                                                id="grand_total"
                                                variant="outlined"
                                                value={grandTotal}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                label="Note"
                                                name="note"
                                                id="note"
                                                value={note}
                                                onChange={handleChangeNote}
                                                fullWidth
                                            />
                                        </Grid>
                                        {renderDeposits(
                                            deposits,
                                            handleChangeDateDeposit,
                                            handleChangeAmountDeposit,
                                            handleChangeTypeDeposit
                                        )}
                                        <Grid item xs={12}>
                                            <Button
                                                fullWidth
                                                size="small"
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                className={classes.submit}
                                            >
                                                {action === "add"
                                                    ? "Submit"
                                                    : "Edit"}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </form>
        </Box>
    );
}

export default PaymentAddEdit;
