# AdapTable FDC3 Integration Showcase

This is a very basic example of FDC3 interop capabilities in AdapTable.

It provides a small [AdapTable React](https://docs.adaptabletools.com/learn/react-overview) instance which contains some dummy Instrument data.

The example illustrates some of  AdapTable's [FDC3 capabilities](https://docs.adaptabletools.com/guide/handbook-using-fdc3).

### FDC3 Columns
The demo contains 3 FDC3 Columns:

- an `Instrument` Column which broadcasts context
- a `Position` Column (that uses the Instrument Column) and broadcasts context
- a `Contact` Column which raises the `ViewContact` FDC3 Intent

### Available FDC3 Intents
The demo listens to 3 FDC3 Intents:
- `ViewQuote`
- `ViewInstrument`
- `ViewContact`

> In the default implementation it merely logs the Context but you can update this to perform more useful interop

### Finance Plugin
All AdapTable FDC3 logic is contained in the [Finance Plugin]([https://docs.adaptabletools.com/guide/handbook-using-fdc3](https://docs.adaptabletools.com/guide/reference-plugins-overview#finance)

The code to define the FDC3 Columns and Intents is:

```
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
```

## Installation

Run `npm install` (or `yarn`), depending on what tool you're using.

## Running for development

Execute the following command

```sh
$ npm run start
```

## Licences

A licence for AdapTable provides access to all product features as well as quarterly updates and enhancements through the lifetime of the licence, comprehensive support, and access to all 3rd party libraries.

We can make a trial licence available for a short period of time to allow you to try out AdapTable for yourself.

Please contact [`sales@adaptabletools.com`](mailto:sales@adaptabletools.com) or read the [Licence Documentation](https://docs.adaptabletools.com/licensing) for more information.

## Demo

To see AdapTable in action visit our [Demo Site](https://demo.adaptabletools.com). Here you can see a large number of AdapTable demos each showing a different feature, function or option in AdapTable (using dummy data sets).

## Help

Developers can learn how to access AdapTable programmatically at [AdapTable Documentation](https://docs.adaptabletools.com).

For more information on how to integrate FDC3 in Adaptable see the [FDC3 AdapTable Documentation](https://docs.adaptabletools.com/guide/handbook-using-fdc3)

For full information on how to use the AdapTable React Wrapper see the [AdapTable React Documentation](https://docs.adaptabletools.com/learn/react-overview).


## More Information

General information about Adaptable Tools is available at our [Website](http://www.adaptabletools.com)

## Support

For all support enquiries please email [`support@adaptabletools.com`](mailto:support@adaptabletools.com) or [raise a Support Ticket](https://adaptabletools.zendesk.com/hc/en-us/requests/new).
