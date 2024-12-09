const {SlashCommandBuilder} = require('discord.js');
const messages = require('../../data/messages.json');
const channels = require("../../data/channels.json");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Greeting message!'),
    async execute(interaction) {
        await interaction.reply({content: messages.commands.success, ephemeral: true});
        await interaction.user.send(messages.welcome.join("\n").replace("%username%", interaction.user.id));
        await interaction.user.send(messages.onboarding_steps.join("\n").replace("%channel%", channels.introduce_yourself));
        await interaction.user.send(messages.frameLangs.intro + "\n" + messages.frameLangs.info + "\n" + messages.frameLangs.other);
    },
};