#! /usr/bin/env bash
deb_ver=5.1.0-beta1
rpm_ver=5.1.0-beta1

wget https://s3-us-west-2.amazonaws.com/grafarg-releases/release/grafarg_${deb_ver}_amd64.deb

package_cloud push grafarg/testing/debian/jessie grafarg_${deb_ver}_amd64.deb
package_cloud push grafarg/testing/debian/wheezy grafarg_${deb_ver}_amd64.deb
package_cloud push grafarg/testing/debian/stretch grafarg_${deb_ver}_amd64.deb

wget https://s3-us-west-2.amazonaws.com/grafarg-releases/release/grafarg-${rpm_ver}.x86_64.rpm

package_cloud push grafarg/testing/el/6 grafarg-${rpm_ver}.x86_64.rpm
package_cloud push grafarg/testing/el/7 grafarg-${rpm_ver}.x86_64.rpm

rm grafarg*.{deb,rpm}
