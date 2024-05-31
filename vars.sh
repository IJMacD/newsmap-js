#!/bin/bash

export APPNAME=newsmap-js
export LOCALHOST_NAME=${APPNAME}.localhost
export TLS_SECRET_NAME=${APPNAME}-cert
export CONTAINER_USER_ID=1001
export REGISTRY_NAME=docker.io
export REPO=ijmacd
export PROJECTS="newsmap-js"
export GIT_TAG=$(git describe --tags)
export LOCAL_KUBECONFIG=~/.kube/config.k3d
export LOCAL_REGISTRY_PORT=5111
export LOCAL_REGISTRY_NAME=k3d-registry.localhost
export LOCAL_REGISTRY=${LOCAL_REGISTRY_NAME}:${LOCAL_REGISTRY_PORT}
