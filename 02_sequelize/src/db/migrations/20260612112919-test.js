
 export async function up (queryInterface, Sequelize) {
      await queryInterface.createTable("users",{
          id:{
             type:Sequelize.INTEGER,
             autoIncrement:true,
             primaryKey:true,
          },
          name:{
             type:Sequelize.STRING,
             allowNull:false,
          },
          email:{
             type:Sequelize.STRING,
             allowNull:false,
          },
          password:{
             type:Sequelize.STRING,
             allowNull:false,
          },
      })
  }

  export  async function down (queryInterface, Sequelize) {
       await queryInterface.dropTable("users")
  }



