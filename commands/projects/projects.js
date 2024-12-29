const {SlashCommandBuilder} = require('discord.js');
const messages = require('../../data/messages.json');
const projects = require('../../data/projects.json');
const metadata = require("../../data/metadata.json");
const roles = require("../../data/roles.json");
const bot = require("../../data/bot.json");
const channels = require("../../data/channels.json");
const {fetchAdmins} = require("../../discord/reusable.js");
const {addUserToProject, createFutureProject} = require("../../database/functions");
const {fetchMembersWithRole, tagUser, tagMember} = require("../../discord/reusable");

const join = async (interaction) => {
    let projectName = interaction.options.getString("name");
    let projectExperience = interaction.options.getString("experience");
    let projectPosition = interaction.options.getString("position");
    let projectDescribeYourself = interaction.options.getString("describe_yourself");
    await addUserToProject(interaction.user.id, interaction.user.displayName, projectName, projectExperience, projectPosition, projectDescribeYourself)
        .then(async () => {
            await interaction.reply({content: messages.projects.join, ephemeral: true});
            // todo replace with learnhub guild id
            await fetchAdmins(interaction, metadata.testingServer)
                .then(admins => {
                    let adminId = projects.find(project => project.name === projectName).owner.id;
                    let theAdmin = admins.find(admin => admin.id === adminId);
                    if (theAdmin) {
                        theAdmin.send(messages.projects.join_admin
                            .replace("%userTag%", tagUser(interaction.user))
                            .replace("%projectName%", projectName)
                            .replace("%projectExperience%", projectExperience)
                            .replace("%projectPosition%", projectPosition)
                            .replace("%projectDescribeYourself%", projectDescribeYourself)
                        );
                    } else {
                        admins.first().send(bot.errors.command
                            .replace("%commandName%", "projects join")
                            .replace("%user%", tagUser(interaction.user))
                        );
                    }
                })
        })
}

const create = async (interaction) => {
    let projectName = interaction.options.getString("name");
    let projectDescription = interaction.options.getString("description");
    let projectInfo = interaction.options.getString("info");
    await createFutureProject(interaction.user.id, interaction.user.displayName, projectName, projectDescription, projectInfo)
        .then(async () => {
            // todo replace with learnhub guild id
            await interaction.reply({content: messages.projects.join, ephemeral: true});
            await fetchAdmins(interaction, metadata.testingServer)
                .then(admins => {
                    admins.forEach(admin => admin.send(
                        messages.projects.create
                            .replace("%userTag%", tagUser(interaction.user))
                            .replace("%projectName%", projectName)
                            .replace("%projectDescription%", projectDescription)
                            .replace("%projectInfo%", projectInfo)
                    ))
                })
        })
}

const list = async (interaction) => {
    let projectInfo = "";
    projects.forEach(project => projectInfo += "- **" + project.name + "**: " + project.info.description + "\n");
    await interaction.reply({content: messages.commands.success, ephemeral: true})
    await interaction.user.send(messages.projects.active
        + "\n" + projectInfo
        + "\n" + messages.projects.inactive.replace("%channel%", channels.projects)
        + "\n" + messages.projects.time
    );
}

const info = async (interaction) => {
    let projectName = interaction.options.getString("project");
    let project = projects.find(project => project.name === projectName)
    // todo replace with learnhub guild id
    await interaction.reply({content: messages.commands.success, ephemeral: true})
    await fetchMembersWithRole(interaction, metadata.testingServer, project.info.members)
        .then(async (members) => {
            let projectMembers = members.map(member => tagMember(member)).join(", ");
            await interaction.user.send(
                messages.projects.info
                    .replace("%projectName%", projectName)
                    .replace("%projectDescription%", project.info.description)
                    .replace("%projectInfo%", project.info.info)
                    .replace("%projectTechnologies%", project.info.technologies.join(", "))
                    .replace("%projectTeams%", project.info.teams.join(""))
                    .replace("%projectMembers%", projectMembers)
            );
        });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('projects')
        .setDescription('List, join or create projects!')
        .addSubcommand(subcommand =>
            subcommand
                .setName("join")
                .setDescription("Join an existing project!")
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription(projects.map(project => project.name).join(", "))
                        .setRequired(true)
                        .addChoices(projects.map(project => {
                                return {"name": project.name, "value": project.name}
                            })
                        )
                )
                .addStringOption(option =>
                    option.setName('experience')
                        .setDescription(roles.experience.join(", "))
                        .setRequired(true)
                        .addChoices(roles.experience.map(role => {
                                return {"name": role, "value": role}
                            })
                        )
                )
                .addStringOption(option =>
                    option.setName('position')
                        .setDescription(roles.position.join(", "))
                        .setRequired(true)
                        .addChoices(roles.position.map(position => {
                                return {"name": position, "value": position}
                            })
                        )
                )
                .addStringOption(option =>
                    option.setName('describe_yourself')
                        .setDescription("Tell me why do you want to join and what qualifications you bring!")
                        .setMaxLength(255)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("Tell me more about the project you want to work on!")
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription("The name of your project!")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription("Short description of your project!")
                        .setRequired(true)
                        .setMaxLength(255)
                )
                .addStringOption(option =>
                    option.setName('info')
                        .setDescription("Technologies, target market or anything else that might help us decide!")
                        .setRequired(true)
                        .setMaxLength(255)
                )
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName("list")
                .setDescription("Lists all projects available!")
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName("info")
                .setDescription("Gives detailed info about a specific project!")
                .addStringOption(option =>
                    option.setName("project")
                        .setDescription("Name of the project!")
                        .addChoices(projects.map(project => {
                                return {"name": project.name, "value": project.name}
                            })
                        )
                )
        ),
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        switch (subCommand) {
            case "info": {
                await info(interaction);
                break;
            }
            case "join": {
                await join(interaction);
                break;
            }
            case "create": {
                await create(interaction);
                break;
            }
            case "list": {
                await list(interaction);
                break;
            }
        }
    },
};