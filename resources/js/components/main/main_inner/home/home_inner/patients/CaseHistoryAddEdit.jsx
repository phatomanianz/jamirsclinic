import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";

import { LoadingContext } from "../../../../../context/context";
import http from "../../../../../../services/http";
import utils from "../../../../../../utilities/utils";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TextInput from "../../../../../common/TextInput";
import TextFieldDisabledDark from "../../../../../common/TextFieldDisabledDark";
import DatePicker from "../../../../../common/DatePicker";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import moment from "moment";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    }
}));

const apiPatientsUrl = "api/patients";
const apiCaseHistoriesUrl = "api/casehistories";
const currentDate = moment().format();

function CaseHistoryAddEdit({ setActiveTab, activeTabTrigger, action }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        if (params.patientID) {
            setActiveTab("patientlist");
        } else {
            setActiveTab("casehistories");
        }
    }, [activeTabTrigger]);

    const formEl = useRef(null);

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [errorSelectedPatient, setErrorSelectedPatient] = useState(false);
    const [
        patientsAutocompleteDisabled,
        setPatientsAutocompleteDisabled
    ] = useState(false);

    const [caseHistoryId, setCaseHistoryId] = useState(null);
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState(currentDate);
    const [dateError, setDateError] = useState(null);

    const [loadingLocal, setLoadingLocal] = useState(false);
    const { setLoading } = useContext(LoadingContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        if (params.patientID) {
            if (action === "add") {
                getSelectedPatientData(params.patientID);
            } else {
                getCaseHistoryData(params.caseHistoryID);
            }
            setPatientsAutocompleteDisabled(true);
        } else {
            getPatients();
            if (action === "edit") {
                getCaseHistoryData(params.caseHistoryID);
            }
        }
    }, [action]);

    const getPatients = async (search = "") => {
        try {
            setLoadingLocal(true);
            const { data } = await http.get(
                `${apiPatientsUrl}?${
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

    const getSelectedPatientData = async patientID => {
        try {
            setLoading(true);
            const { data } = await http.get(`${apiPatientsUrl}/${patientID}`);
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

    const getCaseHistoryData = async caseHistoryID => {
        try {
            setLoading(true);
            const { data } = await http.get(
                `${apiCaseHistoriesUrl}/${caseHistoryID}`
            );
            const {
                id,
                date: caseDate,
                description: caseDescription,
                note: caseNote,
                patient_id,
                patient_name
            } = data.case_history;
            const caseSelectedPatient = {
                id: patient_id.toString(),
                name: patient_name
            };
            if (isMounted.current) {
                setCaseHistoryId(id);
                setDate(moment(caseDate, "MM-DD-YYYY").format());
                setDescription(caseDescription);
                setNote(caseNote !== null ? caseNote : "");

                if (params.patientID) {
                    if (params.patientID != caseSelectedPatient.id) {
                        history.push("/home/404");
                    }
                } else {
                    utils.includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
                        patients,
                        caseSelectedPatient,
                        setPatients
                    );
                }
                setSelectedPatient(caseSelectedPatient);
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

    const handleOnChangePatient = (event, patient) => {
        setSelectedPatient(patient);
    };

    const handleOnInputChangePatient = (event, value, reason) => {
        getPatients(value);
        setErrorSelectedPatient(false);
    };

    const handleDateChange = date => {
        setDate(date);
        setDateError(null);
    };

    const resetFormData = resetForm => {
        if (isMounted.current) {
            resetForm();
            setDate(currentDate);
            if (!params.patientID) {
                setSelectedPatient(null);
            }
        }
    };

    const handleBackButton = () => history.goBack();

    const handleSubmit = async (
        values,
        { setSubmitting, setErrors, resetForm }
    ) => {
        try {
            const formData = new FormData(formEl.current);

            if (selectedPatient === null) {
                setErrorSelectedPatient(true);
                return;
            }

            const date = formData.get("date");

            if (date === "") {
                setDateError("Required");
            }

            const dateFormatted = moment(date, "MM-DD-YYYY", true).format(
                "YYYY-MM-DD"
            );

            if (dateFormatted === "Invalid date") {
                return;
            }

            formData.append("date", dateFormatted);
            formData.append("patient_id", selectedPatient.id);
            setLoading(true);

            if (action === "add") {
                await http.post(`${apiCaseHistoriesUrl}`, formData);
                toast.success(`New case history added successfully`);
                resetFormData(resetForm);
            } else {
                formData.append("_method", "PATCH");
                await http.post(
                    `${apiCaseHistoriesUrl}/${caseHistoryId}`,
                    formData
                );
                toast.success("Case history edited succesfully");
            }
            if (isMounted.current) {
                setSubmitting(false);
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
            setLoading(false);
        }
    };

    return (
        <Grid
            container
            justify="center"
            alignItems="center"
            className={classes.root}
        >
            <Grid item xs={12}>
                <Box mb={2}>
                    <TitleHeader
                        backButton={true}
                        titleIcon={action === "add" ? AddCircleIcon : EditIcon}
                        title={
                            action === "add"
                                ? "Add New Case History"
                                : "Edit Case History"
                        }
                    />
                </Box>
                <Paper>
                    <Box p={2}>
                        <Formik
                            enableReinitialize
                            initialValues={{
                                description,
                                note
                            }}
                            validationSchema={Yup.object({
                                description: Yup.string().required("Required")
                            })}
                            onSubmit={handleSubmit}
                        >
                            <Form ref={formEl}>
                                <Box mt={2}>
                                    <Grid container spacing={2}>
                                        {patientsAutocompleteDisabled ? (
                                            <React.Fragment>
                                                <Grid item xs={12} sm={6}>
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
                                                <Grid item xs={12} sm={6}>
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
                                                <Grid item xs={12} sm={6}>
                                                    <Autocomplete
                                                        onChange={
                                                            handleOnChangePatient
                                                        }
                                                        onInputChange={
                                                            handleOnInputChangePatient
                                                        }
                                                        value={selectedPatient}
                                                        getOptionSelected={(
                                                            option,
                                                            value
                                                        ) =>
                                                            option.id ===
                                                            value.id
                                                        }
                                                        options={patients}
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
                                                                label="Patient name *"
                                                                placeholder="Search"
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
                                                <Grid item xs={12} sm={6}>
                                                    <Autocomplete
                                                        onChange={
                                                            handleOnChangePatient
                                                        }
                                                        onInputChange={
                                                            handleOnInputChangePatient
                                                        }
                                                        value={selectedPatient}
                                                        getOptionSelected={(
                                                            option,
                                                            value
                                                        ) =>
                                                            option.id ===
                                                            value.id
                                                        }
                                                        options={patients}
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
                                                                label="Patient ID *"
                                                                placeholder="Search"
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
                                        <Grid item xs={12}>
                                            <DatePicker
                                                size="small"
                                                inputVariant="outlined"
                                                id="date"
                                                name="date"
                                                label="Date *"
                                                format="MM-DD-YYYY"
                                                value={date}
                                                onChange={handleDateChange}
                                                fullWidth
                                                {...(dateError
                                                    ? {
                                                          error: true,
                                                          helperText: dateError
                                                      }
                                                    : {})}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                autoComplete="description"
                                                id="description"
                                                name="description"
                                                label="Description *"
                                                fullWidth
                                                multiline
                                                rows={4}
                                                rowsMax={8}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                autoComplete="note"
                                                id="note"
                                                name="note"
                                                label="Note"
                                                fullWidth
                                                multiline
                                                rows={3}
                                                rowsMax={8}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Grid container justify="flex-end">
                                    <Grid item xs={12} md={2}>
                                        <Button
                                            fullWidth
                                            size="small"
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            className={classes.submit}
                                        >
                                            {action === "add" ? "Add" : "Edit"}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Form>
                        </Formik>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
}

export default CaseHistoryAddEdit;
