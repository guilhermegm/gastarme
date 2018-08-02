
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Cards', 'userId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Cards', 'userId')
  }
};
