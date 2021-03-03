import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";


export default function EditHostDialog({ host, open, editHostCallback, onClose }) {
    const [editedHost, setEditedHost] = React.useState(host);
    React.useEffect(() => {
        setEditedHost(host);
    }, [host]);
    return  (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">Host</DialogTitle>
            <form noValidate onSubmit={(e) => {
                      e.preventDefault();
                      editHostCallback(editedHost);
                  }}>
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
                    <TextField
                        margin="dense"
                        value={editedHost.port}
                        onChange={(e) =>
                            setEditedHost({
                                ...editedHost,
                                ["port"]: e.target.value,
                            })
                        }
                        id="port"
                        label="SSH Port"
                        type="text"
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        value={editedHost.description}
                        onChange={(e) =>
                            setEditedHost({
                                ...editedHost,
                                ["description"]: e.target.value,
                            })
                        }
                        id="description"
                        label="Description"
                        type="text"
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
