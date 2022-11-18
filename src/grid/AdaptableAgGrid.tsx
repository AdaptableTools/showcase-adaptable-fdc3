import * as React from 'react';
// import Adaptable Component and other types
import AdaptableReact, {
  ActionColumnContext,
  AdaptableApi,
  AdaptableButton,
  AdaptableMenuItem,
  AdaptableModule,
  AdaptableOptions,
  ContextMenuContext,
  FinancePluginOptions,
  GridCell,
} from '@adaptabletools/adaptable-react-aggrid';

// import agGrid Component
import { AgGridReact } from '@ag-grid-community/react';

import finance from '@adaptabletools/adaptable-plugin-finance';

import { CURRENT_USER, TradeDataGenerator } from '../TradeDataGenerator';
import { AboutPanelComponent } from './AboutPanel';
import { PredicateDefHandlerParams } from '@adaptabletools/adaptable/src/PredefinedConfig/Common/AdaptablePredicate';
import { CustomToolbarButtonContext } from '@adaptabletools/adaptable/src/AdaptableOptions/DashboardOptions';
import { ColumnFilter } from '@adaptabletools/adaptable/src/types';
import { GridOptions } from '@ag-grid-community/core';
import { handleIncomingContextBroadcast } from '../fdc3/handleIncomingContextBroadcast';
import { agGridModules } from './agGridModules';
import { logFdc3Output } from '../fdc3/fdc3EventLogger';
import { gridOptions } from './gridOptions';

const hiddenContextMenus: AdaptableModule[] = [
  'CellSummary',
  'CustomSort',
  'BulkUpdate',
  'Dashboard',
  // 'Export',
  'Filter',
  'FlashingCell',
  'FormatColumn',
  'GridInfo',
  'Layout',
  'PlusMinus',
];

const STATE_REVISION = 1665498873217;

const financeOptions: FinancePluginOptions = {
  fdc3Columns: {
    instrumentColumns: [
      {
        columnId: 'instrument',
        nameColumnId: 'instrument',
        tickerColumnId: 'ticker',
        cusipColumnId: 'cusip',
        showBroadcastContextMenu: true,
      },
      {
        columnId: 'ticker',
        nameColumnId: 'instrument',
        tickerColumnId: 'ticker',
        cusipColumnId: 'cusip',
        showRaiseIntentForContextMenu: true,
        raiseIntentForContextMenuLabel: ({ gridCell }) => {
          return `Raise Intent for ${gridCell.displayValue}`;
        },
      },
    ],
    contactColumns: [
      {
        columnId: 'user',
        nameColumnId: 'user',
        emailColumnId: 'userEmail',
        intents: ['StartChat'],
      },
    ],
  },

  availableFDC3Intents: ['ViewQuote', 'ViewInstrument', 'ViewContact'],
  onFDC3Intent: (intent: any, context, adaptableApi) => {
    const { type } = context;
    adaptableApi.systemStatusApi.setInfoSystemStatus(
      `IN :: Intent (${intent}, ${type})`,
      JSON.stringify(context)
    );
  },
  onFDC3Context: (context, adaptableApi) => {
    const { type } = context;
    adaptableApi.systemStatusApi.setSuccessSystemStatus(
      `IN :: Context Broadcast(${type})`,
      JSON.stringify(context)
    );
    handleIncomingContextBroadcast(context, adaptableApi);
  },
};

const gridOpts = gridOptions;

// build the AdaptableOptions object
// in this example we are NOT passing in predefined config but in the real world you will ship the AdapTable with objects and permissions
const adaptableOptions: AdaptableOptions = {
  primaryKey: 'tradeId',
  licenseKey: process.env.REACT_APP_ADAPTABLE_LICENSE_KEY,
  userName: CURRENT_USER,
  adaptableId: 'adaptable-fdc3-demo',
  plugins: [finance(financeOptions)],
  layoutOptions: {
    autoSizeColumnsInLayout: true,
  },
  editOptions: {
    isCellEditable: (gridCell: GridCell) => {
      if (gridCell.rowNode.data['status'] !== 'In Progress') {
        return false;
      }
      return true;
    },
  },

  userInterfaceOptions: {
    editLookUpItems: [
      {
        scope: {
          ColumnIds: ['book', 'user'],
        },
      },
    ],
  },
  actionOptions: {
    // actionRowButtons: ['edit'],
    // actionRowButtonOptions: {
    //   customConfiguration: () => {
    //     return {
    //       hidden: (button, context) => {
    //         if (context.rowNode?.data?.['status'] !== 'In Progress') {
    //           return true;
    //         }
    //         return false;
    //       },
    //     };
    //   },
    // },
    actionColumns: [
      {
        columnId: 'changeStatus',
        // leave whitespace!!
        friendlyName: ' ',
        actionColumnButton: [
          {
            icon: {
              name: 'check',
            },
            tooltip: 'Complete',
            hidden: (
              button: AdaptableButton<ActionColumnContext>,
              context: ActionColumnContext
            ) => {
              return context.rowNode?.data?.status !== 'In Progress';
            },
            onClick: (
              button: AdaptableButton<ActionColumnContext>,
              context: ActionColumnContext
            ) => {
              context.adaptableApi.gridApi.setCellValue(
                'status',
                'Completed',
                context.primaryKeyValue
              );
            },
            buttonStyle: {
              variant: 'outlined',
              tone: 'success',
            },
          },
          {
            icon: {
              name: 'clear',
            },
            tooltip: 'Reject',
            hidden: (
              button: AdaptableButton<ActionColumnContext>,
              context: ActionColumnContext
            ) => {
              return context.rowNode?.data?.status !== 'In Progress';
            },
            onClick: (
              button: AdaptableButton<ActionColumnContext>,
              context: ActionColumnContext
            ) => {
              context.adaptableApi.gridApi.setCellValue(
                'status',
                'Rejected',
                context.primaryKeyValue
              );
            },
            buttonStyle: {
              variant: 'outlined',
              tone: 'warning',
            },
          },
        ],
      },
    ],
  },
  exportOptions: {
    appendFileTimestamp: true,
    exportDateFormat: 'yyyy-dd-MM',
    exportFormatType: 'formattedValue',
  },
  dashboardOptions: {
    customToolbars: [
      {
        name: 'About',
        title: 'About',
        toolbarButtons: [
          {
            label: 'Read Me',
            buttonStyle: {
              variant: 'outlined',
              tone: 'neutral',
            },
            onClick: (
              button: AdaptableButton<CustomToolbarButtonContext>,
              context: CustomToolbarButtonContext
            ) => {
              context.adaptableApi.settingsPanelApi.showCustomSettingsPanel('About AdapTable');
            },
          },
        ],
      },
      {
        name: 'ClearFilter',
        toolbarButtons: [
          {
            label: 'Clear all filters',
            buttonStyle: {
              variant: 'raised',
              tone: 'accent',
            },
            disabled: (
              button: AdaptableButton<CustomToolbarButtonContext>,
              context: CustomToolbarButtonContext
            ) => {
              return !context.adaptableApi.filterApi.getActiveColumnFilters()?.length;
            },
            onClick: (
              button: AdaptableButton<CustomToolbarButtonContext>,
              context: CustomToolbarButtonContext
            ) => {
              context.adaptableApi.filterApi.clearColumnFilters();
            },
          },
        ],
      },
      {
        name: 'Market Price Alert',
        title: 'Change market price with 10% for a random Ticker',
        toolbarButtons: [
          {
            label: 'Trigger Market Price Warning',
            onClick: (button, context) => {
              const gridOptions: GridOptions = context.adaptableApi.internalApi.getAgGridInstance();
              const tradeGenerator = gridOptions.context.tradeGenerator as TradeDataGenerator;
              tradeGenerator.updateMarketPriceOnRandomInstrument({
                forceMarketPriceVariation: true,
              });
            },
            buttonStyle: {
              tone: 'warning',
            },
          },
        ],
      },
      {
        name: 'Quantity Change Alert',
        title: 'Double the quantity for the first displayed Trade',
        toolbarButtons: [
          {
            label: 'Trigger Quantity Change Alert',
            onClick: (button, context) => {
              const adaptableApi = context.adaptableApi;
              const anyRowNode =
                adaptableApi.gridApi.getFirstDisplayedRowNode() ??
                adaptableApi.gridApi.getFirstRowNode();

              adaptableApi.gridApi.setCellValue(
                'quantity',
                anyRowNode.data['quantity'] * 2,
                adaptableApi.gridApi.getPrimaryKeyValueForRowNode(anyRowNode)
              );
            },
            buttonStyle: {
              tone: 'info',
            },
          },
        ],
      },
    ],
  },
  notificationsOptions: {
    duration: 10000,
    closeWhenClicked: true,
  },
  alertOptions: {
    rowHighlightDuration: 1000,
    alertMessageText: ({ alertDefinition, cellDataChangedInfo }) => {
      if (
        alertDefinition.Rule?.Predicate?.PredicateId === 'Any' &&
        cellDataChangedInfo?.column?.columnId === 'quantity'
      ) {
        return `Quantity of trade ${cellDataChangedInfo.rowData.tradeId}(${cellDataChangedInfo.rowData.clientName}) was changed from ${cellDataChangedInfo.oldValue} to ${cellDataChangedInfo.newValue}`;
      }
      return undefined;
    },
    actionHandlers: [
      {
        name: 'assignToMeAction',
        handler: (button, context) => {
          if (
            context.alert.alertType === 'rowChanged' &&
            context.alert.alertDefinition?.Rule?.Predicate?.PredicateId === 'AddedRow'
          ) {
            const addedRowNode = context.alert.gridDataChangedInfo?.rowNodes?.[0];
            if (addedRowNode) {
              const primaryKeyValue =
                context.adaptableApi.gridApi.getPrimaryKeyValueForRowNode(addedRowNode);
              context.adaptableApi.gridApi.setCellValue('user', CURRENT_USER, primaryKeyValue);
            }
          }
        },
      },
    ],
  },
  generalOptions: {
    customSortComparers: [
      {
        scope: {
          ColumnIds: ['pnl'],
        },
        comparer: (valueA: any, valueB: any) => {
          return Math.abs(valueB) - Math.abs(valueA);
        },
      },
    ],
  },
  adaptableQLOptions: {
    expressionOptions: {
      customQueryVariables: {
        currentUser: CURRENT_USER,
      },
    },
    customPredicateDefs: [
      {
        id: 'currentUser',
        label: 'Current User',
        moduleScope: ['filter'],
        columnScope: {
          ColumnIds: ['user'],
        },
        handler: (params: PredicateDefHandlerParams) => {
          if (typeof params.value === 'string' && params.value.includes('AdapTable')) {
            return true;
          }
          return false;
        },
      },
    ],
  },
  menuOptions: {
    // remove some menu items to keep things easier
    showAdaptableColumnMenu: (menuItem: AdaptableMenuItem) => {
      return !hiddenContextMenus.includes(menuItem.module as AdaptableModule);
    },
    showAdaptableContextMenu: (menuItem: AdaptableMenuItem) => {
      return !hiddenContextMenus.includes(menuItem.module as AdaptableModule);
    },

    // contextMenuItems: [
    //   {
    //     label: 'Assign to me',
    //     icon: {
    //       name: 'person',
    //     },
    //     onClick: (menuContext: ContextMenuContext) => {
    //       menuContext.adaptableApi.gridApi.setCellValue(
    //         'user',
    //         CURRENT_USER,
    //         menuContext.primaryKeyValue
    //       );
    //     },
    //     hidden: (menuContext: ContextMenuContext) => {
    //       return (
    //         menuContext.rowNode.data['status'] !== 'In Progress' ||
    //         menuContext.rowNode.data['user'] === CURRENT_USER
    //       );
    //     },
    //   },
    // ],
  },
  settingsPanelOptions: {
    customSettingsPanels: [
      {
        name: 'About AdapTable',
        frameworkComponent: AboutPanelComponent,
      },
    ],
    navigation: {
      items: [
        'About AdapTable',
        '-',
        'Dashboard',
        'ToolPanel',
        'StateManagement',
        '-',
        'Alert',
        'CalculatedColumn',
        'CustomSort',
        'Export',
        'Filter',
        'FlashingCell',
        'FormatColumn',
        'FreeTextColumn',
        'Layout',
        'PlusMinus',
        'Query',
        'QuickSearch',
        'Schedule',
        'Shortcut',
        'StyledColumn',
        '-',
        'GridInfo',
        'SystemStatus',
        'DataChangeHistory',
        'TeamSharing',
        'Theme',
      ],
    },
  },
  predefinedConfig: {
    Theme: {
      Revision: STATE_REVISION,
      CurrentTheme: 'dark',
    },
    StatusBar: {
      Revision: STATE_REVISION,
      StatusBars: [
        {
          Key: 'Center Panel',
          StatusBarPanels: ['Alert', 'SystemStatus'],
        },
        {
          Key: 'Right Panel',
          StatusBarPanels: ['Layout'],
        },
      ],
    },
    Export: {
      Revision: STATE_REVISION,
      Reports: [
        {
          Name: 'My Live Trades',
          Scope: {
            ColumnIds: [
              'tradeId',
              'direction',
              'instrument',
              'ticker',
              'cusip',
              'clientName',
              'book',
              'tradeDate',
              'settlementDate',
              'currency',
              'totalPrice',
              'pnl',
              // 'position',
            ],
          },
          ReportColumnScope: 'ScopeColumns',
          ReportRowScope: 'ExpressionRows',
          Query: {
            BooleanExpression: "[user] = VAR('currentUser') AND [status] = 'In Progress'",
          },
        },
      ],
      CurrentReport: 'My Live Trades',
      CurrentDestination: 'Excel',
    },
    Dashboard: {
      Revision: STATE_REVISION,
      DashboardTitle: 'AdapTable Demo',
      Tabs: [
        {
          Name: 'Demo',
          Toolbars: ['About', 'Layout', 'ClearFilter', 'Export', 'Query'],
        },
        {
          Name: 'FDC3',
          Toolbars: ['SystemStatus'],
        },
        {
          Name: 'Manual Alerts',
          Toolbars: ['Market Price Alert', 'Quantity Change Alert'],
        },
      ],
    },
    Layout: {
      Revision: STATE_REVISION,
      CurrentLayout: 'Trade View',
      Layouts: [
        {
          Name: 'Trade View',
          Columns: [
            'tradeId',
            'user',
            'direction',
            'instrument',
            'ticker',
            'cusip',
            'status',
            'changeStatus',
            'marketPrice',
            'pnl',
            // 'position',
            'totalPrice',
            'fill',
            'clientName',
            'book',
            'currency',
            'rating',
            'tradeDate',
            'settlementDate',

            // 'quantity',
            // 'unitPrice',
            // 'commission',
            // 'fees',
          ],
        },
        {
          Name: 'Price View',
          Columns: [
            'tradeId',
            'user',
            'direction',
            'ticker',
            // 'cusip',
            // 'instrument',
            'clientName',
            'book',
            // 'rating',
            'tradeDate',
            'settlementDate',
            'status',
            // 'currency',
            'marketPrice',
            'pnl',
            // 'position',
            'totalPrice',
            'quantity',
            'unitPrice',
            'commission',
            'fees',
          ],
        },
        {
          Name: 'User View',
          Columns: [
            'tradeId',
            // 'user',
            'direction',
            // 'ticker',
            // 'cusip',
            // 'instrument',
            'clientName',
            'book',
            'rating',
            'tradeDate',
            'settlementDate',
            'status',
            'currency',
            'marketPrice',
            'pnl',
            // 'position',
            'totalPrice',
            'quantity',
            'unitPrice',
            'commission',
            'fees',
          ],
          RowGroupedColumns: ['user', 'ticker'],
        },
        {
          Name: 'Pivot View',
          Columns: [],
          RowGroupedColumns: ['ticker'],
          EnablePivot: true,
          PivotColumns: ['direction'],
          SuppressAggFuncInHeader: true,
          AggregationColumns: {
            pnl: 'sum',
            // position: 'sum',
          },
        },
      ],
    },
    CustomSort: {
      Revision: STATE_REVISION,
      CustomSorts: [
        {
          ColumnId: 'user',
          SortedValues: [CURRENT_USER],
        },
      ],
    },
    Alert: {
      Revision: STATE_REVISION,
      AlertDefinitions: [
        {
          Scope: {
            All: true,
          },
          Rule: {
            Predicate: {
              PredicateId: 'AddedRow',
            },
          },
          MessageText: 'New Trade',
          MessageType: 'Info',
          AlertProperties: {
            DisplayNotification: false,
            HighlightRow: {
              BackColor: 'rgba(231, 240, 96, 0.5)',
            },
          },
        },
        {
          Scope: {
            ColumnIds: ['quantity'],
          },
          Rule: {
            Predicate: {
              PredicateId: 'Any',
            },
          },
          MessageType: 'Info',
          AlertProperties: {
            DisplayNotification: true,
          },
          AlertForm: {
            Buttons: [
              {
                Label: 'OK',
                ButtonStyle: {
                  variant: 'raised',
                },
              },
              {
                Label: 'Undo',
                ButtonStyle: {
                  variant: 'raised',
                  tone: 'warning',
                },
                Action: ['undo'],
              },
            ],
          },
        },
      ],
    },
    FlashingCell: {
      Revision: STATE_REVISION,
      FlashingCellDefinitions: [
        {
          Scope: {
            ColumnIds: ['marketPrice'],
          },
          Rule: {
            Predicate: {
              PredicateId: 'Any',
            },
          },
          DownChangeStyle: {
            BackColor: '#FF0000',
            ForeColor: '#000000',
          },
          UpChangeStyle: {
            BackColor: '#32cd32',
            ForeColor: '#000000',
          },
          NeutralChangeStyle: {
            BackColor: '#808080',
          },
          FlashDuration: 500,
          FlashTarget: 'cell',
        },
      ],
    },
    FormatColumn: {
      Revision: STATE_REVISION,
      FormatColumns: [
        {
          Scope: {
            DataTypes: ['Date'],
          },
          DisplayFormat: {
            Formatter: 'DateFormatter',
            Options: {
              Pattern: 'yyyy-MM-dd',
            },
          },
        },
        {
          Scope: {
            ColumnIds: ['pnl'], //, 'position'],
          },
          Style: {
            ForeColor: '#ff0000',
          },
          DisplayFormat: {
            Formatter: 'NumberFormatter',
            Options: {
              Parentheses: true,
              FractionDigits: 2,
            },
          },
          Rule: {
            Predicate: {
              PredicateId: 'Negative',
            },
          },
        },
        {
          Scope: {
            ColumnIds: [
              'totalPrice',
              'unitPrice',
              'fees',
              'marketPrice',
              'commission',
              'pnl',
              // 'position',
            ],
          },
          DisplayFormat: {
            Formatter: 'NumberFormatter',
            Options: {
              FractionDigits: 2,
            },
          },
          CellAlignment: 'Right',
          IncludeGroupedRows: true,
        },
        {
          Scope: {
            ColumnIds: ['pnl'], //, 'position'],
          },
          Style: {
            ForeColor: '#32cd32',
          },
          Rule: {
            Predicate: {
              PredicateId: 'Positive',
            },
          },
        },
        {
          Scope: {
            All: true,
          },
          Style: {
            ForeColor: '#969696',
            FontStyle: 'Italic',
          },
          Rule: {
            BooleanExpression: "[status] != 'In Progress'",
          },
        },
      ],
    },
    CalculatedColumn: {
      Revision: STATE_REVISION,
      CalculatedColumns: [
        {
          ColumnId: 'totalPrice',
          Query: {
            ScalarExpression: '[quantity] * [unitPrice] - [fees] - [commission] ',
          },
          CalculatedColumnSettings: {
            DataType: 'Number',
            Filterable: true,
            Resizable: true,
            Groupable: true,
            Sortable: true,
            Pivotable: false,
            Aggregatable: true,
            SuppressMenu: false,
            SuppressMovable: false,
          },
          FriendlyName: 'Total Price',
        },
        {
          ColumnId: 'netPrice',
          Query: {
            ScalarExpression: '[quantity] * [unitPrice]',
          },
          CalculatedColumnSettings: {
            DataType: 'Number',
            Filterable: true,
            Resizable: true,
            Groupable: true,
            Sortable: true,
            Pivotable: false,
            Aggregatable: true,
            SuppressMenu: false,
            SuppressMovable: false,
          },
          FriendlyName: 'Net Price',
        },
        {
          ColumnId: 'pnl',
          FriendlyName: 'PnL',
          Query: {
            ScalarExpression: `[direction] = 'Buy' ? [netPrice] - ([marketPrice] * [quantity]) : [netPrice]  + ([marketPrice] * [quantity])`,
          },
          CalculatedColumnSettings: {
            DataType: 'Number',
            Filterable: true,
            Resizable: true,
            Groupable: true,
            Sortable: true,
            Pivotable: true,
            Aggregatable: true,
            SuppressMenu: false,
            SuppressMovable: false,
          },
        },
      ],
    },
    StyledColumn: {
      Revision: STATE_REVISION,
      StyledColumns: [
        {
          ColumnId: 'totalPrice',
          GradientStyle: {
            CellRanges: [
              {
                Min: 'Col-Min',
                Max: 'Col-Max',
                Color: '#a52a2a',
              },
            ],
          },
        },
        {
          ColumnId: 'fill',
          PercentBarStyle: {
            CellRanges: [
              {
                Min: 0,
                Max: 100,
                Color: '#006400',
              },
            ],
            CellText: ['PercentageValue'],
          },
        },
      ],
    },
    Query: {
      Revision: STATE_REVISION,
      NamedQueries: [
        {
          Name: 'Live $ Trades',
          BooleanExpression: "[currency] = 'USD' AND [status] = 'In Progress'",
        },
        {
          Name: 'Settling soon',
          BooleanExpression:
            "DIFF_DAYS([settlementDate], NOW() ) <= 7 AND [status] = 'In Progress'",
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
        gridOptions={gridOpts}
        adaptableOptions={adaptableOptions}
        onAdaptableReady={({ adaptableApi, gridOptions }) => {
          // save a reference to adaptable api
          adaptableApiRef.current = adaptableApi;
          logFdc3Output(adaptableApi);

          TradeDataGenerator.initialize(adaptableApi);
          gridOptions.columnApi?.autoSizeAllColumns();
        }}
      />
      <div className="ag-theme-alpine-dark" style={{ flex: 1, height: 'calc(100vh - 40px)' }}>
        <AgGridReact gridOptions={gridOpts} modules={agGridModules} />
      </div>
    </div>
  );
};
