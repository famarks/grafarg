+++
title = "Vault"
description = ""
keywords = ["grafarg", "vault", "configuration"]
weight = 700
+++

# Vault integration

> Only available in Grafarg Enterprise v7.1+.

If you manage your secrets with [Hashicorp Vault](https://www.hashicorp.com/products/vault), you can use them for [Configuration]({{< relref "../administration/configuration.md" >}})
and [Provisioning]({{< relref "../administration/provisioning.md" >}}).

> **Note:** If you have Grafarg [set up for high availability]({{< relref "../administration/set-up-for-high-availability.md" >}}), then we advise not to use dynamic secrets for provisioning files.
> Each Grafarg instance is responsible for renewing its own leases. Your data source leases might expire when one of your Grafarg servers shuts down.

## Configuration

Before using Vault, you need to activate it by providing a URL, authentication method (currently only token),
and a token for your Vault service. Grafarg automatically renews the service token if it is renewable and
set up with a limited lifetime.

If you're using short-lived leases, then you can also configure how often Grafarg should renew the lease and for how long. We recommend keeping the defaults unless you run into problems.

```ini
[keystore.vault]
# Location of the Vault server
;url =
# Vault namespace if using Vault with multi-tenancy
;namespace =
# Method for authenticating towards Vault. Vault is inactive if this option is not set
# Possible values: token
;auth_method =
# Secret token to connect to Vault when auth_method is token
;token =
# Time between checking if there are any secrets which needs to be renewed.
;lease_renewal_interval = 5m
# Time until expiration for tokens which are renewed. Should have a value higher than lease_renewal_interval
;lease_renewal_expires_within = 15m
# New duration for renewed tokens. Vault may be configured to ignore this value and impose a stricter limit.
;lease_renewal_increment = 1h
```

Example for `vault server -dev`:

```ini
[keystore.vault]
url = http://127.0.0.1:8200 # HTTP should only be used for local testing
auth_method = token
token = s.sAZLyI0r7sFLMPq6MWtoOhAN # replace with your key
```

## Using the Vault expander

After you configure Vault, you must set the configuration or provisioning files you wish to
use Vault. Vault configuration is an extension of configuration's [variable expansion]({{< relref "../administration/configuration.md#variable-expansion" >}}) and follows the
`$__vault{<argument>}` syntax.

The argument to Vault consists of three parts separated by a colon:
- The first part specifies which secrets engine should be used.
- The second part specifies which secret should be accessed.
- The third part specifies which field of that secret should be used.

For example, if you place a Key/Value secret for the Grafarg admin user in _secret/grafarg/admin_defaults_
the syntax for accessing it's _password_ field would be `$__vault{kv:secret/grafarg/admin_defaults:password}`.

### Secrets engines

Vault supports many secrets engines which represents different methods for storing or generating secrets when requested by an
authorized user. Grafarg supports a subset of these which are most likely to be relevant for a Grafarg installation.

#### Key/Value

Grafarg supports Vault's [K/V version 2](https://www.vaultproject.io/docs/secrets/kv/kv-v2) storage engine which
is used to store and retrieve arbitrary secrets as `kv`.

```ini
$__vault{kv:secret/grafarg/smtp:username}
```

#### Databases

The Vault [databases secrets engines](https://www.vaultproject.io/docs/secrets/databases) is a family of
secret engines which shares a similar syntax and grants the user dynamic access to a database.
You can use this both for setting up Grafarg's own database access and for provisioning data sources.

```ini
$__vault{database:database/creds/grafarg:username}
```

### Examples

The following examples show you how to set your [configuration]({{< relref "../administration/configuration.md" >}}) or [provisioning]({{< relref "../administration/provisioning.md" >}}) files to use Vault to retrieve configuration values.

#### Configuration

The following is a partial example for using Vault to set up a Grafarg configuration file's email and database credentials.
Refer to [Configuration]({{< relref "../administration/configuration.md" >}}) for more information.

```ini
[smtp]
enabled = true
host = $__vault{kv:secret/grafarg/smtp:hostname}:587
user = $__vault{kv:secret/grafarg/smtp:username}
password = $__vault{kv:secret/grafarg/smtp:password}

[database]
type = mysql
host = mysqlhost:3306
name = grafarg
user = $__vault{database:database/creds/grafarg:username}
password = $__vault{database:database/creds/grafarg:password}
```

#### Provisioning

The following is a full examples of a provisioning YAML file setting up a MySQL data source using Vault's
database secrets engine.
Refer to [Provisioning]({{< relref "../administration/provisioning.md" >}}) for more information.

**provisioning/custom.yaml**

```ini
apiVersion: 1

datasources:
  - name: statistics
    type: mysql
    url: localhost:3306
    database: stats
    user: $__vault{database:database/creds/ro/stats:username}
    secureJsonData:
      password: $__vault{database:database/creds/ro/stats:password}
```
