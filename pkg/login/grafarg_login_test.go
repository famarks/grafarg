package login

import (
	"testing"

	"github.com/famarks/grafarg/pkg/bus"
	"github.com/famarks/grafarg/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLoginUsingGrafargDB(t *testing.T) {
	grafargLoginScenario(t, "When login with non-existing user", func(sc *grafargLoginScenarioContext) {
		sc.withNonExistingUser()
		err := loginUsingGrafargDB(sc.loginUserQuery)
		require.EqualError(t, err, models.ErrUserNotFound.Error())

		assert.False(t, sc.validatePasswordCalled)
		assert.Nil(t, sc.loginUserQuery.User)
	})

	grafargLoginScenario(t, "When login with invalid credentials", func(sc *grafargLoginScenarioContext) {
		sc.withInvalidPassword()
		err := loginUsingGrafargDB(sc.loginUserQuery)

		require.EqualError(t, err, ErrInvalidCredentials.Error())

		assert.True(t, sc.validatePasswordCalled)
		assert.Nil(t, sc.loginUserQuery.User)
	})

	grafargLoginScenario(t, "When login with valid credentials", func(sc *grafargLoginScenarioContext) {
		sc.withValidCredentials()
		err := loginUsingGrafargDB(sc.loginUserQuery)
		require.NoError(t, err)

		assert.True(t, sc.validatePasswordCalled)

		require.NotNil(t, sc.loginUserQuery.User)
		assert.Equal(t, sc.loginUserQuery.Username, sc.loginUserQuery.User.Login)
		assert.Equal(t, sc.loginUserQuery.Password, sc.loginUserQuery.User.Password)
	})

	grafargLoginScenario(t, "When login with disabled user", func(sc *grafargLoginScenarioContext) {
		sc.withDisabledUser()
		err := loginUsingGrafargDB(sc.loginUserQuery)
		require.EqualError(t, err, ErrUserDisabled.Error())

		assert.False(t, sc.validatePasswordCalled)
		assert.Nil(t, sc.loginUserQuery.User)
	})
}

type grafargLoginScenarioContext struct {
	loginUserQuery         *models.LoginUserQuery
	validatePasswordCalled bool
}

type grafargLoginScenarioFunc func(c *grafargLoginScenarioContext)

func grafargLoginScenario(t *testing.T, desc string, fn grafargLoginScenarioFunc) {
	t.Helper()

	t.Run(desc, func(t *testing.T) {
		origValidatePassword := validatePassword

		sc := &grafargLoginScenarioContext{
			loginUserQuery: &models.LoginUserQuery{
				Username:  "user",
				Password:  "pwd",
				IpAddress: "192.168.1.1:56433",
			},
			validatePasswordCalled: false,
		}

		t.Cleanup(func() {
			validatePassword = origValidatePassword
		})

		fn(sc)
	})
}

func mockPasswordValidation(valid bool, sc *grafargLoginScenarioContext) {
	validatePassword = func(providedPassword string, userPassword string, userSalt string) error {
		sc.validatePasswordCalled = true

		if !valid {
			return ErrInvalidCredentials
		}

		return nil
	}
}

func (sc *grafargLoginScenarioContext) getUserByLoginQueryReturns(user *models.User) {
	bus.AddHandler("test", func(query *models.GetUserByLoginQuery) error {
		if user == nil {
			return models.ErrUserNotFound
		}

		query.Result = user
		return nil
	})
}

func (sc *grafargLoginScenarioContext) withValidCredentials() {
	sc.getUserByLoginQueryReturns(&models.User{
		Id:       1,
		Login:    sc.loginUserQuery.Username,
		Password: sc.loginUserQuery.Password,
		Salt:     "salt",
	})
	mockPasswordValidation(true, sc)
}

func (sc *grafargLoginScenarioContext) withNonExistingUser() {
	sc.getUserByLoginQueryReturns(nil)
}

func (sc *grafargLoginScenarioContext) withInvalidPassword() {
	sc.getUserByLoginQueryReturns(&models.User{
		Password: sc.loginUserQuery.Password,
		Salt:     "salt",
	})
	mockPasswordValidation(false, sc)
}

func (sc *grafargLoginScenarioContext) withDisabledUser() {
	sc.getUserByLoginQueryReturns(&models.User{
		IsDisabled: true,
	})
}
