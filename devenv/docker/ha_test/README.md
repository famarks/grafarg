# Grafarg High Availability (HA) test setup

A set of docker compose services which together creates a Grafarg HA test setup with capability of easily
scaling up/down number of Grafarg instances.

Included services

- Grafarg
- Mysql - Grafarg configuration database and session storage
- Prometheus - Monitoring of Grafarg and used as data source of provisioned alert rules
- Nginx - Reverse proxy for Grafarg and Prometheus. Enables browsing Grafarg/Prometheus UI using a hostname

## Prerequisites

### Build grafarg docker container

Build a Grafarg docker container from current branch and commit and tag it as grafarg/grafarg:dev.

```bash
$ cd <grafarg repo>
$ make build-docker-full
```

### Virtual host names

#### Alternative 1 - Use dnsmasq

```bash
$ sudo apt-get install dnsmasq
$ echo 'address=/loc/127.0.0.1' | sudo tee /etc/dnsmasq.d/dnsmasq-loc.conf > /dev/null
$ sudo /etc/init.d/dnsmasq restart
$ ping whatever.loc
PING whatever.loc (127.0.0.1) 56(84) bytes of data.
64 bytes from localhost (127.0.0.1): icmp_seq=1 ttl=64 time=0.076 ms
--- whatever.loc ping statistics ---
1 packet transmitted, 1 received, 0% packet loss, time 1998ms
```

#### Alternative 2 - Manually update /etc/hosts

Update your `/etc/hosts` to be able to access Grafarg and/or Prometheus UI using a hostname.

```bash
$ cat /etc/hosts
127.0.0.1       grafarg.loc
127.0.0.1       prometheus.loc
```

## Start services

```bash
$ docker-compose up -d
```

Browse
- http://grafarg.loc/
- http://prometheus.loc/

Check for any errors

```bash
$ docker-compose logs | grep error
```

### Scale Grafarg instances up/down

Scale number of Grafarg instances to `<instances>`

```bash
$ docker-compose up --scale grafarg=<instances> -d
# for example 3 instances
$ docker-compose up --scale grafarg=3 -d
```

## Test alerting

### Create notification channels

Creates default notification channels, if not already exists

```bash
$ ./alerts.sh setup
```

### Slack notifications

Disable

```bash
$ ./alerts.sh slack -d
```

Enable and configure url

```bash
$ ./alerts.sh slack -u https://hooks.slack.com/services/...
```

Enable, configure url and enable reminders

```bash
$ ./alerts.sh slack -u https://hooks.slack.com/services/... -r -e 10m
```

### Provision alert dashboards with alert rules

Provision 1 dashboard/alert rule (default)

```bash
$ ./alerts.sh provision
```

Provision 10 dashboards/alert rules

```bash
$ ./alerts.sh provision -a 10
```

Provision 10 dashboards/alert rules and change condition to `gt > 100`

```bash
$ ./alerts.sh provision -a 10 -c 100
```

### Pause/unpause all alert rules

Pause

```bash
$ ./alerts.sh pause
```

Unpause

```bash
$ ./alerts.sh unpause
```
