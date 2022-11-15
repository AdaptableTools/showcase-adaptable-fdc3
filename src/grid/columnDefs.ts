import { ColDef } from '@ag-grid-community/core';
import { InstrumentInfo } from './rowData';

export const defaultColDef: ColDef = {
  editable: false,
  sortable: true,
  filter: true,
  floatingFilter: true,
  enableRowGroup: true,
  enablePivot: true,
  enableValue: true,
};

export const columnDefs: ColDef<InstrumentInfo>[] = [
  {
    headerName: 'Instrument',
    field: 'Instrument',
    type: 'abColDefString',
  },
  {
    headerName: 'Ticker',
    field: 'Ticker',
    type: 'abColDefString',
  },
  {
    headerName: 'CUSIP',
    field: 'Cusip',
    type: 'abColDefString',
  },
  {
    headerName: 'Position',
    field: 'Position',
    type: 'abColDefNumber',
  },
  {
    headerName: 'Last Updated By',
    field: 'LastUpdatedByName',
    type: 'abColDefString',
  },
];
