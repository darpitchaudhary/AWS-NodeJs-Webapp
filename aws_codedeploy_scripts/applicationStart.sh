cd /home/ubuntu/latest_app/webapp
sudo kill -9 $(sudo lsof -t -i:3000)
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/ubuntu/latest_app/webapp/cloudwatch-config.json -s
source /etc/profile
npx sequelize db:migrate
pm2 start ./bin/www