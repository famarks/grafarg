import { PanelPlugin } from '@grafarg/data';
import { WelcomeBanner } from './Welcome';

export const plugin = new PanelPlugin(WelcomeBanner).setNoPadding();
