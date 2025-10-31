#!/bin/bash
# build the frontend
ng build

# build the backend
npm run build:backend

# deploy to Harper Fabric
harperdb deploy restart=true
