import React from "react";
import OurTable, {ButtonColumn} from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { cellToAxiosParamsSuspend, onSuspendSuccess, cellToAxiosParamsRestore, onRestoreSuccess } from "main/utils/usersUtils"
import { hasRole } from "main/utils/currentUser";
import { formatTime } from "main/utils/dateUtils";

export default function UsersTable({ users, currentUser }) {

    // Stryker disable all : hard to test for query caching
    const suspendMutation = useBackendMutation(
        cellToAxiosParamsSuspend,
        { onSuccess: onSuspendSuccess },
        ["/api/admin/users"]
    );
    // Stryker restore all 

    // Stryker disable next-line all : TODO try to make a good test for this
    const suspendCallback = async (cell) => { 
        suspendMutation.mutate(cell);
    }

    // Stryker disable all : hard to test for query caching
    const restoreMutation = useBackendMutation(
        cellToAxiosParamsRestore,
        { onSuccess: onRestoreSuccess },
        ["/api/admin/users"]
    );
    // Stryker restore all 

    // Stryker disable next-line all : TODO try to make a good test for this
    const restoreCallback = async (cell) => { 
        restoreMutation.mutate(cell);
    }

    const columns = [
        {
            Header: 'id',
            accessor: 'id', // accessor is the "key" in the data
        },
        {
            Header: 'First Name',
            accessor: 'givenName',
        },
        {
            Header: 'Last Name',
            accessor: 'familyName',
        },
        {
            Header: 'Email',
            accessor: 'email',
        },
        {
            Header: 'Last Online',
            id: 'lastOnline',
            accessor: (row) => formatTime(row.lastOnline),
        },
        {
            Header: 'Admin',
            id: 'admin',
            accessor: (row, _rowIndex) => String(row.admin) // hack needed for boolean values to show up
        },
        {
            Header: 'Suspended',
            id: 'suspended',
            accessor: (row, _rowIndex) => String(row.suspended) // hack needed for boolean values to show up
        },
    ];

    const testid = "UsersTable";

    const columnsIfAdmin = [
        ...columns,
        ButtonColumn("Suspend", "danger", suspendCallback, testid),
        ButtonColumn("Restore", "success", restoreCallback, testid),
    ];

    const columnsToDisplay = hasRole(currentUser,"ROLE_ADMIN") ? columnsIfAdmin : columns;

    return (
    <>
        <OurTable
            data={users}
            columns={columnsToDisplay}
            testid={testid}
        />
    </>);

};