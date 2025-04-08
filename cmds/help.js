const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/message');

module.exports = {
  name: 'help',
  description: 'Show available commands with descriptions',
  role: 1,
  author: 'GeoDevz69',
  
  execute(senderId, args, pageAccessToken) {
    const commandsDir = path.join(__dirname, '../cmds');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map((file) => {
      const command = require(path.join(commandsDir, file));
      return {
        title: `⌬ ${command.name.charAt(0).toUpperCase() + command.name.slice(1)}`,
        description: command.description,
        payload: `${command.name.toUpperCase()}_PAYLOAD`
      };
    });

    const totalCommands = commands.length;
    const commandsPerPage = 5;
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    let page = parseInt(args[0], 10);

    // Show all commands
    if (args[0]?.toLowerCase() === 'all') {
      const helpTextMessage = `╭─❍「 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 」\n│ [ Total Commands : ${totalCommands} ]\n│` +
        commands.map((cmd, index) => `\n│ ${index + 1}. ${cmd.title}\n│ ○ ${cmd.description}`).join('') +
        `\n╰────────────⧕\n\n\n├─────☾⋆\n│ » Owner: GeoDevz69\n│ » Age: 14yr old\n│ » Status: Taken\n│ » Hobby: Siya lang\n╰────────────⧕`;

      return sendLongMessage(senderId, helpTextMessage, pageAccessToken);
    }

    if (isNaN(page) || page < 1) page = 1;

    const startIndex = (page - 1) * commandsPerPage;
    const commandsForPage = commands.slice(startIndex, startIndex + commandsPerPage);

    if (commandsForPage.length === 0) {
      return sendMessage(senderId, {
        text: `❌ Oops! Page ${page} doesn't exist. There are only ${totalPages} page(s) available.`,
      }, pageAccessToken);
    }

    const helpTextMessage = `╭─❍「 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 」\n│ » Page View : [ ${page}/${totalPages} ]\n│ » Total Commands : [ ${totalCommands} ]\n│` +
      commandsForPage.map((cmd, index) => `\n│ ${startIndex + index + 1}. ${cmd.title}\n│ ○ ${cmd.description}`).join('') +
      `\n╰────────────⧕\n\n\n├─────☾⋆\n│ » Note : Use "help [page]" to switch pages\n│ or "help all" to see all commands!\n╰────────────⧕`;

    const quickReplies = commandsForPage.map((cmd) => ({
      content_type: "text",
      title: cmd.title.replace('⌬ ', ''),
      payload: cmd.payload
    }));

    sendMessage(senderId, {
      text: helpTextMessage,
      quick_replies: quickReplies
    }, pageAccessToken);
  }
};

function sendLongMessage(bot, text, authToken) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    sendMessage(bot, { text: messages[0] }, authToken);

    messages.slice(1).forEach((message, index) => {
      setTimeout(() => sendMessage(bot, { text: message }, authToken), (index + 1) * delayBetweenMessages);
    });
  } else {
    sendMessage(bot, { text }, authToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
