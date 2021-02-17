import * as React from "react";
import { DataGrid } from "@material-ui/data-grid";
import FormDialog from "./CreateHostDialog";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import HostGroupsDialog from "./HostGroupsDialog";

export default function Hosts() {
    const [hosts, setHosts] = React.useState([]);
    const [showDialog, setShowDialog] = React.useState(false);
    const [hostGroups, setHostGroups] = React.useState([]);
    const [groups, setGroups] = React.useState([]);
    const [editedHost, setEditedHost] = React.useState({
        id: "",
        name: "",
        address: "",
    });
    const columns = [
        { field: "id", headerName: "ID", width: 90 },
        { field: "name", headerName: "Name", width: 190 },
        { field: "address", headerName: "Address", width: 180 },
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
                    setEditedHost(row);
                    setShowDialog(true);
                };
                const remove = (row) => {
                    handleRemoveHost(row);
                };
                const groups = (row) => {
                    fetch(`/adm/hostgroups/${row.id}`)
                        .then((response) => response.json())
                        .then((json) => {
                            setEditedHost(row);
                            setHostGroups(json.items);
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
                danger: host.danger,
            }),
        })
            .then((resp) => resp.text())
            .then((text) => {
                host.pass = "";
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

    React.useEffect(() => {
        fetch("/adm/hosts")
            .then((response) => response.json())
            .then((json) => {
                setHosts(json.items);
            });
    }, []);
    return (
            <Grid container spacing={2}>
            <Grid item justify="flex-end" xs={12}>
                <FormDialog
        host={editedHost}
        status={showDialog}
        editHostCallback={handleEditHost}
            />
            <HostGroupsDialog host={editedHost} groups={hostGroups} allGroups={groups} />
            </Grid>
            <Grid item xs={12}>
            <div style={{ height: 300, width: "100%" }}>
            <DataGrid
        rows={hosts}
        columns={columns}
        pageSize={5}
        density="compact"
                    />
                </div>
            </Grid>
        </Grid>
    );
}
