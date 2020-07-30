require('dotenv').config();
module.exports = 
{
  "production": {
    "username": "root",
    "password": "root123",
    "database": "csye6225dum",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "development": {
    "username": process.env.RDS_USER_NAME,
    "password": process.env.RDS_PASSWORD,
    "database": process.env.RDS_DB_NAME,
    "host": process.env.host,
    "dialect": "mysql",
    "dialectOptions": { ssl: 'Amazon RDS' },
    "operatorsAliases": false
  }
}
