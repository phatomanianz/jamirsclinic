import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useHistory } from "react-router-dom";
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
import AddCircleIcon from "@material-ui/icons/AddCircle";
import EditIcon from "@material-ui/icons/Edit";
import PhotoCamera from "@material-ui/icons/PhotoCamera";

import {
    AuthUserContext,
    LoadingContext
} from "../../../../../context/context";
import http from "../../../../../../services/http";
import auth from "../../../../../../services/auth";

import TextInput from "../../../../../common/TextInput";
import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import SelectInput from "../../../../../common/SelectInput";
import TextFieldDisabledDark from "../../../../../common/TextFieldDisabledDark";
import { Formik, Form } from "formik";
import * as Yup from "yup";

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

const apiUserEndpoint = "api/user";

function UserAddEdit({ setActiveTab, activeTabTrigger, action }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const { type, id } = useParams();
    const history = useHistory();

    const upperCaseType = utils.upperCaseFirstLetter(type);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setActiveTab(`users${type}`);
    }, [activeTabTrigger]);

    const formEl = useRef(null);

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFileName, setImageFileName] = useState(null);
    const [imageError, setImageError] = useState(null);

    const [userRole, setUserRole] = useState(type);
    const [userID, setUserID] = useState("");
    const [userImage, setUserImage] = useState(null);
    const [userName, setUserName] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [userAddress, setUserAddress] = useState("");
    const [userEmail, setUserEmail] = useState("");

    const { setLoading } = useContext(LoadingContext);
    const { authUser, setAuthUser } = useContext(AuthUserContext);

    useEffect(() => {
        setLoading(false);
        if (action === "edit") {
            async function getUserData() {
                try {
                    setLoading(true);
                    const { data } = await http.get(`${apiUserEndpoint}/${id}`);
                    const {
                        id: userEditId,
                        role,
                        name,
                        phone,
                        address,
                        email,
                        image
                    } = data.user;
                    if (isMounted.current) {
                        setUserRole(role);
                        setUserID(userEditId);
                        setUserName(name);
                        setUserPhone(phone !== null ? phone : "");
                        setUserAddress(address);
                        setUserEmail(email);
                        setUserImage(image);
                        setImagePreview(image);
                    }
                } catch (ex) {
                    if (ex.response && ex.response.status === 404) {
                        history.push("/home/404");
                    } else {
                        toast.error("An unexpected error occured.");
                        console.log(ex);
                    }
                }
                setLoading(false);
            }
            getUserData();
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
            setImagePreview(userImage);
        }
    };

    const resetFormData = resetForm => {
        if (isMounted.current) {
            resetForm();
            setImageError(null);
            setImageFileName(null);
            setImagePreview(null);
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

            setLoading(true);
            const formData = new FormData(formEl.current);
            if (!imageFileName) {
                formData.delete("image");
            }

            if (action === "add") {
                await http.post(`${apiUserEndpoint}/register`, formData);
                toast.success(`New ${type} added successfully`);
                resetFormData(resetForm);
            } else {
                formData.append("_method", "PATCH");
                const { data: updatedUser } = await http.post(
                    `${apiUserEndpoint}/${userID}`,
                    formData
                );
                toast.success("User edited succesfully");
                if (
                    authUser.id === updatedUser.user.id &&
                    updatedUser.user.role !== "admin"
                ) {
                    await auth.logout();
                    setTimeout(() => history.push("/login"), 5000);
                }
                if (isMounted.current) {
                    setFieldValue("password", "");
                    setFieldValue("password_confirmation", "");
                }
            }

            setSubmitting(false);
        } catch (ex) {
            if (ex.response && ex.response.status === 422) {
                const message = ex.response.data.message;
                setErrors(message);
                if (message.image) {
                    setImageError(message.image);
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
                        titleIcon={action === "add" ? AddCircleIcon : EditIcon}
                        title={
                            action === "add"
                                ? `Add New ${upperCaseType}`
                                : `Edit ${upperCaseType}`
                        }
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
                                email: userEmail,
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
                                password:
                                    action === "add"
                                        ? Yup.string()
                                              .min(8)
                                              .required("Required")
                                              .label("Password")
                                        : Yup.string()
                                              .min(8)
                                              .label("Password"),
                                password_confirmation:
                                    action === "add"
                                        ? Yup.string()
                                              .min(8)
                                              .required("Required")
                                              .label("Password")
                                        : Yup.string()
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
                                                    {upperCaseType.charAt(0)}
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
                                            <Box
                                                className={
                                                    action === "add"
                                                        ? classes.isHidden
                                                        : null
                                                }
                                            >
                                                <SelectInput
                                                    variant="outlined"
                                                    size="small"
                                                    inputLabel="Role *"
                                                    inputLabelId="roleLabel"
                                                    id="role"
                                                    name="role"
                                                    items={[
                                                        {
                                                            label: "Admin",
                                                            value: "admin"
                                                        },
                                                        {
                                                            label: "Doctor",
                                                            value: "doctor"
                                                        },
                                                        {
                                                            label:
                                                                "Receptionist",
                                                            value:
                                                                "receptionist"
                                                        }
                                                    ]}
                                                />
                                            </Box>
                                        </Grid>
                                        {action === "edit" && (
                                            <Grid item xs={12} sm={6}>
                                                <TextFieldDisabledDark
                                                    size="small"
                                                    label="ID"
                                                    name="id"
                                                    id="id"
                                                    variant="outlined"
                                                    value={userID}
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
                                                name="password"
                                                label={
                                                    action === "add"
                                                        ? "Password *"
                                                        : "Password"
                                                }
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
                                                label={
                                                    action === "add"
                                                        ? "Password confirmation *"
                                                        : "Password confirmation"
                                                }
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

export default UserAddEdit;
