A simple One-themed bot. Uses javascript and Discord.js. 
Based off of this handy tutorial:     
https://discordjs.guide/#before-you-begin


Dependencies:

Node.js >=16.6.0
```
npm install discord.js @discordjs/rest @discordjs/builders discord-api-types sequelize sqlite3
npm install --save-dev eslint
```


How to use:     
Fill out the `config_template.txt`, remove the comments and rename it to `config.json`.     
Launch a command prompt inside this folder, and:     
```
node deploy-commands.js   
node .
```     

Instructions for migrating the database:
Go to database_stuff.js and set your new columns in the newColumns.
Set the migrate bool in ready.js to true.
Observe whether the 3 sample entries, hopefully good, are what you would expect.
Turn the bot off, stash the old database away, or delete it, and use the new one, and then replace the currentColumns in database_stuff with the newColumns.
Don't forget to set the migrate bool to false.