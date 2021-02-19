import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export default function EditCommandDialog({ command, open, editCommandCallback, onClose }) {
    const classes = useStyles();
    const [editedCommand, setEditedCommand] = React.useState(command);
    React.useEffect(() => {
        setEditedCommand(command);
    }, [command]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">Command</DialogTitle>
            <form noValidate onSubmit={(e) => {
                      e.preventDefault();
                      editCommandCallback(editedCommand);
                  }}>
                <DialogContent>
                    <DialogContentText>Create or edit a command</DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="description"
                        value={editedCommand.description}
                        onChange={(e) =>
                            setEditedCommand({
                                ...editedCommand,
                                ["description"]: e.target.value,
                            })
                        }
                        label="Description"
                        type="description"
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        value={editedCommand.cmd}
                        onChange={(e) =>
                            setEditedCommand({
                                ...editedCommand,
                                ["cmd"]: e.target.value,
                            })
                        }
                        id="cmd"
                        label="Command Template"
                        type="text"
                        fullWidth
                    />
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="age-native-helper">Command Impact</InputLabel>
                        <NativeSelect
                            value={editedCommand.danger}
                            onChange={(e) =>
                                setEditedCommand({
                                    ...editedCommand,
                                    ["danger"]: e.target.checked,
                                })
                            }
                            inputProps={{
                                name: 'age',
                                id: 'age-native-helper',
                            }}
                        >
                            <option aria-label="None" value="" />
                            <option value={1}>Safe</option>
                            <option value={2}>Low</option>
                            <option value={3}>Medium</option>
                            <option value={4}>High</option>
                            <option value={5}>Extreme</option>
                        </NativeSelect>
                        <FormHelperText>Some important helper text</FormHelperText>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Cancel
                    </Button>
                    <Button type="submit" color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
