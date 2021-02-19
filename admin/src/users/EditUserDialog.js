import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function EditUserDialog({ user, open, editUserCallback, onClose }) {
    const [editedUser, setEditedUser] = React.useState(user);
    React.useEffect(() => {
        setEditedUser(user);
    }, [user]);
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">User</DialogTitle>
            <form noValidate onSubmit={(e) => {
                      e.preventDefault();
                      editUserCallback(editedUser);
                  }}>
                <DialogContent>
                    <DialogContentText>Create or edit a user</DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        value={editedUser.email}
                        onChange={(e) =>
                            setEditedUser({
                                ...user,
                                ["email"]: e.target.value,
                            })
                        }
                        label="Email Address"
                        type="email"
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        value={editedUser.firstName}
                        onChange={(e) =>
                            setEditedUser({
                                ...user,
                                ["firstName"]: e.target.value,
                            })
                        }
                        id="firstName"
                        label="FirstName"
                        type="text"
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        value={editedUser.lastName}
                        onChange={(e) =>
                            setEditedUser({
                                ...user,
                                ["lastName"]: e.target.value,
                            })
                        }
                        id="lastName"
                        label="LastName"
                        type="text"
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        value={editedUser.phone}
                        onChange={(e) =>
                            setEditedUser({
                                ...user,
                                ["phone"]: e.target.value,
                            })
                        }
                        label="Phone"
                        type="text"
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        onChange={(e) =>
                            setEditedUser({
                                ...user,
                                ["pass"]: e.target.value,
                            })
                        }
                        label="Pass"
                        type="password"
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
