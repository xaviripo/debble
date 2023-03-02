# Setting up the machine

First, install NVM and Python 3.

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask --app debble init-db # Create the database
```

Depoy using:

```
./run.sh
```

# Compile the frontend

```sh
# From the root of this repo
cd frontend
nvm use 16.16
npm install
npm run build # or npm run watch
```

# Run the server

```sh
# From the root of this repo
source venv/bin/activate
flask --app debble --debug run
```
