import { DataType } from "sequelize-typescript";
import { sequelize } from "../../config/dbconfig";

const User = sequelize.define(
    "User",
    {
        account: {
            type: DataType.STRING,
            allowNull: false,
        },
        password: {
            type: DataType.STRING,
            allowNull: false,
        },
        id: {
            primaryKey: true,
            type: DataType.UUID,
            allowNull: true,
            autoIncrement:true
        },
    },
    {
        timestamps: false,
        modelName: "User",
        tableName: "users",
    },
);

export { sequelize, User };
