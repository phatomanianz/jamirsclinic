import http from "../services/http";
import { toast } from "react-toastify";

const apiUser = "api/user";

async function login(email, password) {
    const { data } = await http.post(`${apiUser}/login`, {
        email,
        password
    });

    return data;
}

async function logout() {
    let status = true;
    try {
        await http.post(`${apiUser}/logout`);
    } catch (ex) {
        if (ex.response && ex.response.status === 401) {
            status = false;
            toast.error("An unexpected error occured.");
        }
    }

    return status;
}

async function validateUser() {
    let data = null;
    try {
        const dataResponsed = await http.get(`${apiUser}/validate-token`);
        data = dataResponsed.data;
    } catch (ex) {
        if (ex.response && ex.response.status === 401) {
            // User not authenticated. Do nothing...
        }
    }
    return data;
}

export default {
    login,
    logout,
    validateUser
};
