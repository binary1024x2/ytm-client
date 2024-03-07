# YT Music Client

Is your regular YouTube Music client with features to make it more suitable for a stand-alone desktop application. It features nice things like Discord precense, ad skipping and navigation buttons. Please note there are things that still need to be fixed; if you find a bug related to the app, post it on the **Issues** section, do not send any issues related to YouTube Music itself as they will be ignored.

## Disclaimer

Neither the application or the developer are related in any way to Google or YouTube. Pleas do not send any issues related to the app to Google or YouTube.

## Getting the executable

If you don't know about programming or don't want to bother with Node, you can get the executables from the Releases page.

## Running from source and compiling

The app was made using Electron and built using Electron Forge. To run the app use: 

```shell
$ npm start
```

To compile run:

```shell
$ npm run make
```

Please note that the app will not run unless you add a file named `discord.js` on the `inject` folder. This file was not added to the git as it contains the app ID used, and that should be private. This file sould look like this:

```js
const DISCORD_APP_ID = "your discord app id"

module.exports = {
    DISCORD_APP_ID
}
```
