import React, { useState, useEffect, useContext, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import WorkIcon from "@material-ui/icons/Work";
import ScheduleIcon from "@material-ui/icons/Schedule";
import FolderIcon from "@material-ui/icons/Folder";
import PaymentIcon from "@material-ui/icons/Payment";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";

import {
    DashboardContext,
    LoadingContext
} from "../../../../../../context/context";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    box: {
        height: theme.spacing(16),
        [theme.breakpoints.down("sm")]: {
            height: theme.spacing(12)
        }
    },
    boxIcon: {
        width: theme.spacing(7),
        height: theme.spacing(7)
    },
    barGraph: {
        [theme.breakpoints.down("sm")]: {
            height: theme.spacing(80)
        },
        [theme.breakpoints.up("md")]: {
            height: theme.spacing(37)
        }
    },
    pieChart: {
        height: theme.spacing(35)
    }
}));

const BoxDashboard = props => {
    const classes = useStyles();

    return (
        <Grid container className={classes.box}>
            <Grid item xs={4}>
                <Box
                    height="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    bgcolor={props.bgColor}
                    color="primary.contrastText"
                    p={1}
                >
                    <props.icon className={classes.boxIcon} />
                </Box>
            </Grid>
            <Grid item xs={8}>
                <Box
                    height="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    bgcolor="background.paper"
                    p={1}
                >
                    <Box textAlign="center">
                        <Typography
                            variant="h5"
                            color="textPrimary"
                            gutterBottom
                        >
                            {props.value}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            {props.title}
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

function DashboardPatient({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();

    useEffect(() => {
        setActiveTab("dashboard");
    }, [activeTabTrigger]);

    const [appointmentTotal, setAppointmentTotal] = useState("");
    const [prescriptionTotal, setPrescriptionTotal] = useState("");
    const [caseHistoryTotal, setCaseHistoryTotal] = useState("");
    const [documentTotal, setDocumentTotal] = useState("");
    const [invoiceTotal, setInvoiceTotal] = useState("");

    const { dashboard } = useContext(DashboardContext);
    const { setLoading } = useContext(LoadingContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(true);
        if (dashboard) {
            const {
                apppointment_total,
                prescription_total,
                caseHistory_total,
                document_total,
                invoice_total
            } = dashboard;
            if (isMounted.current) {
                setAppointmentTotal(apppointment_total);
                setPrescriptionTotal(prescription_total);
                setCaseHistoryTotal(caseHistory_total);
                setDocumentTotal(document_total);
                setInvoiceTotal(invoice_total);

                setLoading(false);
            }
        }
    }, [dashboard]);

    return (
        <Box className={classes.root}>
            <Grid container justify="center" spacing={3}>
                <Grid item xs={12} md={4}>
                    <BoxDashboard
                        bgColor="secondary.main"
                        icon={ScheduleIcon}
                        title="Total Due"
                        value={invoiceTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <BoxDashboard
                        bgColor="primary.main"
                        icon={ScheduleIcon}
                        title="Total Appointment"
                        value={appointmentTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <BoxDashboard
                        bgColor="success.main"
                        icon={SupervisedUserCircleIcon}
                        title="Total Prescription"
                        value={prescriptionTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <BoxDashboard
                        bgColor="success.main"
                        icon={WorkIcon}
                        title="Total Case History"
                        value={caseHistoryTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <BoxDashboard
                        bgColor="secondary.main"
                        icon={FolderIcon}
                        title="Total Document"
                        value={documentTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <BoxDashboard
                        bgColor="primary.main"
                        icon={PaymentIcon}
                        title="Total Invoice"
                        value={invoiceTotal}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

export default DashboardPatient;
