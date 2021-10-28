import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const TextFieldDisabledDarker = withStyles({
    root: {
        marginRight: 8,
        "& .MuiInputBase-root.Mui-disabled": {
            color: "rgb(0, 0, 0)" // (default alpha is 0.38)
        }
    }
})(TextField);

export default TextFieldDisabledDarker;
