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


export default function EditCommandDialog({ command, open, editCommandCallback, onClose }) {
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
                    <FormControlLabel control={<Checkbox name="checkedC" />} label="Dangerous Command" checked={editedCommand.danger} onChange={(e) =>
                                          setEditedCommand({
                                              ...editedCommand,
                                              ["danger"]: e.target.checked,
                                          })
                                      }/>
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
