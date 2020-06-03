'use strict';
module.exports = (sequelize, DataTypes) => {
  var Books = sequelize.define('Books', {
    bookId:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      id:{
        allowNull: false,
        type: DataTypes.UUID,
      },
      isbn: {
        allowNull: false,
        type: DataTypes.STRING
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING
      },
      authors: {
        allowNull: false,
        type: DataTypes.STRING
      },
      publicationDate: {
        allowNull: false,
        type: DataTypes.DATE
      },
      quantity: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      price: {
        allowNull: false,
        type: DataTypes.DOUBLE
      },
    });

  return Books;
};