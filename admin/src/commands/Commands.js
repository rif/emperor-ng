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
import CommandGroupsDialog from "./CommandGroupsDialog";
import EditCommandDialog from "./EditCommandDialog";

export default function Commands() {
    const [commands, setCommands] = React.useState([]);
    const [showDialog, setShowDialog] = React.useState(false);
    const [showCommandGroupsDialog, setShowCommandGroupsDialog] = React.useState(false);
    const [commandGroups, setCommandGroups] = React.useState([]);
    const [groups, setGroups] = React.useState([]);
    const [editedCommand, setEditedCommand] = React.useState({
        id: "",
        description: "",
        cmd: "",
        danger: false,
    });

    const handleEditCommand = (command) => {
        fetch(`/adm/command?csrf=${window.csrf}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: command.id,
                description: command.description,
                cmd: command.cmd,
                danger: command.danger,
            }),
        })
            .then((resp) => resp.text())
            .then((text) => {
                command.id = text;
                const newCommands = [...commands];
                let found = false;
                for (let i = 0; i < newCommands.length; i++) {
                    if (newCommands[i].id === command.id) {
                        newCommands[i] = command;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    newCommands.push(command);
                }
                setCommands(newCommands);
                handleDialogClose();
            });
    };

    const handleRemoveCommand = (command) => {
        if (window.confirm("Are you soure you want to delete this command?")) {
            const newCommands = [...commands];
            let index = -1;
            for (let i = 0; i < newCommands.length; i++) {
                if (newCommands[i].id === command.id) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                newCommands.splice(index, 1);
                console.log("delete command: ", JSON.stringify(command), index);
                fetch(`/adm/command?csrf=${window.csrf}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(command),
                })
                    .then((resp) => {
                        if (resp.status === 200) {
                            setCommands(newCommands);
                        } else {
                            alert("Could not delete command!");
                        }
                    })
                    .catch((err) => {
                        alert("error deleting command: " + err);
                    });
            }
        }
    };

    const handleCommandGroupsDialogClose = () => {
        setShowCommandGroupsDialog(false);
    }

    const handleDialogClose = () => {
        setShowDialog(false);
    }

    const handleClickOpen = () => {
        setShowDialog(true);
    };

    const editIcon = row => (
        <IconButton onClick={() => {
                        setEditedCommand(row);
                        setShowDialog(true);
                    }}>
            <EditIcon color="primary" />
        </IconButton>
    );

    var groupsIcon = row => (
        <IconButton onClick={() => {
                        fetch(`/adm/commandgroups/${row.id}`)
                            .then((response) => response.json())
                            .then((json) => {
                                setEditedCommand(row);
                                setCommandGroups(json.items);
                                setGroups(json.groups);
                                setShowCommandGroupsDialog(true);
                            });
                    }}>
            <GroupAddIcon color="primary" />
        </IconButton>
    );

    var deleteIcon = row => (
        <IconButton onClick={() => {
                        handleRemoveCommand(row);
                    }}>
            <DeleteIcon color="secondary" />
        </IconButton>
    );

    React.useEffect(() => {
        fetch("/adm/commands")
            .then((response) => response.json())
            .then((json) => {
                setCommands(json.items);
            });
    }, []);

    return (
        <React.Fragment>
            <Button style={{float:'right'}} variant="outlined" color="primary" onClick={ () => {
                        setEditedCommand({id: "", description: "", cmd: "", danger: false})
                        handleClickOpen();
                    }}>New Command</Button>
            <EditCommandDialog open={showDialog} command={editedCommand} editCommandCallback={handleEditCommand} onClose={handleDialogClose}/>
            <CommandGroupsDialog open={showCommandGroupsDialog} onClose={handleCommandGroupsDialogClose} command={editedCommand} groups={commandGroups} allGroups={groups} />
            <Title>Commands</Title>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell>Cmd</TableCell>
                        <TableCell>Danger</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {commands.map((command) => (
                        <TableRow key={command.id}>
                            <TableCell>{command.description}</TableCell>
                            <TableCell>{command.cmd}</TableCell>
                            <TableCell>{command.danger}</TableCell>
                            <TableCell align="right">
                                {editIcon(command)}
                                {groupsIcon(command)}
                                {deleteIcon(command)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </React.Fragment>
    );
}
