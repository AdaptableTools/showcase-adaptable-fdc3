import { FDC3Context } from '@adaptabletools/adaptable-react-aggrid';
import { AdaptableApi } from '@adaptabletools/adaptable/src/Api/AdaptableApi';
import { ColumnFilter } from '@adaptabletools/adaptable/src/types';
import { TradeDataGenerator } from '../TradeDataGenerator';

export const handleIncomingContextBroadcast = (
  fdc3Context: FDC3Context,
  adaptableApi: AdaptableApi
) => {
  if (fdc3Context.type === 'fdc3.instrument' && fdc3Context.id?.ticker) {
    const tickerValue = fdc3Context.id?.ticker;

    if (TradeDataGenerator.getAvailableTickers().includes(tickerValue)) {
      adaptableApi.layoutApi.setLayout('Trade View');

      const tickerFilter: ColumnFilter = {
        ColumnId: 'ticker',
        Predicate: {
          PredicateId: 'Is',
          Inputs: [tickerValue],
        },
      };
      adaptableApi.filterApi.setColumnFilter([tickerFilter]);
    } else {
      adaptableApi.filterApi.clearColumnFilterByColumn('ticker');
      adaptableApi.alertApi.showAlertWarning(
        'AdapTable missing ticker',
        `AdapTable Blotter does NOT contain any trades for Ticker ${tickerValue}`
      );
    }
  }
  if (fdc3Context.type === 'fdc3.contact') {
    const availableUsers = TradeDataGenerator.getAvailableUsers();

    const contactEmail = fdc3Context.id?.email;
    let contactName;

    if (contactEmail) {
      contactName =
        availableUsers.find((userInfo) => userInfo.email === contactEmail)?.name ??
        fdc3Context.name;
    } else {
      contactName = fdc3Context.name;
    }

    if (contactName) {
      adaptableApi.layoutApi.setLayout('Trade View');

      const tickerFilter: ColumnFilter = {
        ColumnId: 'user',
        Predicate: {
          PredicateId: 'Is',
          Inputs: [contactName],
        },
      };
      adaptableApi.filterApi.setColumnFilter([tickerFilter]);
    } else {
      adaptableApi.filterApi.clearColumnFilterByColumn('user');
      adaptableApi.alertApi.showAlertWarning(
        'Unknown user',
        `AdapTable Blotter does NOT contain any trades for user ${contactEmail}`
      );
    }
  }
};
