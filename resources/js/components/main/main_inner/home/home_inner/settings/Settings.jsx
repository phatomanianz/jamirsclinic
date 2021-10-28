import React, { useState, useEffect, useContext, useRef } from "react";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import SettingsIcon from "@material-ui/icons/Settings";

import {
    LoadingContext,
    SettingsContext
} from "../../../../../context/context";
import http from "../../../../../../services/http";
import utils from "../../../../../../utilities/utils";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TextInput from "../../../../../common/TextInput";
import SelectInput from "../../../../../common/SelectInput";
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
    logoFileName: {
        whiteSpace: "no-wrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    }
}));

const apiSettings = "api/settings";

function Settings({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();

    useEffect(() => {
        setActiveTab("settings");
    }, [activeTabTrigger]);

    const formEl = useRef(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFileName, setLogoFileName] = useState(null);
    const [logoError, setLogoError] = useState(null);

    const [settingsID, setSettingsID] = useState(null);
    const [logo, setLogo] = useState(null);
    const [name, setName] = useState("");
    const [title, setTitle] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [currency, setCurrency] = useState("$");

    const { setLoading } = useContext(LoadingContext);
    const { settings } = useContext(SettingsContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        if (settings) {
            const {
                id,
                name: systemName,
                title: systemTitle,
                address: systemAddress,
                phone: systemPhone,
                email: systemEmail,
                currency: systemCurrency,
                logo: systemLogo
            } = settings;
            if (isMounted.current) {
                setSettingsID(id);
                setName(systemName);
                setTitle(systemTitle);
                setAddress(systemAddress);
                setPhone(systemPhone);
                setEmail(systemEmail);
                setCurrency(systemCurrency);
                setLogo(systemLogo);
                setLogoPreview(systemLogo);
            }
        }
    }, [settings]);

    const handleLogoChange = event => {
        if (event.target.files && event.target.files[0]) {
            setLogoPreview(URL.createObjectURL(event.target.files[0]));
            setLogoFileName(event.target.files[0].name);
            setLogoError(null);
        }
    };

    const handleDeleteLogo = () => {
        setLogoError(null);
        setLogoFileName(null);
        setLogoPreview(logo);
    };

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            const formData = new FormData(formEl.current);

            if (!logoFileName) {
                formData.delete("logo");
            }

            setLoading(true);
            formData.append("_method", "PATCH");
            await http.post(`${apiSettings}/${settingsID}`, formData);
            toast.success("Settings edited succesfully");

            if (isMounted.current) {
                setSubmitting(false);
            }

            window.location.reload();
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
                        backButton={false}
                        titleIcon={SettingsIcon}
                        title="System Settings"
                    />
                </Box>
                <Paper>
                    <Box p={2}>
                        <Formik
                            enableReinitialize
                            initialValues={{
                                name,
                                title,
                                address,
                                phone,
                                email,
                                currency
                            }}
                            validationSchema={Yup.object({
                                name: Yup.string().required("Required"),
                                title: Yup.string().required("Required"),
                                address: Yup.string().required("Required"),
                                phone: Yup.string().required("Required"),
                                email: Yup.string()
                                    .email()
                                    .label("Email"),
                                currency: Yup.string()
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
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                id="name"
                                                name="name"
                                                label="System Name *"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                id="title"
                                                name="title"
                                                label="Title *"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                id="address"
                                                name="address"
                                                label="Address *"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                id="phone"
                                                name="phone"
                                                label="Phone *"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                id="email"
                                                name="email"
                                                label="Email *"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <SelectInput
                                                variant="outlined"
                                                size="small"
                                                inputLabel="Currency *"
                                                inputLabelId="currencyLabel"
                                                id="currency"
                                                name="currency"
                                                items={utils.getCurrency()}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                            >
                                                <Box color="text.secondary">
                                                    <Typography
                                                        variant="body2"
                                                        color="inherit"
                                                        gutterBottom
                                                    >
                                                        &nbsp;Logo
                                                    </Typography>
                                                    <Avatar
                                                        className={
                                                            classes.avatarPreview
                                                        }
                                                        src={logoPreview}
                                                    >
                                                        P
                                                    </Avatar>
                                                </Box>
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
                                                        id="logo"
                                                        name="logo"
                                                        type="file"
                                                        onChange={
                                                            handleLogoChange
                                                        }
                                                    />
                                                    <label htmlFor="logo">
                                                        <IconButton
                                                            color="primary"
                                                            aria-label="upload picture"
                                                            component="span"
                                                        >
                                                            <PhotoCamera />
                                                        </IconButton>
                                                    </label>
                                                    {logoFileName && (
                                                        <IconButton
                                                            color="secondary"
                                                            aria-label="reset logo"
                                                            component="span"
                                                            onClick={
                                                                handleDeleteLogo
                                                            }
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                    {logoError && (
                                                        <Box color="error.main">
                                                            {logoError}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                            {logoFileName && (
                                                <Typography
                                                    variant="body2"
                                                    className={
                                                        classes.logoFileName
                                                    }
                                                >
                                                    {logoFileName}
                                                </Typography>
                                            )}
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

export default Settings;
