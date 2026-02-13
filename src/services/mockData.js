
export const mockData = {
    branches: [
        { BranchNo: 'B001', Branch: 'MANILA', AreaID: 1 },
        { BranchNo: 'B002', Branch: 'CEBU', AreaID: 2 },
        { BranchNo: 'B003', Branch: 'DAVAO', AreaID: 3 },
        { BranchNo: 'B004', Branch: 'QUEZON CITY', AreaID: 1 },
    ],
    area: [
        { id: 1, area_name: 'METRO MANILA', region_id: 1 },
        { id: 2, area_name: 'VISAYAS CENTRAL', region_id: 2 },
        { id: 3, area_name: 'DAVAO REGION', region_id: 3 },
    ],
    region: [
        { id: 1, region: 'NCR', divisionID: 1 },
        { id: 2, region: 'REGION VII', divisionID: 2 },
        { id: 3, region: 'REGION XI', divisionID: 3 },
    ],
    division: [
        { id: 1, division: 'NORTH DIV', operationID: 1 },
        { id: 2, division: 'CENTRAL DIV', operationID: 3 },
        { id: 3, division: 'SOUTH DIV', operationID: 5 },
    ],
    operations: [
        { id: 1, name: 'LUZON I' },
        { id: 2, name: 'LUZON II' },
        { id: 3, name: 'VISAYAS I' },
        { id: 4, name: 'VISAYAS II' },
        { id: 5, name: 'MINDANAO I' },
        { id: 6, name: 'MINDANAO II' },
    ],
    financial_statement_saved_reports: [
        { branch_no: 'B001', month: 1, year: 2025 },
        { branch_no: 'B003', month: 1, year: 2025 },
    ],
    daily_financial_statement_saved_reports: [
        { branch_no: 'B001', transaction_date: '2025-01-22' },
        { branch_no: 'B002', transaction_date: '2025-01-22' }
    ],
    clients: [
        { clientRefNo: '12345', branchNo: 'B001', firstName: 'Juan', middleName: 'D', lastName: 'Cruz', birthdate: '1990-01-01', status: 'Active', close_status: 'N/A', membershipDate: '2020-01-01', closedOn: '' }
    ],
    bad_debts: [
        { clientRefNo: '12345', branchNo: 'B001', clientName: 'Juan Cruz', savings: 5000, bad_debts: 1000, net_risk: 0, date_closed: '', is_paid: 'No', date_paid: '', status: 'Active' }
    ],
    unclaimed_accounts: [],
    client_savings: [
        { clientRefNo: '12345', CBU: 1000, LCBU: 500, Status: 'Active' }
    ]
};
