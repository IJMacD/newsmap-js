#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source ${SCRIPT_DIR}/../../vars.sh

# make sure the cluster isn't running
k3d cluster stop ${APPNAME}

k3d cluster delete ${APPNAME}
