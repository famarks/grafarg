+++
title = "Release notes for Grafarg 7.3.4"
[_build]
list = false
+++

<!-- Auto generated by update changelog github action -->

# Release notes for Grafarg 7.3.4

### Bug fixes

* **Dashboard**: Fixes kiosk state after being redirected to login page and back. [#29273](https://github.com/famarks/grafarg/pull/29273), [@torkelo](https://github.com/torkelo)
* **InfluxDB**: Update flux library to fix support for boolean label values. [#29310](https://github.com/famarks/grafarg/pull/29310), [@ryantxu](https://github.com/ryantxu)
* **Security**: Fixes minor security issue with alert notification webhooks that allowed GET & DELETE requests. [#29330](https://github.com/famarks/grafarg/pull/29330), [@wbrowne](https://github.com/wbrowne)
* **Table**: Fixes issues with phantom extra 0 for zero values. [#29165](https://github.com/famarks/grafarg/pull/29165), [@dprokop](https://github.com/dprokop)

