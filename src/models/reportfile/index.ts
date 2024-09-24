import { DataType } from "sequelize-typescript";
import { sequelize } from "../../config/dbconfig";
import {DataTypes} from "sequelize";

const ReportFile = sequelize.define(
    'ReportFile',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: true,
            autoIncrement: true,
            primaryKey: true
        },
        filename: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        path: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        file_type: {
            type: DataTypes.ENUM('html', 'docx'),
            allowNull: false
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        },
        db_type: {
            type: DataTypes.ENUM('g100', 'e100', 'pg', 'og', 'panwei'),
            allowNull: false,
            defaultValue: 'g100'
        }
    }, {
        tableName: 'report_files',
        modelName: "ReportFile",
        timestamps: false,
        indexes: [
            {
                name: 'user_id',
                fields: ['user_id']
            }
        ]
    });


export { sequelize, ReportFile };
