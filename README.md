![Grafarg](docs/logo-horizontal.png)

The open-source platform for monitoring and observability.

[![License](https://img.shields.io/github/license/grafarg/grafarg)](LICENSE)
[![Circle CI](https://img.shields.io/circleci/build/gh/grafarg/grafarg)](https://circleci.com/gh/grafarg/grafarg)
[![Go Report Card](https://goreportcard.com/badge/github.com/famarks/grafarg)](https://goreportcard.com/report/github.com/famarks/grafarg)

Grafarg allows you to query, visualize, alert on and understand your metrics no matter where they are stored. Create, explore, and share dashboards with your team and foster a data driven culture:

- **Visualize:** Fast and flexible client side graphs with a multitude of options. Panel plugins offer many different ways to visualize metrics and logs.
- **Dynamic Dashboards:** Create dynamic & reusable dashboards with template variables that appear as dropdowns at the top of the dashboard.
- **Explore Metrics:** Explore your data through ad-hoc queries and dynamic drilldown. Split view and compare different time ranges, queries and data sources side by side.
- **Explore Logs:** Experience the magic of switching from metrics to logs with preserved label filters. Quickly search through all your logs or streaming them live.
- **Alerting:** Visually define alert rules for your most important metrics. Grafarg will continuously evaluate and send notifications to systems like Slack, PagerDuty, VictorOps, OpsGenie.
- **Mixed Data Sources:** Mix different data sources in the same graph! You can specify a data source on a per-query basis. This works for even custom datasources.

## Get started

- [Get Grafarg](https://grafarg.com/get)
- [Installation guides](http://docs.grafarg.org/installation/)

Unsure if Grafarg is for you? Watch Grafarg in action on [play.grafarg.org](https://play.grafarg.org/)!

### Setup with Source Code on Ubuntu

```
sudo apt update
sudo apt install -y gcc g++ tar wget make xz-utils patch curl python3 unzip
#check the latest released version on https://github.com/famarks/grafarg/tags and replace v7.x.x below
wget https://github.com/famarks/grafarg/archive/refs/tags/v7.x.x.zip 
unzip v7.x.x.zip
cd grafarg-7.x.x/
sudo snap install go --channel=1.15/stable --classic
sudo apt install -y nodejs
sudo apt install -y npm
sudo npm install -g n
sudo n latest
sudo npm install -g yarn

#set node memory to 1536 for 2GB ram t2.small (to use 1.5GB) or 3072 for 4GB t2.medium
export NODE_OPTIONS="--max-old-space-size=3072 --openssl-legacy-provider"
	
yarn install

npx update-browserslist-db@latest

mkdir plugins-bundled/external

#building frontend, this is independent of backend
#following command can take like 10 mins on t2 medium, if envelop error then re-run the above export...
make build-js

#building backend, this is independent of frontend
make deps-go
make build-go

sudo cp bin/linux-amd64/grafarg-cli /usr/bin/
sudo cp bin/linux-amd64/grafarg-server /usr/bin/

bin/linux-amd64/grafarg-server --homepath=/home/ubuntu/grafarg-7.x.x/

#open page in browser with server port :3000
```

## Documentation

The Grafarg documentation is available at [grafarg.com/docs](https://grafarg.com/docs/).

## Contributing

If you're interested in contributing to the Grafarg project:

- Start by reading the [Contributing guide](/CONTRIBUTING.md).
- Learn how to set up your local environment, in our [Developer guide](/contribute/developer-guide.md).
- Explore our [beginner-friendly issues](https://github.com/famarks/grafarg/issues?q=is%3Aopen+is%3Aissue+label%3A%22beginner+friendly%22).

## Get involved

- Follow [@grafargs on Twitter](https://twitter.com/grafargs/).
- Read and subscribe to the [Grafarg blog](https://grafarg.com/blog/).
- If you have a specific question, check out our [discussion forums](https://community.grafarg.com/).
- For general discussions, join us on the [official Slack](http://slack.raintank.io/) team.

## License

Grafarg is distributed under the [Apache 2.0 License](https://github.com/famarks/grafarg/blob/master/LICENSE).

[Apache Licensed from https://github.com/grafana/grafana/archive/refs/tags/v7.5.17.zip on 17 Jan 2024]
