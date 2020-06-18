'use strict';
module.exports = (sequelize, DataTypes) => {
  var Image = sequelize.define('Image', {
    imageId:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      imageName:{
        allowNull: false,
        type: DataTypes.STRING,
      },
      book_Img_id:{
        allowNull: false,
        type: DataTypes.UUID,
      },
    },
    {
      freezeTableName: true
    }
    );
  
    Image.associate = models => {
      Image.belongsTo(models.Books, { foreignKey: 'book_Img_id' });
  };

  return Image;
};