import React, { PureComponent } from 'react';
import { dateTimeFormat } from '@grafarg/data';
import { Spinner } from '@grafarg/ui';
import { SyncInfo } from 'app/types';

interface Props {
  ldapSyncInfo: SyncInfo;
}

interface State {
  isSyncing: boolean;
}

const format = 'dddd YYYY-MM-DD HH:mm zz';

export class LdapSyncInfo extends PureComponent<Props, State> {
  state = {
    isSyncing: false,
  };

  handleSyncClick = () => {
    this.setState({ isSyncing: !this.state.isSyncing });
  };

  render() {
    const { ldapSyncInfo } = this.props;
    const { isSyncing } = this.state;
    const nextSyncTime = dateTimeFormat(ldapSyncInfo.nextSync, { format });

    return (
      <>
        <h3 className="page-heading">
          LDAP Synchronisation
          <button className={`btn btn-secondary pull-right`} onClick={this.handleSyncClick} hidden={true}>
            <span className="btn-title">Bulk-sync now</span>
            {isSyncing && <Spinner inline={true} />}
          </button>
        </h3>
        <div className="gf-form-group">
          <div className="gf-form">
            <table className="filter-table form-inline">
              <tbody>
                <tr>
                  <td>Active synchronisation</td>
                  <td colSpan={2}>{ldapSyncInfo.enabled ? 'Enabled' : 'Disabled'}</td>
                </tr>
                <tr>
                  <td>Scheduled</td>
                  <td>{ldapSyncInfo.schedule}</td>
                </tr>
                <tr>
                  <td>Next scheduled synchronisation</td>
                  <td>{nextSyncTime}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }
}
