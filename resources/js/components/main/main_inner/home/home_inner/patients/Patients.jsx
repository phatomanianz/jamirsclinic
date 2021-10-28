import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useRouteMatch } from "react-router-dom";

import { toast } from "react-toastify";

import { LoadingContext } from "../../../../../context/context";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import PersonIcon from "@material-ui/icons/Person";
import TimelineIcon from "@material-ui/icons/Timeline";
import PaymentIcon from "@material-ui/icons/Payment";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";

import RenderByUserRole from "../../../../../common/RenderByUserRole";
import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TableComplex from "../../../../../common/TableComplex";
import Dialog from "../../../../../common/Dialog";
import http from "../../../../../../services/http";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    noWrap: {
        [theme.breakpoints.up("sm")]: {
            whiteSpace: "nowrap"
        }
    },
    buttonSpacing: {
        [theme.breakpoints.down("xs")]: {
            margin: theme.spacing(0.4)
        },
        [theme.breakpoints.up("sm")]: {
            marginRight: theme.spacing(0.4)
        }
    }
}));

const Options = ({ url, id, onClickDelete }) => {
    const classes = useStyles();

    return (
        <Box className={classes.noWrap}>
            <Box color="primary.main" component="span">
                <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    className={classes.buttonSpacing}
                    startIcon={<EditIcon />}
                    component={Link}
                    to={`${url}/${id}/edit`}
                >
                    Edit
                </Button>
            </Box>
            <Box color="info.main" component="span">
                <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    className={classes.buttonSpacing}
                    startIcon={<PermIdentityIcon />}
                    component={Link}
                    to={`${url}/${id}/view`}
                >
                    Info
                </Button>
            </Box>
            <Box color="success.main" component="span">
                <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    className={classes.buttonSpacing}
                    startIcon={<TimelineIcon />}
                    component={Link}
                    to={`${url}/${id}/history`}
                >
                    History
                </Button>
            </Box>
            <Box color="text.primary" component="span">
                <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    className={classes.buttonSpacing}
                    startIcon={<PaymentIcon />}
                    component={Link}
                    to={`${url}/${id}/payments`}
                >
                    Payment
                </Button>
            </Box>
            <RenderByUserRole
                redirect={false}
                notAllowedUser={["doctor", "receptionist"]}
            >
                <Box color="secondary.main" component="span">
                    <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        className={classes.buttonSpacing}
                        startIcon={<DeleteIcon />}
                        onClick={() => onClickDelete(id)}
                    >
                        Delete
                    </Button>
                </Box>
            </RenderByUserRole>
        </Box>
    );
};

const renderColumns = (url, onClickDelete) => [
    {
        title: "ID",
        field: "id"
    },
    {
        title: "Name",
        field: "name"
    },
    {
        title: "Phone",
        field: "phone"
    },
    {
        title: "Due Balance",
        field: "due"
    },
    {
        title: "Options",
        field: "options",
        sorting: false,
        render: ({ id }) => (
            <Options id={id} url={url} onClickDelete={onClickDelete} />
        )
    }
];

const apiPatients = "/api/patients";

function Patients({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const match = useRouteMatch();

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [path, setPath] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const { loading, setLoading } = useContext(LoadingContext);

    const [deletePatientId, setDeletePatientId] = useState(null);
    const [openModalWarning, setOpenModalWarning] = useState(false);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        setActiveTab(`patientlist`);
        getPatientsData();
    }, [activeTabTrigger]);

    const getPatientsData = async () => {
        try {
            setLoading(true);
            setData([]);
            setCurrentPage(1);
            setPath("");
            setPerPage(10);
            setTotal(0);

            const { data } = await http.get(apiPatients);
            setExtractData(data);
        } catch (ex) {
            toast.error("An unexpected error occured");
            console.log(ex);
        }
        if (isMounted.current) {
            setLoading(false);
        }
    };

    const extractData = ({ patients }) => {
        return patients;
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
        setDeletePatientId(null);
    };

    const handleOnClickDeletePatient = id => {
        setOpenModalWarning(true);
        setDeletePatientId(id);
    };

    const handleOnClickDeletedPatient = async () => {
        try {
            setOpenModalWarning(false);
            setLoading(true);
            await http.delete(`${apiPatients}/${deletePatientId}`);
            if (isMounted.current) {
                setDeletePatientId(null);
                setLoading(false);
                toast.success("Patient deleted successfully");
                getPatientsData();
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
                title="Delete Patient"
                description="Are you sure you want to delete this patient?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedPatient}
            />
            <Box mb={2}>
                <TitleHeader
                    backButton={false}
                    titleIcon={PersonIcon}
                    title="Patients"
                />
            </Box>
            <Box mb={2}>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    component={Link}
                    to={`${match.url}/add`}
                    startIcon={<AddCircleIcon />}
                >
                    Add New
                </Button>
            </Box>
            <TableComplex
                title="Patient List"
                columns={renderColumns(match.url, handleOnClickDeletePatient)}
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

export default Patients;
