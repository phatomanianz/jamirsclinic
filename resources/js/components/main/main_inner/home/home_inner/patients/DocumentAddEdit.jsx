import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import FolderIcon from "@material-ui/icons/Folder";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import AttachFileIcon from "@material-ui/icons/AttachFile";

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
    },
    inputFile: {
        display: "none"
    },
    avatarPreview: {
        width: theme.spacing(16),
        height: theme.spacing(16),
        marginRight: theme.spacing(1)
    },
    fileName: {
        whiteSpace: "no-wrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    }
}));

const apiPatientsUrl = "api/patients";
const apiDocumentUrl = "api/documents";
const currentDate = moment().format();

function DocumentAddEdit({ setActiveTab, activeTabTrigger, action }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        if (params.patientID) {
            setActiveTab("patientlist");
        } else {
            setActiveTab("documents");
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

    const [filePreview, setFilePreview] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [fileError, setFileError] = useState(null);

    // Is used for unchanged file in edit action
    const [fileNameEditAction, setFileNameEditAction] = useState(null);

    const [documentID, setDocumentID] = useState(params.documentID);
    const [description, setDescription] = useState("");
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
        const actionEffect = async () => {
            if (params.patientID) {
                if (action === "add") {
                    getSelectedPatientData(params.patientID);
                } else {
                    getDocumentData(params.documentID);
                }
                setPatientsAutocompleteDisabled(true);
            } else {
                getPatients();
                if (action === "edit") {
                    getDocumentData(params.documentID);
                }
            }
        };
        actionEffect();
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

    const getDocumentData = async documentID => {
        try {
            setLoading(true);
            const { data } = await http.get(`${apiDocumentUrl}/${documentID}`);
            const {
                id,
                date: documentDate,
                description: documentDescription,
                file: documentFile,
                patient_id,
                patient_name
            } = data.document;
            const documentSelectedPatient = {
                id: patient_id.toString(),
                name: patient_name
            };

            if (isMounted.current) {
                setDocumentID(id);
                setDate(moment(documentDate, "MM-DD-YYYY").format());
                setFilePreview(documentFile);
                setFileNameEditAction(documentFile);
                setFileName(
                    documentFile.substr(documentFile.lastIndexOf("/") + 1)
                );
                setDescription(
                    documentDescription !== null ? documentDescription : ""
                );

                if (params.patientID) {
                    if (params.patientID != documentSelectedPatient.id) {
                        history.push("/home/404");
                    }
                } else {
                    utils.includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
                        patients,
                        documentSelectedPatient,
                        setPatients
                    );
                }
                setSelectedPatient(documentSelectedPatient);
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

    const handleFileChange = event => {
        if (event.target.files && event.target.files[0]) {
            setFilePreview(URL.createObjectURL(event.target.files[0]));
            setFileName(event.target.files[0].name);
            setFileError(null);
        }
    };

    const handleDeleteFile = () => {
        setFileError(null);
        setFileName(null);
        setFilePreview(null);
    };

    const handleDateChange = date => {
        setDate(date);
        setDateError(null);
    };

    const handleBackButton = () => history.goBack();

    const handleSubmit = async (
        values,
        { setSubmitting, setErrors, resetForm }
    ) => {
        try {
            if (fileName === null) {
                setFileError("File is required");
                return;
            }
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
                await http.post(apiDocumentUrl, formData);
                toast.success(`New document added successfully`);

                if (isMounted.current) {
                    setFileError(null);
                    setFileName(null);
                    setFilePreview(null);
                    setDate(currentDate);
                    resetForm();
                    if (!params.patientID) {
                        setSelectedPatient(null);
                    }
                }
            } else {
                // If file is unchanged
                if (filePreview === fileNameEditAction) {
                    formData.delete("file");
                }
                formData.append("_method", "PATCH");
                await http.post(`${apiDocumentUrl}/${documentID}`, formData);
                toast.success(`Document edited successfully`);
            }

            if (isMounted.current) {
                setSubmitting(false);
            }
        } catch (ex) {
            if (ex.response && ex.response.status === 422) {
                const errors = ex.response.data.errors;
                if (isMounted.current) {
                    setErrors(errors);
                    if (errors.file) {
                        setFileError(errors.file);
                    }
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
                                ? "Add New Document"
                                : "Edit Document"
                        }
                    />
                </Box>
                <Paper>
                    <Box p={2}>
                        <Formik
                            enableReinitialize
                            initialValues={{
                                description: description
                            }}
                            validationSchema={Yup.object({
                                name: Yup.string().label("Description")
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
                                            <Typography
                                                variant="body1"
                                                color="textSecondary"
                                            >
                                                File *
                                            </Typography>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                            >
                                                <Avatar
                                                    className={
                                                        classes.avatarPreview
                                                    }
                                                    src={filePreview}
                                                    variant="square"
                                                >
                                                    <FolderIcon />
                                                </Avatar>
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    flexDirection="column"
                                                >
                                                    <input
                                                        accept=".jpeg, .jpg, .bmp, .png, .doc, .pdf, .docx, .ppt, .txt, .zip, .rar"
                                                        className={
                                                            classes.inputFile
                                                        }
                                                        id="file"
                                                        name="file"
                                                        type="file"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />
                                                    <label htmlFor="file">
                                                        <Tooltip
                                                            title="Upload file"
                                                            placement="top"
                                                        >
                                                            <IconButton
                                                                color="primary"
                                                                aria-label="upload file"
                                                                component="span"
                                                            >
                                                                <AttachFileIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </label>
                                                    {fileName && (
                                                        <Tooltip
                                                            title="Delete file"
                                                            placement="top"
                                                        >
                                                            <IconButton
                                                                color="secondary"
                                                                aria-label="reset picture"
                                                                component="span"
                                                                onClick={
                                                                    handleDeleteFile
                                                                }
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {fileError && (
                                                        <Box color="error.main">
                                                            {fileError}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                            {fileName && (
                                                <Box mt={1}>
                                                    <Typography
                                                        variant="body2"
                                                        className={
                                                            classes.fileName
                                                        }
                                                    >
                                                        {fileName}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Grid>
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
                                                label="Description"
                                                name="description"
                                                id="description"
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

export default DocumentAddEdit;
