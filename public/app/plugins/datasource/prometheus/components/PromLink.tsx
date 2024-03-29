import _ from 'lodash';
import React, { FC, useEffect, useState, memo } from 'react';

import { PrometheusDatasource } from '../datasource';
import { PromQuery } from '../types';
import { DataQueryRequest, PanelData, textUtil } from '@grafarg/data';

interface Props {
  datasource: PrometheusDatasource;
  query: PromQuery;
  panelData?: PanelData;
}

const PromLink: FC<Props> = ({ panelData, query, datasource }) => {
  const [href, setHref] = useState('');

  useEffect(() => {
    if (panelData) {
      const getExternalLink = () => {
        if (!panelData.request) {
          return '';
        }

        const {
          request: { range, interval },
        } = panelData;

        const start = datasource.getPrometheusTime(range.from, false);
        const end = datasource.getPrometheusTime(range.to, true);
        const rangeDiff = Math.ceil(end - start);
        const endTime = range.to.utc().format('YYYY-MM-DD HH:mm');

        const options = {
          interval,
        } as DataQueryRequest<PromQuery>;

        const queryOptions = datasource.createQuery(query, options, start, end);
        const expr = {
          'g0.expr': queryOptions.expr,
          'g0.range_input': rangeDiff + 's',
          'g0.end_input': endTime,
          'g0.step_input': queryOptions.step,
          'g0.tab': 0,
        };

        const args = _.map(expr, (v: string, k: string) => {
          return k + '=' + encodeURIComponent(v);
        }).join('&');
        return `${datasource.directUrl}/graph?${args}`;
      };

      setHref(getExternalLink());
    }
  }, [panelData]);

  return (
    <a href={textUtil.sanitizeUrl(href)} target="_blank" rel="noopener noreferrer">
      Prometheus
    </a>
  );
};

export default memo(PromLink);
