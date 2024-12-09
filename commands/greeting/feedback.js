const {SlashCommandBuilder} = require('discord.js');
const messages = require('../../data/messages.json');
const {addFeedback} = require("../../database/functions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Provide feedback about any topic you want!')
        .addStringOption(option =>
            option.setName('topic')
                .setDescription("Topic you wish to discuss!")
                .setRequired(true)
                .setMaxLength(255)
        )
        .addStringOption(option =>
            option.setName('feedback')
                .setDescription("Feedback you wish to provide!")
                .setRequired(true)
                .setMaxLength(255)
        ),
    async execute(interaction) {
        const topic = interaction.options.getString("topic");
        const feedback = interaction.options.getString("feedback");
        await addFeedback(interaction.user.id, interaction.user.displayName, topic, feedback)
            .then(async () => {
                await interaction.reply({content: messages.commands.success, ephemeral: true});
                await interaction.user.send(messages.feedback)
            })
    },
};