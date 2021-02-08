import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';

const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'email', headerName: 'Email', width: 130 },
    { field: 'firstName', headerName: 'FirstName', width: 130 },
    { field: 'lastName', headerName: 'LastName', width: 130 },
    { field: 'phone', headerName: 'Phone', width: 90},
    {
        field: 'fullName',
        headerName: 'Full name',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 160,
        valueGetter: (params) =>
        `${params.getValue('firstName') || ''} ${params.getValue('lastName') || ''}`,
    },
];

export default function Users() {
    const [users, setUsers] = React.useState([]);
    React.useEffect(() => {
        fetch("/adm/users")
            .then(response => response.json())
            .then((json) => {
                setUsers(json.items);
                console.log(users);
            });
    }, []);
    return (
            <div style={{ height: 400, width: '100%' }}>
            <DataGrid rows={users} columns={columns} pageSize={5} checkboxSelection />
            </div>
    );
}

