import * as React from "react";
import { DataGrid } from "@material-ui/data-grid";
import FormDialog from "./CreateUserDialog";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";

export default function UserGroups() {
  const [users, setUsers] = React.useState([]);
  const [showDialog, setShowDialog] = React.useState(false);
  const [editedUser, setEditedUser] = React.useState({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const columns = [
    { field: "id", headerName: "ID", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "firstName", headerName: "FirstName", width: 200 },
    { field: "lastName", headerName: "LastName", width: 200 },
    { field: "phone", headerName: "Phone", width: 120 },
    {
      field: "",
      headerName: "Actions",
      sortable: false,
      width: 200,
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
          setEditedUser(row);
          setShowDialog(true);
        };
        const remove = (row) => {
          handleRemoveUser(row);
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

  React.useEffect(() => {
    fetch("/adm/users")
      .then((response) => response.json())
      .then((json) => {
        setUsers(json.items);
      });
  }, []);
  return (
    <Grid container spacing={2}>
      <Grid item justify="flex-end" xs={12}>
        <FormDialog
          user={editedUser}
          status={showDialog}
          editUserCallback={handleEditUser}
        />
      </Grid>
      <Grid item xs={12}>
        <div style={{ height: 300, width: "100%" }}>
          <DataGrid rows={users} columns={columns} pageSize={5} />
        </div>
      </Grid>
    </Grid>
  );
}
