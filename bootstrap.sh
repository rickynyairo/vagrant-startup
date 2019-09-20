#!/usr/bin/env bash
export YELLOW='\033[0;33m'
echo -e "${YELLOW}>>>> update vm image"
apt-get update
echo -e "${YELLOW}>>>> use curl to install nodejs"
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
apt-get install -y build-essential
echo -e "${YELLOW}>>>> installing npm globally"
npm install -g npm
echo -e "${YELLOW}>>>> removing unused stubs"
apt-get autoremove -y

######## APACHE
echo -e "${YELLOW}>>>> installing apache"
apt-get install -y apache2
# symlink all the files to be served by the server.
if ! [ -L /var/www ]; then
  rm -rf /var/www
  ln -fs /vagrant /var/www
fi

# Install mongodb database
echo -e "${YELLOW}>>>> installing mongodb"
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
# create list file
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
sudo apt-get update
# install database and dependencies
sudo apt-get install -y mongodb-org=4.2.0 mongodb-org-server=4.2.0 mongodb-org-shell=4.2.0 mongodb-org-mongos=4.2.0 mongodb-org-tools=4.2.0
# set dependency versions to be fixed
echo "mongodb-org hold" | sudo dpkg --set-selections
echo "mongodb-org-server hold" | sudo dpkg --set-selections
echo "mongodb-org-shell hold" | sudo dpkg --set-selections
echo "mongodb-org-mongos hold" | sudo dpkg --set-selections
echo "mongodb-org-tools hold" | sudo dpkg --set-selections

echo -e "${YELLOW}>>>> starting the database"
sudo service mongod start
echo -e "${YELLOW}>>>> bootstrap the node application"
cd vagrant-startup/
npm install --no-warnings
source .env
npm run start --no-warnings
