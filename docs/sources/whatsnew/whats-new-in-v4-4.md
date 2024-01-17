+++
title = "What's new in Grafarg v4.4"
description = "Feature and improvement highlights for Grafarg v4.4"
keywords = ["grafarg", "new", "documentation", "4.4.0", "release notes"]
aliases = ["/docs/grafarg/latest/guides/whats-new-in-v4-4/"]
weight = -11
[_build]
list = false
+++

## What's new in Grafarg v4.4

Grafarg v4.4 is now [available for download](https://grafarg.com/grafarg/download/4.4.0).

**Highlights**:

- Dashboard History - version control for dashboards.

## New Features

**Dashboard History**: View dashboard version history, compare any two versions (summary and json diffs), restore to old version. This big feature
was contributed by **Walmart Labs**. Big thanks to them for this massive contribution!
Initial feature request: [#4638](https://github.com/famarks/grafarg/issues/4638)
Pull Request: [#8472](https://github.com/famarks/grafarg/pull/8472)

## Enhancements
- **Elasticsearch**: Added filter aggregation label [#8420](https://github.com/famarks/grafarg/pull/8420), thx [@tianzk](github.com/tianzk)
- **Sensu**: Added option for source and handler [#8405](https://github.com/famarks/grafarg/pull/8405), thx [@joemiller](github.com/joemiller)
- **CSV**: Configurable csv export datetime format [#8058](https://github.com/famarks/grafarg/issues/8058), thx [@cederigo](github.com/cederigo)
- **Table Panel**: Column style that preserves formatting/indentation (like pre tag) [#6617](https://github.com/famarks/grafarg/issues/6617)
- **DingDing**: Add DingDing Alert Notifier [#8473](https://github.com/famarks/grafarg/pull/8473) thx [@jiamliang](https://github.com/jiamliang)

## Minor Enhancements

- **Elasticsearch**: Add option for result set size in raw_document [#3426](https://github.com/famarks/grafarg/issues/3426) [#8527](https://github.com/famarks/grafarg/pull/8527), thx [@mk-dhia](github.com/mk-dhia)

## Bug Fixes

- **Graph**: Bug fix for negative values in histogram mode [#8628](https://github.com/famarks/grafarg/issues/8628)

## Download

Head to the [v4.4 download page](https://grafarg.com/grafarg/download) for download links and instructions.

## Thanks

A big thanks to all the Grafarg users who contribute by submitting PRs, bug reports, helping out on our [community site](https://community.grafarg.com/) and providing feedback!
