const postgres = require("postgres");
require("dotenv").config();
const connection = process.env.POSTGRES_URL;
const sql = postgres(connection);

const setupDB = async () => {
    await sql`CREATE TABLE IF NOT EXISTS users
              (
                  discordId   bigint primary key,
                  discordName varchar(255)
              )`.then(async () => {
        await sql`CREATE TABLE IF NOT EXISTS experiences
                  (
                      discordId bigint,
                      skill     varchar(255) primary key,
                      years     numeric,
                      FOREIGN KEY (discordId) REFERENCES users (discordId)
                  )`
        await sql`CREATE TABLE IF NOT EXISTS projects
                  (
                      discordId  bigint,
                      name       varchar(255),
                      experience varchar(255),
                      position   varchar(255),
                      FOREIGN KEY (discordId) REFERENCES users (discordId)
                  )`
        await sql`CREATE TABLE IF NOT EXISTS future_projects
                  (
                      discordId   bigint,
                      name        varchar(255),
                      description varchar(255),
                      info        varchar(255),
                      FOREIGN KEY (discordId) REFERENCES users (discordId)
                  )`
        await sql`CREATE TABLE IF NOT EXISTS feedback
                  (
                      discordId bigint,
                      topic     varchar(255),
                      feedback  varchar(255),
                      FOREIGN KEY (discordId) references users (discordId)
                  )`
    });
}

module.exports = {
    "sql": sql,
    "setupDB": setupDB,
}