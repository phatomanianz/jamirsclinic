import React from "react";

import { Redirect, Switch, Route, useRouteMatch } from "react-router-dom";

/* Dashboard */
import Dashboard from "../home_inner/dashboard/Dashboard";
/* Doctors */
import DoctorsHistories from "./../home_inner/doctors/DoctorsHistories";
import DoctorAppointments from "./../home_inner/doctors/DoctorAppointments";
import DoctorPresciptions from "./../home_inner/doctors/DoctorPrescriptions";
/* Patients */
import Patients from "../home_inner/patients/Patients";
import PatientAddEdit from "../home_inner/patients/PatientAddEdit";
import PatientView from "../home_inner/patients/PatientView";
import PatientHistory from "../home_inner/patients/PatientHistory";
import CaseHistories from "../home_inner/patients/CaseHistories";
import CaseHistoryAddEdit from "../home_inner/patients/CaseHistoryAddEdit";
import CaseHistoryView from "../home_inner/patients/CaseHistoryView";
import Documents from "../home_inner/patients/Documents";
import DocumentAddEdit from "../home_inner/patients/DocumentAddEdit";
import PatientPayments from "../home_inner/patients/PatientPayments";
import PatientPaymentsInvoiceDeposits from "../home_inner/patients/PatientPaymentsInvoiceDeposits";
/* Prescriptions */
import Prescriptions from "../home_inner/prescriptions/Prescriptions";
import PrescriptionAddEdit from "../home_inner/prescriptions/PrescriptionAddEdit";
import PrescriptionView from "../home_inner/prescriptions/PrescriptionView";
/* Appointments*/
import Appointments from "../home_inner/appointments/Appointments";
import AppointmentAddEdit from "./../home_inner/appointments/AppointmentAddEdit";
/* Payments */
import Payments from "../home_inner/payments/Payments";
import PaymentAddEdit from "../home_inner/payments/PaymentAddEdit";
import PaymentView from "../home_inner/payments/PaymentView";
/* Inventory */
import InventoryCategories from "../home_inner/inventory/InventoryCategories";
import InventoryTreatments from "../home_inner/inventory/InventoryTreatments";
import InventoryTreatmentAddEdit from "../home_inner/inventory/InventoryTreatmentAddEdit";
import InventoryStocks from "../home_inner/inventory/InventoryStocks";
import InventoryStockAddEdit from "../home_inner/inventory/InventoryStockAddEdit";
/* Users */
import Users from "../home_inner/users/Users";
import UserAddEdit from "../home_inner/users/UserAddEdit";
/* Settings */
import Settings from "./../home_inner/settings/Settings";
/* My Profile */
import MyProfile from "../home_inner/my_profile/MyProfile";
/* Utilities */
import NotFound from "../../NotFound";

import RenderByUserRole from "../../../../common/RenderByUserRole";

function ContentRoute(props) {
    let match = useRouteMatch();

    const renderRoute = (path, Component, componentProps, notExact) => {
        return (notAllowedUser = []) => (
            <Route
                {...(notExact ? {} : { exact: true })}
                path={`${match.path}/${path}`}
                render={propsRoute => (
                    <RenderByUserRole notAllowedUser={notAllowedUser}>
                        <Component
                            {...componentProps}
                            {...propsRoute}
                            activeTabTrigger={props.activeTabTrigger}
                            setActiveTab={props.setActiveTab}
                        />
                    </RenderByUserRole>
                )}
            />
        );
    };

    return (
        <Switch>
            {/* Dashboard */}
            {renderRoute("dashboard", Dashboard)()}
            {/* Doctors */}
            {renderRoute("doctors", DoctorsHistories)(["doctor", "patient"])}
            {renderRoute(
                "doctors/:doctorID/appointments",
                DoctorAppointments
            )(["doctor", "patient"])}
            {renderRoute(
                "doctors/:doctorID/prescriptions",
                DoctorPresciptions
            )(["doctor", "patient"])}
            {/* Patients */}
            {renderRoute("patients", Patients)(["patient"])}
            {renderRoute("patients/add", PatientAddEdit, { action: "add" })([
                "patient"
            ])}
            {renderRoute("patients/:patientID/edit", PatientAddEdit, {
                action: "edit"
            })(["patient"])}
            {renderRoute("patients/:patientID/view", PatientView)(["patient"])}
            {renderRoute(
                "patients/:patientID/appointments/add",
                AppointmentAddEdit,
                {
                    action: "add"
                }
            )()}
            {renderRoute(
                "patients/:patientID/appointments/:appointmentID/edit",
                AppointmentAddEdit,
                {
                    action: "edit"
                }
            )(["patient"])}
            {renderRoute("patients/:patientID/history", PatientHistory)()}
            {renderRoute(
                "patients/:patientID/history/casehistories/add",
                CaseHistoryAddEdit,
                { action: "add" }
            )(["patient"])}
            {renderRoute(
                "patients/:patientID/history/casehistories/:caseHistoryID/edit",
                CaseHistoryAddEdit,
                { action: "edit" }
            )(["patient"])}
            {renderRoute(
                "patients/:patientID/history/casehistories/:caseHistoryID/view",
                CaseHistoryView
            )()}
            {renderRoute(
                "patients/:patientID/history/prescriptions/add",
                PrescriptionAddEdit,
                { action: "add" }
            )(["receptionist", "patient"])}
            {renderRoute(
                "patients/:patientID/history/prescriptions/:prescriptionID/edit",
                PrescriptionAddEdit,
                { action: "edit" }
            )(["receptionist", "patient"])}
            {renderRoute(
                "patients/:patientID/history/prescriptions/:prescriptionID/view",
                PrescriptionView
            )()}
            {renderRoute(
                "patients/:patientID/history/documents/add",
                DocumentAddEdit,
                { action: "add" }
            )(["patient"])}
            {renderRoute(
                "patients/:patientID/history/documents/:documentID/edit",
                DocumentAddEdit,
                { action: "edit" }
            )(["patient"])}
            {renderRoute(
                "patients/:patientID/history/appointments/add",
                AppointmentAddEdit,
                { action: "add" }
            )()}
            {renderRoute(
                "patients/:patientID/history/appointments/:appointmentID/edit",
                AppointmentAddEdit,
                { action: "edit" }
            )(["patient"])}
            {renderRoute("patients/:patientID/payments", PatientPayments)()}
            {renderRoute("patients/:patientID/payments/add", PaymentAddEdit, {
                action: "add"
            })(["patient"])}
            {renderRoute(
                "patients/:patientID/payments/:invoiceID/edit",
                PaymentAddEdit,
                {
                    action: "edit"
                }
            )(["patient"])}
            {renderRoute(
                "patients/:patientID/payments/:invoiceID/view",
                PaymentView
            )()}
            {renderRoute(
                "patients/:patientID/payments/:invoiceID/deposits",
                PatientPaymentsInvoiceDeposits
            )(["patient"])}
            {renderRoute("casehistories", CaseHistories)()}
            {renderRoute("casehistories/add", CaseHistoryAddEdit, {
                action: "add"
            })(["patient"])}
            {renderRoute(
                "casehistories/:caseHistoryID/edit",
                CaseHistoryAddEdit,
                {
                    action: "edit"
                }
            )(["patient"])}
            {renderRoute(
                "casehistories/:caseHistoryID/view",
                CaseHistoryView
            )()}
            {renderRoute("documents", Documents)()}
            {renderRoute("documents/add", DocumentAddEdit, { action: "add" })([
                "patient"
            ])}
            {renderRoute("documents/:documentID/edit", DocumentAddEdit, {
                action: "edit"
            })(["patient"])}
            {/* Prescriptions */}
            {renderRoute("prescriptions", Prescriptions)()}
            {renderRoute("prescriptions/add", PrescriptionAddEdit, {
                action: "add"
            })(["receptionist", "patient"])}
            {renderRoute(
                "prescriptions/:prescriptionID/edit",
                PrescriptionAddEdit,
                {
                    action: "edit"
                }
            )(["receptionist", "patient"])}
            {renderRoute(
                "prescriptions/:prescriptionID/view",
                PrescriptionView
            )()}
            {/* Appointments */}
            {renderRoute("appointments/add", AppointmentAddEdit, {
                action: "add"
            })()}
            {renderRoute("appointments/:type/add", AppointmentAddEdit, {
                action: "add"
            })()}
            {renderRoute(
                "appointments/:type/:appointmentID/edit",
                AppointmentAddEdit,
                {
                    action: "edit"
                }
            )(["patient"])}
            {renderRoute("appointments/:type", Appointments)()}
            {/* Payments */}
            {renderRoute("payments", Payments)()}
            {renderRoute("payments/add", PaymentAddEdit, { action: "add" })([
                "patient"
            ])}
            {renderRoute("payments/:invoiceID/edit", PaymentAddEdit, {
                action: "edit"
            })(["patient"])}
            {renderRoute("payments/:invoiceID/view", PaymentView)()}
            {/* Inventory */}
            {renderRoute(
                "inventory/categories",
                InventoryCategories
            )(["patient"])}
            {renderRoute(
                "inventory/treatments",
                InventoryTreatments
            )(["patient"])}
            {renderRoute(
                "inventory/treatments/add",
                InventoryTreatmentAddEdit,
                { action: "add" }
            )(["receptionist", "patient"])}
            {renderRoute(
                "inventory/treatments/:treatmentId/edit",
                InventoryTreatmentAddEdit,
                { action: "edit" }
            )(["receptionist", "patient"])}
            {renderRoute("inventory/stocks", InventoryStocks)(["patient"])}
            {renderRoute("inventory/stocks/add", InventoryStockAddEdit, {
                action: "add"
            })(["patient"])}
            {renderRoute(
                "inventory/stocks/:stockId/edit",
                InventoryStockAddEdit,
                {
                    action: "edit"
                }
            )(["patient"])}
            {/* Users */}
            {renderRoute(
                "users/:type",
                Users
            )(["doctor", "receptionist", "patient"])}
            {renderRoute("users/:type/add", UserAddEdit, { action: "add" })([
                "doctor",
                "receptionist",
                "patient"
            ])}
            {renderRoute("users/:type/:id/edit", UserAddEdit, {
                action: "edit"
            })(["doctor", "receptionist", "patient"])}
            {/* Settings */}
            {renderRoute(
                "settings",
                Settings
            )(["doctor", "receptionist", "patient"])}
            {/* My Profile */}
            {renderRoute("profile", MyProfile)()}
            {/* 404 Not Found */}
            {renderRoute("404", NotFound)()}
            {/* HOME */}
            <Redirect
                exact
                from={`${match.path}`}
                to={`${match.path}/dashboard`}
            />
            {/* Invalid Path Redirect to 404 Not Found */}
            <Redirect to={`${match.path}/404`} />
        </Switch>
    );
}

export default ContentRoute;
