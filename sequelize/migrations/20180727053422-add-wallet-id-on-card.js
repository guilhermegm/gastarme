module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Cards', 'walletId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Wallets',
        key: 'id',
      },
    })
  },

  down: queryInterface => {
    return queryInterface.removeColumn('Cards', 'walletId')
  },
}
