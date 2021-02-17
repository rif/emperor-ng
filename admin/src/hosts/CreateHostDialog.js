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


export default function FormDialog({ host, status, editHostCallback }) {
    const defaultHost = {
        id: "",
        name: "",
        address: "",
    };
    const [open, setOpen] = React.useState(status);
    const [editedHost, setEditedHost] = React.useState({
        id: host.id,
        name: host.name,
        address: host.address,
    });

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditedHost(defaultHost);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        editHostCallback(editedHost);
        handleClose();
    };

    React.useEffect(() => {
        setEditedHost(host);
        setOpen(status);
    }, [host, status]);

    return (
        <div>
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                New Host
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Host</DialogTitle>
                <form noValidate onSubmit={handleSubmit}>
                    <DialogContent>
                        <DialogContentText>Create or edit a host</DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            value={editedHost.name}
                            onChange={(e) =>
                                setEditedHost({
                                    ...editedHost,
                                    ["name"]: e.target.value,
                                })
                            }
                            label="Name"
                            type="name"
                            fullWidth
                        />
                        <TextField
                            margin="dense"
                            value={editedHost.address}
                            onChange={(e) =>
                                setEditedHost({
                                    ...editedHost,
                                    ["address"]: e.target.value,
                                })
                            }
                            id="address"
                            label="IP Address"
                            type="text"
                            fullWidth
                        />

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
