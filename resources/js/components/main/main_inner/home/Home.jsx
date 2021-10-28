import React, { useRef, useState, useEffect, useContext } from "react";

import {
    LoadingContext,
    ScrollTopContext,
    DashboardContext,
    SettingsContext,
    AuthUserContext
} from "../../../context/context";

import { toast } from "react-toastify";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import LinearProgress from "@material-ui/core/LinearProgress";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import Badge from "@material-ui/core/Badge";
import MenuIcon from "@material-ui/icons/Menu";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import PaymentIcon from "@material-ui/icons/Payment";
import PersonIcon from "@material-ui/icons/Person";
import ScheduleIcon from "@material-ui/icons/Schedule";

import SidebarListItems from "./home_sub/SidebarListItems";
import ContentRoute from "./home_sub/ContentRoute";
import MenuMyProfile from "./home_sub/MenuMyProfile";
import MenuTodayAppointment from "./home_sub/MenuTodayAppointment";
import MenuTodayPatientRegistered from "./home_sub/MenuTodayPatientRegistered";
import MenuTodayPayment from "./home_sub/MenuTodayPayment";

import StyledAvatar from "../../../common/StyledAvatar";
import RenderByUserRole from "../../../common/RenderByUserRole";

import http from "../../../../services/http";

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex"
    },
    title: {
        flexGrow: 1
    },
    drawer: {
        [theme.breakpoints.up("md")]: {
            width: drawerWidth,
            flexShrink: 0
        }
    },
    appBar: {
        [theme.breakpoints.up("md")]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth
        }
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up("md")]: {
            display: "none"
        }
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth
    },
    content: {
        flexGrow: 1,
        overflow: "auto",
        [theme.breakpoints.up("md")]: {
            padding: theme.spacing(3)
        },
        [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(1)
        }
    },
    avatarSmall: {
        width: theme.spacing(3),
        height: theme.spacing(3)
    }
}));

const apiDashboard = "api/dashboard";

function Home(props) {
    const { window } = props;

    const classes = useStyles();
    const theme = useTheme();

    const isMobileScreen = useMediaQuery(theme => theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);

    const [menuMyProfileAnchorEl, setMenuMyProfileAnchorEl] = useState(null);
    const [
        menuTodayAppointmentAnchorEl,
        setMenuTodayAppointmentAnchorEl
    ] = useState(null);
    const [
        menuTodayPatientsRegisteredAnchorEl,
        setMenuTodayPatientRegisteredAnchorEl
    ] = useState(null);
    const [menuTodayPaymentAnchorEl, setMenuTodayPaymentAnchorEl] = useState(
        null
    );

    const mainElement = useRef(null);

    const [activeTabTrigger, setActiveTabTrigger] = useState({});
    const [activeTab, setActiveTab] = useState({
        dashboard: false,
        doctorshistories: false,
        patientadd: false,
        patientlist: false,
        prescriptionadd: false,
        prescriptionlist: false,
        casehistories: false,
        documents: false,
        appointmentadd: false,
        appointmentsall: false,
        appointmentstoday: false,
        appointmentsupcoming: false,
        paymentadd: false,
        paymentlist: false,
        inventorytreatments: false,
        inventorycategories: false,
        inventorystocks: false,
        usersadmin: false,
        usersdoctor: false,
        usersreceptionist: false,
        settings: false,
        role_patients_history: false,
        role_patients_payments: false
    });

    const [dashboard, setDashboard] = useState(null);

    const { loading } = useContext(LoadingContext);
    const { settings } = useContext(SettingsContext);
    const { authUser } = useContext(AuthUserContext);

    useEffect(() => {
        getDashboardData();
    }, []);

    const getDashboardData = async () => {
        try {
            const { data } = await http.get(apiDashboard);
            setDashboard(data.dashboard);
        } catch (ex) {
            toast.error("An unexpected error occured.");
            console.log(ex);
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDrawerCloseOnSidebarListClick = () => {
        if (isMobileScreen) {
            setMobileOpen(false);
        }
    };

    const handleClickActiveTab = link => {
        for (const list in activeTab) {
            if (list !== link) {
                activeTab[list] = false;
            }
        }
        activeTab[link] = true;
        setActiveTab({ ...activeTab });
    };

    const handleClickActiveTabTrigger = () => {
        setActiveTabTrigger({});
    };

    const handleScrollTop = () => {
        mainElement.current.scrollTo(0, 0);
    };

    /* Menu Today Appointment */
    const handleOpenMenuTodayAppointment = event => {
        setMenuTodayAppointmentAnchorEl(event.currentTarget);
    };

    const handleCloseMenuTodayAppointment = () => {
        setMenuTodayAppointmentAnchorEl(null);
    };

    /* Menu Today Patient Registered */
    const handleOpenMenuTodayPatientRegistered = event => {
        setMenuTodayPatientRegisteredAnchorEl(event.currentTarget);
    };

    const handleCloseMenuTodayPatientRegistered = () => {
        setMenuTodayPatientRegisteredAnchorEl(null);
    };

    /* Menu Today Payment */
    const handleOpenMenuTodayPayment = event => {
        setMenuTodayPaymentAnchorEl(event.currentTarget);
    };

    const handleCloseMenuTodayPayment = () => {
        setMenuTodayPaymentAnchorEl(null);
    };

    /* Menu My Profile */
    const handleOpenMenuMyProfile = event => {
        setMenuMyProfileAnchorEl(event.currentTarget);
    };

    const handleCloseMenuMyProfile = () => {
        setMenuMyProfileAnchorEl(null);
    };

    const drawer = (
        <div>
            <div className={classes.toolbar} />
            <Divider />
            <List>
                <SidebarListItems
                    activeTab={activeTab}
                    setActiveTabTrigger={handleClickActiveTabTrigger}
                    onClickDrawerClose={handleDrawerCloseOnSidebarListClick}
                />
            </List>
        </div>
    );

    const container =
        window !== undefined ? () => window().document.body : undefined;

    return (
        <DashboardContext.Provider
            value={{
                dashboard,
                setDashboard: getDashboardData
            }}
        >
            <ScrollTopContext.Provider value={handleScrollTop}>
                <div className={classes.root}>
                    <CssBaseline />
                    <AppBar position="fixed" className={classes.appBar}>
                        <Toolbar>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                className={classes.menuButton}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography
                                variant="h6"
                                className={classes.title}
                                noWrap
                            >
                                <Hidden smDown implementation="css">
                                    {settings && settings.name}
                                </Hidden>
                            </Typography>
                            <Box display="flex" mr={1.5}>
                                {/* Button Menu Today Appointment */}
                                <Box mr={1}>
                                    <IconButton
                                        edge="end"
                                        aria-label="today appointment"
                                        aria-controls="menuTodayAppointment"
                                        aria-haspopup="true"
                                        onClick={handleOpenMenuTodayAppointment}
                                        color="inherit"
                                    >
                                        <Badge
                                            badgeContent={
                                                dashboard
                                                    ? dashboard.today_appointment
                                                    : 0
                                            }
                                            color="secondary"
                                        >
                                            <ScheduleIcon />
                                        </Badge>
                                    </IconButton>
                                </Box>
                                <RenderByUserRole
                                    redirect={false}
                                    notAllowedUser={["patient"]}
                                >
                                    {/* Button Menu Today Patient Registered */}
                                    <Box mr={1}>
                                        <IconButton
                                            edge="end"
                                            aria-label="today patient registered"
                                            aria-controls="menuTodayPatientRegistered"
                                            aria-haspopup="true"
                                            onClick={
                                                handleOpenMenuTodayPatientRegistered
                                            }
                                            color="inherit"
                                        >
                                            <Badge
                                                badgeContent={
                                                    dashboard
                                                        ? dashboard.today_patient_registered
                                                        : 0
                                                }
                                                color="secondary"
                                            >
                                                <PersonIcon />
                                            </Badge>
                                        </IconButton>
                                    </Box>
                                    {/* Button Menu Today Payment */}
                                    <Box mr={1}>
                                        <IconButton
                                            edge="end"
                                            aria-label="today payment"
                                            aria-controls="menuTodayPayment"
                                            aria-haspopup="true"
                                            onClick={handleOpenMenuTodayPayment}
                                            color="inherit"
                                        >
                                            <Badge
                                                badgeContent={
                                                    dashboard
                                                        ? dashboard.today_payment
                                                        : 0
                                                }
                                                color="secondary"
                                            >
                                                <PaymentIcon />
                                            </Badge>
                                        </IconButton>
                                    </Box>
                                </RenderByUserRole>
                            </Box>
                            {/* Button Menu My Profile */}
                            <Hidden smDown implementation="css">
                                <Button
                                    size="small"
                                    color="inherit"
                                    aria-label="profile of current user"
                                    aria-controls="menuMyAccount"
                                    aria-haspopup="true"
                                    onClick={handleOpenMenuMyProfile}
                                    startIcon={
                                        <StyledAvatar
                                            alt={
                                                authUser ? authUser.name : null
                                            }
                                            src={
                                                authUser ? authUser.image : null
                                            }
                                        />
                                    }
                                >
                                    {authUser ? authUser.role : ""}
                                </Button>
                            </Hidden>
                            <Hidden mdUp implementation="css">
                                <IconButton
                                    edge="end"
                                    aria-label="profile of current user"
                                    aria-controls="menuMyAccount"
                                    aria-haspopup="true"
                                    onClick={handleOpenMenuMyProfile}
                                    color="inherit"
                                >
                                    <StyledAvatar
                                        alt={authUser ? authUser.name : null}
                                        src={authUser ? authUser.image : null}
                                    />
                                </IconButton>
                            </Hidden>
                        </Toolbar>
                        {loading && <LinearProgress />}
                    </AppBar>
                    {/* Menu Today Appointment */}
                    <MenuTodayAppointment
                        anchorEl={menuTodayAppointmentAnchorEl}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right"
                        }}
                        id="menuTodayAppointment"
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right"
                        }}
                        open={Boolean(menuTodayAppointmentAnchorEl)}
                        onClose={handleCloseMenuTodayAppointment}
                    />
                    {/* Menu Today Patient Registered */}
                    <MenuTodayPatientRegistered
                        anchorEl={menuTodayPatientsRegisteredAnchorEl}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right"
                        }}
                        id="menuTodayPatientRegistered"
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right"
                        }}
                        open={Boolean(menuTodayPatientsRegisteredAnchorEl)}
                        onClose={handleCloseMenuTodayPatientRegistered}
                    />
                    {/* Menu Today Payment */}
                    <MenuTodayPayment
                        anchorEl={menuTodayPaymentAnchorEl}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right"
                        }}
                        id="menuTodayPayment"
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right"
                        }}
                        open={Boolean(menuTodayPaymentAnchorEl)}
                        onClose={handleCloseMenuTodayPayment}
                    />
                    {/* Menu My Account */}
                    <MenuMyProfile
                        anchorEl={menuMyProfileAnchorEl}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right"
                        }}
                        id="menuMyAccount"
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right"
                        }}
                        open={Boolean(menuMyProfileAnchorEl)}
                        onClose={handleCloseMenuMyProfile}
                    />
                    <nav className={classes.drawer} aria-label="sidebar-list">
                        <Hidden mdUp implementation="css">
                            <Drawer
                                container={container}
                                variant="temporary"
                                anchor={
                                    theme.direction === "rtl" ? "right" : "left"
                                }
                                open={mobileOpen}
                                onClose={handleDrawerToggle}
                                classes={{
                                    paper: classes.drawerPaper
                                }}
                                ModalProps={{
                                    keepMounted: true // Better open performance on mobile.
                                }}
                            >
                                {drawer}
                            </Drawer>
                        </Hidden>
                        <Hidden smDown implementation="css">
                            <Drawer
                                classes={{
                                    paper: classes.drawerPaper
                                }}
                                variant="permanent"
                                open
                            >
                                {drawer}
                            </Drawer>
                        </Hidden>
                    </nav>
                    <main className={classes.content} ref={mainElement}>
                        <div className={classes.toolbar} />
                        <ContentRoute
                            activeTabTrigger={activeTabTrigger}
                            setActiveTab={handleClickActiveTab}
                        />
                    </main>
                </div>
            </ScrollTopContext.Provider>
        </DashboardContext.Provider>
    );
}

export default Home;
