import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import PhotoCamera from "@material-ui/icons/PhotoCamera";

import {
    LoadingContext,
    DashboardContext
} from "../../../../../context/context";
import http from "../../../../../../services/http";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TextInput from "../../../../../common/TextInput";
import TextFieldDisabledDark from "../../../../../common/TextFieldDisabledDark";
import SelectInput from "../../../../../common/SelectInput";
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
    inputImage: {
        display: "none"
    },
    avatarPreview: {
        width: theme.spacing(12),
        height: theme.spacing(12),
        marginRight: theme.spacing(1)
    },
    imageFileName: {
        whiteSpace: "no-wrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    }
}));

const apiPatientEndpoint = "api/patients";
const currentDate = moment().format();

function PatientAddEdit({ setActiveTab, activeTabTrigger, action }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        if (action === "add") {
            setActiveTab("patientadd");
        } else {
            setActiveTab("patientlist");
        }
    }, [activeTabTrigger]);

    const formEl = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFileName, setImageFileName] = useState(null);
    const [imageError, setImageError] = useState(null);

    const [selectedBirthdate, setSelectedBirthdate] = useState(currentDate);
    const [selectedBirthdateError, setSelectedBirthdateError] = useState(null);

    const [patientID, setPatientID] = useState("");
    const [patientImage, setPatientImage] = useState(null);
    const [patientName, setPatientName] = useState("");
    const [patientSex, setPatientSex] = useState("male");
    const [patientPhone, setPatientPhone] = useState("");
    const [patientAddress, setPatientAddress] = useState("");
    const [patientNote, setPatientNote] = useState("");
    const [patientEmail, setPatientEmail] = useState("");

    const { setLoading } = useContext(LoadingContext);
    const { setDashboard } = useContext(DashboardContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        if (action === "edit") {
            async function getPatientData() {
                try {
                    setLoading(true);
                    const { data } = await http.get(
                        `${apiPatientEndpoint}/${params.patientID}`
                    );
                    const {
                        id: patientEditId,
                        name,
                        sex,
                        birthdate,
                        phone,
                        address,
                        note,
                        email,
                        image
                    } = data.patient;
                    if (isMounted.current) {
                        setPatientID(patientEditId);
                        setPatientName(name);
                        setPatientSex(sex);
                        setPatientPhone(phone);
                        setPatientAddress(address);
                        setPatientNote(note !== null ? note : "");
                        setPatientEmail(email !== null ? email : "");
                        setPatientImage(image);
                        setImagePreview(image);
                        setSelectedBirthdate(
                            moment(birthdate, "MM-DD-YYYY").format()
                        );
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
            }
            getPatientData();
        } else {
            resetFormData();
        }
    }, [action]);

    const handleImageChange = event => {
        if (event.target.files && event.target.files[0]) {
            setImagePreview(URL.createObjectURL(event.target.files[0]));
            setImageFileName(event.target.files[0].name);
            setImageError(null);
        }
    };

    const handleDeleteImage = () => {
        setImageError(null);
        setImageFileName(null);
        if (action === "add") {
            setImagePreview(null);
        } else {
            setImagePreview(patientImage);
        }
    };

    const handleDateChange = date => {
        setSelectedBirthdate(date);
        setSelectedBirthdateError(null);
    };

    const resetFormData = resetForm => {
        if (isMounted.current) {
            setImageError(null);
            setImageFileName(null);
            setImagePreview(null);

            if (resetForm) {
                resetForm();
            } else {
                setPatientID("");
                setPatientName("");
                setPatientSex("male");
                setSelectedBirthdate(currentDate);
                setPatientPhone("");
                setPatientAddress("");
                setPatientEmail("");
                setPatientImage(null);
            }
        }
    };

    const handleSubmit = async (
        values,
        { setSubmitting, setErrors, resetForm, setFieldValue }
    ) => {
        try {
            if (
                (values.password !== "" ||
                    values.password_confirmation !== "") &&
                values.password !== values.password_confirmation
            ) {
                setErrors({
                    password_confirmation:
                        "Password confirmation does not match"
                });
                return;
            }

            const formData = new FormData(formEl.current);

            const birthDate = formData.get("birthdate");

            if (birthDate === "") {
                setSelectedBirthdateError("Required");
            }

            const birthDateFormatted = moment(
                birthDate,
                "MM-DD-YYYY",
                true
            ).format("YYYY-MM-DD");

            if (birthDateFormatted === "Invalid date") {
                return;
            }

            setLoading(true);
            formData.append("birthdate", birthDateFormatted);

            if (!imageFileName) {
                formData.delete("image");
            }

            if (action === "add") {
                await http.post(apiPatientEndpoint, formData);
                toast.success(`New patient added successfully`);
                resetFormData(resetForm);
            } else {
                formData.append("_method", "PATCH");
                await http.post(`${apiPatientEndpoint}/${patientID}`, formData);
                toast.success("Patient edited succesfully");
                if (isMounted.current) {
                    setFieldValue("password", "");
                    setFieldValue("password_confirmation", "");
                }
            }

            setDashboard(false);

            if (isMounted.current) {
                setSubmitting(false);
            }
        } catch (ex) {
            if (ex.response && ex.response.status === 422) {
                if (isMounted.current) {
                    setErrors(ex.response.data.errors);
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
                                ? "Add New Patient"
                                : "Edit Patient"
                        }
                    />
                </Box>
                <Paper>
                    <Box p={2}>
                        <Formik
                            enableReinitialize
                            initialValues={{
                                name: patientName,
                                sex: patientSex,
                                phone: patientPhone,
                                address: patientAddress,
                                note: patientNote,
                                email: patientEmail,
                                password: "",
                                password_confirmation: ""
                            }}
                            validationSchema={Yup.object({
                                name: Yup.string().required("Required"),
                                sex: Yup.string(),
                                phone: Yup.string().required("Required"),
                                address: Yup.string().required("Required"),
                                note: Yup.string().label("Note"),
                                email: Yup.string()
                                    .email()
                                    .label("Email"),
                                password: Yup.string()
                                    .min(8)
                                    .label("Password"),
                                password_confirmation: Yup.string()
                                    .min(8)
                                    .label("Password")
                            })}
                            onSubmit={handleSubmit}
                        >
                            <Form ref={formEl}>
                                <Box mt={2}>
                                    <Grid
                                        container
                                        spacing={2}
                                        justify="flex-end"
                                    >
                                        <Grid item xs={12}>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                            >
                                                <Avatar
                                                    className={
                                                        classes.avatarPreview
                                                    }
                                                    src={imagePreview}
                                                >
                                                    P
                                                </Avatar>
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    flexDirection="column"
                                                >
                                                    <input
                                                        accept="image/*"
                                                        className={
                                                            classes.inputImage
                                                        }
                                                        id="image"
                                                        name="image"
                                                        type="file"
                                                        onChange={
                                                            handleImageChange
                                                        }
                                                    />
                                                    <label htmlFor="image">
                                                        <IconButton
                                                            color="primary"
                                                            aria-label="upload picture"
                                                            component="span"
                                                        >
                                                            <PhotoCamera />
                                                        </IconButton>
                                                    </label>
                                                    {imageFileName && (
                                                        <IconButton
                                                            color="secondary"
                                                            aria-label="reset picture"
                                                            component="span"
                                                            onClick={
                                                                handleDeleteImage
                                                            }
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                    {imageError && (
                                                        <Box color="error.main">
                                                            {imageError}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                            {imageFileName && (
                                                <Typography
                                                    variant="body2"
                                                    className={
                                                        classes.imageFileName
                                                    }
                                                >
                                                    {imageFileName}
                                                </Typography>
                                            )}
                                        </Grid>
                                        {action === "edit" && (
                                            <Grid item xs={12} md={6}>
                                                <TextFieldDisabledDark
                                                    size="small"
                                                    label="ID"
                                                    name="id"
                                                    id="id"
                                                    variant="outlined"
                                                    value={patientID}
                                                    fullWidth
                                                    disabled
                                                />
                                            </Grid>
                                        )}
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                autoComplete="name"
                                                name="name"
                                                variant="outlined"
                                                fullWidth
                                                id="name"
                                                label="Name *"
                                                autoFocus
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <SelectInput
                                                variant="outlined"
                                                size="small"
                                                inputLabel="Sex *"
                                                inputLabelId="sexLabel"
                                                id="sex"
                                                name="sex"
                                                items={[
                                                    {
                                                        label: "Male",
                                                        value: "male"
                                                    },
                                                    {
                                                        label: "Female",
                                                        value: "female"
                                                    }
                                                ]}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <DatePicker
                                                size="small"
                                                inputVariant="outlined"
                                                id="birthdate"
                                                name="birthdate"
                                                label="Birthdate *"
                                                format="MM-DD-YYYY"
                                                maxDate={currentDate}
                                                maxDateMessage="Date should not be after current date"
                                                value={selectedBirthdate}
                                                onChange={handleDateChange}
                                                fullWidth
                                                {...(selectedBirthdateError
                                                    ? {
                                                          error: true,
                                                          helperText: selectedBirthdateError
                                                      }
                                                    : {})}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                id="phone"
                                                label="Phone *"
                                                name="phone"
                                                autoComplete="phone"
                                            />
                                        </Grid>
                                        <Grid
                                            item
                                            xs={12}
                                            sm={action === "add" ? 12 : 6}
                                        >
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                id="address"
                                                label="Address *"
                                                name="address"
                                                autoComplete="address"
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
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                name="email"
                                                label="Email"
                                                type="email"
                                                id="email"
                                                autoComplete="email"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                name="password"
                                                label="Password"
                                                type="password"
                                                id="password"
                                                autoComplete="password"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                name="password_confirmation"
                                                label="Password confirmation"
                                                type="password"
                                                id="password_confirmation"
                                                autoComplete="password"
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
                                            {action === "add"
                                                ? "Register"
                                                : "Edit"}
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

export default PatientAddEdit;
