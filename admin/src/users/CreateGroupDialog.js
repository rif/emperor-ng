import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function FormDialog({ group, status, editGroupCallback }) {
  const defaultGroup = {
    id: "",
    name: "",
  };
  const [open, setOpen] = React.useState(status);
  const [editedGroup, setEditedGroup] = React.useState({
    id: group.id,
    name: group.name,
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditedGroup(defaultGroup);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editGroupCallback(editedGroup);
    handleClose();
  };

  React.useEffect(() => {
    setEditedGroup(group);
    setOpen(status);
  }, [group, status]);

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        New Group
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Group</DialogTitle>
        <form noValidate onSubmit={handleSubmit}>
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
