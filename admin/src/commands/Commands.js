import * as React from "react";
import { DataGrid } from "@material-ui/data-grid";
import FormDialog from "./CreateCommandDialog";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import CommandGroupsDialog from "./CommandGroupsDialog"
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';

export default function Commands() {
    const [commands, setCommands] = React.useState([]);
    const [showDialog, setShowDialog] = React.useState(false);
    const [commandGroups, setCommandGroups] = React.useState([]);
    const [groups, setGroups] = React.useState([]);
    const [editedCommand, setEditedCommand] = React.useState({
        id: "",
        description: "",
        cmd: "",
        lastName: "",
        phone: "",
    });
    const columns = [
        { field: "id", headerName: "ID", width: 90 },
        { field: "description", headerName: "Description", width: 190 },
        { field: "cmd", headerName: "Cmd", width: 180 },
        { field: "danger", headerName: "Danger", width: 180 },
        {
            field: "",
            headerName: "Actions",
            sortable: false,
            width: 110,
            disableClickEventBubbling: true,
            renderCell: (params) => {
                const onClick = (callback) => {
                    const api = params.api;
                    const fields = api
                          .getAllColumns()
                          .map((c) => c.field)
                          .filter((c) => c !== "__check__" && !!c);
                    const thisRow = {};

                    fields.forEach((f) => {
                        thisRow[f] = params.getValue(f);
                    });

                    return callback(thisRow);
                };
                const edit = (row) => {
                    setEditedCommand(row);
                    setShowDialog(true);
                };
                const remove = (row) => {
                    handleRemoveCommand(row);
                };
                const groups = (row) => {
                    fetch(`/adm/commandgroups/${row.id}`)
                        .then((response) => response.json())
                        .then((json) => {
                            setEditedCommand(row);
                            setCommandGroups(json.items);
                            setGroups(json.groups);
                        });
                };

                return [
                    <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={() => {
                            onClick(edit);
                        }}
                    >
                        <EditIcon />
                    </IconButton>,
                    <IconButton
                        aria-label="edit"
                        size="small"
                        onClick={() => {
                            onClick(groups);
                        }}
                        color="danger"
                    >
                        <GroupAddIcon />
                    </IconButton>,
                    <IconButton
                        aria-label="edit"
                        size="small"
                        onClick={() => {
                            onClick(remove);
                        }}
                        color="danger"
                    >
                        <DeleteIcon />
                    </IconButton>,
                ];
            },
        },
    ];

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
                command.pass = "";
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

    React.useEffect(() => {
        fetch("/adm/commands")
            .then((response) => response.json())
            .then((json) => {
                setCommands(json.items);
            });
    }, []);
    return (
        <Grid container spacing={2}>
            <Grid item justify="flex-end" xs={12}>
                <FormDialog
                    command={editedCommand}
                    status={showDialog}
                    editCommandCallback={handleEditCommand}
                />
                <CommandGroupsDialog command={editedCommand} groups={commandGroups} allGroups={groups} />
            </Grid>
            <Grid item xs={12}>
                <div style={{ height: 300, width: "100%" }}>
                    <DataGrid
                        rows={commands}
                        columns={columns}
                        pageSize={5}
                        density="compact"
                    />
                </div>
            </Grid>
        </Grid>
    );
}
