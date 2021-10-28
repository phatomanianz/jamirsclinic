import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useParams, useRouteMatch, useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { LoadingContext } from "../../../../../context/context";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Tooltip from "@material-ui/core/Tooltip";
import Avatar from "@material-ui/core/Avatar";
import PersonIcon from "@material-ui/icons/Person";
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
        overflow: "hidden"
    },
    avatarSize: {
        width: theme.spacing(10),
        height: theme.spacing(10)
    }
}));

const UserAvatar = ({ link }) => {
    const classes = useStyles();

    return (
        <a href={link} target="_blank">
            <Avatar alt="User" src={link} className={classes.avatarSize} />
        </a>
    );
};

const renderColumns = (url, onClickDelete) => [
    {
        title: "ID",
        field: "id"
    },
    {
        title: "Image",
        field: "image",
        sorting: false,
        render: ({ image }) => <UserAvatar link={image} />
    },
    {
        title: "Name",
        field: "name"
    },
    {
        title: "Email",
        field: "email"
    },
    {
        title: "Address",
        field: "address"
    },
    {
        title: "Phone",
        field: "phone"
    },
    {
        title: "Options",
        field: "options",
        sorting: false,
        render: ({ id }) => (
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
        )
    }
];

const apiPatients = "/api/user";

function Users({ setActiveTab, activeTabTrigger }) {
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

    const [deleteUserId, setDeleteUserId] = useState(null);
    const [openModalWarning, setOpenModalWarning] = useState(false);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        if (
            !utils.isValidParameter(
                ["admin", "doctor", "receptionist"],
                params.type
            )
        ) {
            history.push("/home/404");
        } else {
            setActiveTab(`users${params.type}`);
            setCustomQuery(`role=${params.type}`);
            getUsersData();
        }
    }, [activeTabTrigger]);

    async function getUsersData() {
        try {
            setLoading(true);
            setData([]);
            setCurrentPage(1);
            setPath("");
            setPerPage(10);
            setTotal(0);

            const { data } = await http.get(
                `${apiPatients}?role=${params.type}`
            );
            setExtractData(data);
        } catch (ex) {
            console.log(ex);
            toast.error("An unexpected error occured.");
        }
        setLoading(false);
    }

    const extractData = ({ users }) => {
        return users;
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
        setDeleteUserId(null);
    };

    const handleOnClickDeleteUser = id => {
        setOpenModalWarning(true);
        setDeleteUserId(id);
    };

    const handleOnClickDeletedUser = async () => {
        try {
            setOpenModalWarning(false);
            setLoading(true);
            await http.delete(`${apiPatients}/${deleteUserId}`);
            if (isMounted.current) {
                setDeleteUserId(null);
                setLoading(false);
                toast.success("User deleted successfully");
                getUsersData();
            }
        } catch (ex) {
            if (isMounted.current) {
                setLoading(false);
                toast.error("An unexpected error occured");
                console.log(ex);
            }
        }
    };

    return (
        <Box className={classes.root}>
            <Dialog
                open={openModalWarning}
                onClose={handleCloseModalWarning}
                title="Delete User"
                description="Are you sure you want to delete this user?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleOnClickDeletedUser}
            />
            <Box mb={2}>
                <TitleHeader
                    backButton={false}
                    titleIcon={PersonIcon}
                    title={upperCaseType}
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
                title={`${upperCaseType} List`}
                columns={renderColumns(match.url, handleOnClickDeleteUser)}
                setExtractData={extractData}
                customQuery={customQuery}
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

export default Users;
