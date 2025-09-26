import DataTable from '../DataTable';

interface DataRow {
  [key: string]: string | number;
}

interface SheetData {
  fileName: string;
  sheetName: string;
  headers: string[];
  rows: DataRow[];
  matchingRows: number[];
}

export default function DataTableExample() {
  // Mock search results data
  const searchResults: SheetData[] = [
    {
      fileName: 'Caste survey 24.09.2025.xls',
      sheetName: 'Survey Data',
      headers: ['RR Number', 'Name', 'Caste', 'Age', 'Gender', 'District', 'Survey Date'],
      rows: [
        { 'RR Number': 'RR001234', 'Name': 'Rajesh Kumar', 'Caste': 'General', 'Age': 32, 'Gender': 'Male', 'District': 'Dakshina Kannada', 'Survey Date': '2024-09-15' },
        { 'RR Number': 'RR005678', 'Name': 'Priya Sharma', 'Caste': 'OBC', 'Age': 28, 'Gender': 'Female', 'District': 'Udupi', 'Survey Date': '2024-09-16' },
        { 'RR Number': 'RR001234', 'Name': 'Rajesh Kumar', 'Caste': 'General', 'Age': 32, 'Gender': 'Male', 'District': 'Dakshina Kannada', 'Survey Date': '2024-09-15' }
      ],
      matchingRows: [0, 2] // Rows that match the search
    },
    {
      fileName: 'LT1 INST KADABA.xlsx',
      sheetName: 'Main Data',
      headers: ['RR Number', 'Institution Name', 'Type', 'Location', 'Established', 'Students Count'],
      rows: [
        { 'RR Number': 'RR001234', 'Institution Name': 'Kadaba Primary School', 'Type': 'Primary School', 'Location': 'Kadaba', 'Established': '1985', 'Students Count': 245 },
        { 'RR Number': 'RR009012', 'Institution Name': 'Kadaba High School', 'Type': 'High School', 'Location': 'Kadaba', 'Established': '1992', 'Students Count': 412 }
      ],
      matchingRows: [0] // Rows that match the search
    }
  ];

  const searchTerm = 'RR001234';

  return (
    <DataTable 
      searchResults={searchResults}
      searchTerm={searchTerm}
    />
  );
}