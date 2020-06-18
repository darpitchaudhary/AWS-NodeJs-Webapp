'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    //Cart belongsTo User
    return queryInterface.addColumn(
      'Cart', // name of Source model
      'buyer_id', // name of the key we're adding 
      {
        type: Sequelize.UUID,
        references: {
          model: 'Users', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }
    )
    .then(() => {
         //Cart belongsTo Books
    return queryInterface.addColumn(
      'Cart', // name of Source model
      'bookForeignId', // name of the key we're adding 
      {
        type: Sequelize.UUID,
        references: {
          model: 'Books', // name of Source model
          key: 'bookId', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    );
  }
  )
    .then(() => {
        //Books belongsTo User(Seller)
        return queryInterface.addColumn(
          'Image', // name of Source model
          'book_Img_id', // name of the key we're adding
          {
            type: Sequelize.UUID,
            references: {
              model: 'Books', // name of Target model
              key: 'bookId',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          }
        ); 
      }
    )

    .then(() => {
      //Books belongsTo User(Seller)
      return queryInterface.addColumn(
        'Books', // name of Source model
        'seller_id', // name of the key we're adding
        {
          type: Sequelize.UUID,
          references: {
            model: 'Users', // name of Target model
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        }
      ); 
    }
  )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Cart', // name of source model
      'buyer_id' // key we want to remove
    )
    .then(() => {
      return queryInterface.removeColumn(
       'Cart', // name of Source model
       'bookForeignId' // key we want to remove
       );
     }
    )
    .then(() => {
      return queryInterface.removeColumn(
        'Books',
        'seller_id'
      );
    }
    )
  }
};