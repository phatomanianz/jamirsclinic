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

import {
    LoadingContext,
    AuthUserContext,
    DashboardContext
} from "../../../../../context/context";
import http from "../../../../../../services/http";
import utils from "../../../../../../utilities/utils";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import SelectInput from "../../../../../common/SelectInput";
import TextInput from "../../../../../common/TextInput";
import TextFieldDisabledDark from "../../../../../common/TextFieldDisabledDark";
import DatetimePicker from "../../../../../common/DatetimePicker";
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

const apiAppointments = "api/appointments";
const apiPatients = "api/patients";
const apiPersonnels = "api/personnels";
const currentDate = moment().format();

function AppointmentAddEdit({ setActiveTab, activeTabTrigger, action }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        if (params.patientID) {
            setActiveTab("patientlist");
        } else {
            if (params.type) {
                setActiveTab(`appointments${params.type}`);
            } else {
                setActiveTab("appointmentadd");
            }
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

    const [appointmentID, setAppointmentID] = useState(params.appointmentID);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [status, setStatus] = useState("");
    const [datetime, setDatetime] = useState(currentDate);
    const [datetimeError, setDatetimeError] = useState(null);

    const [doctors, setDoctors] = useState([]);
    const [errorSelectedDoctor, setErrorSelectedDoctor] = useState(false);
    const [
        doctorsAutocompleteDisabled,
        setDoctorsAutocompleteDisabled
    ] = useState(false);

    const [statusOptions, setStatusOptions] = useState([
        {
            label: "Pending Confirmation",
            value: "pending confirmation"
        },
        {
            label: "Confirmed",
            value: "confirmed"
        },
        {
            label: "Completed",
            value: "completed"
        },
        {
            label: "Cancelled",
            value: "cancelled"
        },
        {
            label: "No Show",
            value: "no show"
        }
    ]);

    const [loadingLocal, setLoadingLocal] = useState(false);
    const { setLoading } = useContext(LoadingContext);
    const { setDashboard } = useContext(DashboardContext);
    const { authUser } = useContext(AuthUserContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        const actionEffect = async () => {
            switch (authUser.role) {
                case "patient":
                    setStatusOptions([
                        {
                            label: "Requested",
                            value: "requested"
                        }
                    ]);
                    setStatus("requested");
                    setSelectedPatient({
                        id: authUser.id.toString(),
                        name: authUser.name
                    });
                    setPatientsAutocompleteDisabled(true);
                    setSelectedDoctor({ id: "N/A", name: "N/A" });
                    setDoctorsAutocompleteDisabled(true);
                    break;

                case "doctor":
                    getPatients();
                    setStatus("pending confirmation");
                    setSelectedDoctor({
                        id: authUser.id.toString(),
                        name: authUser.name
                    });
                    setDoctorsAutocompleteDisabled(true);

                    if (params.patientID) {
                        if (action === "add") {
                            getSelectedPatientData(params.patientID);
                        } else {
                            getAppointmentData(params.appointmentID);
                        }
                        setPatientsAutocompleteDisabled(true);
                    } else {
                        if (action === "edit") {
                            getAppointmentData(params.appointmentID);
                        }
                    }
                    break;

                default:
                    getDoctors();
                    getPatients();
                    if (params.patientID) {
                        if (action === "add") {
                            getSelectedPatientData(params.patientID);
                        } else {
                            getAppointmentData(params.appointmentID);
                        }
                        setPatientsAutocompleteDisabled(true);
                    } else {
                        if (action === "edit") {
                            getAppointmentData(params.appointmentID);
                        }
                    }
                    setStatus("pending confirmation");
            }
        };
        actionEffect();
    }, [action]);

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

    const getDoctors = async (search = "") => {
        try {
            setLoadingLocal(true);
            const { data } = await http.get(
                `${apiPersonnels}?role=doctor${
                    search ? `&search=${search}` : ""
                }`
            );
            const doctorsRequest = utils.convertPropertyNumberToString(
                data.personnels,
                "id"
            );

            if (isMounted.current) {
                if (selectedDoctor) {
                    utils.includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
                        doctorsRequest,
                        selectedDoctor,
                        setDoctors
                    );
                } else {
                    setDoctors([{ id: "N/A", name: "N/A" }, ...doctorsRequest]);
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
            const { data } = await http.get(`${apiPatients}/${patientID}`);
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

    const getAppointmentData = async appointmentID => {
        try {
            setLoading(true);
            const { data } = await http.get(
                `${apiAppointments}/${appointmentID}`
            );
            const {
                id,
                datetime: appointmentDatetime,
                patient_id,
                patient_name,
                doctor_id,
                doctor_name,
                remarks: appointmentRemarks,
                status: appointmentStatus
            } = data.appointment;
            const appointmentSelectedPatient = {
                id: patient_id.toString(),
                name: patient_name
            };
            const appointmentSelectedDoctor = {
                id: doctor_id.toString(),
                name: doctor_name
            };

            if (isMounted.current) {
                setAppointmentID(id);
                setDatetime(
                    moment(appointmentDatetime, "MM-DD-YYYY hh:mm A").format()
                );
                setSelectedPatient(appointmentSelectedPatient);
                setSelectedDoctor(appointmentSelectedDoctor);
                setRemarks(
                    appointmentRemarks !== null ? appointmentRemarks : ""
                );
                setStatus(appointmentStatus);
                if (appointmentStatus === "requested") {
                    setStatusOptions([
                        { label: "Requested", value: "requested" },
                        ...statusOptions
                    ]);
                }

                if (params.patientID) {
                    if (params.patientID != appointmentSelectedPatient.id) {
                        history.push("/home/404");
                    }
                } else {
                    utils.includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
                        patients,
                        appointmentSelectedPatient,
                        setPatients
                    );
                }

                utils.includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
                    doctors,
                    appointmentSelectedDoctor,
                    setDoctors
                );
            }

            if (authUser.role === "doctor") {
                setDoctorsAutocompleteDisabled(true);
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

    const handleOnChangeDoctor = (event, doctor) => {
        setSelectedDoctor(doctor);
    };

    const handleOnInputChangeDoctor = (event, value, reason) => {
        getDoctors(value);
        setErrorSelectedDoctor(false);
    };

    const handleDatetimeChange = datetime => {
        setDatetime(datetime);
        setDatetimeError(null);
    };

    const resetFormData = resetForm => {
        if (isMounted.current) {
            resetForm();
            setDatetime(currentDate);

            if (authUser.role === "doctor") {
                if (!params.patientID) {
                    setSelectedPatient(null);
                }
            } else if (
                authUser.role === "admin" ||
                authUser.role === "receptionist"
            ) {
                if (!params.patientID) {
                    setSelectedPatient(null);
                }
                setSelectedDoctor(null);
            } else {
                // Do nothing...
            }
        }
    };

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

            if (selectedDoctor === null) {
                setErrorSelectedDoctor(true);
                return;
            }

            const datetime = formData.get("datetime");

            if (datetime === "") {
                setDatetimeError("Required");
            }

            const datetimeFormatted = moment(
                datetime,
                "MM-DD-YYYY hh:mm A",
                true
            ).format("YYYY-MM-DD HH:mm:ss");

            if (datetimeFormatted === "Invalid date") {
                return;
            }

            formData.append("datetime", datetimeFormatted);
            formData.append("patient_id", selectedPatient.id);
            if (selectedDoctor.id !== "N/A") {
                formData.append("personnel_id", selectedDoctor.id);
            }

            setLoading(true);
            if (action === "add") {
                await http.post(apiAppointments, formData);
                toast.success(`New appointment added successfully`);
                resetFormData(resetForm);
            } else {
                formData.append("_method", "PATCH");
                await http.post(
                    `${apiAppointments}/${appointmentID}`,
                    formData
                );
                toast.success("Appointment edited succesfully");
            }

            setDashboard(false);

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
                                ? "Add New Appointment"
                                : "Edit Appointment"
                        }
                    />
                </Box>
                <Paper>
                    <Box p={2}>
                        <Formik
                            enableReinitialize
                            initialValues={{
                                remarks,
                                status
                            }}
                            validationSchema={Yup.object({
                                remarks: Yup.string().label("Required"),
                                status: Yup.string().label("Status")
                            })}
                            onSubmit={handleSubmit}
                        >
                            <Form ref={formEl}>
                                <Box mt={2}>
                                    <Grid container spacing={2}>
                                        {action === "edit" && (
                                            <Grid item xs={12}>
                                                <TextFieldDisabledDark
                                                    size="small"
                                                    label="ID"
                                                    name="id"
                                                    id="id"
                                                    variant="outlined"
                                                    value={appointmentID}
                                                    fullWidth
                                                    disabled
                                                />
                                            </Grid>
                                        )}
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
                                        {doctorsAutocompleteDisabled ? (
                                            <React.Fragment>
                                                <Grid item xs={12} sm={6}>
                                                    <TextFieldDisabledDark
                                                        size="small"
                                                        variant="outlined"
                                                        label="Doctor name *"
                                                        disabled
                                                        fullWidth
                                                        value={
                                                            selectedDoctor !==
                                                            null
                                                                ? selectedDoctor.name
                                                                : ""
                                                        }
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextFieldDisabledDark
                                                        size="small"
                                                        variant="outlined"
                                                        label="Doctor ID *"
                                                        disabled
                                                        fullWidth
                                                        value={
                                                            selectedDoctor !==
                                                            null
                                                                ? selectedDoctor.id
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
                                                            handleOnChangeDoctor
                                                        }
                                                        onInputChange={
                                                            handleOnInputChangeDoctor
                                                        }
                                                        value={selectedDoctor}
                                                        getOptionSelected={(
                                                            option,
                                                            value
                                                        ) =>
                                                            option.id ===
                                                            value.id
                                                        }
                                                        options={doctors}
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
                                                                label="Doctor name *"
                                                                placeholder="Search"
                                                                fullWidth
                                                                {...(errorSelectedDoctor
                                                                    ? {
                                                                          error: true,
                                                                          helperText:
                                                                              "Doctor is required"
                                                                      }
                                                                    : {})}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Autocomplete
                                                        onChange={
                                                            handleOnChangeDoctor
                                                        }
                                                        onInputChange={
                                                            handleOnInputChangeDoctor
                                                        }
                                                        value={selectedDoctor}
                                                        getOptionSelected={(
                                                            option,
                                                            value
                                                        ) =>
                                                            option.id ===
                                                            value.id
                                                        }
                                                        options={doctors}
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
                                                                label="Doctor ID *"
                                                                placeholder="Search"
                                                                fullWidth
                                                                {...(errorSelectedDoctor
                                                                    ? {
                                                                          error: true,
                                                                          helperText:
                                                                              "Doctor is required"
                                                                      }
                                                                    : {})}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                            </React.Fragment>
                                        )}
                                        <Grid item xs={12} sm={6}>
                                            <DatetimePicker
                                                size="small"
                                                variant="inline"
                                                inputVariant="outlined"
                                                id="datetime"
                                                name="datetime"
                                                label="Date & time *"
                                                value={datetime}
                                                onChange={handleDatetimeChange}
                                                format="MM-DD-YYYY hh:mm A"
                                                fullWidth
                                                {...(datetimeError
                                                    ? {
                                                          error: true,
                                                          helperText: datetimeError
                                                      }
                                                    : {})}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <SelectInput
                                                variant="outlined"
                                                size="small"
                                                inputLabel="Status *"
                                                inputLabelId="statusLabel"
                                                id="status"
                                                name="status"
                                                items={statusOptions}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                autoComplete="remarks"
                                                id="remarks"
                                                name="remarks"
                                                label="Remarks"
                                                fullWidth
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

export default AppointmentAddEdit;
