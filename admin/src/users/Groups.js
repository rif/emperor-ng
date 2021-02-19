import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from '../dashboard/Title';
import EditGroupDialog from "./EditGroupDialog";

export default function Groups() {
    const [groups, setGroups] = React.useState([]);
    const [showDialog, setShowDialog] = React.useState(false);
    const [editedGroup, setEditedGroup] = React.useState({
        id: "",
        name: "",
    });

    const handleEditGroup = (group) => {
        fetch(`/adm/group?csrf=${window.csrf}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: group.id,
                name: group.name,
            }),
        })
            .then((resp) => resp.text())
            .then((text) => {
                group.id = text;
                const newGroups = [...groups];
                let found = false;
                for (let i = 0; i < newGroups.length; i++) {
                    if (newGroups[i].id === group.id) {
                        newGroups[i] = group;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    newGroups.push(group);
                }
                setGroups(newGroups);
                handleDialogClose();
            });
    };

    const handleRemoveGroup = (group) => {
        if (window.confirm("Are you soure you want to delete this group?")) {
            const newGroups = [...groups];
            let index = -1;
            for (let i = 0; i < newGroups.length; i++) {
                if (newGroups[i].id === group.id) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                newGroups.splice(index, 1);
                console.log("delete group: ", JSON.stringify(group), index);
                fetch(`/adm/group?csrf=${window.csrf}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(group),
                })
                    .then((resp) => {
                        if (resp.status === 200) {
                            setGroups(newGroups);
                        } else {
                            alert("Could not delete group!");
                        }
                    })
                    .catch((err) => {
                        alert("error deleting group: " + err);
                    });
            }
        }
    };

    const handleDialogClose = () => {
        setShowDialog(false);
    }

    const handleClickOpen = () => {
        setShowDialog(true);
    };

    const editIcon = row => (
        <IconButton onClick={() => {
                        setEditedGroup(row);
                        setShowDialog(true);
                    }}>
            <EditIcon color="primary" />
        </IconButton>
    );

    var deleteIcon = row => (
        <IconButton onClick={() => {
                        handleRemoveGroup(row);
                    }}>
            <DeleteIcon color="secondary" />
        </IconButton>
    );

    React.useEffect(() => {
        fetch("/adm/groups")
            .then((response) => response.json())
            .then((json) => {
                setGroups(json.items);
            });
    }, []);

    return (
        <React.Fragment>
            <Button style={{float:'right'}} variant="outlined" color="primary" onClick={ () => {
                        setEditedGroup({id: "", email: "", firstName: "", lastName: "", phone: ""})
                        handleClickOpen();
                    }}>New Group</Button>
            <EditGroupDialog open={showDialog} group={editedGroup} editGroupCallback={handleEditGroup} onClose={handleDialogClose}/>
            <Title>Groups</Title>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {groups.map((group) => (
                        <TableRow key={group.id}>
                            <TableCell>{group.name}</TableCell>
                            <TableCell align="right">
                                {editIcon(group)}
                                {deleteIcon(group)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </React.Fragment>
    );
}
