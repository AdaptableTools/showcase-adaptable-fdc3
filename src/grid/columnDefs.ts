import { ColDef } from '@ag-grid-community/core';
import { InstrumentInfo, Trade } from '../TradeDataGenerator';

export const defaultColDef: ColDef = {
  editable: false,
  sortable: true,
  resizable: true,
  filter: true,
  floatingFilter: true,
  enableRowGroup: true,
  enablePivot: true,
  enableValue: true,
};

export const columnDefs: ColDef<Trade>[] = [
  { headerName: 'Trade Id', field: 'tradeId', editable: false, type: ['abColDefString'] },
  {
    headerName: 'User',
    colId: 'user',
    valueGetter: ({ data }) => {
      return data?.user.name;
    },
    enableRowGroup: true,
    editable: true,
    type: ['abColDefString'],
  },
  {
    colId: 'userEmail',
    hide: true,
    suppressColumnsToolPanel: true,
    suppressFiltersToolPanel: true,
    valueGetter: ({ data }) => {
      return data?.user.email;
    },
  },
  {
    headerName: 'Book',
    field: 'book',
    enableRowGroup: true,
    editable: true,
    type: ['abColDefString'],
  },
  { headerName: 'Client', field: 'clientName', enableRowGroup: true, type: ['abColDefString'] },
  { headerName: 'Trade Date', field: 'tradeDate', type: 'abColDefDate' },
  { headerName: 'Sett Date', field: 'settlementDate', type: 'abColDefDate' },
  {
    headerName: 'B/S',
    field: 'direction',
    enableRowGroup: true,
    enablePivot: true,
    type: ['abColDefString'],
  },
  { headerName: 'Status', field: 'status', enableRowGroup: true, type: ['abColDefString'] },
  { headerName: 'Ticker', field: 'ticker', enableRowGroup: true, type: ['abColDefString'] },
  { headerName: 'CUSIP', field: 'cusip', enableRowGroup: true, type: ['abColDefString'] },
  { headerName: 'Instrument', field: 'instrument', type: ['abColDefString'] },
  { headerName: 'CCY', field: 'currency', enableRowGroup: true, type: ['abColDefString'] },
  { headerName: 'Rating', field: 'rating', enableRowGroup: true, type: ['abColDefString'] },
  {
    headerName: 'Quantity',
    field: 'quantity',
    enablePivot: true,
    enableValue: true,
    editable: true,
    type: ['abColDefNumber'],
  },
  {
    headerName: 'Unit Price',
    field: 'unitPrice',
    enablePivot: true,
    enableValue: true,
    type: ['abColDefNumber'],
  },
  {
    headerName: 'Commission',
    field: 'commission',
    enablePivot: true,
    enableValue: true,
    type: ['abColDefNumber'],
  },
  {
    headerName: 'Fees',
    field: 'fees',
    enablePivot: true,
    enableValue: true,
    type: ['abColDefNumber'],
  },
  {
    headerName: 'Mkt Price',
    field: 'marketPrice',
    enablePivot: true,
    enableValue: true,
    type: ['abColDefNumber'],
  },
  { headerName: 'Fill', field: 'fill', type: ['abColDefNumber'] },
];
