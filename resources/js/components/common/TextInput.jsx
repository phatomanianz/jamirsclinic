import React from "react";
import { useField } from "formik";
import TextField from "@material-ui/core/TextField";

function TextInput(props) {
    // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
    // which we can spread on <input> and also replace ErrorMessage entirely.
    const [field, meta] = useField(props);
    return props.noFormikValidation ? (
        <TextField
            {...props}
            {...(props.error ? { error: true, helperText: props.error } : {})}
        />
    ) : (
        <TextField
            {...props}
            {...field}
            {...(meta.touched && meta.error
                ? { error: true, helperText: meta.error }
                : {})}
        />
    );
}

export default TextInput;
