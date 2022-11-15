import { GridOptions } from '@ag-grid-community/core';
import { columnDefs, defaultColDef } from './columnDefs';
import { rowData } from './rowData';

export const gridOptions: GridOptions = {
  defaultColDef,
  columnDefs,
  rowData,
  sideBar: true,
  enableRangeSelection: true,
  statusBar: {
    statusPanels: [
      {
        key: 'Left Panel',
        statusPanel: 'AdaptableStatusPanel',
        align: 'left',
      },
      {
        key: 'Center Panel',
        statusPanel: 'AdaptableStatusPanel',
        align: 'center',
      },
      {
        key: 'Right Panel',
        statusPanel: 'AdaptableStatusPanel',
        align: 'right',
      },
    ],
  },
};
