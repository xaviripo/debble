#!/bin/bash

source venv/bin/activate
export NVM_DIR=$HOME/.nvm
source $NVM_DIR/nvm.sh
nvm use 16.16

cd frontend
npm install
npm run build

cd ..
gunicorn wsgi:app
