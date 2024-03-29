import React, { PureComponent } from 'react';
import config from 'app/core/config';

import { updateLocation } from 'app/core/actions';
import { connect } from 'react-redux';
import { StoreState } from 'app/types';
import { getBackendSrv } from '@grafarg/runtime';
import { hot } from 'react-hot-loader';
import appEvents from 'app/core/app_events';
import { AppEvents } from '@grafarg/data';

const isOauthEnabled = () => {
  return !!config.oauth && Object.keys(config.oauth).length > 0;
};

export interface FormModel {
  user: string;
  password: string;
  email: string;
}
interface Props {
  routeParams?: any;
  updateLocation?: typeof updateLocation;
  children: (props: {
    isLoggingIn: boolean;
    changePassword: (pw: string) => void;
    isChangingPassword: boolean;
    skipPasswordChange: Function;
    login: (data: FormModel) => void;
    disableLoginForm: boolean;
    ldapEnabled: boolean;
    authProxyEnabled: boolean;
    disableUserSignUp: boolean;
    isOauthEnabled: boolean;
    loginHint: string;
    passwordHint: string;
  }) => JSX.Element;
}

interface State {
  isLoggingIn: boolean;
  isChangingPassword: boolean;
}

export class LoginCtrl extends PureComponent<Props, State> {
  result: any = {};
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoggingIn: false,
      isChangingPassword: false,
    };

    if (config.loginError) {
      appEvents.emit(AppEvents.alertWarning, ['Login Failed', config.loginError]);
    }
  }

  changePassword = (password: string) => {
    const pw = {
      newPassword: password,
      confirmNew: password,
      oldPassword: 'admin',
    };
    if (!this.props.routeParams.code) {
      getBackendSrv()
        .put('/api/user/password', pw)
        .then(() => {
          this.toGrafarg();
        })
        .catch((err: any) => console.error(err));
    }

    const resetModel = {
      code: this.props.routeParams.code,
      newPassword: password,
      confirmPassword: password,
    };

    getBackendSrv()
      .post('/api/user/password/reset', resetModel)
      .then(() => {
        this.toGrafarg();
      });
  };

  login = (formModel: FormModel) => {
    this.setState({
      isLoggingIn: true,
    });

    getBackendSrv()
      .post('/login', formModel)
      .then((result: any) => {
        this.result = result;
        if (formModel.password !== 'admin' || config.ldapEnabled || config.authProxyEnabled) {
          this.toGrafarg();
          return;
        } else {
          this.changeView();
        }
      })
      .catch(() => {
        this.setState({
          isLoggingIn: false,
        });
      });
  };

  changeView = () => {
    this.setState({
      isChangingPassword: true,
    });
  };

  toGrafarg = () => {
    // Use window.location.href to force page reload
    if (this.result.redirectUrl) {
      if (config.appSubUrl !== '' && !this.result.redirectUrl.startsWith(config.appSubUrl)) {
        window.location.href = config.appSubUrl + this.result.redirectUrl;
      } else {
        window.location.href = this.result.redirectUrl;
      }
    } else {
      window.location.href = config.appSubUrl + '/';
    }
  };

  render() {
    const { children } = this.props;
    const { isLoggingIn, isChangingPassword } = this.state;
    const { login, toGrafarg, changePassword } = this;
    const { loginHint, passwordHint, disableLoginForm, ldapEnabled, authProxyEnabled, disableUserSignUp } = config;

    return (
      <>
        {children({
          isOauthEnabled: isOauthEnabled(),
          loginHint,
          passwordHint,
          disableLoginForm,
          ldapEnabled,
          authProxyEnabled,
          disableUserSignUp,
          login,
          isLoggingIn,
          changePassword,
          skipPasswordChange: toGrafarg,
          isChangingPassword,
        })}
      </>
    );
  }
}

export const mapStateToProps = (state: StoreState) => ({
  routeParams: state.location.routeParams,
});

const mapDispatchToProps = { updateLocation };

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(LoginCtrl));
