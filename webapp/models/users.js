'use strict';
module.exports = (sequelize, DataTypes) => {
  var Users = sequelize.define('Users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      
      allowNull: false,
      primaryKey: true
    },
    emailId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    lastName: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    password: {
        allowNull: false,
        type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true
  });

  Users.associate = models => {
  Users.hasOne(models.Cart, { foreignKey: 'buyer_id'});
  Users.hasMany(models.Books, { foreignKey: 'seller_id'});
};

  return Users;
};