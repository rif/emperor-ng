import * as React from "react";
import { DataGrid } from "@material-ui/data-grid";
import FormDialog from "./CreateGroupDialog";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";

export default function Groups() {
  const [groups, setGroups] = React.useState([]);
  const [showDialog, setShowDialog] = React.useState(false);
  const [editedGroup, setEditedGroup] = React.useState({
    id: "",
    name: "",
  });
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", width: 100 },
    {
      field: "",
      headerName: "Actions",
      sortable: false,
      width: 105,
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
          setEditedGroup(row);
          setShowDialog(true);
        };
        const remove = (row) => {
          handleRemoveGroup(row);
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
        group.pass = "";
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

  React.useEffect(() => {
    fetch("/adm/groups")
      .then((response) => response.json())
      .then((json) => {
        setGroups(json.items);
      });
  }, []);
  return (
    <Grid container spacing={2}>
      <Grid item justify="flex-end" xs={12}>
        <FormDialog
          group={editedGroup}
          status={showDialog}
          editGroupCallback={handleEditGroup}
        />
      </Grid>
      <Grid item xs={12}>
        <div style={{ height: 300, width: "100%" }}>
          <DataGrid
            rows={groups}
            columns={columns}
            pageSize={5}
            density="compact"
          />
        </div>
      </Grid>
    </Grid>
  );
}
