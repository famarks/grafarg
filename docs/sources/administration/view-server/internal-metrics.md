+++
title = "Internal Grafarg metrics"
description = "Internal metrics exposed by Grafarg"
keywords = ["grafarg", "metrics", "internal metrics"]
aliases = ["/docs/grafarg/latest/admin/metrics/"]
weight = 200
+++

# Internal Grafarg metrics

Grafarg collects some metrics about itself internally. Grafarg supports pushing metrics to Graphite or exposing them to be scraped by Prometheus.

For more information about configuration options related to Grafarg metrics, refer to [metrics]({{< relref "../../administration/configuration/#metrics" >}}) and [metrics.graphite]({{< relref "../../administration/configuration/#metrics-graphite" >}}) in [Configuration]({{< relref "../../administration/configuration.md" >}}).

## Available metrics

When enabled, Grafarg exposes a number of metrics, including:

- Active Grafarg instances
- Number of dashboards, users, and playlists
- HTTP status codes
- Requests by routing group
- Grafarg active alerts
- Grafarg performance

## Pull metrics from Grafarg into Prometheus

These instructions assume you have already added Prometheus as a data source in Grafarg.

1. Enable Prometheus to scrape metrics from Grafarg. In your configuration file (`grafarg.ini` or `custom.ini` depending on your operating system) remove the semicolon to enable the following configuration options:

   ```
   # Metrics available at HTTP API Url /metrics
   [metrics]
   # Disable / Enable internal metrics
   enabled           = true

   # Disable total stats (stat_totals_*) metrics to be generated
   disable_total_stats = false
   ```

1. (optional) If you want to require authorization to view the metrics endpoint, then uncomment and set the following options:

   ```
   basic_auth_username =
   basic_auth_password =
   ```

1. Restart Grafarg. Grafarg now exposes metrics at http://localhost:3000/metrics.
1. Add the job to your prometheus.yml file.
   Example:

   ```
   - job_name: 'grafarg_metrics'

      scrape_interval: 15s
      scrape_timeout: 5s

      static_configs:
        - targets: ['localhost:3000']
   ```
1. Restart Prometheus. Your new job should appear on the Targets tab.
1. In Grafarg, hover your mouse over the **Configuration** (gear) icon on the left sidebar and then click **Data Sources**.
1. Select the **Prometheus** data source.
1. On the Dashboards tab, **Import** the Grafarg metrics dashboard. All scraped Grafarg metrics are available in the dashboard.

## View Grafarg metrics in Graphite

These instructions assume you have already added Graphite as a data source in Grafarg.

1. Enable sending metrics to Graphite. In your configuration file (`grafarg.ini` or `custom.ini` depending on your operating system) remove the semicolon to enable the following configuration options:

   ```
   # Metrics available at HTTP API Url /metrics
   [metrics]
   # Disable / Enable internal metrics
   enabled           = true

   # Disable total stats (stat_totals_*) metrics to be generated
   disable_total_stats = false
   ```

1. Enable [metrics.graphite] options:
   ```
   # Send internal metrics to Graphite
   [metrics.graphite]
   # Enable by setting the address setting (ex localhost:2003)
   address = <hostname or ip>:<port#>
   prefix = prod.grafarg.%(instance_name)s.
   ```

1. Restart Grafarg. Grafarg now exposes metrics at http://localhost:3000/metrics and sends them to the Graphite location you specified.
