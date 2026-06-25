export default {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("hotels", "imageUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("hotels", "imageUrl")
  },
}
