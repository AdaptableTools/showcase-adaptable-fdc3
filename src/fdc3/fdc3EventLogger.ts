import {
  AdaptableApi,
  AdaptableFDC3EventInfo,
  CustomFDC3Intent,
  FDC3Context,
  FDC3Intent,
} from '@adaptabletools/adaptable-react-aggrid';

export const logFdc3Output = (adaptableApi: AdaptableApi) => {
  adaptableApi.eventApi.on('FDC3MessageSent', (eventInfo: AdaptableFDC3EventInfo) => {
    adaptableApi.systemStatusApi.setInfoSystemStatus(
      `OUT :: ${
        eventInfo.eventType === 'RaiseIntent'
          ? 'Raise Intent'
          : eventInfo.eventType === 'RaiseIntentForContext'
          ? 'Raise Intent for Context'
          : 'Broadcast'
      } ${eventInfo.intent ?? ''}: ${eventInfo?.context?.id?.ticker ?? ''} ${
        eventInfo?.context?.id?.CUSIP ?? ''
      } ${eventInfo?.context?.name ?? ''} ${eventInfo?.context?.id?.email ?? ''}`,
      `${eventInfo.intent ?? ''}(${JSON.stringify(eventInfo.context)})`
    );
  });
};

export const logFdc3IntentInput = (
  intent: FDC3Intent | CustomFDC3Intent,
  context: FDC3Context,
  adaptableApi: AdaptableApi
) => {
  const { type } = context;
  adaptableApi.systemStatusApi.setInfoSystemStatus(
    `IN :: Intent (${intent}, ${type})`,
    JSON.stringify(context)
  );
};

export const logFdc3ContextInput = (context: FDC3Context, adaptableApi: AdaptableApi) => {
  const { type } = context;
  adaptableApi.systemStatusApi.setSuccessSystemStatus(
    'IN :: Context Broadcast(' + type + ')',
    JSON.stringify(context)
  );
};
