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
import EditIcon from "@material-ui/icons/Edit";
import AddCircleIcon from "@material-ui/icons/AddCircle";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import { LoadingContext } from "../../../../../context/context";
import http from "../../../../../../services/http";
import utils from "../../../../../../utilities/utils";

import TextInput from "../../../../../common/TextInput";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    }
}));

const apiStocks = "api/stocks";
const apiTreatments = "api/treatments";

function InventoryStockAddEdit({ setActiveTab, activeTabTrigger, action }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        setActiveTab("inventorystocks");
    }, [activeTabTrigger]);

    const formEl = useRef(null);

    const [treatments, setTreatments] = useState([]);
    const [errorSelectedTreatment, setErrorSelectedTreatment] = useState(false);

    const [stockId, setStockId] = useState("");
    const [selectedTreatment, setSelectedTreatment] = useState(null);
    const [quantity, setQuantity] = useState("");

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
            await getTreatments();
            if (action === "edit") {
                getStockData();
            }
        };
        actionEffect();
    }, [action]);

    const getTreatments = async (search = "") => {
        try {
            setLoadingLocal(true);
            const { data } = await http.get(
                `${apiTreatments}?${
                    search ? `search=${search}&` : ""
                } not_paginate=1`
            );
            const treatmentsRequest = utils.convertPropertyNumberToString(
                data.treatments,
                "id"
            );
            if (isMounted.current) {
                if (selectedTreatment) {
                    utils.includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
                        treatmentsRequest,
                        selectedTreatment,
                        setTreatments
                    );
                } else {
                    setTreatments(treatmentsRequest);
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

    const getStockData = async () => {
        try {
            setLoading(true);
            const { data } = await http.get(`${apiStocks}/${params.stockId}`);
            const {
                id,
                treatment_id,
                treatment_name,
                quantity: stockQuantity
            } = data.stock;
            const selectedTreatment = {
                id: treatment_id.toString(),
                name: treatment_name
            };
            if (isMounted.current) {
                setStockId(id);
                setQuantity(stockQuantity);

                utils.includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
                    treatments,
                    selectedTreatment,
                    setTreatments
                );
                setSelectedTreatment(selectedTreatment);
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

    const handleOnChangeTreatment = (event, category) => {
        setSelectedTreatment(category);
    };

    const handleOnInputChangeTreatment = (event, value, reason) => {
        getTreatments(value);
        setErrorSelectedTreatment(false);
    };

    const handleSubmit = async (
        values,
        { setSubmitting, setErrors, resetForm }
    ) => {
        try {
            const formData = new FormData(formEl.current);

            if (selectedTreatment === null) {
                setErrorSelectedTreatment(true);
                return;
            }
            formData.append("treatment_id", selectedTreatment.id);

            setLoading(true);
            if (action === "add") {
                await http.post(apiStocks, formData);
                toast.success(`New stock added successfully`);
                if (isMounted.current) {
                    resetForm();
                    setSelectedTreatment(null);
                }
            } else {
                formData.append("_method", "PATCH");
                await http.post(`${apiStocks}/${stockId}`, formData);
                if (isMounted.current) {
                    toast.success("Stock edited succesfully");
                }
            }
            if (isMounted.current) {
                setSubmitting(false);
            }
        } catch (ex) {
            if (ex.response && ex.response.status === 422) {
                const errors = ex.response.data.errors;
                if (isMounted.current) {
                    setErrors(errors);
                    if (errors.treatment_id) {
                        setErrorSelectedTreatment(errors.treatment_id);
                    }
                }
            } else {
                toast.error("An unexpected error occured.");
                console.log(ex);
            }
        }
        setLoading(false);
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
                        title={
                            action === "add" ? "Add New Stock" : "Edit Stock"
                        }
                    />
                </Box>
                <Paper>
                    <Box p={2}>
                        <Formik
                            enableReinitialize
                            initialValues={{
                                quantity
                            }}
                            validationSchema={Yup.object({
                                quantity: Yup.number()
                                    .required("Required")
                                    .min(0)
                                    .label("Quantity")
                            })}
                            onSubmit={handleSubmit}
                        >
                            <Form ref={formEl}>
                                <Box mt={2}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Autocomplete
                                                onChange={
                                                    handleOnChangeTreatment
                                                }
                                                onInputChange={
                                                    handleOnInputChangeTreatment
                                                }
                                                value={selectedTreatment}
                                                getOptionSelected={(
                                                    option,
                                                    value
                                                ) => option.id === value.id}
                                                options={treatments}
                                                getOptionLabel={option =>
                                                    option.name
                                                }
                                                loading={loadingLocal}
                                                blurOnSelect
                                                renderInput={params => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        variant="outlined"
                                                        label="Treatment name *"
                                                        placeholder="Search"
                                                        fullWidth
                                                        {...(errorSelectedTreatment
                                                            ? {
                                                                  error: true,
                                                                  helperText:
                                                                      "Treatment is required"
                                                              }
                                                            : {})}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Autocomplete
                                                onChange={
                                                    handleOnChangeTreatment
                                                }
                                                onInputChange={
                                                    handleOnInputChangeTreatment
                                                }
                                                value={selectedTreatment}
                                                getOptionSelected={(
                                                    option,
                                                    value
                                                ) => option.id === value.id}
                                                options={treatments}
                                                getOptionLabel={option =>
                                                    option.id
                                                }
                                                loading={loadingLocal}
                                                blurOnSelect
                                                renderInput={params => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        variant="outlined"
                                                        label="Treatment ID *"
                                                        placeholder="Search"
                                                        fullWidth
                                                        {...(errorSelectedTreatment
                                                            ? {
                                                                  error: true,
                                                                  helperText:
                                                                      "Treatment is required"
                                                              }
                                                            : {})}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextInput
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                type="number"
                                                inputProps={{
                                                    step: "1",
                                                    min: "0"
                                                }}
                                                id="quantity"
                                                name="quantity"
                                                label="Quantity *"
                                                autoComplete="quantity"
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

export default InventoryStockAddEdit;
