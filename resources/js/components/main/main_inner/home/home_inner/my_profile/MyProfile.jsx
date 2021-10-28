import React, { useState, useEffect, useContext, useRef } from "react";

import utils from "../../../../../../utilities/utils";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import PhotoCamera from "@material-ui/icons/PhotoCamera";

import {
    AuthUserContext,
    LoadingContext
} from "../../../../../context/context";
import http from "../../../../../../services/http";

import TextInput from "../../../../../common/TextInput";
import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import SelectInput from "../../../../../common/SelectInput";
import DatePicker from "../../../../../common/DatePicker";
import TextFieldDisabledDark from "../../../../../common/TextFieldDisabledDark";
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
    },
    isHidden: {
        visibility: "hidden"
    }
}));

const apiUser = "api/user";
const currentDate = moment().format();

function MyProfile({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setActiveTab("");
    }, [activeTabTrigger]);

    const formEl = useRef(null);

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFileName, setImageFileName] = useState(null);
    const [imageError, setImageError] = useState(null);

    const [selectedBirthdate, setSelectedBirthdate] = useState(currentDate);
    const [selectedBirthdateError, setSelectedBirthdateError] = useState(null);

    const [userRole, setUserRole] = useState("");
    const [userID, setUserID] = useState("");
    const [userImage, setUserImage] = useState(null);
    const [userName, setUserName] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [userSex, setUserSex] = useState("");
    const [userNote, setUserNote] = useState("");
    const [userAddress, setUserAddress] = useState("");
    const [userEmail, setUserEmail] = useState("");

    const { setLoading } = useContext(LoadingContext);
    const { authUser, setAuthUser } = useContext(AuthUserContext);

    useEffect(() => {
        setLoading(true);
        if (authUser) {
            const {
                id,
                role,
                name,
                sex,
                phone,
                address,
                birthdate,
                note,
                email,
                image
            } = authUser;
            setUserID(id);
            setUserRole(utils.upperCaseFirstLetter(role));
            setUserName(name);
            setUserPhone(phone !== null ? phone : "");
            setUserSex(sex);
            setUserAddress(address);
            setUserNote(note !== null ? note : "");
            setUserEmail(email);
            setUserImage(image);
            setImagePreview(image);
            setSelectedBirthdate(moment(birthdate, "MM-DD-YYYY").format());

            setLoading(false);
        }
    }, [authUser]);

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
        setImagePreview(userImage);
    };

    const handleDateChange = date => {
        setSelectedBirthdate(date);
        setSelectedBirthdateError(null);
    };

    const handleSubmit = async (
        values,
        { setSubmitting, setErrors, setFieldValue }
    ) => {
        try {
            if (
                values.current_password !== "" ||
                values.password !== "" ||
                values.password_confirmation !== ""
            ) {
                let isError = {};

                if (values.current_password === "") {
                    isError.current_password = "Required";
                }
                if (values.password === "") {
                    isError.password = "Required";
                }
                if (values.password_confirmation === "") {
                    isError.password_confirmation = "Required";
                }
                if (values.password !== values.password_confirmation) {
                    isError.password_confirmation =
                        "Password confirmation does not match";
                }

                if (Object.keys(isError).length) {
                    setErrors(isError);
                    return;
                }
            }

            const formData = new FormData(formEl.current);

            const birthDate = formData.get("birthdate");

            if (authUser && authUser.role === "patient") {
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
                } else {
                    formData.append("birthdate", birthDateFormatted);
                }
            } else {
                formData.delete("birthdate");
                formData.delete("note");
            }

            setLoading(true);
            if (!imageFileName) {
                formData.delete("image");
            }

            formData.append("_method", "PATCH");
            await http.post(`${apiUser}/profile`, formData);
            toast.success("Profile edited succesfully");
            if (isMounted.current) {
                setFieldValue("current_password", "");
                setFieldValue("password", "");
                setFieldValue("password_confirmation", "");
            }

            setAuthUser();

            setSubmitting(false);
        } catch (ex) {
            if (ex.response && ex.response.status === 422) {
                const errors = ex.response.data.errors;
                setErrors(errors);
                if (errors.image) {
                    setImageError(errors.image);
                }
            } else {
                toast.error("An unexpected error occured.");
                console.log(ex);
            }
        }
        setLoading(false);
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
                        titleIcon={AccountBoxIcon}
                        title="My Account"
                    />
                </Box>
                <Paper>
                    <Box p={2}>
                        <Formik
                            enableReinitialize
                            initialValues={{
                                role: userRole,
                                name: userName,
                                phone: userPhone,
                                address: userAddress,
                                sex: userSex,
                                note: userNote,
                                email: userEmail,
                                current_password: "",
                                password: "",
                                password_confirmation: ""
                            }}
                            validationSchema={Yup.object({
                                name: Yup.string().required("Required"),
                                phone: Yup.string(),
                                address: Yup.string().required("Required"),
                                email: Yup.string()
                                    .email()
                                    .required("Required")
                                    .label("Email"),
                                current_password: Yup.string().label(
                                    "Current password"
                                ),
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
                                        <Grid item xs={12} sm={6} md={6}>
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
                                                    {userName}
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
                                        <Grid item xs={12} sm={6}>
                                            {authUser &&
                                            authUser.role !== "patient" ? (
                                                <TextFieldDisabledDark
                                                    size="small"
                                                    label="Role"
                                                    variant="outlined"
                                                    value={userRole}
                                                    fullWidth
                                                    disabled
                                                />
                                            ) : null}
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextFieldDisabledDark
                                                size="small"
                                                label="ID"
                                                variant="outlined"
                                                value={userID}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                autoComplete="name"
                                                name="name"
                                                variant="outlined"
                                                fullWidth
                                                id="name"
                                                label="Name *"
                                            />
                                        </Grid>
                                        {authUser &&
                                        authUser.role === "patient" ? (
                                            <React.Fragment>
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
                                                        value={
                                                            selectedBirthdate
                                                        }
                                                        onChange={
                                                            handleDateChange
                                                        }
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
                                            </React.Fragment>
                                        ) : null}
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                id="phone"
                                                label="Phone"
                                                name="phone"
                                                autoComplete="phone"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
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
                                        {authUser &&
                                        authUser.role === "patient" ? (
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
                                        ) : null}
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                name="email"
                                                label="Email *"
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
                                                label="Current password *"
                                                id="current_password"
                                                name="current_password"
                                                type="password"
                                                autoComplete="password"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                id="password"
                                                name="password"
                                                label="New password *"
                                                type="password"
                                                autoComplete="password"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                name="password_confirmation"
                                                label="New password confirmation *"
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
                                            Edit
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

export default MyProfile;
