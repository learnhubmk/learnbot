const {SlashCommandBuilder} = require('discord.js');
const messages = require('../../data/messages.json');
const channels = require('../../data/channels.json');
const metadata = require('../../data/metadata.json');
const {fetchMembers, isAdmin, fetchAdmins} = require("../../discord/reusable");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('onboard_all')
        .setDescription('Sends message to all (admin only, use only once)!'),
    async execute(interaction) {
        try {
            if (isAdmin(interaction.member)) {
                // todo replace with learnhub guild id
                fetchAdmins(interaction, metadata.learnhub)
                    .then(members =>
                        members.forEach(member => {
                                try {
                                    member.send(messages.welcome.join("\n").replace("%username%", interaction.user.id));
                                    member.send(messages.onboarding_steps.join("\n").replace("%channel%", channels.introduce_yourself));
                                    member.send(messages.frameLangs.intro +
                                        "\n" + messages.frameLangs.info +
                                        "\n" + messages.frameLangs.other +
                                        "\n" + messages.projects.time
                                    );
                                } catch (error) {
                                    console.log("error sending message to this guy: ", member.id)
                                    console.log("the error", error)
                                }
                            }
                        )
                    ).then(async () => {
                    await interaction.reply({content: messages.commands.success, ephemeral: true});
                }).catch((error) => {
                    console.log("error sending message", error);
                });
            } else {
                await interaction.reply({content: messages.permissions.none, ephemeral: true});
            }
        } catch (error) {
            console.log("cannot send message", error)
        }
    },
};