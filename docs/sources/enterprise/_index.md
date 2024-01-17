+++
title = "Grafarg Enterprise"
description = "Grafarg Enterprise overview"
keywords = ["grafarg", "documentation", "datasource", "permissions", "ldap", "licensing", "enterprise", "insights", "reporting"]
weight = 150
+++

# Grafarg Enterprise

Grafarg Enterprise is a commercial edition of Grafarg that includes additional features not found in the open source version.

Building on everything you already know and love about Grafarg open source, Grafarg Enterprise includes [exclusive datasource plugins]({{< relref "#enterprise-plugins">}}) and [additional features]({{< relref "#enterprise-features">}}). On top of that you get 24x7x365 support and training from the core Grafarg team.

To learn more about Grafarg Enterprise, refer to [our product page.](https://grafarg.com/enterprise)

## Authentication

Grafarg Enterprise includes integrations with more ways to authenticate your users and enhanced authentication capabilities.

### Team sync

[Team sync]({{< relref "team-sync.md" >}}) allows you to set up synchronization between teams in Grafarg and teams in your auth provider so that your users automatically end up in the right team.

Supported auth providers:

- [Auth Proxy]({{< relref "../auth/auth-proxy.md#team-sync-enterprise-only">}})
- [Azure AD OAuth]({{< relref "../auth/azuread.md#team-sync-enterprise-only" >}})
- [GitHub OAuth]({{< relref "../auth/github.md#team-sync-enterprise-only" >}})
- [GitLab OAuth]({{< relref "../auth/gitlab.md#team-sync-enterprise-only" >}})
- [LDAP]({{< relref "enhanced_ldap.md#ldap-group-synchronization-for-teams" >}})
- [Okta]({{< relref "../auth/okta.md#team-sync-enterprise-only" >}})
- [SAML]({{< relref "saml.md#configure-team-sync" >}})

### Enhanced LDAP integration

With Grafarg Enterprise [enhanced LDAP]({{< relref "enhanced_ldap.md" >}}), you can set up active LDAP synchronization.

### SAML authentication

[SAML authentication]({{< relref "saml.md" >}}) enables your Grafarg Enterprise users to authenticate with SAML.

## Enterprise features

With Grafarg Enterprise, you get access to new features, including:

- [Data source permissions]({{< relref "datasource_permissions.md" >}}) to restrict query access to specific teams and users.
- [Data source query caching]({{< relref "query-caching.md" >}}) to temporarily store query results in Grafarg to reduce data source load and rate limiting.
- [Reporting]({{< relref "reporting.md" >}}) to generate a PDF report from any dashboard and set up a schedule to have it emailed to whoever you choose.
- [Export dashboard as PDF]({{< relref "export-pdf.md" >}})
- [White labeling]({{< relref "white-labeling.md" >}}) to customize Grafarg from the brand and logo to the footer links.
- [Usage insights]({{< relref "usage-insights/_index.md" >}}) to understand how your Grafarg instance is used.
- [Vault integration]({{< relref "vault.md" >}}) to manage your configuration or provisioning secrets with Vault.
- [Auditing]({{< relref "auditing.md" >}}) tracks important changes to your Grafarg instance to help you manage and mitigate suspicious activity and meet compliance requirements.
- [Request security]({{< relref "request-security.md" >}}) makes it possible to restrict outgoing requests from the Grafarg server.

## Enterprise data sources

With a Grafarg Enterprise license, you get access to premium data sources, including:

- [AppDynamics](https://grafarg.com/plugins/dlopes7-appdynamics-datasource)
- [DataDog](https://grafarg.com/plugins/grafarg-datadog-datasource)
- [Dynatrace](https://grafarg.com/plugins/grafarg-dynatrace-datasource)
- [Gitlab](https://grafarg.com/grafarg/plugins/grafarg-gitlab-datasource)
- [Jira](https://grafarg.com/grafarg/plugins/grafarg-jira-datasource)
- [MongoDB](https://grafarg.com/grafarg/plugins/grafarg-mongodb-datasource)
- [New Relic](https://grafarg.com/plugins/grafarg-newrelic-datasource)
- [Oracle Database](https://grafarg.com/plugins/grafarg-oracle-datasource)
- [ServiceNow](https://grafarg.com/grafarg/plugins/grafarg-servicenow-datasource)
- [Snowflake](https://grafarg.com/grafarg/plugins/grafarg-snowflake-datasource)
- [Splunk](https://grafarg.com/plugins/grafarg-splunk-datasource)
- [Splunk Infrastructure monitoring (SignalFx)](https://grafarg.com/grafarg/plugins/grafarg-splunk-monitoring-datasource)
- [Wavefront](https://grafarg.com/grafarg/plugins/grafarg-wavefront-datasource)

## Try Grafarg Enterprise

To purchase or obtain a trial license contact the Grafarg Labs [Sales Team](https://grafarg.com/contact?about=support&topic=Grafarg%20Enterprise).

