import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import PrintIcon from "@material-ui/icons/Print";
import VisibilityIcon from "@material-ui/icons/Visibility";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TextFieldDisabledDarker from "../../../../../common/TextFieldDisabledDarker";

import PrintHeader from "../settings/common/PrintHeader";

import { LoadingContext } from "../../../../../context/context";
import http from "../../../../../../services/http";

import ReactToPrint from "react-to-print";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    prescriptionWrapper: {
        width: theme.spacing(35)
    },
    dispalyNone: {
        display: "none"
    },
    pre: {
        fontFamily: "inherit",
        whiteSpace: "pre-wrap",
        margin: theme.spacing(0)
    }
}));

const apiPrescriptions = "api/prescriptions";

function prescriptionView({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        if (params.patientID) {
            setActiveTab("patientlist");
        } else {
            setActiveTab("prescriptionlist");
        }
    }, [activeTabTrigger]);

    const [date, setDate] = useState("");
    const [patientId, setPatientId] = useState("");
    const [patientName, setPatientName] = useState("");
    const [patientAddress, setPatientAddress] = useState("");
    const [patientPhone, setPatientPhone] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [doctorPhone, setDoctorPhone] = useState("");
    const [medication, setMedication] = useState("");
    const [note, setNote] = useState("");

    const prescriptionForPrintRef = useRef();
    const { setLoading } = useContext(LoadingContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        const getPatientPrescription = async () => {
            try {
                setLoading(true);
                const { data } = await http.get(
                    `${apiPrescriptions}/${params.prescriptionID}`
                );
                const {
                    date: prescriptionDate,
                    patient_id,
                    patient_name,
                    patient_address,
                    patient_phone,
                    doctor_id,
                    doctor_name,
                    doctor_phone,
                    medication: prescriptionMedication,
                    note: prescriptionNote
                } = data.prescription;
                if (isMounted.current) {
                    setDate(prescriptionDate);
                    setPatientId(patient_id);
                    setPatientName(patient_name);
                    setPatientAddress(patient_address);
                    setPatientPhone(patient_phone);
                    setDoctorId(doctor_id);
                    setDoctorName(doctor_name);
                    setDoctorPhone(doctor_phone);
                    setMedication(prescriptionMedication);
                    setNote(prescriptionNote !== null ? prescriptionNote : "");
                }

                if (params.patientID && params.patientID != patient_id) {
                    history.push("/home/404");
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
        getPatientPrescription();
    }, []);

    return (
        <React.Fragment>
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
                            titleIcon={VisibilityIcon}
                            title="View Prescription"
                        />
                    </Box>
                    <Paper>
                        <Box p={3}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldDisabledDarker
                                        size="small"
                                        variant="outlined"
                                        label="Patient name"
                                        value={patientName}
                                        fullWidth
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldDisabledDarker
                                        size="small"
                                        variant="outlined"
                                        label="Patient ID"
                                        value={patientId}
                                        fullWidth
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldDisabledDarker
                                        size="small"
                                        variant="outlined"
                                        label="Doctor name"
                                        value={doctorName}
                                        fullWidth
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldDisabledDarker
                                        size="small"
                                        variant="outlined"
                                        label="Doctor ID"
                                        value={doctorId}
                                        fullWidth
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextFieldDisabledDarker
                                        size="small"
                                        variant="outlined"
                                        label="Date"
                                        value={date}
                                        fullWidth
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextFieldDisabledDarker
                                        size="small"
                                        variant="outlined"
                                        label="Medication"
                                        value={medication}
                                        fullWidth
                                        multiline
                                        rows={4}
                                        rowsMax={8}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextFieldDisabledDarker
                                        size="small"
                                        variant="outlined"
                                        label="Note"
                                        value={note}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        rowsMax={8}
                                        disabled
                                    />
                                </Grid>
                            </Grid>
                            <Box
                                mt={3}
                                display="flex"
                                justifyContent="flex-end"
                            >
                                <ReactToPrint
                                    trigger={() => (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            startIcon={<PrintIcon />}
                                        >
                                            Print
                                        </Button>
                                    )}
                                    content={() =>
                                        prescriptionForPrintRef.current
                                    }
                                    documentTitle={`prescription-${patientId}-${patientName}`}
                                />
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* ONLY SHOW WHILE PRINTING */}
            <Box className={classes.dispalyNone}>
                <Box p={5} ref={prescriptionForPrintRef}>
                    <PrintHeader />
                    <Box
                        mt={3}
                        mx="auto"
                        p={1}
                        borderBottom={2}
                        className={classes.prescriptionWrapper}
                    >
                        <Typography variant="h6" align="center">
                            PRESCRIPTION
                        </Typography>
                    </Box>
                    <Box mt={3}>
                        <Grid container spacing={1}>
                            <Grid item xs={4}>
                                <Typography variant="body1">
                                    <strong>Patient name:</strong> {patientName}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body1">
                                    <strong>Doctor name:</strong> {doctorName}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body1">
                                    <strong>Date:</strong> {date}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body1">
                                    <strong>Patient ID:</strong> {patientId}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body1">
                                    <strong>Doctor ID:</strong> {doctorId}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                {/* empty */}
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body1">
                                    <strong>Addresss:</strong> {patientAddress}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body1">
                                    <strong>Phone:</strong> {doctorPhone}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                {/* empty */}
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body1">
                                    <strong>Phone:</strong> {patientPhone}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box mt={3} mb={1}>
                        <Divider />
                    </Box>
                    <Box p={3}>
                        <Grid container spacing={1}>
                            <Grid item xs={2}>
                                <Typography variant="body1">
                                    <strong>Medication:</strong>
                                </Typography>
                            </Grid>
                            <Grid item xs={10}>
                                <Typography variant="body1" component="div">
                                    <pre className={classes.pre}>
                                        {medication}
                                    </pre>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box mt={1} mb={1}>
                        <Divider />
                    </Box>
                    <Box p={3}>
                        <Grid container spacing={1}>
                            <Grid item xs={2}>
                                <Typography variant="body1">
                                    <strong>Note:</strong>
                                </Typography>
                            </Grid>
                            <Grid item xs={10}>
                                <Typography variant="body1" component="div">
                                    <pre className={classes.pre}>{note}</pre>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Box>
        </React.Fragment>
    );
}

export default prescriptionView;
