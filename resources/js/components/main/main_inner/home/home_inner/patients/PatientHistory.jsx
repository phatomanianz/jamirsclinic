import React, { useState, useEffect, useContext, useRef } from "react";

import { Link, useParams, useHistory, useRouteMatch } from "react-router-dom";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import TimelineIcon from "@material-ui/icons/Timeline";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import ClearIcon from "@material-ui/icons/Clear";

import RenderByUserRole from "../../../../../common/RenderByUserRole";
import TableSimple from "../../../../../common/TableSimple";
import Dialog from "../../../../../common/Dialog";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import {
    LoadingContext,
    AuthUserContext
} from "../../../../../context/context";
import http from "../../../../../../services/http";
import file from "../../../../../../../images/file.png";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden",
        marginBottom: theme.spacing(5)
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
    },
    avatarContainer: {
        overflow: "hidden"
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
            width: theme.spacing(15),
            height: theme.spacing(15)
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
    cardActions: {
        display: "flex",
        justifyContent: "space-around"
    },
    cardMedia: {
        [theme.breakpoints.down("sm")]: {
            height: theme.spacing(18)
        },
        [theme.breakpoints.up("md")]: {
            height: theme.spacing(15)
        }
    },
    cardContent: {
        overflow: "auto",
        height: theme.spacing(10)
    }
}));

const renderCaseHistoriesColumns = (url, onClickDelete) => {
    return [
        { title: "Date", field: "date" },
        {
            title: "Description",
            field: "description"
        },
        {
            title: "Note",
            field: "note"
        },
        {
            title: "Options",
            field: "id",
            render: id => (
                <React.Fragment>
                    <Tooltip title="View" placement="top">
                        <IconButton
                            aria-label="View"
                            color="default"
                            size="small"
                            component={Link}
                            to={`${url}/casehistories/${id}/view`}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <RenderByUserRole
                        redirect={false}
                        notAllowedUser={["patient"]}
                    >
                        <Tooltip title="Edit" placement="top">
                            <IconButton
                                aria-label="Edit"
                                color="primary"
                                size="small"
                                component={Link}
                                to={`${url}/casehistories/${id}/edit`}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" placement="top">
                            <IconButton
                                aria-label="Delete"
                                color="secondary"
                                size="small"
                                onClick={() => {
                                    onClickDelete(id);
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </RenderByUserRole>
                </React.Fragment>
            )
        }
    ];
};

const renderPrescriptionsColumns = (url, onClickDelete) => {
    return [
        { title: "Date", field: "date" },
        {
            title: "Doctor",
            field: "doctor"
        },
        {
            title: "Medication",
            field: "medication"
        },
        {
            title: "Note",
            field: "note"
        },
        {
            title: "Options",
            field: "id",
            render: id => (
                <React.Fragment>
                    <Tooltip title="View" placement="top">
                        <IconButton
                            aria-label="View"
                            color="default"
                            size="small"
                            component={Link}
                            to={`${url}/prescriptions/${id}/view`}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <RenderByUserRole
                        redirect={false}
                        notAllowedUser={["receptionist", "patient"]}
                    >
                        <Tooltip title="Edit" placement="top">
                            <IconButton
                                aria-label="Edit"
                                color="primary"
                                size="small"
                                component={Link}
                                to={`${url}/prescriptions/${id}/edit`}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" placement="top">
                            <IconButton
                                aria-label="Delete"
                                color="secondary"
                                size="small"
                                onClick={() => {
                                    onClickDelete(id);
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </RenderByUserRole>
                </React.Fragment>
            )
        }
    ];
};

const renderAppointmentsColumns = (url, onClickDelete) => {
    return [
        {
            title: "Date & Time",
            field: "datetime"
        },
        {
            title: "Doctor ID",
            field: "doctor_id"
        },
        {
            title: "Doctor Name",
            field: "doctor_name"
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
            field: "id",
            render: id => (
                <React.Fragment>
                    <Tooltip title="Edit" placement="top">
                        <IconButton
                            aria-label="Edit"
                            color="primary"
                            size="small"
                            component={Link}
                            to={`${url}/appointments/${id}/edit`}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" placement="top">
                        <IconButton
                            aria-label="Delete"
                            color="secondary"
                            size="small"
                            onClick={() => {
                                onClickDelete(id);
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </React.Fragment>
            )
        }
    ];
};

const isImage = url => {
    let result = true;
    let extension = url.substr(url.lastIndexOf(".") + 1);
    if (extension !== "jpg" && extension !== "jpeg" && extension !== "png") {
        result = false;
    }

    return result;
};

const Documents = props => {
    const classes = useStyles();

    return props.documents.length < 1 ? (
        <Grid item xs={12}>
            <Paper>
                <Box p={1}>
                    <Typography variant="body2" align="center">
                        {props.emptyDataRowsMessage
                            ? props.emptyDataRowsMessage
                            : "No records to display"}
                    </Typography>
                </Box>
            </Paper>
        </Grid>
    ) : (
        <React.Fragment>
            {props.documents.map((document, index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Card>
                        <CardHeader
                            action={
                                <RenderByUserRole
                                    redirect={false}
                                    notAllowedUser={["patient"]}
                                >
                                    <Tooltip title="Delete" placement="top">
                                        <IconButton
                                            color="secondary"
                                            aria-label="delete"
                                            size="small"
                                            onClick={() => {
                                                props.onClickDelete(
                                                    document.id
                                                );
                                            }}
                                        >
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </RenderByUserRole>
                            }
                            disableTypography
                            title={
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    {document.date}
                                </Typography>
                            }
                        />
                        <CardMedia
                            className={classes.cardMedia}
                            image={
                                isImage(document.file) ? document.file : file
                            }
                            title="Document"
                        />
                        <CardContent className={classes.cardContent}>
                            <Typography variant="body2" color="textSecondary">
                                {document.description}
                            </Typography>
                        </CardContent>
                        <CardActions className={classes.cardActions}>
                            <Tooltip title="View" placement="top">
                                <a href={document.file} target="_blank">
                                    <IconButton
                                        color="default"
                                        aria-label="download"
                                        size="small"
                                    >
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </a>
                            </Tooltip>
                            <Tooltip title="Download" placement="top">
                                <a href={document.file} download>
                                    <IconButton
                                        color="primary"
                                        aria-label="download"
                                        size="small"
                                    >
                                        <CloudDownloadIcon fontSize="small" />
                                    </IconButton>
                                </a>
                            </Tooltip>
                            <RenderByUserRole
                                redirect={false}
                                notAllowedUser={["patient"]}
                            >
                                <Tooltip title="Edit" placement="top">
                                    <IconButton
                                        color="primary"
                                        aria-label="edit"
                                        size="small"
                                        component={Link}
                                        to={`${props.url}/documents/${document.id}/edit`}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </RenderByUserRole>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </React.Fragment>
    );
};

const UserInformation = props => {
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
            <Typography variant="h6">{props.patientId}</Typography>
            <Box
                ml={1}
                mr={1}
                borderLeft={2}
                borderColor="grey.500"
                className={classes.textSeparator}
            ></Box>
            <Typography variant="h6">{props.patientName}</Typography>
            <Box
                ml={1}
                mr={1}
                borderLeft={2}
                borderColor="grey.500"
                className={classes.textSeparator}
            ></Box>
            <Typography variant="h6">{props.patientPhone}</Typography>
        </Box>
    );
};

const apiPatients = "api/patients";
const apiCaseHistories = "api/casehistories";
const apiPrescriptions = "api/prescriptions";
const apiDocuments = "api/documents";
const apiAppointments = "api/appointments";

function PatientHistory({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();

    const match = useRouteMatch();
    const params = useParams();
    const history = useHistory();

    const { authUser } = useContext(AuthUserContext);

    useEffect(() => {
        if (authUser && authUser.role === "patient") {
            setActiveTab("role_patients_history");
        } else {
            setActiveTab("patientlist");
        }
    }, [activeTabTrigger]);

    const [patientId, setPatientId] = useState("");
    const [patientName, setPatientName] = useState("");
    const [patientPhone, setPatientPhone] = useState("");
    const [caseHistories, setCaseHistories] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const { loading, setLoading } = useContext(LoadingContext);

    /* Case History */
    const [deleteCaseHistoryId, setDeleteCaseHistoryId] = useState(null);
    const [
        openModalWarningCaseHistory,
        setOpenModalWarningCaseHistory
    ] = useState(false);

    /* Prescription */
    const [deletePrescriptionID, setDeletePrescriptionID] = useState(null);
    const [
        openModalWarningPrescription,
        setOpenModalWarningPrescription
    ] = useState(false);

    /* Document */
    const [deleteDocumentID, setDeleteDocumentID] = useState(null);
    const [openModalWarningDocument, setOpenModalWarningDocument] = useState(
        false
    );

    /* Appointments */
    const [deleteAppointmentID, setDeleteAppointmentID] = useState(null);
    const [
        openModalWarningAppointment,
        setOpenModalWarningAppointment
    ] = useState(false);

    useEffect(() => {
        setLoading(false);
        getPatientData();

        return () => {
            isMounted.current = false;
        };
    }, []);

    const getPatientData = async () => {
        try {
            setLoading(true);
            const { data } = await http.get(
                `${apiPatients}/${params.patientID}`
            );
            const {
                id: patientViewId,
                name,
                phone,
                case_histories,
                prescriptions: prescriptionData,
                documents: documentsData,
                appointments: appointmentsData
            } = data.patient;
            if (isMounted.current) {
                setPatientId(patientViewId);
                setPatientName(name);
                setPatientPhone(phone);
                setCaseHistories(case_histories);
                setPrescriptions(prescriptionData);
                setDocuments(documentsData);
                setAppointments(appointmentsData);
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
    };

    const getPatientCaseHistories = async () => {
        try {
            setLoading(true);
            setCaseHistories([]);
            const { data } = await http.get(
                `${apiPatients}/${params.patientID}/histories/show`
            );
            const { case_histories } = data.patient;
            if (isMounted.current) {
                setCaseHistories(case_histories);
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
    };

    const getPatientPrescriptions = async () => {
        try {
            setLoading(true);
            setPrescriptions([]);
            const { data } = await http.get(
                `${apiPatients}/${params.patientID}/prescriptions/show`
            );
            const { prescriptions } = data.patient;
            if (isMounted.current) {
                setPrescriptions(prescriptions);
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
    };

    const getPatientDocuments = async () => {
        try {
            setLoading(true);
            setDocuments([]);
            const { data } = await http.get(
                `${apiPatients}/${params.patientID}/documents/show`
            );
            const { documents } = data.patient;
            if (isMounted.current) {
                setDocuments(documents);
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
    };

    const getPatientAppointments = async () => {
        try {
            setLoading(true);
            setAppointments([]);
            const { data } = await http.get(
                `${apiPatients}/${params.patientID}/appointments/show`
            );
            const { appointments } = data.patient;
            if (isMounted.current) {
                setAppointments(appointments);
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
    };

    /* Case History */
    const handleCloseModalWarningCaseHistory = () => {
        setOpenModalWarningCaseHistory(false);
        setDeleteCaseHistoryId(null);
    };

    const handleOnClickDeleteCaseHistory = id => {
        setOpenModalWarningCaseHistory(true);
        setDeleteCaseHistoryId(id);
    };

    const handleOnClickDeletedCaseHistory = async () => {
        try {
            setOpenModalWarningCaseHistory(false);
            setLoading(true);
            await http.delete(`${apiCaseHistories}/${deleteCaseHistoryId}`);
            if (isMounted.current) {
                setDeleteCaseHistoryId(null);
                setLoading(false);
                toast.success("Case history deleted successfully");
                getPatientCaseHistories();
            }
        } catch (ex) {
            if (isMounted.current) {
                setLoading(false);
            }
            toast.error("An unexpected error occured");
            console.log(ex);
        }
    };

    /* Prescription */
    const handleCloseModalWarningPrescription = () => {
        setOpenModalWarningPrescription(false);
        setDeletePrescriptionID(null);
    };

    const handleOnClickDeletePrescription = id => {
        setOpenModalWarningPrescription(true);
        setDeletePrescriptionID(id);
    };

    const handleOnClickDeletedPrescription = async () => {
        try {
            setOpenModalWarningPrescription(false);
            setLoading(true);
            await http.delete(`${apiPrescriptions}/${deletePrescriptionID}`);
            if (isMounted.current) {
                setDeletePrescriptionID(null);
                setLoading(false);
                toast.success("Prescription deleted successfully");
                getPatientPrescriptions();
            }
        } catch (ex) {
            if (isMounted.current) {
                setLoading(false);
            }
            toast.error("An unexpected error occured");
            console.log(ex);
        }
    };

    /* Document */
    const handleCloseModalWarningDocument = () => {
        setOpenModalWarningDocument(false);
        setDeleteDocumentID(null);
    };

    const handleOnClickDeleteDocument = id => {
        setOpenModalWarningDocument(true);
        setDeleteDocumentID(id);
    };

    const handleOnClickDeletedDocument = async () => {
        try {
            setOpenModalWarningDocument(false);
            setLoading(true);
            await http.delete(`${apiDocuments}/${deleteDocumentID}`);
            if (isMounted.current) {
                setDeleteDocumentID(null);
                setLoading(false);
                toast.success("Document deleted successfully");
                getPatientDocuments();
            }
        } catch (ex) {
            if (isMounted.current) {
                setLoading(false);
            }
            toast.error("An unexpected error occured");
            console.log(ex);
        }
    };

    /* Appointments */
    const handleCloseModalWarningAppointment = () => {
        setOpenModalWarningAppointment(false);
        setDeleteAppointmentID(null);
    };

    const handleOnClickDeleteAppointment = id => {
        setOpenModalWarningAppointment(true);
        setDeleteAppointmentID(id);
    };

    const handleOnClickDeletedAppointment = async () => {
        try {
            setOpenModalWarningAppointment(false);
            setLoading(true);
            await http.delete(`${apiAppointments}/${deleteAppointmentID}`);
            if (isMounted.current) {
                setDeleteAppointmentID(null);
                setLoading(false);
                toast.success("Appointment deleted successfully");
                getPatientAppointments();
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
        <React.Fragment>
            {/* Case History */}
            <Dialog
                open={openModalWarningCaseHistory}
                onClose={handleCloseModalWarningCaseHistory}
                title="Delete Case History"
                description="Are you sure you want to delete this case history?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedCaseHistory}
            />
            {/* Prescription */}
            <Dialog
                open={openModalWarningPrescription}
                onClose={handleCloseModalWarningPrescription}
                title="Delete Case History"
                description="Are you sure you want to delete this prescription?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedPrescription}
            />
            {/* Document */}
            <Dialog
                open={openModalWarningDocument}
                onClose={handleCloseModalWarningDocument}
                title="Delete Document"
                description="Are you sure you want to delete this document?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedDocument}
            />
            {/* Appointment */}
            <Dialog
                open={openModalWarningAppointment}
                onClose={handleCloseModalWarningAppointment}
                title="Delete Appointment"
                description="Are you sure you want to delete this appointment?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedAppointment}
            />
            <Grid
                container
                justify="center"
                alignItems="center"
                className={classes.root}
            >
                <Grid item xs={12}>
                    <Box mb={2}>
                        <Hidden xsDown implementation="css">
                            {!loading && (
                                <TitleHeader
                                    backButton={true}
                                    titleIcon={TimelineIcon}
                                    renderTitle={props => (
                                        <React.Fragment>
                                            <Typography
                                                variant="h6"
                                                className={classes.titleLabel}
                                            >
                                                Medical History
                                            </Typography>
                                            <UserInformation
                                                patientId={patientId}
                                                patientName={patientName}
                                                patientPhone={patientPhone}
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
                                        titleIcon={TimelineIcon}
                                        title="Medical History"
                                        titleAlign="left"
                                    />
                                    <Box mt={2}>
                                        <Paper>
                                            <Box p={1}>
                                                <UserInformation
                                                    patientId={patientId}
                                                    patientName={patientName}
                                                    patientPhone={patientPhone}
                                                />
                                            </Box>
                                        </Paper>
                                    </Box>
                                </React.Fragment>
                            )}
                        </Hidden>
                    </Box>
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <RenderByUserRole
                                redirect={false}
                                notAllowedUser={["patient"]}
                            >
                                <Box mb={2}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={<AddCircleIcon />}
                                        component={Link}
                                        to={`${match.url}/casehistories/add`}
                                    >
                                        Add New
                                    </Button>
                                </Box>
                            </RenderByUserRole>
                            <Paper>
                                <Box p={1}>
                                    <Typography variant="h6">
                                        Case History
                                    </Typography>
                                </Box>
                            </Paper>
                            <Box mt={2}>
                                {/* Case History */}
                                <TableSimple
                                    tableContainer={{
                                        component: Paper
                                    }}
                                    table={{ size: "small" }}
                                    tableBodyRow={{ hover: true }}
                                    columns={renderCaseHistoriesColumns(
                                        match.url,
                                        handleOnClickDeleteCaseHistory
                                    )}
                                    rows={caseHistories}
                                    emptyDataRowsMessage={
                                        loading
                                            ? "Loading..."
                                            : "No records to display"
                                    }
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <RenderByUserRole
                                redirect={false}
                                notAllowedUser={["receptionist", "patient"]}
                            >
                                <Box mb={2}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={<AddCircleIcon />}
                                        component={Link}
                                        to={`${match.url}/prescriptions/add`}
                                    >
                                        Add New
                                    </Button>
                                </Box>
                            </RenderByUserRole>
                            <Paper>
                                <Box p={1}>
                                    <Typography variant="h6">
                                        Prescriptions
                                    </Typography>
                                </Box>
                            </Paper>
                            <Box mt={2}>
                                {/* Prescriptions */}
                                <TableSimple
                                    tableContainer={{
                                        component: Paper
                                    }}
                                    table={{ size: "small" }}
                                    tableBodyRow={{ hover: true }}
                                    columns={renderPrescriptionsColumns(
                                        match.url,
                                        handleOnClickDeletePrescription
                                    )}
                                    rows={prescriptions}
                                    emptyDataRowsMessage={
                                        loading
                                            ? "Loading..."
                                            : "No records to display"
                                    }
                                />
                            </Box>
                        </Grid>
                        <RenderByUserRole
                            redirect={false}
                            notAllowedUser={["patient"]}
                        >
                            <Grid item xs={12}>
                                <Box mb={2}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={<AddCircleIcon />}
                                        component={Link}
                                        to={`${match.url}/appointments/add`}
                                    >
                                        Add New
                                    </Button>
                                </Box>
                                <Paper>
                                    <Box p={1}>
                                        <Typography variant="h6">
                                            Appointments
                                        </Typography>
                                    </Box>
                                </Paper>
                                <Box mt={2}>
                                    {/* Appointments */}
                                    <TableSimple
                                        tableContainer={{
                                            component: Paper
                                        }}
                                        table={{ size: "small" }}
                                        tableBodyRow={{ hover: true }}
                                        columns={renderAppointmentsColumns(
                                            match.url,
                                            handleOnClickDeleteAppointment
                                        )}
                                        rows={appointments}
                                        emptyDataRowsMessage={
                                            loading
                                                ? "Loading..."
                                                : "No records to display"
                                        }
                                    />
                                </Box>
                            </Grid>
                        </RenderByUserRole>
                        <Grid item xs={12}>
                            <RenderByUserRole
                                redirect={false}
                                notAllowedUser={["patient"]}
                            >
                                <Box mb={2}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={<AddCircleIcon />}
                                        component={Link}
                                        to={`${match.url}/documents/add`}
                                    >
                                        Add New
                                    </Button>
                                </Box>
                            </RenderByUserRole>
                            <Paper>
                                <Box p={1}>
                                    <Typography variant="h6">
                                        Documents
                                    </Typography>
                                </Box>
                            </Paper>
                            <Box mt={2}>
                                <Grid container spacing={2}>
                                    {/* Document */}
                                    <Documents
                                        documents={documents}
                                        url={match.url}
                                        emptyDataRowsMessage={
                                            loading
                                                ? "Loading..."
                                                : "No records to display"
                                        }
                                        onClickDelete={
                                            handleOnClickDeleteDocument
                                        }
                                    />
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default PatientHistory;
