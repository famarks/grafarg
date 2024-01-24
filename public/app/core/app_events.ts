import { EventBusSrv, EventBusExtended } from '@grafarg/data';

export const appEvents: EventBusExtended = new EventBusSrv();

export default appEvents;
