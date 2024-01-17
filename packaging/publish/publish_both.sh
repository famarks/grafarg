#! /usr/bin/env bash
version=5.4.2

# wget https://dl.grafarg.com/oss/release/grafarg_${version}_amd64.deb
#
# package_cloud push grafarg/stable/debian/jessie grafarg_${version}_amd64.deb
# package_cloud push grafarg/stable/debian/wheezy grafarg_${version}_amd64.deb
# package_cloud push grafarg/stable/debian/stretch grafarg_${version}_amd64.deb
#
# package_cloud push grafarg/testing/debian/jessie grafarg_${version}_amd64.deb
# package_cloud push grafarg/testing/debian/wheezy grafarg_${version}_amd64.deb --verbose
# package_cloud push grafarg/testing/debian/stretch grafarg_${version}_amd64.deb --verbose

wget https://dl.grafarg.com/oss/release/grafarg-${version}-1.x86_64.rpm

package_cloud push grafarg/testing/el/6 grafarg-${version}-1.x86_64.rpm --verbose
package_cloud push grafarg/testing/el/7 grafarg-${version}-1.x86_64.rpm --verbose

package_cloud push grafarg/stable/el/7 grafarg-${version}-1.x86_64.rpm --verbose
package_cloud push grafarg/stable/el/6 grafarg-${version}-1.x86_64.rpm --verbose

rm grafarg*.{deb,rpm}
