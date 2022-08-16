A simple One-themed bot. Uses ~~javascript~~ typescript! and Discord.js. (Also sequelize, sqlite3, and other minor things)
Based off of this handy tutorial:     
https://discordjs.guide/#before-you-begin


Dependencies:

Node.js >=16.6.0
```
npm install discord.js @discordjs/rest @discordjs/builders discord-api-types sequelize sqlite3 sequelize-typescript
npm install --save-dev eslint
```

The bot can:
Render 3-4 blends - a bunch of suzannes in front of an image of your choosing, a thanos-style snap of your video/image with lots of customizability, a rolling barrel roll of an image, and some welcome images that I haven't included in the assets folder...
Do convenient maths including converting units
Greet you!
Ignore channels
And some other stuff
No server management capabilities

How to use:     
Fill out the `config_template.txt`, remove the comments and rename it to `config.json`.     
Launch a command prompt inside this folder, and:     
```
npx tsc
node deploy-commands.js   
node .
```     

Instructions for migrating the database:
Go to database_stuff.ts and set your new columns in the newColumns.
Set the migrate bool in ready.ts to true.
Observe whether the 3 sample entries, hopefully good, are what you would expect.
Turn the bot off, stash the old database away, or delete it, and use the new one, and then replace the currentColumns in database_stuff with the newColumns.
Don't forget to set the migrate bool to false.