import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import { LoadingContext } from "../../../../../context/context";
import http from "../../../../../../services/http";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    avatarContainer: {
        overflow: "hidden",
        [theme.breakpoints.up("md")]: {
            height: theme.spacing(35)
        }
    },
    avatarPreview: {
        overflow: "hidden",
        [theme.breakpoints.down("xs")]: {
            width: theme.spacing(8),
            height: theme.spacing(8)
        },
        [theme.breakpoints.down("sm")]: {
            width: theme.spacing(10),
            height: theme.spacing(10)
        },
        [theme.breakpoints.up("md")]: {
            width: theme.spacing(18),
            height: theme.spacing(18)
        },
        [theme.breakpoints.up("lg")]: {
            width: theme.spacing(20),
            height: theme.spacing(20)
        }
    },
    inputText: {
        marginLeft: theme.spacing(1),
        marginBottom: theme.spacing(1)
    },
    pre: {
        fontFamily: "inherit",
        whiteSpace: "pre-wrap",
        margin: theme.spacing(0)
    }
}));

const apiPatientEndpoint = "api/patients";

function PatientView({ setActiveTab, activeTabTrigger, action }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        setActiveTab("patientlist");
    }, [activeTabTrigger]);

    const [patientId, setPatientId] = useState("");
    const [patientImage, setPatientImage] = useState(null);
    const [patientName, setPatientName] = useState("");
    const [patientBirthdate, setPatienBirthdate] = useState("");
    const [patientSex, setPatientSex] = useState("");
    const [patientPhone, setPatientPhone] = useState("");
    const [patientAddress, setPatientAddress] = useState("");
    const [patientNote, setPatientNote] = useState("");
    const [patientEmail, setPatientEmail] = useState("");

    const { setLoading } = useContext(LoadingContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        async function getPatientData() {
            try {
                setLoading(true);
                const { data } = await http.get(
                    `${apiPatientEndpoint}/${params.patientID}`
                );
                const {
                    id: patientViewId,
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
                    setPatientId(patientViewId);
                    setPatientName(name);
                    setPatientSex(sex);
                    setPatientPhone(phone);
                    setPatientAddress(address);
                    setPatientNote(note);
                    setPatientEmail(email);
                    setPatientImage(image);
                    setPatienBirthdate(birthdate);
                }
            } catch (ex) {
                if (ex.response && ex.response.status === 404) {
                    history.push("home/404");
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
    }, []);

    const handleBackButton = () => history.goBack();

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
                        titleIcon={PermIdentityIcon}
                        title="Patient Information"
                    />
                </Box>
                <Paper>
                    <Box p={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4} lg={3}>
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    pr={1}
                                    pl={1}
                                    pt={3}
                                    pb={3}
                                    bgcolor="primary.main"
                                    borderRadius="borderRadius"
                                    className={classes.avatarContainer}
                                >
                                    <Avatar
                                        className={classes.avatarPreview}
                                        src={patientImage}
                                    >
                                        P
                                    </Avatar>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={8} lg={9}>
                                <Grid container spacing={1}>
                                    <Grid item xs={12}>
                                        <Box
                                            pl={1}
                                            pr={1}
                                            pt={2}
                                            pb={2}
                                            bgcolor="primary.main"
                                            color="primary.contrastText"
                                            borderRadius="borderRadius"
                                        >
                                            <Typography variant="body1">
                                                <strong>Patient ID:</strong>{" "}
                                                {patientId}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography
                                            variant="body1"
                                            className={classes.inputText}
                                        >
                                            <strong>Name:</strong> {patientName}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography
                                            variant="body1"
                                            className={classes.inputText}
                                        >
                                            <strong>Email:</strong>{" "}
                                            {patientEmail}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography
                                            variant="body1"
                                            className={classes.inputText}
                                        >
                                            <strong>Address:</strong>{" "}
                                            {patientAddress}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography
                                            variant="body1"
                                            className={classes.inputText}
                                        >
                                            <strong>Phone:</strong>{" "}
                                            {patientPhone}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography
                                            variant="body1"
                                            className={classes.inputText}
                                        >
                                            <strong>Sex:</strong> {patientSex}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography
                                            variant="body1"
                                            className={classes.inputText}
                                        >
                                            <strong>Birthdate:</strong>{" "}
                                            {patientBirthdate}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography
                                            variant="body1"
                                            component="div"
                                            className={classes.inputText}
                                        >
                                            <strong>Note:</strong>{" "}
                                            <pre className={classes.pre}>
                                                {patientNote}
                                            </pre>
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
}

export default PatientView;
