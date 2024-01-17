#!/bin/bash

cp Dockerfile ../../dist
cd ../../dist

docker build --tag "grafarg/rpmtest" .

rm Dockerfile

docker run -i -t grafarg/rpmtest /bin/bash
