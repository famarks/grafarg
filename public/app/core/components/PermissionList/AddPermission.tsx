import React, { Component } from 'react';
import { css } from 'emotion';
import config from 'app/core/config';
import { UserPicker } from 'app/core/components/Select/UserPicker';
import { TeamPicker, Team } from 'app/core/components/Select/TeamPicker';
import { Button, Form, HorizontalGroup, Icon, Select, stylesFactory } from '@grafarg/ui';
import { GrafargTheme, SelectableValue } from '@grafarg/data';
import { User } from 'app/types';
import {
  dashboardPermissionLevels,
  dashboardAclTargets,
  AclTarget,
  PermissionLevel,
  NewDashboardAclItem,
  OrgRole,
} from 'app/types/acl';

export interface Props {
  onAddPermission: (item: NewDashboardAclItem) => void;
  onCancel: () => void;
}

class AddPermissions extends Component<Props, NewDashboardAclItem> {
  static defaultProps = {
    showPermissionLevels: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = this.getCleanState();
  }

  getCleanState() {
    return {
      userId: 0,
      teamId: 0,
      role: undefined,
      type: AclTarget.Team,
      permission: PermissionLevel.View,
    };
  }

  onTypeChanged = (item: any) => {
    const type = item.value as AclTarget;

    switch (type) {
      case AclTarget.User:
      case AclTarget.Team:
        this.setState({ type: type, userId: 0, teamId: 0, role: undefined });
        break;
      case AclTarget.Editor:
        this.setState({ type: type, userId: 0, teamId: 0, role: OrgRole.Editor });
        break;
      case AclTarget.Viewer:
        this.setState({ type: type, userId: 0, teamId: 0, role: OrgRole.Viewer });
        break;
    }
  };

  onUserSelected = (user: User) => {
    this.setState({ userId: user && !Array.isArray(user) ? user.id : 0 });
  };

  onTeamSelected = (team: Team) => {
    this.setState({ teamId: team && !Array.isArray(team) ? team.id : 0 });
  };

  onPermissionChanged = (permission: SelectableValue<PermissionLevel>) => {
    this.setState({ permission: permission.value! });
  };

  onSubmit = async () => {
    await this.props.onAddPermission(this.state);
    this.setState(this.getCleanState());
  };

  isValid() {
    switch (this.state.type) {
      case AclTarget.Team:
        return this.state.teamId > 0;
      case AclTarget.User:
        return this.state.userId > 0;
    }
    return true;
  }

  render() {
    const { onCancel } = this.props;
    const newItem = this.state;
    const pickerClassName = 'min-width-20';
    const isValid = this.isValid();
    const styles = getStyles(config.theme);

    return (
      <div className="cta-form">
        <button className="cta-form__close btn btn-transparent" onClick={onCancel}>
          <Icon name="times" />
        </button>
        <h5>Add Permission For</h5>
        <Form maxWidth="none" onSubmit={this.onSubmit}>
          {() => (
            <HorizontalGroup>
              <Select
                isSearchable={false}
                value={this.state.type}
                options={dashboardAclTargets}
                onChange={this.onTypeChanged}
              />

              {newItem.type === AclTarget.User ? (
                <UserPicker onSelected={this.onUserSelected} className={pickerClassName} />
              ) : null}

              {newItem.type === AclTarget.Team ? (
                <TeamPicker onSelected={this.onTeamSelected} className={pickerClassName} />
              ) : null}

              <span className={styles.label}>Can</span>

              <Select
                isSearchable={false}
                value={this.state.permission}
                options={dashboardPermissionLevels}
                onChange={this.onPermissionChanged}
                width={25}
              />
              <Button data-save-permission type="submit" disabled={!isValid}>
                Save
              </Button>
            </HorizontalGroup>
          )}
        </Form>
      </div>
    );
  }
}

const getStyles = stylesFactory((theme: GrafargTheme) => ({
  label: css`
    color: ${theme.colors.textBlue};
    font-weight: bold;
  `,
}));

export default AddPermissions;
