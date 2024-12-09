const {REST, Routes} = require('discord.js');
require("dotenv").config();

const token = process.env.DISCORD_TOKEN;
const fs = require('node:fs');
const path = require('node:path');
//loads all commands recursively from the commands folder
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const compileCommands = () => {
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    return commands;
}
const updateCommands = async () => {
    const bot = require('./data/bot.json');
    const rest = new REST().setToken(token);
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        await rest.put(
            Routes.applicationCommands(bot.id),
            {body: commands.map(command => command.data.toJSON())},
        );

    } catch (error) {
        console.error(error);
    }
}
compileCommands();
updateCommands();
module.exports = {"commands": commands, "compileCommands": compileCommands, "updateCommands": updateCommands};