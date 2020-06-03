'use strict';
module.exports = (sequelize, DataTypes) => {
  var Cart = sequelize.define('Cart', {
    cartId:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      cartOneTimeId:{
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      bookId:{
        allowNull: false,
        type: DataTypes.UUID,
      },
      id:{
        allowNull: false,
        type: DataTypes.UUID,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING
      },
      quantity: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      price: {
        allowNull: false,
        type: DataTypes.DOUBLE
      },
      delFlag:{
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue:0
      },
      paymentComplete:{
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue:0
      },
    });
  return Cart;
};