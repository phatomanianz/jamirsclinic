import React, { useState, useEffect, useContext, useRef } from "react";
import { useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import CategoryIcon from "@material-ui/icons/Category";
import LinearProgress from "@material-ui/core/LinearProgress";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import {
    LoadingContext,
    AuthUserContext
} from "../../../../../context/context";
import http from "../../../../../../services/http";

import RenderByUserRole from "../../../../../common/RenderByUserRole";
import TableComplex from "../../../../../common/TableComplex";
import DialogCustom from "../../../../../common/Dialog";
import TextInput from "../../../../../common/TextInput";
import { Formik, Form } from "formik";
import * as Yup from "yup";

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

const renderColumns = (onclickEdit, onClickDelete, userRole) => {
    return userRole === "receptionist"
        ? [
              {
                  title: "Category",
                  field: "category"
              },
              {
                  title: "Description",
                  field: "description"
              }
          ]
        : [
              {
                  title: "Category",
                  field: "category"
              },
              {
                  title: "Description",
                  field: "description"
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
                                  onClick={() => {
                                      onclickEdit(id);
                                  }}
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

const apiCategories = "/api/categories";

function InventoryCategories({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const history = useHistory();

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [path, setPath] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const [loadingLocal, setLoadingLocal] = useState(false);
    const { loading, setLoading } = useContext(LoadingContext);

    const [deleteCategoryID, setDeleteCategoryID] = useState(null);
    const [openDeleteModalWarning, setOpenDeleteModalWarning] = useState(false);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [addCategory, setAddCategory] = useState("");
    const [addDescription, setAddDescription] = useState("");

    const [openEditModal, setOpenEditModal] = useState(false);
    const [editCategoryID, setEditCategoryID] = useState(null);
    const [editCategory, setEditCategory] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const { authUser } = useContext(AuthUserContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        setActiveTab("inventorycategories");
        getCategoriesData();
    }, [activeTabTrigger]);

    const getCategoriesData = async () => {
        try {
            setLoading(true);
            setData([]);
            setCurrentPage(1);
            setPath("");
            setPerPage(10);
            setTotal(0);

            const { data } = await http.get(apiCategories);
            setExtractData(data);
        } catch (ex) {
            toast.error("An unexpected error occured");
            console.log(ex);
        }
        if (isMounted.current) {
            setLoading(false);
        }
    };

    const extractData = ({ categories }) => {
        return categories;
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

    /* DELETE ACTION */
    const handleCloseDeleteModalWarning = () => {
        setOpenDeleteModalWarning(false);
        setDeleteCategoryID(null);
    };

    const handleClickDeleteCategory = id => {
        setOpenDeleteModalWarning(true);
        setDeleteCategoryID(id);
    };

    const handleClickDeletedCategory = async () => {
        try {
            setOpenDeleteModalWarning(false);
            setLoading(true);
            await http.delete(`${apiCategories}/${deleteCategoryID}`);
            if (isMounted.current) {
                setDeleteCategoryID(null);
                setLoading(false);
                toast.success("Category deleted successfully");
                handleCloseAddModal();
                getCategoriesData();
            }
        } catch (ex) {
            if (isMounted.current) {
                setLoading(false);
            }
            toast.error("An unexpected error occured");
            console.log(ex);
        }
    };

    /* ADD ACTION */
    const handleCloseAddModal = () => {
        setOpenAddModal(false);
        setAddCategory("");
        setAddDescription("");
    };

    const handleClickAddCategory = () => {
        setOpenAddModal(true);
    };

    const handleSubmitAdd = async (
        values,
        { setSubmitting, setErrors, resetForm }
    ) => {
        try {
            setLoadingLocal(true);
            await http.post(apiCategories, values);
            if (isMounted.current) {
                setLoadingLocal(false);
                resetForm();
                setSubmitting(false);
                handleCloseAddModal();
                toast.success("Category added successfully");
                getCategoriesData();
            }
        } catch (ex) {
            if (isMounted.current) {
                setLoadingLocal(false);
                if (ex.response && ex.response.status === 422) {
                    setErrors(ex.response.data.errors);
                } else {
                    toast.error("An unexpected error occured.");
                    console.log(ex);
                }
            }
        }
    };

    /* EDIT ACTION */
    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setEditCategory("");
        setEditDescription("");
    };

    const handleClickEditCategory = async categoryID => {
        try {
            setOpenEditModal(true);
            setLoadingLocal(true);
            const { data } = await http.get(`${apiCategories}/${categoryID}`);
            const { id, category, description } = data.category;
            if (isMounted.current) {
                setEditCategoryID(id);
                setEditCategory(category);
                setEditDescription(description);
            }
        } catch (ex) {
            if (ex.response && ex.response.status === 404) {
                history.push("/home/404");
            } else {
                toast.error("An unexpected error occured.");
                console.log(ex);
            }
        }
        if (isMounted.current) {
            setLoadingLocal(false);
        }
    };

    const handleSubmitEdit = async (
        values,
        { setSubmitting, setErrors, resetForm }
    ) => {
        try {
            setLoadingLocal(true);
            await http.post(`${apiCategories}/${editCategoryID}`, {
                ...values,
                _method: "PATCH"
            });
            if (isMounted.current) {
                setLoadingLocal(false);
                resetForm();
                setSubmitting(false);
                handleCloseEditModal();
                toast.success("Category edited successfully");
                getCategoriesData();
            }
        } catch (ex) {
            if (isMounted.current) {
                setLoadingLocal(false);
                if (ex.response && ex.response.status === 422) {
                    setErrors(ex.response.data.errors);
                } else {
                    toast.error("An unexpected error occured.");
                    console.log(ex);
                }
            }
        }
    };

    return (
        <Box className={classes.root}>
            {/* Delete Category Dialog*/}
            <DialogCustom
                open={openDeleteModalWarning}
                onClose={handleCloseDeleteModalWarning}
                title="Delete Category"
                description="Are you sure you want to delete this category?"
                buttonSecondaryText="No"
                buttonPrimaryText="Yes"
                onClickButtonPrimary={handleClickDeletedCategory}
            />
            {/* Add Category Dialog*/}
            <Dialog
                open={openAddModal}
                onClose={handleCloseAddModal}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
                maxWidth="sm"
                title="Add Category"
            >
                {loadingLocal && <LinearProgress />}
                <Formik
                    enableReinitialize
                    initialValues={{
                        category: addCategory,
                        description: addDescription
                    }}
                    validationSchema={Yup.object({
                        category: Yup.string().required("Required"),
                        description: Yup.string()
                    })}
                    onSubmit={handleSubmitAdd}
                >
                    <Form>
                        <DialogTitle id="alert-dialog-title">
                            Add Category
                        </DialogTitle>
                        <DialogContent>
                            <TextInput
                                autoFocus
                                size="small"
                                variant="outlined"
                                label="Category *"
                                id="category"
                                name="category"
                                autoComplete="category"
                                fullWidth
                            />
                            <br />
                            <br />
                            <TextInput
                                size="small"
                                variant="outlined"
                                id="description"
                                name="description"
                                label="Description"
                                autoComplete="description"
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={handleCloseAddModal}
                                color="primary"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" color="primary">
                                Add
                            </Button>
                        </DialogActions>
                    </Form>
                </Formik>
            </Dialog>
            {/* Edit Category Dialog*/}
            <Dialog
                open={openEditModal}
                onClose={handleCloseEditModal}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
                maxWidth="sm"
                title="Edit Category"
            >
                {loadingLocal && <LinearProgress />}
                <Formik
                    enableReinitialize
                    initialValues={{
                        category: editCategory,
                        description: editDescription
                    }}
                    validationSchema={Yup.object({
                        category: Yup.string().required("Required"),
                        description: Yup.string()
                    })}
                    onSubmit={handleSubmitEdit}
                >
                    <Form>
                        <DialogTitle id="alert-dialog-title">
                            Edit Category
                        </DialogTitle>
                        <DialogContent>
                            <TextInput
                                autoFocus
                                size="small"
                                variant="outlined"
                                label="Category *"
                                id="category"
                                name="category"
                                autoComplete="category"
                                fullWidth
                            />
                            <br />
                            <br />
                            <TextInput
                                size="small"
                                variant="outlined"
                                id="description"
                                name="description"
                                label="Description"
                                autoComplete="description"
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={handleCloseEditModal}
                                color="primary"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" color="primary">
                                Update
                            </Button>
                        </DialogActions>
                    </Form>
                </Formik>
            </Dialog>
            <Box mb={2}>
                <TitleHeader
                    backButton={false}
                    titleIcon={CategoryIcon}
                    title="Categories"
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
                        onClick={handleClickAddCategory}
                        startIcon={<AddCircleIcon />}
                    >
                        Add New
                    </Button>
                </Box>
            </RenderByUserRole>
            <TableComplex
                title="Category List"
                columns={renderColumns(
                    handleClickEditCategory,
                    handleClickDeleteCategory,
                    authUser.role
                )}
                setExtractData={extractData}
                loading={loading}
                currentPage={currentPage}
                path={path}
                perPage={perPage}
                data={data}
                total={total}
                orderBy="category"
                order="desc"
            />
        </Box>
    );
}

export default InventoryCategories;
