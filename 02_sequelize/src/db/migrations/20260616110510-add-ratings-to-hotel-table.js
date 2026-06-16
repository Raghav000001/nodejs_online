
 export default {
  async up (queryInterface, Sequelize) {
      queryInterface.addColumn("hotels","rating",{
         type:Sequelize.INTEGER,
         allowNull:false
      })
        
  },

  async down (queryInterface, Sequelize) {
      queryInterface.removeColumn("hotels","rating")
  }
};



// up => logic => coloumn add 
// down => remove