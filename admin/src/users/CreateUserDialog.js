import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function FormDialog({ user, status, editUserCallback }) {
  const defaultUser = {
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  };
  const [open, setOpen] = React.useState(status);
  const [editedUser, setEditedUser] = React.useState({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditedUser(defaultUser);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editUserCallback(editedUser);
    handleClose();
  };

  React.useEffect(() => {
    setEditedUser(user);
    setOpen(status);
  }, [user, status]);

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        New User
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">User</DialogTitle>
        <form noValidate onSubmit={handleSubmit}>
          <DialogContent>
            <DialogContentText>Create or edit a user</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="email"
              value={editedUser.email}
              onChange={(e) =>
                setEditedUser({
                  ...editedUser,
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
                  ...editedUser,
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
                  ...editedUser,
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
                  ...editedUser,
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
                  ...editedUser,
                  ["pass"]: e.target.value,
                })
              }
              label="Pass"
              type="password"
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
