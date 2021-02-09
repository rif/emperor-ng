import * as React from "react";
import Button from "@material-ui/core/Button";
import {
  DataGrid,
  ColDef,
  ValueGetterParams,
  CellParams,
  GridApi,
} from "@material-ui/data-grid";
import FormDialog from "./CreateUserDialog";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "firstName", headerName: "FirstName", width: 130 },
  { field: "lastName", headerName: "LastName", width: 130 },
  { field: "phone", headerName: "Phone", width: 120 },
  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 160,
    valueGetter: (params) =>
      `${params.getValue("firstName") || ""} ${
        params.getValue("lastName") || ""
      }`,
  },
  {
    field: "",
    headerName: "Actions",
    sortable: false,
    width: 200,
    disableClickEventBubbling: true,
    renderCell: (params: CellParams) => {
      const onClick = (callback) => {
        const api: GridApi = params.api;
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
        alert("Edit: " + JSON.stringify(row, null, 4));
      };
      const remove = (row) => {
        alert("Delete: " + JSON.stringify(row, null, 4));
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
          aria-label="delete"
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

export default function Users() {
  const [users, setUsers] = React.useState([]);
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
        <FormDialog />
      </Grid>
      <Grid item xs={12}>
        <div style={{ height: 800, width: "100%" }}>
          <DataGrid rows={users} columns={columns} pageSize={5} />
        </div>
      </Grid>
    </Grid>
  );
}
