import * as React from 'react';

// import agGrid Component
import { AgGridReact } from '@ag-grid-community/react';
import { agGridModules } from './agGridModules';
import { gridOptions } from './gridOptions';

// import Adaptable Component and other types
import AdaptableReact, {
  AdaptableApi,
  AdaptableOptions,
} from '@adaptabletools/adaptable-react-aggrid';
import finance from '@adaptabletools/adaptable-plugin-finance';
import { logFdc3ContextInput, logFdc3IntentInput, logFdc3Output } from '../fdc3/fdc3EventLogger';
import { setupFrameworkComponents } from '@adaptabletools/adaptable-react-aggrid/src/setupFrameworkComponents';

const STATE_REVISION = 1;

// build the AdaptableOptions object
// in this example we are NOT passing in predefined config but in the real world you will ship the AdapTable with objects and permissions
const adaptableOptions: AdaptableOptions = {
  primaryKey: 'Ticker',
  licenseKey: process.env.REACT_APP_ADAPTABLE_LICENSE_KEY,
  userName: 'TestUser',
  adaptableId: 'adaptable-fdc3-demo',
  plugins: [
    finance({
      fdc3Columns: {
        instrumentColumns: [
          {
            columnId: 'Instrument',
            nameColumnId: 'Instrument',
            tickerColumnId: 'Ticker',
            cusipColumnId: 'Cusip',
            showBroadcastContextMenu: true,
          },
        ],
        positionColumns: [
          {
            columnId: 'Position',
            instrumentColumnId: 'Instrument',
            showBroadcastContextMenu: true,
          },
        ],
        contactColumns: [
          {
            columnId: 'LastUpdatedByName',
            nameColumnId: 'LastUpdatedByName',
            emailColumnId: 'LastUpdatedByEmail',
            intents: ['ViewContact'],
          },
        ],
      },
      availableFDC3Intents: ['ViewQuote', 'ViewInstrument', 'ViewContact'],
      onFDC3Intent: (intent: any, context, adaptableApi) => {
        logFdc3IntentInput(intent, context, adaptableApi);
      },
      onFDC3Context: (context, adaptableApi) => {
        logFdc3ContextInput(context, adaptableApi);
      },
    }),
  ],

  predefinedConfig: {
    Theme: {
      Revision: STATE_REVISION,
      CurrentTheme: 'dark',
    },
    Dashboard: {
      Revision: STATE_REVISION,
      DashboardTitle: 'AdapTable FDC3 Demo',
      Tabs: [
        {
          Name: 'Demo',
          Toolbars: ['Layout', 'Export', 'Query'],
        },
        {
          Name: 'FDC3',
          Toolbars: ['SystemStatus'],
        },
      ],
    },
    StatusBar: {
      Revision: STATE_REVISION,
      StatusBars: [
        {
          Key: 'Center Panel',
          StatusBarPanels: ['SystemStatus'],
        },
        {
          Key: 'Right Panel',
          StatusBarPanels: ['Theme'],
        },
      ],
    },
    StyledColumn: {
      Revision: STATE_REVISION,
      StyledColumns: [
        {
          ColumnId: 'Position',
          GradientStyle: {
            CellRanges: [
              {
                Min: 'Col-Min',
                Max: 'Col-Max',
                Color: '#940000',
              },
            ],
          },
        },
      ],
    },
  },
};

export const AdaptableAgGrid = () => {
  const adaptableApiRef = React.useRef<AdaptableApi>();
  return (
    <div style={{ display: 'flex', flexFlow: 'column', height: '100vh' }}>
      <AdaptableReact
        style={{ flex: 'none' }}
        gridOptions={gridOptions}
        adaptableOptions={adaptableOptions}
        onAdaptableReady={({ adaptableApi }) => {
          // save a reference to adaptable api
          adaptableApiRef.current = adaptableApi;

          logFdc3Output(adaptableApi);
        }}
      />
      <div className="ag-theme-alpine" style={{ flex: 1 }}>
        <AgGridReact gridOptions={gridOptions} modules={agGridModules} />
      </div>
    </div>
  );
};
