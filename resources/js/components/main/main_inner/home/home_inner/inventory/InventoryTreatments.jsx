import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useRouteMatch } from "react-router-dom";

import { toast } from "react-toastify";

import {
    LoadingContext,
    AuthUserContext
} from "../../../../../context/context";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";

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
        whiteSpace: "nowrap"
    },
    buttonSpacing: {
        marginRight: theme.spacing(0.4)
    }
}));

const Options = ({ url, id, onClickDelete }) => {
    return (
        <React.Fragment>
            <Tooltip title="Edit" placement="top">
                <IconButton
                    aria-label="delete"
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
    );
};

const renderColumns = (url, onClickDelete, userRole) => {
    return userRole === "receptionist"
        ? [
              {
                  title: "ID",
                  field: "id"
              },
              {
                  title: "Name",
                  field: "name"
              },
              {
                  title: "Description",
                  field: "description"
              },
              {
                  title: "Category",
                  field: "category"
              },
              {
                  title: "Purchase price",
                  field: "purchase_price"
              },
              {
                  title: "Selling price",
                  field: "selling_price"
              }
          ]
        : [
              {
                  title: "ID",
                  field: "id"
              },
              {
                  title: "Name",
                  field: "name"
              },
              {
                  title: "Description",
                  field: "description"
              },
              {
                  title: "Category",
                  field: "category"
              },
              {
                  title: "Purchase price",
                  field: "purchase_price"
              },
              {
                  title: "Selling price",
                  field: "selling_price"
              },
              {
                  title: "Options",
                  field: "options",
                  sorting: false,
                  render: ({ id }) => (
                      <Options
                          id={id}
                          url={url}
                          onClickDelete={onClickDelete}
                      />
                  )
              }
          ];
};

const apiUrl = "/api/treatments";

function InventoryTreatments({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const match = useRouteMatch();

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [path, setPath] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const { loading, setLoading } = useContext(LoadingContext);

    const [deleteTreatmentId, setDeleteTreatmentId] = useState(null);
    const [openModalWarning, setOpenModalWarning] = useState(false);

    const { authUser } = useContext(AuthUserContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        setActiveTab("inventorytreatments");
        getTreatmentsData();
    }, [activeTabTrigger]);

    const getTreatmentsData = async () => {
        try {
            setLoading(true);
            setData([]);
            setCurrentPage(1);
            setPath("");
            setPerPage(10);
            setTotal(0);

            const { data } = await http.get(apiUrl);
            setExtractData(data);
        } catch (ex) {
            toast.error("An unexpected error occured");
            console.log(ex);
        }
        if (isMounted.current) {
            setLoading(false);
        }
    };

    const extractData = ({ treatments }) => {
        return treatments;
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
        setDeleteTreatmentId(null);
    };

    const handleOnClickDeleteTreatment = id => {
        setOpenModalWarning(true);
        setDeleteTreatmentId(id);
    };

    const handleOnClickDeletedTreatment = async () => {
        try {
            setOpenModalWarning(false);
            setLoading(true);
            await http.delete(`${apiUrl}/${deleteTreatmentId}`);
            if (isMounted.current) {
                setDeleteTreatmentId(null);
                setLoading(false);
                toast.success("Treatment deleted successfully");
                getTreatmentsData();
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
                title="Delete Treatment"
                description="Are you sure you want to delete this treatment?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedTreatment}
            />
            <Box mb={2}>
                <TitleHeader
                    backButton={false}
                    titleIcon={LocalHospitalIcon}
                    renderTitle={props => (
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            ml={1}
                        >
                            <Typography variant="h6">Medicines</Typography>
                            <Typography variant="caption" display="block">
                                (Medicines & Services)
                            </Typography>
                        </Box>
                    )}
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
                title="Treatment List"
                columns={renderColumns(
                    match.url,
                    handleOnClickDeleteTreatment,
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

export default InventoryTreatments;
