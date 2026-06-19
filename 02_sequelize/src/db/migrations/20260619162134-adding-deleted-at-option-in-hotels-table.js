export default {
    async up(queryInterface, Sequelize){
       queryInterface.addColumn("hotels","deletedAt",{
        type:Sequelize.DATE,
        allowNull:true,
        defaultValue:null
       })
    },
    async down(queryInterface, Sequelize){
      queryInterface.removeColumn("hotels","deletedAt")
    }
}
