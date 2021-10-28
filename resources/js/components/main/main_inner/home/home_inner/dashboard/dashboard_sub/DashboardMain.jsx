import React, { useState, useEffect, useContext, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import PersonIcon from "@material-ui/icons/Person";
import WorkIcon from "@material-ui/icons/Work";
import ScheduleIcon from "@material-ui/icons/Schedule";
import FolderIcon from "@material-ui/icons/Folder";
import PaymentIcon from "@material-ui/icons/Payment";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";

import {
    DashboardContext,
    LoadingContext
} from "../../../../../../context/context";

import SalesAndProftBarChart from "./dashboard_main_sub/SalesAndProftBarChart";
import SalesAndProfitPieChart from "./dashboard_main_sub/SalesAndProfitPieChart";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    box: {
        height: theme.spacing(12)
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

function Dashboard({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();

    useEffect(() => {
        setActiveTab("dashboard");
    }, [activeTabTrigger]);

    const [doctorTotal, setDoctorTotal] = useState("");
    const [patientTotal, setPatientTotal] = useState("");
    const [appointmentTotal, setAppointmentTotal] = useState("");
    const [prescriptionTotal, setPrescriptionTotal] = useState("");
    const [caseHistoryTotal, setCaseHistoryTotal] = useState("");
    const [documentTotal, setDocumentTotal] = useState("");
    const [invoiceTotal, setInvoiceTotal] = useState("");
    const [treatmentTotal, setTreatmentTotal] = useState("");

    const [
        currentYearPerMonthTotalSalesAndProfit,
        setCurrentYearPerMonthTotalSalesAndProfit
    ] = useState([]);
    const [totalSalesAndProfit, setTotalSalesAndProfit] = useState([]);

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
                doctor_total,
                patient_total,
                apppointment_total,
                prescription_total,
                caseHistory_total,
                document_total,
                invoice_total,
                treatment_total,
                sales_and_profit
            } = dashboard;
            if (isMounted.current) {
                setDoctorTotal(doctor_total);
                setPatientTotal(patient_total);
                setAppointmentTotal(apppointment_total);
                setPrescriptionTotal(prescription_total);
                setCaseHistoryTotal(caseHistory_total);
                setDocumentTotal(document_total);
                setInvoiceTotal(invoice_total);
                setTreatmentTotal(treatment_total);
                setCurrentYearPerMonthTotalSalesAndProfit(
                    sales_and_profit.current_year_per_month_total_sales_and_profit
                );
                setTotalSalesAndProfit([
                    {
                        name: "Sales",
                        value: parseFloat(sales_and_profit.total_sales)
                    },
                    {
                        name: "Profit",
                        value: parseFloat(sales_and_profit.total_profit)
                    }
                ]);

                setLoading(false);
            }
        }
    }, [dashboard]);

    return (
        <Box className={classes.root}>
            <Grid container justify="center" spacing={3}>
                <Grid item xs={12} md={4} lg={3}>
                    <BoxDashboard
                        bgColor="secondary.main"
                        icon={PersonIcon}
                        title="Total Doctor"
                        value={doctorTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                    <BoxDashboard
                        bgColor="primary.main"
                        icon={PersonIcon}
                        title="Total Patient"
                        value={patientTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                    <BoxDashboard
                        bgColor="success.main"
                        icon={ScheduleIcon}
                        title="Total Appointment"
                        value={appointmentTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                    <BoxDashboard
                        bgColor="primary.main"
                        icon={SupervisedUserCircleIcon}
                        title="Total Prescription"
                        value={prescriptionTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                    <BoxDashboard
                        bgColor="primary.main"
                        icon={WorkIcon}
                        title="Total Case History"
                        value={caseHistoryTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                    <BoxDashboard
                        bgColor="secondary.main"
                        icon={FolderIcon}
                        title="Total Document"
                        value={documentTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                    <BoxDashboard
                        bgColor="primary.main"
                        icon={PaymentIcon}
                        title="Total Invoice"
                        value={invoiceTotal}
                    />
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                    <BoxDashboard
                        bgColor="success.main"
                        icon={LocalHospitalIcon}
                        title="Total Treatment"
                        value={treatmentTotal}
                    />
                </Grid>
            </Grid>
            {/* <Box mt={1}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box bgcolor="background.paper">
                            <Box
                                p={0.5}
                                bgcolor="primary.main"
                                color="primary.contrastText"
                            >
                                <Typography variant="subtitle1" align="center">
                                    2020 Per Month Sales / Profit
                                </Typography>
                            </Box>
                            <Box p={1} className={classes.barGraph}>
                                <SalesAndProftBarChart
                                    data={
                                        currentYearPerMonthTotalSalesAndProfit
                                    }
                                />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box bgcolor="background.paper">
                            <Box
                                p={0.5}
                                bgcolor="primary.main"
                                color="primary.contrastText"
                            >
                                <Typography variant="subtitle1" align="center">
                                    Total Sales / Profit
                                </Typography>
                            </Box>
                            <Box p={1} className={classes.pieChart}>
                                <SalesAndProfitPieChart
                                    data={totalSalesAndProfit}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box> */}
        </Box>
    );
}

export default Dashboard;
