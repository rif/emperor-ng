import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Button from '@material-ui/core/Button';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import PersonIcon from '@material-ui/icons/Person';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
}));

export default function UserGroupsDialog({ user, groups, allGroups }) {
    const classes = useStyles();
    const [checked, setChecked] = React.useState([]);
    const [showDialog, setShowDialog] = React.useState(false);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };
    const handleClose = () => {
        setShowDialog(false);
    };

    const handleSubmit = () => {
        fetch(`/adm/usergroup/${user.id}?csrf=${window.csrf}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({newGroups:checked}),
        }).then((resp) => {
            setShowDialog(false);
            if (resp.status !== 200) {
                alert("Could not set user groups!");
            }
        });
    };

    React.useEffect(() => {
        setChecked(groups);
        setShowDialog(user.id !== '');
    }, [groups,allGroups]);

    return (
        <Dialog aria-labelledby="simple-dialog-title" open={showDialog} onClose={handleClose}>
            <DialogTitle id="simple-dialog-title">Additional Groups</DialogTitle>
            <DialogContent>
                <List className={classes.root}>
                    {allGroups.map((ag) => {
                        const labelId = `checkbox-list-label-${ag.id}`;

                        return (
                            <ListItem key={ag.id} role={undefined} dense button onClick={handleToggle(ag.id)}>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={checked.indexOf(ag.id) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={ag.name} />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="comments">
                                        <PersonIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        );
                    })}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary" autoFocus>
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

UserGroupsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    groups: PropTypes.array.isRequired,
    allGroups: PropTypes.array.isRequired,
};
