import {Model} from "sequelize"
import { sequelize } from "../../config/sequelize.js"
import { DataTypes } from "sequelize"


class Hotel extends Model {
    id;
    name;
    address;
    city;
    state;
    zip;
    country;
    phone;
    email;
    imageUrl;
    createdAt;
    updatedAt;
    deletedAt;
}

Hotel.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    address:{
        type:DataTypes.STRING,
        allowNull:false
    },
    city:{
        type:DataTypes.STRING,
        allowNull:false
    },
    state:{
        type:DataTypes.STRING,
        allowNull:false
    },
    zip:{
        type:DataTypes.STRING,
        allowNull:false
    },
    country:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    createdAt:{
        type:DataTypes.DATE,
        allowNull:false
    },
    updatedAt:{
        type:DataTypes.DATE,
        allowNull:false
    },
    imageUrl:{
        type:DataTypes.STRING,
        allowNull:true
    },
    deletedAt:{
        type:DataTypes.DATE,
        allowNull:true
    }
},{
    sequelize,
    tableName:"hotels",
    timestamps:true,
    paranoid:true
})

export default Hotel
    

  