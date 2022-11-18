import { GridOptions } from '@ag-grid-community/core';
import { columnDefs, defaultColDef } from './columnDefs';

export const gridOptions: GridOptions = {
  defaultColDef,
  columnDefs,
  enableCharts: true,
  enableRangeSelection: true,
  suppressColumnVirtualisation: false,
  suppressMenuHide: true,
  sideBar: ['adaptable'],
  rowSelection: 'multiple',
  autoGroupColumnDef: {
    sortable: true,
  },
  statusBar: {
    statusPanels: [
      { statusPanel: 'agTotalRowCountComponent', align: 'left' },
      { statusPanel: 'agFilteredRowCountComponent', align: 'left' },
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
