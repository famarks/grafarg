import React, { FC } from 'react';
import { PluginMeta } from '@grafarg/data';
import { PluginSignatureBadge } from './PluginSignatureBadge';
import { selectors } from '@grafarg/e2e-selectors';

interface Props {
  plugin: PluginMeta;
}

const PluginListItem: FC<Props> = (props) => {
  const { plugin } = props;

  return (
    <li className="card-item-wrapper" aria-label={selectors.pages.PluginsList.listItem}>
      <a className="card-item" href={`plugins/${plugin.id}/`}>
        <div className="card-item-header">
          <div className="card-item-type">{plugin.type}</div>
          <div className="card-item-badge">
            <PluginSignatureBadge status={plugin.signature} />
          </div>
          {plugin.hasUpdate && (
            <div className="card-item-notice">
              <span bs-tooltip="plugin.latestVersion">Update available!</span>
            </div>
          )}
        </div>
        <div className="card-item-body">
          <figure className="card-item-figure">
            <img src={plugin.info.logos.small} />
          </figure>
          <div className="card-item-details">
            <div className="card-item-name">{plugin.name}</div>
            <div className="card-item-sub-name">{`By ${plugin.info.author.name}`}</div>
          </div>
        </div>
      </a>
    </li>
  );
};

export default PluginListItem;
