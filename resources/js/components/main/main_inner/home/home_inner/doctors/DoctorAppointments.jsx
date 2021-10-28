import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";

import { toast } from "react-toastify";

import { LoadingContext } from "../../../../../context/context";

import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
import ScheduleIcon from "@material-ui/icons/Schedule";
import DeleteIcon from "@material-ui/icons/Delete";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TableComplex from "../../../../../common/TableComplex";
import Dialog from "../../../../../common/Dialog";
import http from "../../../../../../services/http";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    titleLabel: {
        [theme.breakpoints.only("xs")]: {
            width: "100%",
            textAlign: "center",
            marginBottom: theme.spacing(3)
        }
    },
    userInfoWrapper: {
        [theme.breakpoints.only("xs")]: {
            flexDirection: "column",
            alignItems: "flex-start"
        }
    },
    textSeparator: {
        height: theme.spacing(2.5),
        [theme.breakpoints.only("xs")]: {
            display: "none"
        }
    },
    TimelineIcon: {
        marginLeft: theme.spacing(1),
        [theme.breakpoints.down("sm")]: {
            display: "none"
        }
    }
}));

const renderColumns = onClickDelete => [
    {
        title: "ID",
        field: "id"
    },
    {
        title: "Patient ID",
        field: "patient_id"
    },
    {
        title: "Patient Name",
        field: "patient_name"
    },
    {
        title: "Date & Time",
        field: "datetime"
    },
    {
        title: "Remarks",
        field: "remarks"
    },
    {
        title: "Status",
        field: "status"
    },
    {
        title: "Options",
        field: "options",
        sorting: false,
        render: ({ id }) => (
            <Tooltip title="Delete" placement="top">
                <IconButton
                    aria-label="delete"
                    color="secondary"
                    size="small"
                    onClick={() => {
                        onClickDelete(id);
                    }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        )
    }
];

const DoctorInformation = props => {
    const classes = useStyles();
    return (
        <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            className={classes.userInfoWrapper}
        >
            <Box
                ml={1}
                mr={1}
                borderLeft={2}
                borderColor="grey.500"
                className={classes.textSeparator}
            ></Box>
            <Typography variant="h6">{props.doctorID}</Typography>
            <Box
                ml={1}
                mr={1}
                borderLeft={2}
                borderColor="grey.500"
                className={classes.textSeparator}
            ></Box>
            <Typography variant="h6">{props.doctorName}</Typography>
        </Box>
    );
};

const apiDoctors = "/api/personnels/doctors";
const apiAppointments = "/api/appointments";

function DoctorAppointments({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();

    const [doctorID, setDoctorID] = useState("");
    const [doctorName, setDoctorName] = useState("");

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [path, setPath] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const { loading, setLoading } = useContext(LoadingContext);

    const [deleteAppointmentID, setDeleteAppointmentID] = useState(null);
    const [openModalWarning, setOpenModalWarning] = useState(false);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        setActiveTab(`doctorshistories`);
        getDoctorAppointmentsData();
    }, [activeTabTrigger]);

    const getDoctorAppointmentsData = async () => {
        try {
            setLoading(true);
            setData([]);
            setCurrentPage(1);
            setPath("");
            setPerPage(10);
            setTotal(0);

            const { data } = await http.get(
                `${apiDoctors}/${params.doctorID}/appointments`
            );
            setDoctorID(data.doctor_id);
            setDoctorName(data.doctor_name);
            setExtractData(data);
        } catch (ex) {
            toast.error("An unexpected error occured");
            console.log(ex);
        }
        if (isMounted.current) {
            setLoading(false);
        }
    };

    const extractData = ({ appointments }) => {
        return appointments;
    };

    const setExtractData = data => {
        const {
            data: requestedData,
            current_page,
            path,
            per_page,
            total
        } = extractData(data);
        if (isMounted.current) {
            setLoading(false);
            setData(requestedData);
            setCurrentPage(current_page);
            setPath(path);
            setPerPage(per_page);
            setTotal(total);
        }
    };

    const handleCloseModalWarning = () => {
        setOpenModalWarning(false);
        setDeleteAppointmentID(null);
    };

    const handleOnClickDeleteDoctorAppointment = id => {
        setOpenModalWarning(true);
        setDeleteAppointmentID(id);
    };

    const handleOnClickDeletedDoctorAppointment = async () => {
        try {
            setOpenModalWarning(false);
            setLoading(true);
            await http.delete(`${apiAppointments}/${deleteAppointmentID}`);
            if (isMounted.current) {
                setDeleteAppointmentID(null);
                setLoading(false);
                toast.success("Appointment deleted successfully");
                getDoctorAppointmentsData();
            }
        } catch (ex) {
            if (isMounted.current) {
                setLoading(false);
            }
            toast.error("An unexpected error occured");
            console.log(ex);
        }
    };

    return (
        <Box className={classes.root}>
            <Dialog
                open={openModalWarning}
                onClose={handleCloseModalWarning}
                title="Delete Appointment"
                description="Are you sure you want to delete this appointment?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedDoctorAppointment}
            />
            <Box mb={2}>
                <Hidden xsDown implementation="css">
                    {!loading && (
                        <TitleHeader
                            backButton={true}
                            titleIcon={ScheduleIcon}
                            renderTitle={props => (
                                <React.Fragment>
                                    <Typography
                                        variant="h6"
                                        className={classes.titleLabel}
                                    >
                                        Doctor Appointments
                                    </Typography>
                                    <DoctorInformation
                                        doctorID={doctorID}
                                        doctorName={doctorName}
                                    />
                                </React.Fragment>
                            )}
                        />
                    )}
                </Hidden>
                <Hidden smUp implementation="css">
                    {!loading && (
                        <React.Fragment>
                            <TitleHeader
                                backButton={true}
                                titleIcon={ScheduleIcon}
                                title="Doctor Appointments"
                                titleAlign="left"
                            />
                            <Box mt={2}>
                                <Paper>
                                    <Box p={1}>
                                        <DoctorInformation
                                            doctorID={doctorID}
                                            doctorName={doctorName}
                                        />
                                    </Box>
                                </Paper>
                            </Box>
                        </React.Fragment>
                    )}
                </Hidden>
            </Box>
            <TableComplex
                title="Doctor Appointments List"
                columns={renderColumns(handleOnClickDeleteDoctorAppointment)}
                setExtractData={extractData}
                loading={loading}
                currentPage={currentPage}
                path={path}
                perPage={perPage}
                data={data}
                total={total}
                orderBy="id"
                order="desc"
            />
        </Box>
    );
}

export default DoctorAppointments;
