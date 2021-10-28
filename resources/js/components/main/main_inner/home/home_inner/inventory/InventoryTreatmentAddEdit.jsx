import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import { LoadingContext } from "../../../../../context/context";
import http from "../../../../../../services/http";
import utils from "../../../../../../utilities/utils";

import TextInput from "../../../../../common/TextInput";
import TextFieldDisabledDark from "../../../../../common/TextFieldDisabledDark";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    inputImage: {
        display: "none"
    },
    avatarPreview: {
        width: theme.spacing(12),
        height: theme.spacing(12),
        marginRight: theme.spacing(1)
    },
    imageFileName: {
        whiteSpace: "no-wrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    }
}));

const apiTreatments = "api/treatments";
const apiCategories = "api/categories";

function InventoryTreatmentAddEdit({ setActiveTab, activeTabTrigger, action }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        setActiveTab(`inventorytreatments`);
    }, [activeTabTrigger]);

    const formEl = useRef(null);

    const [categories, setCategories] = useState([]);
    const [errorSelectedCategory, setErrorSelectedCategory] = useState(false);

    const [treatmentId, setTreatmentId] = useState("");
    const [selectedTreatmentCategory, setSelectedTreatmentCategory] = useState(
        null
    );
    const [treatmentName, setTreatmentName] = useState("");
    const [treatmentDescription, setTreatmentDescription] = useState("");
    const [treatmentPurchasePrice, setTreatmentPurchasePrice] = useState("");
    const [treatmentSellingPrice, setTreatmentSellingPrice] = useState("");

    const [loadingLocal, setLoadingLocal] = useState(false);
    const { setLoading } = useContext(LoadingContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        const actionEffect = async () => {
            await getCategories();
            if (action === "edit") {
                getTreatmentData();
            }
        };
        actionEffect();
    }, [action]);

    const getCategories = async (search = "") => {
        try {
            setLoadingLocal(true);
            const { data } = await http.get(
                `${apiCategories}?${
                    search ? `search=${search}&` : ""
                } not_paginate=1`
            );
            const categoriesRequest = utils.convertPropertyNumberToString(
                data.categories,
                "id"
            );
            if (isMounted.current) {
                if (selectedTreatmentCategory) {
                    utils.includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
                        categoriesRequest,
                        selectedTreatmentCategory,
                        setCategories
                    );
                } else {
                    setCategories(categoriesRequest);
                }
            }
        } catch (ex) {
            toast.error("An unexpected error occured.");
            console.log(ex);
        }
        if (isMounted.current) {
            setLoadingLocal(false);
        }
    };

    const getTreatmentData = async () => {
        try {
            setLoading(true);
            const { data } = await http.get(
                `${apiTreatments}/${params.treatmentId}`
            );
            const {
                id,
                category,
                category_id,
                name,
                description,
                purchase_price,
                selling_price
            } = data.treatment;
            const selectedCategory = {
                id: category_id.toString(),
                category
            };
            if (isMounted.current) {
                setTreatmentId(id);
                setTreatmentName(name);
                setTreatmentDescription(
                    description !== null ? description : ""
                );
                setTreatmentPurchasePrice(purchase_price);
                setTreatmentSellingPrice(selling_price);

                utils.includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
                    categories,
                    selectedCategory,
                    setCategories
                );
                setSelectedTreatmentCategory(selectedCategory);
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
            setLoading(false);
        }
    };

    const handleOnChangeCategory = (event, category) => {
        setSelectedTreatmentCategory(category);
    };

    const handleOnInputChangeCategory = (event, value, reason) => {
        getCategories(value);
        setErrorSelectedCategory(false);
    };

    const handleSubmit = async (
        values,
        { setSubmitting, setErrors, resetForm }
    ) => {
        try {
            const formData = new FormData(formEl.current);

            if (selectedTreatmentCategory === null) {
                setErrorSelectedCategory(true);
                return;
            }
            formData.append("category_id", selectedTreatmentCategory.id);

            setLoading(true);
            if (action === "add") {
                await http.post(apiTreatments, formData);
                toast.success(`New treatment added successfully`);
                if (isMounted.current) {
                    resetForm();
                    setSelectedTreatmentCategory(null);
                }
            } else {
                formData.append("_method", "PATCH");
                await http.post(`${apiTreatments}/${treatmentId}`, formData);
                toast.success("Treatment edited succesfully");
            }

            if (isMounted.current) {
                setSubmitting(false);
            }
        } catch (ex) {
            if (ex.response && ex.response.status === 422) {
                const errors = ex.response.data.errors;
                if (isMounted.current) {
                    setErrors(errors);
                    if (errors.category_id) {
                        setErrorSelectedCategory(errors.category_id);
                    }
                }
            } else {
                toast.error("An unexpected error occured.");
                console.log(ex);
            }
        }
        if (isMounted.current) {
            setLoading(false);
        }
    };

    return (
        <Grid
            container
            justify="center"
            alignItems="center"
            className={classes.root}
        >
            <Grid item xs={12}>
                <Box mb={2}>
                    <TitleHeader
                        backButton={true}
                        titleIcon={action === "add" ? AddCircleIcon : EditIcon}
                        renderTitle={props => (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                ml={1}
                            >
                                <Typography variant="h6">
                                    {action === "add"
                                        ? "Add New Treatment"
                                        : "Edit Treatment"}
                                </Typography>
                                <Typography variant="caption" display="block">
                                    (Medicines & Services)
                                </Typography>
                            </Box>
                        )}
                    />
                </Box>
                <Paper>
                    <Box p={2}>
                        <Formik
                            enableReinitialize
                            initialValues={{
                                name: treatmentName,
                                description: treatmentDescription,
                                purchase_price: treatmentPurchasePrice,
                                selling_price: treatmentSellingPrice
                            }}
                            validationSchema={Yup.object({
                                name: Yup.string().required("Required"),
                                description: Yup.string(),
                                purchase_price: Yup.number()
                                    .required("Required")
                                    .min(0)
                                    .label("Purchase price"),
                                selling_price: Yup.number()
                                    .required("Required")
                                    .min(0)
                                    .label("Selling price")
                            })}
                            onSubmit={handleSubmit}
                        >
                            <Form ref={formEl}>
                                <Box mt={2}>
                                    <Grid container spacing={2}>
                                        {action === "edit" ? (
                                            <Grid item xs={12} sm={6}>
                                                <TextFieldDisabledDark
                                                    size="small"
                                                    variant="outlined"
                                                    fullWidth
                                                    disabled
                                                    label="ID"
                                                    value={treatmentId}
                                                />
                                            </Grid>
                                        ) : null}
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                id="name"
                                                label="Name *"
                                                name="name"
                                                autoComplete="name"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Autocomplete
                                                onChange={
                                                    handleOnChangeCategory
                                                }
                                                onInputChange={
                                                    handleOnInputChangeCategory
                                                }
                                                value={
                                                    selectedTreatmentCategory
                                                }
                                                getOptionSelected={(
                                                    option,
                                                    value
                                                ) => option.id === value.id}
                                                options={categories}
                                                getOptionLabel={option =>
                                                    option.category
                                                }
                                                loading={loadingLocal}
                                                blurOnSelect
                                                renderInput={params => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        variant="outlined"
                                                        label="Category *"
                                                        placeholder="Search"
                                                        fullWidth
                                                        {...(errorSelectedCategory
                                                            ? {
                                                                  error: true,
                                                                  helperText:
                                                                      "Category is required"
                                                              }
                                                            : {})}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid
                                            item
                                            xs={12}
                                            sm={action === "add" ? 12 : 6}
                                        >
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                id="description"
                                                name="description"
                                                label="Description"
                                                autoComplete="description"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                type="number"
                                                inputProps={{
                                                    step: "any",
                                                    min: "0"
                                                }}
                                                id="purchase_price"
                                                name="purchase_price"
                                                label="Purchase price *"
                                                autoComplete="purchase_price"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                type="number"
                                                inputProps={{
                                                    step: "any",
                                                    min: "0"
                                                }}
                                                id="selling_price"
                                                name="selling_price"
                                                label="Selling price *"
                                                autoComplete="selling_price"
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Grid container justify="flex-end">
                                    <Grid item xs={12} md={2}>
                                        <Button
                                            fullWidth
                                            size="small"
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            className={classes.submit}
                                        >
                                            {action === "add" ? "Add" : "Edit"}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Form>
                        </Formik>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
}

export default InventoryTreatmentAddEdit;
