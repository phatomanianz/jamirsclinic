import React, { useContext } from "react";

import { useHistory } from "react-router-dom";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import { LoadingContext } from "../../../../context/context";
import auth from "../../../../../services/auth";

function MenuMyProfile(props) {
    const history = useHistory();
    const { setLoading } = useContext(LoadingContext);

    const handleClickMyAccount = () => {
        history.push("/home/profile");
        props.onClose();
    };

    const handleClickLogout = async () => {
        setLoading(true);
        await auth.logout();
        setLoading(false);
        history.push("/login");
    };

    return (
        <Menu {...props}>
            <MenuItem onClick={handleClickMyAccount}>My profile</MenuItem>
            <MenuItem onClick={handleClickLogout}>Logout</MenuItem>
        </Menu>
    );
}

export default MenuMyProfile;
