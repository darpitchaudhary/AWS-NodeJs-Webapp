'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Cart', {
      cartId:{
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      cartOneTimeId:{
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      bookId:{
        allowNull: false,
        type: Sequelize.UUID,
      },
      id:{
        allowNull: false,
        type: Sequelize.UUID,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      quantity: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      price: {
        allowNull: false,
        type: Sequelize.DOUBLE,
      },
      delFlag:{
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue:0
      },
      paymentComplete:{
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue:0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Cart');
  }
};