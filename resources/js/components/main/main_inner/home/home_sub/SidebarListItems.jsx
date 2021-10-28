import React, { useState, useContext } from "react";
import { Link, useRouteMatch } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DashboardIcon from "@material-ui/icons/Dashboard";
import PeopleIcon from "@material-ui/icons/People";
import PersonIcon from "@material-ui/icons/Person";
import TimelineIcon from "@material-ui/icons/Timeline";
import PaymentIcon from "@material-ui/icons/Payment";
import ScheduleIcon from "@material-ui/icons/Schedule";
import EventNoteIcon from "@material-ui/icons/EventNote";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import MoneyIcon from "@material-ui/icons/Money";
import ListIcon from "@material-ui/icons/List";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";
import AccessibilityNewIcon from "@material-ui/icons/AccessibilityNew";
import SettingsIcon from "@material-ui/icons/Settings";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import CategoryIcon from "@material-ui/icons/Category";
import CloudIcon from "@material-ui/icons/Cloud";
import FolderIcon from "@material-ui/icons/Folder";
import WorkIcon from "@material-ui/icons/Work";

import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";

import { AuthUserContext } from "../../../../context/context";

import RenderByUserRole from "../../../../common/RenderByUserRole";

const useStyles = makeStyles(theme => ({
    nested: {
        paddingLeft: theme.spacing(4)
    }
}));

const SidebarListItems = ({
    activeTab,
    setActiveTabTrigger,
    onClickDrawerClose
}) => {
    const classes = useStyles();
    let match = useRouteMatch();

    const [open, setOpen] = useState({
        doctors: false,
        patients: false,
        prescriptions: false,
        appointments: false,
        payments: false,
        inventory: false,
        users: false
    });

    const { authUser } = useContext(AuthUserContext);

    const handleClickSubMenu = listItem => {
        for (const list in open) {
            if (list !== listItem) {
                open[list] = false;
            }
        }
        open[listItem] = !open[listItem];
        setOpen({ ...open });
    };

    const handleOnClick = () => {
        setActiveTabTrigger();
        onClickDrawerClose();
    };

    return (
        <div>
            <ListItem
                button
                selected={activeTab.dashboard && true}
                component={Link}
                to={`${match.url}/dashboard`}
                onClick={handleOnClick}
            >
                <ListItemIcon>
                    <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
            </ListItem>
            <RenderByUserRole redirect={false} notAllowedUser={["patient"]}>
                <RenderByUserRole redirect={false} notAllowedUser={["doctor"]}>
                    <ListItem
                        button
                        onClick={() => handleClickSubMenu("doctors")}
                    >
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Doctors" />
                        {open.doctors ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={open.doctors} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem
                                button
                                className={classes.nested}
                                selected={activeTab.doctorshistories && true}
                                component={Link}
                                to={`${match.url}/doctors`}
                                onClick={handleOnClick}
                            >
                                <ListItemIcon>
                                    <TimelineIcon />
                                </ListItemIcon>
                                <ListItemText primary="Doctors History" />
                            </ListItem>
                        </List>
                    </Collapse>
                </RenderByUserRole>
                <ListItem button onClick={() => handleClickSubMenu("patients")}>
                    <ListItemIcon>
                        <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Patients" />
                    {open.patients ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open.patients} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem
                            button
                            className={classes.nested}
                            selected={activeTab.patientadd && true}
                            component={Link}
                            to={`${match.url}/patients/add`}
                            onClick={handleOnClick}
                        >
                            <ListItemIcon>
                                <AddCircleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Add" />
                        </ListItem>
                        <ListItem
                            button
                            className={classes.nested}
                            selected={activeTab.patientlist && true}
                            component={Link}
                            to={`${match.url}/patients`}
                            onClick={handleOnClick}
                        >
                            <ListItemIcon>
                                <PersonIcon />
                            </ListItemIcon>
                            <ListItemText primary="Patients List" />
                        </ListItem>
                        <ListItem
                            button
                            className={classes.nested}
                            selected={activeTab.casehistories && true}
                            component={Link}
                            to={`${match.url}/casehistories`}
                            onClick={handleOnClick}
                        >
                            <ListItemIcon>
                                <WorkIcon />
                            </ListItemIcon>
                            <ListItemText primary="Case Histories" />
                        </ListItem>
                        <ListItem
                            button
                            className={classes.nested}
                            selected={activeTab.documents && true}
                            component={Link}
                            to={`${match.url}/documents`}
                            onClick={handleOnClick}
                        >
                            <ListItemIcon>
                                <FolderIcon />
                            </ListItemIcon>
                            <ListItemText primary="Documents" />
                        </ListItem>
                    </List>
                </Collapse>
            </RenderByUserRole>
            <ListItem button onClick={() => handleClickSubMenu("appointments")}>
                <ListItemIcon>
                    <ScheduleIcon />
                </ListItemIcon>
                <ListItemText primary="Appointments" />
                {open.appointments ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open.appointments} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItem
                        button
                        className={classes.nested}
                        selected={activeTab.appointmentadd && true}
                        component={Link}
                        to={`${match.url}/appointments/add`}
                        onClick={handleOnClick}
                    >
                        <ListItemIcon>
                            <AddCircleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Add" />
                    </ListItem>
                    <ListItem
                        button
                        className={classes.nested}
                        selected={activeTab.appointmentsall && true}
                        component={Link}
                        to={`${match.url}/appointments/all`}
                        onClick={handleOnClick}
                    >
                        <ListItemIcon>
                            <EventNoteIcon />
                        </ListItemIcon>
                        <ListItemText primary="All" />
                    </ListItem>
                    <ListItem
                        button
                        className={classes.nested}
                        selected={activeTab.appointmentstoday && true}
                        component={Link}
                        to={`${match.url}/appointments/today`}
                        onClick={handleOnClick}
                    >
                        <ListItemIcon>
                            <EventNoteIcon />
                        </ListItemIcon>
                        <ListItemText primary="Today" />
                    </ListItem>
                    <ListItem
                        button
                        className={classes.nested}
                        selected={activeTab.appointmentsupcoming && true}
                        component={Link}
                        to={`${match.url}/appointments/upcoming`}
                        onClick={handleOnClick}
                    >
                        <ListItemIcon>
                            <EventNoteIcon />
                        </ListItemIcon>
                        <ListItemText primary="Upcoming" />
                    </ListItem>
                </List>
            </Collapse>
            <RenderByUserRole redirect={false} notAllowedUser={["patient"]}>
                <ListItem
                    button
                    onClick={() => handleClickSubMenu("prescriptions")}
                >
                    <ListItemIcon>
                        <SupervisedUserCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Prescriptions" />
                    {open.prescriptions ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open.prescriptions} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <RenderByUserRole
                            redirect={false}
                            notAllowedUser={["receptionist"]}
                        >
                            <ListItem
                                button
                                className={classes.nested}
                                selected={activeTab.prescriptionadd && true}
                                component={Link}
                                to={`${match.url}/prescriptions/add`}
                                onClick={handleOnClick}
                            >
                                <ListItemIcon>
                                    <AddCircleIcon />
                                </ListItemIcon>
                                <ListItemText primary="Add" />
                            </ListItem>
                        </RenderByUserRole>
                        <ListItem
                            button
                            className={classes.nested}
                            selected={activeTab.prescriptionlist && true}
                            component={Link}
                            to={`${match.url}/prescriptions`}
                            onClick={handleOnClick}
                        >
                            <ListItemIcon>
                                <AccessibilityNewIcon />
                            </ListItemIcon>
                            <ListItemText primary="Prescriptions List" />
                        </ListItem>
                    </List>
                </Collapse>
                <ListItem button onClick={() => handleClickSubMenu("payments")}>
                    <ListItemIcon>
                        <PaymentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Payments" />
                    {open.payments ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open.payments} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem
                            button
                            className={classes.nested}
                            selected={activeTab.paymentadd && true}
                            component={Link}
                            to={`${match.url}/payments/add`}
                            onClick={handleOnClick}
                        >
                            <ListItemIcon>
                                <AddCircleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Add" />
                        </ListItem>
                        <ListItem
                            button
                            className={classes.nested}
                            selected={activeTab.paymentlist && true}
                            component={Link}
                            to={`${match.url}/payments`}
                            onClick={handleOnClick}
                        >
                            <ListItemIcon>
                                <MoneyIcon />
                            </ListItemIcon>
                            <ListItemText primary="Payments List" />
                        </ListItem>
                    </List>
                </Collapse>
                <ListItem
                    button
                    onClick={() => handleClickSubMenu("inventory")}
                >
                    <ListItemIcon>
                        <CloudIcon />
                    </ListItemIcon>
                    <ListItemText primary="Olema's Pharmacy" />
                    {open.inventory ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open.inventory} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {/* <ListItem
                            button
                            className={classes.nested}
                            component={Link}
                            to={`${match.url}/inventory/stocks`}
                            selected={activeTab.inventorystocks && true}
                            onClick={handleOnClick}
                        >
                            <ListItemIcon>
                                <ListIcon />
                            </ListItemIcon>
                            <ListItemText primary="Stocks" />
                        </ListItem> */}
                        <ListItem
                            button
                            className={classes.nested}
                            component={Link}
                            to={`${match.url}/inventory/treatments`}
                            selected={activeTab.inventorytreatments && true}
                            onClick={handleOnClick}
                        >
                            <ListItemIcon>
                                <LocalHospitalIcon />
                            </ListItemIcon>
                            <ListItemText primary="Treatments" />
                        </ListItem>
                        <ListItem
                            button
                            className={classes.nested}
                            component={Link}
                            to={`${match.url}/inventory/categories`}
                            selected={activeTab.inventorycategories && true}
                            onClick={handleOnClick}
                        >
                            <ListItemIcon>
                                <CategoryIcon />
                            </ListItemIcon>
                            <ListItemText primary="Categories" />
                        </ListItem>
                    </List>
                </Collapse>
                <RenderByUserRole
                    redirect={false}
                    notAllowedUser={["doctor", "receptionist", "patient"]}
                >
                    <ListItem
                        button
                        onClick={() => handleClickSubMenu("users")}
                    >
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Users" />
                        {open.users ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={open.users} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem
                                button
                                className={classes.nested}
                                component={Link}
                                to={`${match.url}/users/admin`}
                                selected={activeTab.usersadmin && true}
                                onClick={handleOnClick}
                            >
                                <ListItemIcon>
                                    <PersonIcon />
                                </ListItemIcon>
                                <ListItemText primary="Admin" />
                            </ListItem>
                            <ListItem
                                button
                                className={classes.nested}
                                component={Link}
                                to={`${match.url}/users/doctor`}
                                selected={activeTab.usersdoctor && true}
                                onClick={handleOnClick}
                            >
                                <ListItemIcon>
                                    <PersonIcon />
                                </ListItemIcon>
                                <ListItemText primary="Doctor" />
                            </ListItem>
                            {/* <ListItem
                                button
                                className={classes.nested}
                                component={Link}
                                to={`${match.url}/users/receptionist`}
                                selected={activeTab.usersreceptionist && true}
                                onClick={handleOnClick}
                            >
                                <ListItemIcon>
                                    <PersonIcon />
                                </ListItemIcon>
                                <ListItemText primary="Receptionist" />
                            </ListItem> */}
                        </List>
                    </Collapse>
                    <ListItem
                        button
                        component={Link}
                        to={`${match.url}/settings`}
                        selected={activeTab.settings && true}
                        onClick={handleOnClick}
                    >
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItem>
                </RenderByUserRole>
            </RenderByUserRole>
            <RenderByUserRole
                redirect={false}
                notAllowedUser={["admin", "doctor", "receptionist"]}
            >
                <ListItem
                    button
                    selected={activeTab.role_patients_history && true}
                    component={Link}
                    to={`${match.url}/patients/${authUser &&
                        authUser.id}/history`}
                    onClick={handleOnClick}
                >
                    <ListItemIcon>
                        <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="My Records" />
                </ListItem>
                <ListItem
                    button
                    selected={activeTab.role_patients_payments && true}
                    component={Link}
                    to={`${match.url}/patients/${authUser &&
                        authUser.id}/payments`}
                    onClick={handleOnClick}
                >
                    <ListItemIcon>
                        <PaymentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Payments" />
                </ListItem>
            </RenderByUserRole>
        </div>
    );
};

export default SidebarListItems;
