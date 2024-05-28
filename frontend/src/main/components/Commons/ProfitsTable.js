import React from "react";
import OurTable from "main/components/OurTable";

export default function ProfitsTable({ profits }) {
    //const PROFIT_PAGE_SIZE = 5;
    //const [currentPage, setCurrentPage] = React.useState(0);
    // Stryker disable ArrayDeclaration : [columns] and [students] are performance optimization; mutation preserves correctness
    const memoizedColumns = React.useMemo(() => 
        [
            {
                Header: "Profit",
                accessor: (row) => `$${row.amount.toFixed(2)}`,
            },
            {
                Header: "Date",
                accessor: "timestamp",
                Cell: ({ value }) => {
                    const date = new Date(value);
                    return date.toLocaleString('en-US', {
                        year: 'numeric', month: 'numeric', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                        hour12: false
                    });
                }
            },
            {
                Header: "Health",
                accessor: (row) => `${row.avgCowHealth.toFixed(1) + '%'}`
            },
            {
                Header: "Cows",
                accessor: "numCows",
            },
        ], 
    []);
    const memoizedDates = React.useMemo(() => profits, [profits]);
    // Stryker restore ArrayDeclaration

    return <OurTable
        data={memoizedDates}
        columns={memoizedColumns}
        testid={"ProfitsTable"}
    />;
};