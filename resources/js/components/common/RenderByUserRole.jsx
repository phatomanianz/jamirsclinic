import React, { useContext } from "react";

import { Redirect } from "react-router-dom";

import { AuthUserContext } from "../context/context";

function RenderByUserRole(props) {
    props = { ...RenderByUserRole.defaultProps, ...props };
    const { authUser } = useContext(AuthUserContext);

    let isNotAllowedUser = false;
    if (props.notAllowedUser.length && authUser) {
        isNotAllowedUser = props.notAllowedUser.some(
            user => user === authUser.role
        );
    }

    if (isNotAllowedUser) {
        return props.redirect ? <Redirect to="/home/404" /> : null;
    }

    return props.children;
}

RenderByUserRole.defaultProps = {
    notAllowedUser: [],
    redirect: true
};

export default RenderByUserRole;
