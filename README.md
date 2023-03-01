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
