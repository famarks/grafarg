package login

import (
	"errors"

	"github.com/famarks/grafarg/pkg/bus"
	"github.com/famarks/grafarg/pkg/infra/log"
	"github.com/famarks/grafarg/pkg/models"
	"github.com/famarks/grafarg/pkg/services/ldap"
	"github.com/famarks/grafarg/pkg/services/multildap"
	"github.com/famarks/grafarg/pkg/setting"
	"github.com/famarks/grafarg/pkg/util/errutil"
)

// getLDAPConfig gets LDAP config
var getLDAPConfig = multildap.GetConfig

// isLDAPEnabled checks if LDAP is enabled
var isLDAPEnabled = multildap.IsEnabled

// newLDAP creates multiple LDAP instance
var newLDAP = multildap.New

// logger for the LDAP auth
var ldapLogger = log.New("login.ldap")

// loginUsingLDAP logs in user using LDAP. It returns whether LDAP is enabled and optional error and query arg will be
// populated with the logged in user if successful.
var loginUsingLDAP = func(query *models.LoginUserQuery) (bool, error) {
	enabled := isLDAPEnabled()

	if !enabled {
		return false, nil
	}

	config, err := getLDAPConfig(query.Cfg)
	if err != nil {
		return true, errutil.Wrap("Failed to get LDAP config", err)
	}

	externalUser, err := newLDAP(config.Servers).Login(query)
	if err != nil {
		if errors.Is(err, ldap.ErrCouldNotFindUser) {
			// Ignore the error since user might not be present anyway
			if err := DisableExternalUser(query.Username); err != nil {
				ldapLogger.Debug("Failed to disable external user", "err", err)
			}

			return true, ldap.ErrInvalidCredentials
		}

		return true, err
	}

	upsert := &models.UpsertUserCommand{
		ReqContext:    query.ReqContext,
		ExternalUser:  externalUser,
		SignupAllowed: setting.LDAPAllowSignup,
		UserLookupParams: models.UserLookupParams{
			Login:  &externalUser.Login,
			Email:  &externalUser.Email,
			UserID: nil,
		},
	}
	err = bus.Dispatch(upsert)
	if err != nil {
		return true, err
	}
	query.User = upsert.Result

	return true, nil
}

// DisableExternalUser marks external user as disabled in Grafarg db
func DisableExternalUser(username string) error {
	// Check if external user exist in Grafarg
	userQuery := &models.GetExternalUserInfoByLoginQuery{
		LoginOrEmail: username,
	}

	if err := bus.Dispatch(userQuery); err != nil {
		return err
	}

	userInfo := userQuery.Result
	if !userInfo.IsDisabled {
		ldapLogger.Debug(
			"Disabling external user",
			"user",
			userQuery.Result.Login,
		)

		// Mark user as disabled in grafarg db
		disableUserCmd := &models.DisableUserCommand{
			UserId:     userQuery.Result.UserId,
			IsDisabled: true,
		}

		if err := bus.Dispatch(disableUserCmd); err != nil {
			ldapLogger.Debug(
				"Error disabling external user",
				"user",
				userQuery.Result.Login,
				"message",
				err.Error(),
			)
			return err
		}
	}
	return nil
}
