import React from "react";
import { PropTypes } from "prop-types";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

function DialogWrapper(props) {
    const {
        open,
        onClose,
        title,
        description,
        renderContent,
        buttonSecondaryText,
        buttonPrimaryText,
        onClickButtonPrimary,
        options
    } = props;
    return (
        <div>
            <Dialog
                open={open}
                onClose={onClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                {...options}
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {description}
                    </DialogContentText>
                    {renderContent && renderContent(props)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        {buttonSecondaryText}
                    </Button>
                    <Button
                        onClick={onClickButtonPrimary}
                        color="primary"
                        autoFocus
                    >
                        {buttonPrimaryText}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

DialogWrapper.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    renderContent: PropTypes.func,
    buttonSecondaryText: PropTypes.string.isRequired,
    buttonPrimaryText: PropTypes.string.isRequired,
    onClickButtonPrimary: PropTypes.func.isRequired,
    options: PropTypes.object
};

export default DialogWrapper;
