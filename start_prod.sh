# Sync master from git
git fetch origin master

# Check if there is a prod mongodb already started
PID=`ps -ef | grep mongod | grep '/opt/spedish/db' | grep -v grep | awk '{print $2}'`

if [ ! -z "$PID" ]; then
  echo Stopping mongod with PID $PID
  kill -15 $PID
fi

# Start Mongodb
nohup mongod --dbpath /opt/spedish/db &

# Stop NodeJS server
PID=`ps -ef | grep nodejs | grep '--prod' | grep -v grep | awk '{print $2}'`

if [ ! -z "$PID" ]; then
  echo Stopping nodejs with PID $PID
  kill -15 $PID
fi

# Install server dependencies
cd server
npm install

# Start server
nohup nodejs index.js --prod &
cd ..

# Stop nginx
sudo service nginx stop

# Install dependencies
npm install
bower install

# Build frontend server
rvm use system
grunt build

# Serve the dist build of frontend server using nginx
sudo service nginx restart

