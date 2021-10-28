import React from "react";
import Badge from "@material-ui/core/Badge";
import Avatar from "@material-ui/core/Avatar";
import { withStyles } from "@material-ui/core/styles";

const StyledBadge = withStyles(theme => ({
    badge: {
        backgroundColor: "#44b700",
        color: "#44b700",
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        "&::after": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "1px solid currentColor",
            content: '""'
            // Ripple Effects
            // animation: "$ripple 1.2s infinite ease-in-out",
        }
    }
    // Ripple Effects
    // "@keyframes ripple": {
    //     "0%": {
    //         transform: "scale(.8)",
    //         opacity: 1
    //     },
    //     "100%": {
    //         transform: "scale(2.4)",
    //         opacity: 0
    //     }
    // }
}))(Badge);

const SmallAvatar = withStyles(theme => ({
    root: {
        width: 22,
        height: 22,
        border: `2px solid ${theme.palette.background.paper}`
    }
}))(Avatar);

function StyledAvatar(props) {
    return (
        <StyledBadge
            overlap="circle"
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right"
            }}
            variant="dot"
        >
            <SmallAvatar alt={props.alt} src={props.src} />
        </StyledBadge>
    );
}

export default StyledAvatar;
