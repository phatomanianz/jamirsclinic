import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useRouteMatch } from "react-router-dom";

import { toast } from "react-toastify";

import {
    LoadingContext,
    AuthUserContext
} from "../../../../../context/context";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import WorkIcon from "@material-ui/icons/Work";
import VisibilityIcon from "@material-ui/icons/Visibility";

import RenderByUserRole from "../../../../../common/RenderByUserRole";
import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TableComplex from "../../../../../common/TableComplex";
import Dialog from "../../../../../common/Dialog";
import http from "../../../../../../services/http";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    }
}));

const Options = props => (
    <React.Fragment>
        <Tooltip title="View" placement="top">
            <IconButton
                aria-label="View"
                color="default"
                size="small"
                component={Link}
                to={`${props.url}/${props.id}/view`}
            >
                <VisibilityIcon fontSize="small" />
            </IconButton>
        </Tooltip>
        <RenderByUserRole redirect={false} notAllowedUser={["receptionist"]}>
            &nbsp;&nbsp;
            <Tooltip title="Edit" placement="top">
                <IconButton
                    aria-label="Edit"
                    color="primary"
                    size="small"
                    component={Link}
                    to={`${props.url}/${props.id}/edit`}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            &nbsp;&nbsp;
            <Tooltip title="Delete" placement="top">
                <IconButton
                    aria-label="Delete"
                    color="secondary"
                    size="small"
                    onClick={() => {
                        props.onClickDelete(props.id);
                    }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </RenderByUserRole>
    </React.Fragment>
);

const renderColumns = (url, onClickDelete, userRole) => {
    return userRole === "doctor"
        ? [
              {
                  title: "Date",
                  field: "date"
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
                  title: "Medication",
                  field: "medication"
              },
              {
                  title: "Note",
                  field: "note"
              },
              {
                  title: "Options",
                  field: "options",
                  sorting: false,
                  render: ({ id }) => <Options url={url} id={id} onClickDelete={onClickDelete} />
              }
          ]
        : [
              {
                  title: "Date",
                  field: "date"
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
                  title: "Medication",
                  field: "medication"
              },
              {
                  title: "Note",
                  field: "note"
              },
              {
                  title: "Options",
                  field: "options",
                  sorting: false,
                  render: ({ id }) => <Options url={url} id={id} onClickDelete={onClickDelete} />
              }
          ];
};

const apiDoctors = "/api/personnels/doctors";
const apiPrescriptions = "/api/prescriptions";

function Prescriptions({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const match = useRouteMatch();

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [path, setPath] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const { loading, setLoading } = useContext(LoadingContext);

    const [deletePrescriptionID, setDeletePrescriptionID] = useState(null);
    const [openModalWarning, setOpenModalWarning] = useState(false);

    const { authUser } = useContext(AuthUserContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        setActiveTab(`prescriptionlist`);
        getPrescriptionsData();
    }, [activeTabTrigger]);

    const getPrescriptionsData = async () => {
        try {
            setLoading(true);
            setData([]);
            setCurrentPage(1);
            setPath("");
            setPerPage(10);
            setTotal(0);

            const { data } = await http.get(
                authUser.role === "doctor"
                    ? `${apiDoctors}/${authUser.id}/prescriptions`
                    : apiPrescriptions
            );
            setExtractData(data);
        } catch (ex) {
            toast.error("An unexpected error occured");
            console.log(ex);
        }
        if (isMounted.current) {
            setLoading(false);
        }
    };

    const extractData = ({ prescriptions }) => {
        return prescriptions;
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
        setDeletePrescriptionID(null);
    };

    const handleOnClickDeletePrescription = id => {
        setOpenModalWarning(true);
        setDeletePrescriptionID(id);
    };

    const handleOnClickDeletedPrescription = async () => {
        try {
            setOpenModalWarning(false);
            setLoading(true);
            await http.delete(`${apiPrescriptions}/${deletePrescriptionID}`);
            if (isMounted.current) {
                setDeletePrescriptionID(null);
                setLoading(false);
                toast.success("Prescription deleted successfully");
                getPrescriptionsData();
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
                title="Delete Prescription"
                description="Are you sure you want to delete this prescription?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedPrescription}
            />
            <Box mb={2}>
                <TitleHeader
                    backButton={false}
                    titleIcon={WorkIcon}
                    title="Prescriptions"
                />
            </Box>
            <RenderByUserRole
                redirect={false}
                notAllowedUser={["receptionist"]}
            >
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
            </RenderByUserRole>
            <TableComplex
                title="Prescriptions List"
                columns={renderColumns(
                    match.url,
                    handleOnClickDeletePrescription,
                    authUser.role
                )}
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

export default Prescriptions;
