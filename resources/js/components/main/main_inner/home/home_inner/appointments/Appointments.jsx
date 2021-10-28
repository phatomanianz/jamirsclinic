import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useParams, useRouteMatch, useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import {
    LoadingContext,
    AuthUserContext
} from "../../../../../context/context";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import Tooltip from "@material-ui/core/Tooltip";
import ScheduleIcon from "@material-ui/icons/Schedule";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TableComplex from "../../../../../common/TableComplex";
import Dialog from "../../../../../common/Dialog";
import http from "../../../../../../services/http";
import utils from "../../../../../../utilities/utils";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        width: "100%"
    }
}));

const renderColumns = (url, onClickDelete, userRole) => {
    return userRole === "patient"
        ? [
              {
                  title: "ID",
                  field: "id"
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
              }
          ]
        : [
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
                  title: "Doctor ID",
                  field: "doctor_id"
              },
              {
                  title: "Doctor Name",
                  field: "doctor_name"
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
                      <React.Fragment>
                          <Tooltip title="Edit" placement="top">
                              <IconButton
                                  aria-label="Edit"
                                  color="primary"
                                  size="small"
                                  component={Link}
                                  to={`${url}/${id}/edit`}
                              >
                                  <EditIcon fontSize="small" />
                              </IconButton>
                          </Tooltip>
                          &nbsp;&nbsp;
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
                      </React.Fragment>
                  )
              }
          ];
};

const apiAppointments = "/api/appointments";

function Appointments({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const match = useRouteMatch();
    const history = useHistory();
    const upperCaseType = utils.upperCaseFirstLetter(params.type);

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [path, setPath] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const [customQuery, setCustomQuery] = useState(null);
    const { loading, setLoading } = useContext(LoadingContext);

    const [deleteAppointmentID, setDeleteAppointmentID] = useState(null);
    const [openModalWarning, setOpenModalWarning] = useState(false);

    const [tabValue, setTabValue] = useState(0);
    const [tabValueText, setTabValueText] = useState("All");

    const { authUser } = useContext(AuthUserContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        if (
            !utils.isValidParameter(
                ["all", "today", "upcoming", "calendar"],
                params.type
            )
        ) {
            history.push("/home/404");
        } else {
            setActiveTab(`appointments${params.type}`);
            getAppointmentsData();
        }
    }, [activeTabTrigger]);

    async function getAppointmentsData(status = "") {
        try {
            setLoading(true);
            setData([]);
            setCurrentPage(1);
            setPath("");
            setPerPage(10);
            setTotal(0);

            let queryRequest = "";
            switch (params.type) {
                case "today":
                    queryRequest = "filtered_by_date=today";
                    break;
                case "upcoming":
                    queryRequest = "filtered_by_date=upcoming";
                    break;
                default:
                // Do nothing
            }

            if (status) {
                queryRequest += queryRequest
                    ? `&filtered_by_status=${status}`
                    : `filtered_by_status=${status}`;
            }

            setCustomQuery(queryRequest ? queryRequest : null);

            const { data } = await http.get(
                `${apiAppointments}?${queryRequest}`
            );
            setExtractData(data);
        } catch (ex) {
            console.log(ex);
            toast.error("An unexpected error occured.");
        }
        setLoading(false);
    }

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

    const handleOnClickDeleteAppointment = id => {
        setOpenModalWarning(true);
        setDeleteAppointmentID(id);
    };

    const handleOnClickDeletedAppointment = async () => {
        try {
            setOpenModalWarning(false);
            setLoading(true);
            await http.delete(`${apiAppointments}/${deleteAppointmentID}`);
            if (isMounted.current) {
                setDeleteAppointmentID(null);
                setLoading(false);
                toast.success("Appointmnt deleted successfully");
                getAppointmentsData();
            }
        } catch (ex) {
            if (isMounted.current) {
                setLoading(false);
                toast.error("An unexpected error occured");
                console.log(ex);
            }
        }
    };

    const handleChangeTab = (event, newTabValue) => {
        setTabValue(newTabValue);
        switch (newTabValue) {
            case 1:
                getAppointmentsData("requested");
                setTabValueText("Requested");
                break;
            case 2:
                getAppointmentsData("pending confirmation");
                setTabValueText("Pending Confirmation");
                break;
            case 3:
                getAppointmentsData("confirmed");
                setTabValueText("Confirmed");
                break;
            case 4:
                getAppointmentsData("completed");
                setTabValueText("Completed");
                break;
            case 5:
                getAppointmentsData("cancelled");
                setTabValueText("Cancelled");
                break;
            case 6:
                getAppointmentsData("no show");
                setTabValueText("No Show");
                break;
            default:
                getAppointmentsData();
                setTabValueText("All");
        }
    };

    return (
        <Box className={classes.root}>
            <Dialog
                open={openModalWarning}
                onClose={handleCloseModalWarning}
                title="Delete User"
                description="Are you sure you want to delete this appointment?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedAppointment}
            />
            <Box mb={2}>
                <TitleHeader
                    backButton={false}
                    titleIcon={ScheduleIcon}
                    title={`${params.type !== "all" ? `${upperCaseType} ` : ""}
                    Appointments`}
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
            {params.type !== "all" ? (
                <TableComplex
                    title={`${upperCaseType} Appointments List`}
                    columns={renderColumns(
                        match.url,
                        handleOnClickDeleteAppointment,
                        authUser.role
                    )}
                    setExtractData={extractData}
                    customQuery={customQuery}
                    loading={loading}
                    currentPage={currentPage}
                    path={path}
                    perPage={perPage}
                    data={data}
                    total={total}
                    orderBy="datetime"
                    order="desc"
                />
            ) : (
                <Paper square>
                    <Paper>
                        <Tabs
                            value={tabValue}
                            onChange={handleChangeTab}
                            variant="scrollable"
                            scrollButtons="on"
                            indicatorColor="primary"
                            textColor="primary"
                            aria-label="appointments"
                        >
                            <Tab label="All" id="all" aria-controls="all" />
                            <Tab label="Requested" aria-controls="Requested" />
                            <Tab
                                label="Pending Confirmation"
                                aria-controls="Pending Confirmation"
                            />
                            <Tab label="Confirmed" aria-controls="Confirmed" />
                            <Tab label="Completed" aria-controls="Completed" />
                            <Tab label="Cancelled" aria-controls="Cancelled" />
                            <Tab label="No Show" aria-controls="No Show" />
                        </Tabs>
                    </Paper>
                    <TableComplex
                        title={`${tabValueText} Appointments List`}
                        columns={renderColumns(
                            match.url,
                            handleOnClickDeleteAppointment,
                            authUser.role
                        )}
                        setExtractData={extractData}
                        customQuery={customQuery}
                        loading={loading}
                        currentPage={currentPage}
                        path={path}
                        perPage={perPage}
                        data={data}
                        total={total}
                        orderBy="datetime"
                        order="desc"
                    />
                </Paper>
            )}
        </Box>
    );
}

export default Appointments;
