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
import HostGroupsDialog from "./HostGroupsDialog";
import EditHostDialog from "./EditHostDialog";

export default function Hosts() {
    const [hosts, setHosts] = React.useState([]);
    const [showDialog, setShowDialog] = React.useState(false);
    const [showHostGroupsDialog, setShowHostGroupsDialog] = React.useState(false);
    const [hostGroups, setHostGroups] = React.useState([]);
    const [groups, setGroups] = React.useState([]);
    const [editedHost, setEditedHost] = React.useState({
        id: "",
        name: "",
        address: "",
        port: "",
        description: "",
    });

    const handleEditHost = (host) => {
        fetch(`/adm/host?csrf=${window.csrf}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: host.id,
                name: host.name,
                address: host.address,
                port: host.port,
                description: host.description,
            }),
        })
            .then((resp) => resp.text())
            .then((text) => {
                host.id = text;
                const newHosts = [...hosts];
                let found = false;
                for (let i = 0; i < newHosts.length; i++) {
                    if (newHosts[i].id === host.id) {
                        newHosts[i] = host;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    newHosts.push(host);
                }
                setHosts(newHosts);
                handleDialogClose();
            });
    };

    const handleRemoveHost = (host) => {
        if (window.confirm("Are you soure you want to delete this host?")) {
            const newHosts = [...hosts];
            let index = -1;
            for (let i = 0; i < newHosts.length; i++) {
                if (newHosts[i].id === host.id) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                newHosts.splice(index, 1);
                console.log("delete host: ", JSON.stringify(host), index);
                fetch(`/adm/host?csrf=${window.csrf}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(host),
                })
                    .then((resp) => {
                        if (resp.status === 200) {
                            setHosts(newHosts);
                        } else {
                            alert("Could not delete host!");
                        }
                    })
                    .catch((err) => {
                        alert("error deleting host: " + err);
                    });
            }
        }
    };

    const handleHostGroupsDialogClose = () => {
        setShowHostGroupsDialog(false);
    }

    const handleDialogClose = () => {
        setShowDialog(false);
    }

    const handleClickOpen = () => {
        setShowDialog(true);
    };

    const editIcon = row => (
        <IconButton title="Edit" onClick={() => {
                        setEditedHost(row);
                        setShowDialog(true);
                    }}>
            <EditIcon color="primary" />
        </IconButton>
    );

    var groupsIcon = row => (
        <IconButton title="Manage Groups" onClick={() => {
                        fetch(`/adm/hostgroups/${row.id}`)
                            .then((response) => response.json())
                            .then((json) => {
                                setEditedHost(row);
                                setHostGroups(json.items);
                                setGroups(json.groups);
                                setShowHostGroupsDialog(true);
                            });
                    }}>
            <GroupAddIcon color="primary" />
        </IconButton>
    );

    var deleteIcon = row => (
        <IconButton title="Delete" onClick={() => {
                        handleRemoveHost(row);
                    }}>
            <DeleteIcon color="secondary" />
        </IconButton>
    );

    React.useEffect(() => {
        fetch("/adm/hosts")
            .then((response) => response.json())
            .then((json) => {
                setHosts(json.items);
            });
    }, []);

    return (
        <React.Fragment>
            <Button style={{float:'right'}} variant="outlined" color="primary" onClick={ () => {
                        setEditedHost({id: "", name: "", address: "", port:"", description:""})
                        handleClickOpen();
                    }}>New Host</Button>
            <EditHostDialog open={showDialog} host={editedHost} editHostCallback={handleEditHost} onClose={handleDialogClose}/>
            <HostGroupsDialog open={showHostGroupsDialog} onClose={handleHostGroupsDialogClose} host={editedHost} groups={hostGroups} allGroups={groups} />
            <Title>Hosts</Title>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Address</TableCell>
                        <TableCell>Port</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {hosts.map((host) => (
                        <TableRow key={host.id}>
                            <TableCell>{host.name}</TableCell>
                            <TableCell>{host.address}</TableCell>
                            <TableCell>{host.port}</TableCell>
                            <TableCell>{host.description}</TableCell>
                            <TableCell align="right">
                                {editIcon(host)}
                                {groupsIcon(host)}
                                {deleteIcon(host)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </React.Fragment>
    );
}
