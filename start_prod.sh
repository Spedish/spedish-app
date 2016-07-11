RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}Sync to latest git master${NC}"
git fetch origin master

echo -e "${RED}Stopping mongodb${NC}"
PID=`ps -ef | grep mongod | grep '/opt/spedish/db' | grep -v grep | awk '{print $2}'`

if [ ! -z "$PID" ]; then
  echo -e "${RED}Stopping mongod with PID ${PID} ${NC}"
  kill -15 $PID
fi

echo -e "${RED}Restarting mongodb${NC}"
nohup mongod --dbpath /opt/spedish/db &

echo -e "${RED}Stopping nodejs${NC}"
PID=`lsof -i :4000 | grep nodejs | awk '{print $2}'`

if [ ! -z "$PID" ]; then
  echo -e "${RED}Stopping nodejs with PID $PID ${NC}"
  kill -15 $PID
fi

echo -e "${RED}Installing server dependecies${NC}"
cd server
npm install

echo -e "${RED}Starting nodejs${NC}"
export NODE_ENV=prod
nohup nodejs index.js &

echo -e "${RED}Stopping nginx${NC}"
sudo service nginx stop

echo -e "${RED}Installing frontend dependencies${NC}"
cd ../client
npm install
bower install

echo -e "${RED}Building frontend dist package${NC}"
rvm use system
grunt build

echo -e "${RED}Restarting nginx${NC}"
sudo service nginx restart

# Restore pwd
cd ..
