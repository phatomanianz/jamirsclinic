import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const TextFieldDisabledDark = withStyles({
    root: {
        marginRight: 8,
        "& .MuiInputBase-root.Mui-disabled": {
            color: "rgba(0, 0, 0, 0.6)" // (default alpha is 0.38)
        }
    }
})(TextField);

export default TextFieldDisabledDark;
