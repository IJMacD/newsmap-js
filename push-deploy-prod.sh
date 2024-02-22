#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

if [ -n "$(git status --porcelain)" ]; then
  echo "Please ensure there are no changes or untracked files before deploying"
  exit 1
fi

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source ${SCRIPT_DIR}/vars.sh

# Override
export KUBECONFIG=~/.kube/config.prod

# Delete the images on the node - not the registry!
# docker exec k3d-aiapp-server-0 sh -c 'ctr image rm $(ctr image list -q)'

for project in "${PROJECTS}"; do
  docker push ${REGISTRY_NAME}/${REPO}/${project}:${TCTAG}
done

helm upgrade --install ${APPNAME} \
  $SCRIPT_DIR/kube/chart/${APPNAME}/ \
  --namespace ${APPNAME} --create-namespace \
  --set web.repository.tag=${TCTAG}