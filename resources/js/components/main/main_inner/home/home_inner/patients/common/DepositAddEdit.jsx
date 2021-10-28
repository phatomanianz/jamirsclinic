import React, { useEffect, useState, useRef } from "react";
import { PropTypes } from "prop-types";

import { toast } from "react-toastify";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";

import TextFieldDisabledDark from "../../../../../../common/TextFieldDisabledDark";
import SelectInput from "../../../../../../common/SelectInput";
import TextInput from "../../../../../../common/TextInput";
import DatePicker from "../../../../../../common/DatePicker";

import http from "../../../../../../../services/http";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import moment from "moment";

const apiDeposits = "api/invoices";
const currentDate = moment();

function DepositAddEdit(props) {
    const isMounted = useRef(true);

    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedInvoiceError, setSelectedInvoiceError] = useState(false);

    const [invoiceID, setInvoiceID] = useState(null);

    const [depositID, setDepositID] = useState(null);
    const [date, setDate] = useState(currentDate);
    const [dateError, setDateError] = useState(null);
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("cash");

    const [loadingLocal, setLoadingLocal] = useState(false);

    const title = props.action === "add" ? "Add Deposit" : "Edit Deposit";

    useEffect(() => {
        if (props.action === "add" && props.invoices) {
            setInvoices(props.invoices);
        } else if (props.action === "add" && props.invoiceID) {
            setInvoiceID(props.invoiceID);
        } else {
            getDepositData();
        }

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (props.action === "edit") {
            getDepositData();
        }
    }, [props.deposit]);

    const getDepositData = () => {
        if (props.deposit) {
            const {
                id,
                date: depositDate,
                amount: depositAmount,
                type: depositType
            } = props.deposit;
            setInvoiceID(props.invoiceID);
            setDepositID(id);
            setDate(moment(depositDate, "MM-DD-YYYY"));
            setAmount(depositAmount);
            setType(depositType);
        }
    };

    const handleChangeInvoice = (event, invoice) => setSelectedInvoice(invoice);

    const handleInputChangeInvoice = (event, value, reason) =>
        setSelectedInvoiceError(null);

    const onDateChange = date => {
        setDate(date);
        setDateError(null);
    };

    const handleSubmit = async (
        values,
        { setSubmitting, setErrors, resetForm }
    ) => {
        try {
            // Validate selected invoice
            if (
                props.action === "add" &&
                !props.invoiceID &&
                invoices &&
                selectedInvoice === null
            ) {
                setSelectedInvoiceError("Required");
                return;
            }

            // Validate date
            if (date === null) {
                setDateError("Required");
            }
            const dateFormatted = moment(date, "MM-DD-YYYY", true).format(
                "YYYY-MM-DD"
            );
            if (dateFormatted === "Invalid date") {
                return;
            }

            values.date = dateFormatted;
            setLoadingLocal(true);
            if (props.action === "add") {
                await http.post(
                    `${apiDeposits}/${
                        props.invoices ? selectedInvoice.id : invoiceID
                    }/deposits`,
                    values
                );
                if (isMounted.current) {
                    resetForm();
                    setDate(currentDate);
                    setSelectedInvoice(null);
                    toast.success(`New deposit added successfully`);
                }
            } else {
                values._method = "PATCH";
                await http.post(
                    `${apiDeposits}/${invoiceID}/deposits/${depositID}`,
                    values
                );
                toast.success(`Deposit edited successfully`);
            }

            if (isMounted.current) {
                setSubmitting(false);
                props.onClose(true);
            }
        } catch (ex) {
            if (ex.response && ex.response.status === 422) {
                const errors = ex.response.data.errors;
                if (isMounted.current) {
                    setErrors(errors);
                }
            } else {
                toast.error("An unexpected error occured.");
                console.log(ex);
            }
        }
        if (isMounted.current) {
            setLoadingLocal(false);
        }
    };

    return (
        <Dialog
            open={props.open}
            onClose={() => props.onClose(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="sm"
            title={title}
            fullWidth
        >
            {loadingLocal && <LinearProgress />}
            <Formik
                enableReinitialize
                initialValues={{
                    amount,
                    type
                }}
                validationSchema={Yup.object({
                    amount: Yup.number()
                        .required("Required")
                        .min(0)
                        .label("Amount"),
                    type: Yup.string().label("Type")
                })}
                onSubmit={handleSubmit}
            >
                <Form>
                    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                    <DialogContent>
                        <Box mb={2}>
                            {props.action === "add" && props.invoices ? (
                                <Autocomplete
                                    onChange={handleChangeInvoice}
                                    onInputChange={handleInputChangeInvoice}
                                    value={selectedInvoice}
                                    getOptionSelected={(option, value) =>
                                        option.id === value.id
                                    }
                                    options={props.invoices}
                                    getOptionLabel={option => option.id}
                                    renderInput={params => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            variant="outlined"
                                            label="Invoice ID *"
                                            fullWidth
                                            {...(selectedInvoiceError
                                                ? {
                                                      error: true,
                                                      helperText: selectedInvoiceError
                                                  }
                                                : {})}
                                        />
                                    )}
                                />
                            ) : (
                                <TextFieldDisabledDark
                                    size="small"
                                    variant="outlined"
                                    label="Invoice ID"
                                    disabled
                                    fullWidth
                                    value={invoiceID}
                                />
                            )}
                        </Box>
                        <Box mb={2}>
                            <DatePicker
                                size="small"
                                inputVariant="outlined"
                                label="Date *"
                                format="MM-DD-YYYY"
                                value={date}
                                onChange={onDateChange}
                                fullWidth
                                {...(dateError
                                    ? {
                                          error: true,
                                          helperText: dateError
                                      }
                                    : {})}
                            />
                        </Box>
                        <Box mb={2}>
                            <TextInput
                                size="small"
                                variant="outlined"
                                type="number"
                                inputProps={{
                                    step: "any",
                                    min: "0"
                                }}
                                id="amount"
                                name="amount"
                                label="Amount *"
                                autoComplete="amount"
                                fullWidth
                            />
                        </Box>
                        <Box>
                            <SelectInput
                                variant="outlined"
                                size="small"
                                id="type"
                                name="type"
                                inputLabel="Type *"
                                inputLabelId="type"
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
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => props.onClose(false)}
                            color="primary"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" color="primary">
                            {props.action === "add" ? "Add" : "Edit"}
                        </Button>
                    </DialogActions>
                </Form>
            </Formik>
        </Dialog>
    );
}

DepositAddEdit.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    action: PropTypes.oneOf(["add", "edit"]).isRequired,
    invoices: PropTypes.array,
    invoiceID: PropTypes.string,
    deposit: PropTypes.object
};

export default DepositAddEdit;
