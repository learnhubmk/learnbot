const {SlashCommandBuilder} = require('discord.js');
const messages = require('../../data/messages.json');
const channels = require('../../data/channels.json');
const metadata = require('../../data/metadata.json');
const {fetchMembers, isAdmin} = require("../../discord/reusable");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('onboard_all')
        .setDescription('Sends message to all (admin only, use only once)!'),
    async execute(interaction) {
        if (isAdmin(interaction.member)) {
            // todo replace with learnhub guild id
            fetchMembers(interaction, metadata.learnhub)
                .then(members =>
                    members.forEach(member => {
                            member.send(messages.welcome.join("\n").replace("%username%", interaction.user.id));
                            member.send(messages.onboarding_steps.join("\n").replace("%channel%", channels.introduce_yourself));
                            member.send(messages.frameLangs.intro +
                                "\n" + messages.frameLangs.info +
                                "\n" + messages.frameLangs.other +
                                "\n" + messages.projects.time
                            );
                        }
                    )
                ).then(async () => {
                await interaction.reply({content: messages.commands.success, ephemeral: true});
            });
        } else {
            await interaction.reply({content: messages.permissions.none, ephemeral: true});
        }
    },
};