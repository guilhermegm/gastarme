const bcrypt = require('bcrypt')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          name: 'Administrator',
          email: 'admin@gastar.me',
          password: await bcrypt.hash('admin', 10),
          accessLevel: 'admin',
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ],
      { logging: true },
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  },
}
