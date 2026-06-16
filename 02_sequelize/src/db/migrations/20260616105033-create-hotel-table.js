

export default {
  async up (queryInterface, Sequelize) {
        queryInterface.createTable("hotels",{
             id:{
                type:Sequelize.INTEGER,
                autoIncrement:true,
                primaryKey:true
             },
             name:{
                type:Sequelize.STRING,
                allowNull:false
             },
             address:{
                type:Sequelize.STRING,
                allowNull:false
             },
             city:{
                type:Sequelize.STRING,
                allowNull:false
             },
             state:{
                type:Sequelize.STRING,
                allowNull:false
             },
             zip:{
                type:Sequelize.STRING,
                allowNull:false
             },
             country:{
                type:Sequelize.STRING,
                allowNull:false
             },
             phone:{
                type:Sequelize.STRING,
                allowNull:false
             },
             email:{
                type:Sequelize.STRING,
                allowNull:false
             },
             createdAt:{
                type:Sequelize.DATE,
                allowNull:false
             },
             updatedAt:{
                type:Sequelize.DATE,
                allowNull:false
             }
        })
  },

  async down (queryInterface, Sequelize) {
        queryInterface.dropTable("hotels")
  }
};

// up => create table
// down => revert