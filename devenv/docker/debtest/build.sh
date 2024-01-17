#!/bin/bash

cp Dockerfile ../../dist
cd ../../dist

docker build --tag "grafarg/debtest" .

rm Dockerfile

docker run -i -t grafarg/debtest /bin/bash
