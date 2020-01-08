module.exports = {
	name: 'notifications',
  aliases: ['n'],
	description: 'Notification Settings that can be configured',
	usage: '[subcommand]',
	adminCommand: true,
	subcommands: {
		'edit':'',
		'refresh':'',
		'reset':'',
		'include':'show',
		'group':'[show1] [show2] [etc.]',
		'ungroup':'[show1] [show2] [etc.]',
		'list':'',
		'channel':'',
	},
	async execute(message, args, prefix, guildSettings, client, Discord, tautulli) {
    // This is where we change notification information

    let notificationSettings;
		var args2 = message.content.slice(prefix.length).trim().split(/ +/g);
    var ogCommand = args2.shift().toLowerCase();

    if (args.length > 0) {
      command = args.shift().toLowerCase();
    } else {
      command = "help";
    }

		if (command === "edit") {
      //enables certain notification options
			var emojiOptions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
			const filter = (reaction, user) => emojiOptions.indexOf(reaction.emoji.name) != -1;
			embed = new Discord.RichEmbed()
				.setAuthor('Notification Role-Mention Options:') //don't foget to edit index.js role react to ignore this if name changes
				.addField('\u200b', `The following options are currently disabled but can be enabled now:`)
				.setTimestamp(new Date())
				.setColor(0x00AE86);

			let sentMessage = await message.channel.send({embed});
			sentMessage.react(emojiOptions[0])
			  .then(() => {
					sentMessage.awaitReactions(filter, { time: 15000 })
				    .then(collected => {
							var selectedEmojis = [];
							//console.log(`Collected ${collected.size} reactions`)
							collected.tap(selectedOptions => {
								if (selectedOptions.users.get(message.author.id) != undefined) {
									console.log(selectedOptions._emoji.name);
									selectedEmojis.push(selectedOptions._emoji.name);
								}
							});
							var returnMessage = "You selected: ";
							for(let emojis of selectedEmojis) {
	    						returnMessage += emojis + " ";
							}
							//console.log(selectedEmojis);
							embed = new Discord.RichEmbed()
								.setDescription(returnMessage)
								.setTimestamp(new Date())
								.setColor(0x00AE86);

							sentMessage.edit({embed});
						})
				    .catch(console.error);
			  })
				.then(() => sentMessage.react(emojiOptions[1]))
				.then(() => sentMessage.react(emojiOptions[2]))
				.then(() => sentMessage.react(emojiOptions[3]))
				.then(() => sentMessage.react(emojiOptions[4]))
				.then(() => sentMessage.react(emojiOptions[5]))
				.then(() => sentMessage.react(emojiOptions[6]))
				.then(() => sentMessage.react(emojiOptions[7]))
				.then(() => sentMessage.react(emojiOptions[8]))
				.then(() => sentMessage.react(emojiOptions[9]))
				.catch(() => console.error('One of the emojis failed to react.'));
    }
    else if (command === "refresh") {
      // grabs list of currently airing shows and adds them to notifications channel
    }
    else if (command === "reset") {
      // Alphabetically re-sort items in notfication settings embed
    }
    else if (command === "include") {
      // Manually include a show in notification settings embed
    }
    else if (command === "exclude") {
      // Manually exclude a show in notification settings embed
    }
    else if (command === "group") {
      // Group up Multiple Items
    }
    else if (command === "ungroup") {
      // Ungroup up Multiple Items
    }
    else if (command === "list") {
      // List the items that have been manually added as well as currently airing
      if (!message.channel.guild.member(message.author).hasPermission('ADMINISTRATOR')) {
        return message.channel.send('You do not have permissions to use `' + prefix + ogCommand + " " + command + '`!');
      }
			const mainProgram = require("../index.js");
      await mainProgram.updateShowList(message);

      var tenNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      var showsList = [];
      var sortList = [];
      var count = 0;
      for (const notificationQuery of client.searchTvShowsNotificationSettings.iterate()) {
        if (notificationQuery.guild === message.guild.id && notificationQuery.exclude === null) {
          if (notificationQuery.groupName != null) {
            var bypass = true;
            for (var i = 0; i < sortList.length; i++) {
              if (sortList[i] === notificationQuery.groupName) {
                bypass = false;
              }
            }
            if (bypass) {
              sortList[count] = notificationQuery.groupName;
              count++;
            }
          }
          else {
            sortList[count] = notificationQuery.sortTitle;
            count++;
          }
        }
      }
      sortList = sortList.sort();

      for (var i = 0; i < sortList.length; i++) {
        notificationSettings = client.getTvShowsNotificationSettingsBySortTitle.get(sortList[i]);
        if (!notificationSettings) {
          // GroupName
          notificationSettings = client.getTvShowsNotificationSettingsByGroupName.get(sortList[i]);
          var role = message.guild.roles.find(role => role.id === notificationSettings.groupRole);
          if (role != null) {
            showsList[i] = role;
          }
          else {
            showsList[i] = notificationSettings.groupName;
          }
        }
        else {
          var role = message.guild.roles.find(role => role.id === notificationSettings.roleID);
          if (role != null) {
            showsList[i] = role;
          }
          else {
            showsList[i] = notificationSettings.title;
          }
        }
      }

      var total = showsList.length;
      for (var pages = 0; (pages*10) < total; pages++) {
        embed = new Discord.RichEmbed()
          .setColor(0x00AE86);
        if (pages === 0) {
          embed.setAuthor("Choose what individual TV Shows you would like to be notified for:")
        }
        else {
          embed.setAuthor("Page " + (pages + 1));
        }

        var emojiCount = 0;
        var pageBody = "";
        for (var i = 0; i < tenNumbers.length; i++) {
          if (showsList[(pages*10) + i]) {
            pageBody = pageBody + tenNumbers[i] + " " + showsList[(pages*10) + i] + "\n";
            emojiCount++;
          }
        }
        embed.setDescription(pageBody);
        var emojiTime = await message.channel.send({embed});
        for (var i = 0; i < emojiCount; i++) {
          await emojiTime.react(tenNumbers[i])
            .then()
            .catch(console.error);
        }
      }
    }
    else if (command === "channel") {
      // Sets the notification channel or turns it off
      if (args.length > 0) {
        let mentionedChannel = message.mentions.channels.first();
        if(!mentionedChannel) {
          command = args.shift().toLowerCase();
          if (command === "off") {
            // disable notification channel
            guildSettings.notificationChannelBoolean = "off";
            client.setGuildSettings.run(guildSettings);
            guildSettings = client.getGuildSettings.get(message.guild.id);
            message.channel.send("Notifications disabled!");
          } else {
            return message.channel.send("You did not specify a valid channel to set the notification channel to!");
          }
        }
        else if (message.channel.guild.member(message.author).hasPermission('ADMINISTRATOR')) {
          guildSettings.notificationChannel = mentionedChannel.id;
          guildSettings.notificationChannelBoolean = "on";
          client.setGuildSettings.run(guildSettings);
          guildSettings = client.getGuildSettings.get(message.guild.id);
          message.channel.send("Notification channel changed to <#" + guildSettings.notificationChannel + ">!");
        } else {
          return message.channel.send('You do not have permissions to use `' + prefix + ogCommand + ' channel` in <#' + message.channel.id + '>!');
        }
      } else {
        return message.channel.send("The current notification channel is <#" + guildSettings.notificationChannel + ">!\nTo change it type: `" + guildSettings.prefix + ogCommand + " channel #logs` (where **#logs** is the desired channel)\nTo disable it type: `" + guildSettings.prefix + ogCommand + " channel off`");
      }
    }
  },
};
