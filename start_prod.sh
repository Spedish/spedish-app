echo Sync to latest git master
git fetch origin master

echo Stopping mongodb
PID=`ps -ef | grep mongod | grep '/opt/spedish/db' | grep -v grep | awk '{print $2}'`

if [ ! -z "$PID" ]; then
  echo Stopping mongod with PID $PID
  kill -15 $PID
fi

echo Restarting mongodb
nohup mongod --dbpath /opt/spedish/db &

echo Stopping nodejs
PID=`ps -ef | grep nodejs | grep '--prod' | grep -v grep | awk '{print $2}'`

if [ ! -z "$PID" ]; then
  echo Stopping nodejs with PID $PID
  kill -15 $PID
fi

echo Installing server dependecies
cd server
npm install

echo Starting nodejs
nohup nodejs index.js --prod &
cd ..

echo Stopping nginx
sudo service nginx stop

echo Installing frontend dependencies
npm install
bower install

echo Building frontend dist package
rvm use system
grunt build

echo Restarting nginx
sudo service nginx restart

