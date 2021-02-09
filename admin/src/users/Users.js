import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import FormDialog from './CreateUserDialog';

const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'firstName', headerName: 'FirstName', width: 130 },
    { field: 'lastName', headerName: 'LastName', width: 130 },
    { field: 'phone', headerName: 'Phone', width: 120},
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
            });
    }, []);
    return (
        <div>
            <div>
                <FormDialog/>
            </div>
            <div style={{ height: 800, width: '100%' }}>
                <DataGrid rows={users} columns={columns} pageSize={5} checkboxSelection />
            </div>
        </div>
    );
}
