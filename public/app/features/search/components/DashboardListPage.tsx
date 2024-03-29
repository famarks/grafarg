import React, { FC, memo } from 'react';
import { useAsync } from 'react-use';
import { connect, MapStateToProps } from 'react-redux';
import { NavModel, locationUtil } from '@grafarg/data';
import { getLocationSrv } from '@grafarg/runtime';
import { FolderDTO, StoreState } from 'app/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { getRouteParams, getUrl } from 'app/core/selectors/location';
import Page from 'app/core/components/Page/Page';
import { loadFolderPage } from '../loaders';
import ManageDashboards from './ManageDashboards';

interface Props {
  navModel: NavModel;
  uid?: string;
  url: string;
}

export const DashboardListPage: FC<Props> = memo(({ navModel, uid, url }) => {
  const { loading, value } = useAsync<{ folder?: FolderDTO; pageNavModel: NavModel }>(() => {
    if (!uid || !url.startsWith('/dashboards')) {
      return Promise.resolve({ pageNavModel: navModel });
    }

    return loadFolderPage(uid!).then(({ folder, folderNav }) => {
      const path = locationUtil.stripBaseFromUrl(folder.url);

      if (path !== location.pathname) {
        getLocationSrv().update({ path });
      }

      return { folder, pageNavModel: { ...navModel, main: folderNav } };
    });
  }, [uid]);

  return (
    <Page navModel={value?.pageNavModel ?? navModel}>
      <Page.Contents isLoading={loading}>
        <ManageDashboards folder={value?.folder} />
      </Page.Contents>
    </Page>
  );
});

DashboardListPage.displayName = 'DashboardListPage';

const mapStateToProps: MapStateToProps<Props, {}, StoreState> = (state) => {
  return {
    navModel: getNavModel(state.navIndex, 'manage-dashboards'),
    uid: getRouteParams(state.location).uid as string | undefined,
    url: getUrl(state.location),
  };
};

export default connect(mapStateToProps)(DashboardListPage);
