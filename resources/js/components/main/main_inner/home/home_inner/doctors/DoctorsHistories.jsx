import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useRouteMatch } from "react-router-dom";

import { toast } from "react-toastify";

import { LoadingContext } from "../../../../../context/context";

import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import ScheduleIcon from "@material-ui/icons/Schedule";
import PersonIcon from "@material-ui/icons/Person";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TableComplex from "../../../../../common/TableComplex";
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
        [theme.breakpoints.up("xs")]: {
            margin: theme.spacing(0.4)
        }
    }
}));

const Options = ({ url, id }) => {
    const classes = useStyles();
    const isMobileScreen = useMediaQuery(theme => theme.breakpoints.down("xs"));

    return (
        <Box className={classes.noWrap}>
            <Box color="info.main" component="span">
                <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    className={classes.buttonSpacing}
                    {...(isMobileScreen ? {} : { startIcon: <ScheduleIcon /> })}
                    component={Link}
                    to={`${url}/${id}/appointments`}
                >
                    Appointments
                </Button>
            </Box>
            <Box color="success.main" component="span">
                <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    className={classes.buttonSpacing}
                    {...(isMobileScreen
                        ? {}
                        : { startIcon: <SupervisedUserCircleIcon /> })}
                    component={Link}
                    to={`${url}/${id}/prescriptions`}
                >
                    Prescriptions
                </Button>
            </Box>
        </Box>
    );
};

const renderColumns = url => [
    {
        title: "Doctor ID",
        field: "doctor_id"
    },
    {
        title: "Doctor Name",
        field: "doctor_name"
    },
    {
        title: "Number of Appointments Completed",
        field: "number_of_appointments_completed"
    },
    {
        title: "Number of Prescriptions",
        field: "number_of_prescriptions"
    },
    {
        title: "Options",
        field: "options",
        sorting: false,
        render: ({ doctor_id }) => <Options id={doctor_id} url={url} />
    }
];

const apiDoctors = "/api/personnels/doctors";

function DoctorsHistories({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const match = useRouteMatch();

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [path, setPath] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const { loading, setLoading } = useContext(LoadingContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        setActiveTab(`doctorshistories`);
    }, [activeTabTrigger]);

    useEffect(() => {
        const getDoctorsHistoriesData = async () => {
            try {
                setLoading(true);
                setData([]);
                setCurrentPage(1);
                setPath("");
                setPerPage(10);
                setTotal(0);

                const { data } = await http.get(apiDoctors);
                setExtractData(data);
            } catch (ex) {
                toast.error("An unexpected error occured");
                console.log(ex);
            }
            if (isMounted.current) {
                setLoading(false);
            }
        };
        getDoctorsHistoriesData();
    }, []);

    const extractData = ({ doctors }) => {
        return doctors;
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

    return (
        <Box className={classes.root}>
            <Box mb={2}>
                <TitleHeader
                    backButton={false}
                    titleIcon={PersonIcon}
                    title="Doctors Histories"
                />
            </Box>
            <TableComplex
                title="Doctors Histories List"
                columns={renderColumns(match.url)}
                setExtractData={extractData}
                loading={loading}
                currentPage={currentPage}
                path={path}
                perPage={perPage}
                data={data}
                total={total}
                orderBy="doctor_id"
                order="desc"
            />
        </Box>
    );
}

export default DoctorsHistories;
