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
import UserGroupsDialog from "./UserGroupsDialog";
import EditUserDialog from "./CreateUserDialog";

export default function Users() {
    const [users, setUsers] = React.useState([]);
    const [showDialog, setShowDialog] = React.useState(false);
    const [showUserGroupsDialog, setShowUserGroupsDialog] = React.useState(false);
    const [userGroups, setUserGroups] = React.useState([]);
    const [groups, setGroups] = React.useState([]);
    const [editedUser, setEditedUser] = React.useState({
        id: "",
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
    });

    const handleEditUser = (user) => {
        fetch(`/adm/user?csrf=${window.csrf}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                password: user.pass,
            }),
        })
            .then((resp) => resp.text())
            .then((text) => {
                user.pass = "";
                user.id = text;
                const newUsers = [...users];
                let found = false;
                for (let i = 0; i < newUsers.length; i++) {
                    if (newUsers[i].id === user.id) {
                        newUsers[i] = user;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    newUsers.push(user);
                }
                setUsers(newUsers);
                handleDialogClose();
            });
    };

    const handleRemoveUser = (user) => {
        if (window.confirm("Are you soure you want to delete this user?")) {
            const newUsers = [...users];
            let index = -1;
            for (let i = 0; i < newUsers.length; i++) {
                if (newUsers[i].id === user.id) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                newUsers.splice(index, 1);
                console.log("delete user: ", JSON.stringify(user), index);
                fetch(`/adm/user?csrf=${window.csrf}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(user),
                })
                    .then((resp) => {
                        if (resp.status === 200) {
                            setUsers(newUsers);
                        } else {
                            alert("Could not delete user!");
                        }
                    })
                    .catch((err) => {
                        alert("error deleting user: " + err);
                    });
            }
        }
    };

    const handleUserGroupsDialogClose = () => {
        setShowUserGroupsDialog(false);
    }

    const handleDialogClose = () => {
        setShowDialog(false);
    }

    const handleClickOpen = () => {
        setShowDialog(true);
    };

    const editIcon = row => (
        <IconButton onClick={() => {
                        setEditedUser(row);
                        setShowDialog(true);
                    }}>
            <EditIcon color="primary" />
        </IconButton>
    );

    var toggleAdminIcon = row => (
        <IconButton onClick={() => {
                        fetch(`/adm/toggleadmin/${row.id}?csrf=${window.csrf}`, { method: "PUT"})
                            .then((response) => response.text())
                            .then((group) => {
                                const newUsers = [...users];
                                for(let i=0; i < newUsers.length; i++) {
                                    if (newUsers[i].id === row.id){
                                        newUsers[i].defaultGroup = group;
                                        break;
                                    }
                                }
                                setUsers(newUsers);
                            });
                    }}>
            <SupervisorAccountIcon color="primary" />
        </IconButton>
    );

    var groupsIcon = row => (
        <IconButton onClick={() => {
                        fetch(`/adm/usergroups/${row.id}`)
                            .then((response) => response.json())
                            .then((json) => {
                                setEditedUser(row);
                                setUserGroups(json.items);
                                setGroups(json.groups);
                                setShowUserGroupsDialog(true);
                            });
                    }}>
            <GroupAddIcon color="primary" />
        </IconButton>
    );

    var deleteIcon = row => (
        <IconButton onClick={() => {
                        handleRemoveUser(row);
                    }}>
            <DeleteIcon color="secondary" />
        </IconButton>
    );

    React.useEffect(() => {
        fetch("/adm/users")
            .then((response) => response.json())
            .then((json) => {
                setUsers(json.items);
            });
    }, []);

    return (
        <React.Fragment>
            <Button variant="outlined" color="primary" onClick={ () => {
                        setEditedUser({id: "", email: "", firstName: "", lastName: "", phone: ""})
                        handleClickOpen();
                    }}>New User</Button>
            <EditUserDialog open={showDialog} user={editedUser} editUserCallback={handleEditUser} onClose={handleDialogClose}/>
            <UserGroupsDialog open={showUserGroupsDialog} onClose={handleUserGroupsDialogClose} user={editedUser} groups={userGroups} allGroups={groups} />
            <Title>Users</Title>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>First Name</TableCell>
                        <TableCell>Last Name</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Default Group</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.firstName}</TableCell>
                            <TableCell>{user.lastName}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>{user.defaultGroup}</TableCell>
                            <TableCell align="right">
                                {editIcon(user)}
                                {toggleAdminIcon(user)}
                                {groupsIcon(user)}
                                {deleteIcon(user)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </React.Fragment>
    );
}
