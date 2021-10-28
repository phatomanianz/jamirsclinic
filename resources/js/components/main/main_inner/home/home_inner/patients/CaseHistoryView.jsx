import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import VisibilityIcon from "@material-ui/icons/Visibility";

import TitleHeader from "../../../../../common/project_specific/TitleHeader";
import TextFieldDisabledDarker from "../../../../../common/TextFieldDisabledDarker";
import { LoadingContext } from "../../../../../context/context";
import http from "../../../../../../services/http";

const useStyles = makeStyles(theme => ({
    root: {
        overflow: "hidden"
    }
}));

const apiCaseHistories = "api/casehistories";

function CaseHistoryView({ setActiveTab, activeTabTrigger }) {
    const isMounted = useRef(true);
    const classes = useStyles();
    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        if (params.patientID) {
            setActiveTab("patientlist");
        } else {
            setActiveTab("casehistories");
        }
    }, [activeTabTrigger]);

    const [date, setDate] = useState("");
    const [patientId, setPatientId] = useState("");
    const [patientName, setPatientName] = useState("");
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");

    const { setLoading } = useContext(LoadingContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(false);
        const getPatientCaseHistory = async () => {
            try {
                setLoading(true);
                const { data } = await http.get(
                    `${apiCaseHistories}/${params.caseHistoryID}`
                );
                const {
                    date: caseDate,
                    patient_id,
                    patient_name,
                    description: caseDescription,
                    note: caseNote
                } = data.case_history;
                if (isMounted.current) {
                    setDate(caseDate);
                    setPatientId(patient_id);
                    setPatientName(patient_name);
                    setDescription(caseDescription);
                    setNote(caseNote !== null ? caseNote : "");
                }
                if (params.patientID && params.patientID != patient_id) {
                    history.push("/home/404");
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
        getPatientCaseHistory();
    }, []);

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
                        titleIcon={VisibilityIcon}
                        title="View Case History"
                    />
                </Box>
                <Paper>
                    <Box p={3}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextFieldDisabledDarker
                                    size="small"
                                    variant="outlined"
                                    label="Patient name"
                                    value={patientName}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldDisabledDarker
                                    size="small"
                                    variant="outlined"
                                    label="Patient ID"
                                    value={patientId}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldDisabledDarker
                                    size="small"
                                    variant="outlined"
                                    label="Date"
                                    value={date}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldDisabledDarker
                                    size="small"
                                    variant="outlined"
                                    label="Medication"
                                    value={description}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    rowsMax={8}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldDisabledDarker
                                    size="small"
                                    variant="outlined"
                                    label="Note"
                                    value={note}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    rowsMax={8}
                                    disabled
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
}

export default CaseHistoryView;
