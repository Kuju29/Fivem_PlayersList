# fivem-bots-discord

### Run:
- Install [Node](https://nodejs.org/en/)
- Create [token bots](https://discord.com/developers/applications)
- Setting `Applications` > `bot` > `enable: Privileged Gateway Intents` both functions

<kbd> ![image](https://user-images.githubusercontent.com/22098092/174883133-a09584ba-7363-4885-a14f-fc0949a6e845.png)
- Downlonad [fivem-bots](https://github.com/Kuju29/Fivem_PlayersList/archive/refs/heads/main.zip)
- Unzip the file
- Edit file config.json
- Start.bat

Download for discord V13 : [file](https://github.com/Kuju29/Fivem_PlayersList/archive/6e22811e1e2d90a9e51a79755824cbbdd46dafc0.zip)

### Command:
- !help

```js
    "NAMELISTENABLE": true, // Enable count names from "NAMELIST"
    "AUTODELETE": false, // Auto-delete message from a function
    "NCOMMAND": false, // Notify a function with a message in Discord. `Completed !help`
```

### Note:
- If your server is unstable, shows offline often, you can edit fetch as below code.\
**Edit file: server/info.js**
```js
    const fetch = require('@vercel/fetch')(require('node-fetch'));
    // const fetch = require('node-fetch');
```

### Example:
<kbd> ![image](https://user-images.githubusercontent.com/22098092/174884363-fcde4ec5-f9c0-47a9-b653-e2f94fcb6999.png)
  
<kbd> ![image](https://user-images.githubusercontent.com/22098092/174883919-dfaecbe3-6ec6-4f47-853f-db2b47c692be.png)

<kbd> ![image](https://user-images.githubusercontent.com/22098092/174884221-95ddac49-77cf-4878-9752-b3ae53edbb64.png)
