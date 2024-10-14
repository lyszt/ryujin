const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

// Array to hold command data
const commands = [];

// Path to the commands directory
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Loop through each folder in the commands directory
for (const folder of commandFolders) {
    // Path to the current command folder
    const commandsPath = path.join(foldersPath, folder);

    // Read all command files ending with .js in the current folder
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // Loop through each command file
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // Check if the command has 'data' and 'execute' properties
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON()); // Add command data to the commands array
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Prepare an instance of the REST module
const rest = new REST().setToken(token);

// Use an IIFE to handle the async function
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to refresh all commands in the guild
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // Log any errors that occur during the process
        console.error(`[ERROR] Failed to deploy commands: ${error.message}`);
    }
})();
