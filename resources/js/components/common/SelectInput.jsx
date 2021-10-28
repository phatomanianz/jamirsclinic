import React from "react";
import { PropTypes } from "prop-types";

import { useField } from "formik";

import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles(theme => ({
    formControl: {
        width: "100%"
    }
}));

function SelectInput(props) {
    const classes = useStyles();

    const {
        noFormikValidation,
        onChange,
        value,
        variant,
        size,
        inputLabel,
        inputLabelId,
        id,
        name,
        items
    } = props;

    // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
    // which we can spread on <input> and also replace ErrorMessage entirely.
    const [field, meta] = !noFormikValidation ? useField(props) : [null, null];

    return (
        <FormControl
            variant={variant}
            size={size}
            className={classes.formControl}
            error={
                !noFormikValidation && meta.touched && meta.error ? true : false
            }
        >
            <InputLabel id={inputLabelId}>{inputLabel}</InputLabel>
            <Select
                {...(!noFormikValidation ? field : { value, onChange })}
                labelId={inputLabelId}
                id={id}
                name={name}
                label={inputLabel}
            >
                {items.map((item, index) => (
                    <MenuItem key={index} value={item.value}>
                        {item.label}
                    </MenuItem>
                ))}
            </Select>
            {!noFormikValidation && meta.touched && meta.error && (
                <FormHelperText>{meta.error}</FormHelperText>
            )}
        </FormControl>
    );
}

SelectInput.propTypes = {
    noFormikValidation: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onChange: PropTypes.func,
    variant: PropTypes.string.isRequired,
    size: PropTypes.string,
    inputLabel: PropTypes.string.isRequired,
    inputLabelId: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired
};

export default SelectInput;
