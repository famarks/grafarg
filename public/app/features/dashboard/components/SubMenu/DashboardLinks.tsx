import React, { FC, useReducer } from 'react';
import { Icon, IconName, Tooltip } from '@grafarg/ui';
import { sanitize, sanitizeUrl } from '@grafarg/data/src/text/sanitize';
import { DashboardLinksDashboard } from './DashboardLinksDashboard';
import { getLinkSrv } from '../../../panel/panellinks/link_srv';

import { DashboardModel } from '../../state';
import { DashboardLink } from '../../state/DashboardModel';
import { linkIconMap } from '../LinksSettings/LinkSettingsEdit';
import { useEffectOnce } from 'react-use';
import { CoreEvents } from 'app/types';
import { selectors } from '@grafarg/e2e-selectors';

export interface Props {
  dashboard: DashboardModel;
  links: DashboardLink[];
}

export const DashboardLinks: FC<Props> = ({ dashboard, links }) => {
  if (!links.length) {
    return null;
  }

  // Emulate forceUpdate (https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate)
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffectOnce(() => {
    dashboard.on(CoreEvents.timeRangeUpdated, forceUpdate);

    return () => {
      dashboard.off(CoreEvents.timeRangeUpdated, forceUpdate);
    };
  });

  useEffectOnce(() => {
    dashboard.on(CoreEvents.submenuVisibilityChanged, forceUpdate);
    return () => {
      dashboard.off(CoreEvents.submenuVisibilityChanged, forceUpdate);
    };
  });

  return (
    <>
      {links.map((link: DashboardLink, index: number) => {
        const linkInfo = getLinkSrv().getAnchorInfo(link);
        const key = `${link.title}-$${index}`;

        if (link.type === 'dashboards') {
          return <DashboardLinksDashboard key={key} link={link} linkInfo={linkInfo} dashboardId={dashboard.id} />;
        }

        const linkElement = (
          <a
            className="gf-form-label gf-form-label--dashlink"
            href={sanitizeUrl(linkInfo.href)}
            target={link.targetBlank ? '_blank' : undefined}
            rel="noreferrer"
            aria-label={selectors.components.DashboardLinks.link}
          >
            <Icon name={linkIconMap[link.icon] as IconName} style={{ marginRight: '4px' }} />
            <span>{sanitize(linkInfo.title)}</span>
          </a>
        );

        return (
          <div key={key} className="gf-form" aria-label={selectors.components.DashboardLinks.container}>
            {link.tooltip ? <Tooltip content={linkInfo.tooltip}>{linkElement}</Tooltip> : linkElement}
          </div>
        );
      })}
    </>
  );
};
