#!/bin/bash
# build the app
ng build

# deploy to Harper Fabric
harperdb deploy restart=true
