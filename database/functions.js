const {sql} = require("./setup");

const addUser = async (id, name) => {
    await sql`INSERT INTO users(discordId, discordName)
              VALUES (${id}, ${name})
              ON CONFLICT DO NOTHING`
}
const addExperience = async (id, name, skill, years) => {
    await addUser(id, name).then(async () => {
        await sql`INSERT INTO experiences(discordId, skill, years)
                  VALUES (${id}, ${skill}, ${years})
                  ON CONFLICT (skill) DO UPDATE SET years = EXCLUDED.years`
    })
}

const addUserToProject = async (id, name, projectName, projectExperience, projectPosition) => {
    await addUser(id, name)
        .then(async () => {
            await sql`INSERT INTO projects(discordId, name, experience, position)
                      VALUES (${id}, ${projectName}, ${projectExperience}, ${projectPosition})`
        })
}

const createFutureProject = async (id, name, projectName, projectDescription, projectInfo) => {
    await addUser(id, name)
        .then(async () => {
            await sql`INSERT INTO future_projects(discordId, name, description, info)
                      VALUES (${id}, ${projectName}, ${projectDescription}, ${projectInfo})`
        })
}

const addFeedback = async (id, name, topic, feedback) => {
    await addUser(id, name)
        .then(async () => {
            await sql`INSERT INTO feedback(discordId, topic, feedback)
                      VALUES (${id}, ${topic}, ${feedback})`
        })
}

const getExperience = async (id) => {
    return sql`SELECT *
               FROM experiences
               WHERE discordId = ${id};`;
}

module.exports = {
    "addUser": addUser,
    "addExperience": addExperience,
    "addUserToProject": addUserToProject,
    "createFutureProject": createFutureProject,
    "addFeedback": addFeedback,
    "getExperience": getExperience
}