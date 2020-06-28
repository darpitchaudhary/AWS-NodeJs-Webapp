cd /home/ubuntu/latest_app/webapp
sudo kill -9 $(sudo lsof -t -i:3000)
source /etc/profile
npx sequelize db:migrate
pm2 start ./bin/www