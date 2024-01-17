#!/bin/bash

blocks_dir=docker/blocks
docker_dir=docker
template_dir=templates

grafarg_config_file=conf.tmp
grafarg_config=config

compose_header_file=docker/compose_header.yml
compose_file=docker-compose.yaml
env_file=.env

if [ "$#" == 0 ]; then
    blocks=`ls $blocks_dir`
    if [ -z "$blocks" ]; then
        echo "No Blocks available in $blocks_dir"
    else
        echo "Available Blocks:"
        for block in $blocks; do
            echo "    $block"
        done
    fi
    exit 0
fi

for file in $grafarg_config_file $compose_file $env_file; do
    if [ -e $file ]; then
        echo "Deleting $file"
        rm $file
    fi
done

echo "Adding Compose header to $compose_file"
cat $compose_header_file >> $compose_file

for dir in $@; do
    current_dir=$blocks_dir/$dir
    if [ ! -d "$current_dir" ]; then
        echo "$current_dir is not a directory"
        exit 1
    fi

    if [ -e $current_dir/$grafarg_config ]; then
        echo "Adding $current_dir/$grafarg_config to $grafarg_config_file"
        cat $current_dir/$grafarg_config >> $grafarg_config_file
        echo "" >> $grafarg_config_file
    fi

    if [ -e $current_dir/$compose_file ]; then
        echo "Adding $current_dir/$compose_file to $compose_file"
        cat $current_dir/$compose_file >> $compose_file
        echo "" >> $compose_file
    fi

    if [ -e $current_dir/$env_file ]; then
        echo "Adding $current_dir/$env_file to .env"
        cat $current_dir/$env_file >> .env
        echo "" >> .env
    fi
done

