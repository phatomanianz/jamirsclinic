import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
    baseURL: process.env.MIX_APP_URL
});

api.interceptors.response.use(null, error => {
    const expectedError =
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500;

    if (!expectedError) {
        console.log(error);
        toast.error("An unexpected error occured.");
    }

    return Promise.reject(error);
});

api.defaults.headers.post["Content-Type"] = "application/json";

export default {
    get: api.get,
    put: api.put,
    post: api.post,
    patch: api.patch,
    delete: api.delete
};
