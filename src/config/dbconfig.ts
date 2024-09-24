import { Sequelize } from "sequelize-typescript";

const sequelize = new Sequelize(
    "mysql://wniarai:Wei@739867901@106.53.221.156:1309/transf",
    {
        timezone: "+08:00",
    },
);

async function dbConnection() {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

dbConnection();

export { sequelize };
