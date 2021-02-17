import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';


export default function FormDialog({ command, status, editCommandCallback }) {
    const defaultCommand = {
        id: "",
        description: "",
        cmd: "",
        danger: false,
    };
    const [open, setOpen] = React.useState(status);
    const [editedCommand, setEditedCommand] = React.useState({
        id: command.id,
        description: command.description,
        cmd: command.cmd,
        danger: command.danger,
    });

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditedCommand(defaultCommand);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        editCommandCallback(editedCommand);
        handleClose();
    };

    React.useEffect(() => {
        setEditedCommand(command);
        setOpen(status);
    }, [command, status]);

    return (
        <div>
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                New Command
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Command</DialogTitle>
                <form noValidate onSubmit={handleSubmit}>
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
                        <FormControlLabel control={<Checkbox name="checkedC" />} label="Dangerous Command" checked={editedCommand.danger} onChange={(e) =>
                                              setEditedCommand({
                                                  ...editedCommand,
                                                  ["danger"]: e.target.checked,
                                              })
                                          }/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}
