import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function EditGroupDialog({ group, open, editGroupCallback, onClose}) {
    const [editedGroup, setEditedGroup] = React.useState(group);
    React.useEffect(() => {
        setEditedGroup(group);
    }, [group]);
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">Group</DialogTitle>
            <form noValidate onSubmit={(e) => {
                      e.preventDefault();
                      editGroupCallback(editedGroup);
                  }}>
                <DialogContent>
                    <DialogContentText>Create or edit a group</DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        value={editedGroup.name}
                        onChange={(e) =>
                            setEditedGroup({
                                ...editedGroup,
                                name: e.target.value,
                            })
                        }
                        label="GroupName"
                        type="name"
                        fullWidth
                    />
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
