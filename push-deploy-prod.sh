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

if ! grep -q "^version: $GIT_TAG\$" ${SCRIPT_DIR}/kube/chart/${APPNAME}/Chart.yaml; then
  echo "Chart version does not match Git tag"
  exit 1
fi

CURRENT_CONTEXT=$(kubectl config current-context)

echo "Deploying version $GIT_TAG to cluster $CURRENT_CONTEXT"

for project in "${PROJECTS}"; do
  docker push ${REGISTRY_NAME}/${REPO}/${project}:${GIT_TAG}
done

helm upgrade --install ${APPNAME} \
  $SCRIPT_DIR/kube/chart/${APPNAME}/ \
  --namespace ${APPNAME} --create-namespace \
  --set web.repository.tag=${GIT_TAG}