FROM grafarg/wix-toolset-ci:v3

RUN mkdir -p /tmp/dist /tmp/cache && \
    cd /tmp/dist && \
    wget https://dl.grafarg.com/enterprise/master/grafarg-enterprise-6.6.0-ca61af52pre.windows-amd64.zip && \
    unzip -l *.zip

COPY . /package-grafarg
WORKDIR /package-grafarg

RUN cp ./msigenerator/cache/nssm-2.24.zip /tmp/cache

RUN cd msigenerator && python3 generator/build.py
