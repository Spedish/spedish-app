# Spedish Webapp
DO NOT install with sudo.
## Backend  
- NodeJS  
```
brew install node
```
- MongoDB 
```
brew install mongodb
```
- GruntCLI  
```
npm install -g grunt-cli
```
- Bower  
```
npm install -g bower
```

### Build
```
npm install
```

### Run
1. Start MongoDB
```
mongod
```
2. Start server
```
node index.js
```
## Frontend  
- AngularJS  
```
cd client
npm install -g yo
npm install -g generator-angular
npm install -g generator-karma
yo angular
gem install compass
bower install
```
### Run
```
grunt serve
```
