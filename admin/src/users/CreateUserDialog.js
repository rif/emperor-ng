import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [id, setId] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [pass, setPass] = React.useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`/adm/user?csrf=${window.csrf}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        password: pass,
      }),
    })
      .then((response) => response.text())
      .then((text) => {
        setPass("");
        setId(text);
        /*if (this.editedIndex > -1) {
                Object.assign(this.items[this.editedIndex], this.editedItem);
        } else {
          this.items.push(this.editedItem);
          }*/
      });
    setOpen(false);
  };

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email Address"
              type="email"
              fullWidth
            />
            <TextField
              margin="dense"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              id="firstName"
              label="FirstName"
              type="text"
              fullWidth
            />
            <TextField
              margin="dense"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              id="lastName"
              label="LastName"
              type="text"
              fullWidth
            />
            <TextField
              margin="dense"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              label="Phone"
              type="text"
              fullWidth
            />
            <TextField
              margin="dense"
              onChange={(e) => setPass(e.target.value)}
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
