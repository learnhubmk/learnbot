const {SlashCommandBuilder} = require('discord.js');
const messages = require('../../data/messages.json');
const bot = require("../../data/bot.json");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists commands available to you!'),
    async execute(interaction) {
        await interaction.reply({content: messages.commands.success, ephemeral: true});
        await interaction.user.send(messages.commands.list
            + "\n"
            + bot.commands
                .map(command => {
                    return "- **/" + command.name + "**: " + command.description
                })
                .join("\n"));
    },
};