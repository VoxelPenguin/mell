#!/bin/bash
# get environment variables (e.g. Harper credentials)
export $(grep -v '^#' .env | xargs -d '\n')

# build the frontend
ng build

# build the backend
npm run build:backend

# deploy to Harper Fabric
harperdb deploy target=$HARPER_DEPLOY_URL replicated=true restart=true
