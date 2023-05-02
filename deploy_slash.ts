import {REST, type RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder} from 'discord.js';
import {clientId, guildId, token} from './config';
import fs from 'node:fs';
import path from 'node:path';
import {type Command} from './src/types';

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'src/commands');
const commandFolders = fs.readdirSync(foldersPath);

const promises: Array<Promise<any>> = [];
for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		promises.push(import(filePath).then((command: Command) => {
			if ('data' in command && 'execute' in command) {
				commands.push(command.data.toJSON());
			} else {
				console.log(
					`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
				);
			}
		}));
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);
void Promise.all(promises).then(async () => {
	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`,
		);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{body: commands},
		);

		console.log(
			`Successfully reloaded ${(data as string).length} application (/) commands.`,
		);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
});

