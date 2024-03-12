const { app, BrowserWindow, shell, ipcMain, Menu, clipboard, nativeImage } = require("electron")

try {
    if (require('electron-squirrel-startup')) { // Avoid showing the app on installation
        app.quit()
    }
} catch {}

const fs = require("fs")
const path = require("path")
const os = require("os")
const { Client } = require('@xhayper/discord-rpc')
const windowStateKeeper = require('electron-window-state');
const resources = require("./inject/resources")

/* 
NOTICE: 

This file is not included in the Git as it contains private information.

If you are compiling this proyect make sure to set up your own Application ID
from Discord
*/
const discord = require("./inject/discord")

if (!app.requestSingleInstanceLock()) {
    app.quit()
}

const client = new Client({
    clientId: discord.DISCORD_APP_ID
})

const appIcon = nativeImage.createFromPath(resources.getPath((process.platform === 'win32' ? 'icon-small.ico' : 'icon.png')))

function openLoginWindow(url, callback) {
    const win = new BrowserWindow({
        width: 600,
        height: 600,
        minWidth: 600,
        minHeight: 600,
        icon: appIcon
    })
    win.webContents.on("page-title-updated", () => {
        win.title = win.webContents.getTitle()
    })
    win.webContents.on("will-navigate", (e) => {
        const url = new URL(e.url)
        if (url.hostname.startsWith('music.youtube.com')) {
            e.preventDefault()
            callback()
            win.close()
        }
    })
    win.webContents.on("will-redirect", (e) => {
        const url = new URL((e.details ? e.details.url : e.url))
        if (url.hostname.startsWith('music.youtube.com')) {
            e.preventDefault()
            callback()
            win.close()
        }
    })
    win.webContents.on("did-finish-load", (e) => {
        const url = new URL(win.webContents.getURL())
        if (url.hostname.startsWith('music.youtube.com')) {
            callback()
            win.close()
        }
    })
    win.setMinimizable(false)
    win.setMaximizable(false)
    win.setMenu(null)
    const userAgent = `Mosilla/5.0 (${os.type().replace(/_/gm, ' ')} ${os.release()}; x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36`
    win.loadURL(url, {
        userAgent
    })
}

/** @type {BrowserWindow|null} */
let mainWindow = null
function createWindow() {
    const mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800
    })
    const win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 800,
        minHeight: 600,
        show: false,
        icon: appIcon,
        titleBarStyle: (process.platform === "win32" || process.platform === "darwin" ? "hidden" : "default"),
        titleBarOverlay: (process.platform === "win32" || process.platform === "darwin" ? {
            color: "#00000000",
            symbolColor: "#ffffff"
        } : false),
        webPreferences: {
            preload: path.join(__dirname, "inject", "preload.js")
        }
    })
    if (process.argv.includes("--dev-console")) {
        win.webContents.openDevTools()
    }
    win.webContents.on('will-navigate', (e) => {
        const url = new URL(e.url)
        if (url.hostname.startsWith('music.youtube.com')) {
            return
        } else if (url.hostname.startsWith('accounts.google.com')) {
            e.preventDefault()
            openLoginWindow(e.url, () => {
                win.webContents.reload()
            })
        } else {
            e.preventDefault()
            shell.openExternal(url.toString())
        }
    })
    win.webContents.on("did-finish-load", () => {
        fs.readFile(resources.getPath("inject/style.css"), { encoding: "utf-8" }, (err, css) => {
            if (err) {
                console.error(err)
                app.exit(1)
                return
            }
            win.webContents.insertCSS(css).then(() => {
                fs.readFile(resources.getPath("inject/script.js"), { encoding: "utf-8" }, (err1, js) => {
                    if (err1) {
                        console.error(err1)
                        app.exit(1)
                        return
                    }
                    win.webContents.executeJavaScript(js, true).finally(() => {
                        win.show()
                    })
                })
            }).finally(() => {
                if (process.platform === "win32" || process.platform === "darwin") {
                    fs.readFile(resources.getPath("inject/nonlinux.style.css"), { encoding: "utf-8" }, (err2, nlnxcss) => {
                        if (err2) {
                            console.error(err2)
                            return
                        }
                        win.webContents.insertCSS(nlnxcss)
                    })
                }
            })
        })
    })
    win.webContents.on("page-title-updated", () => {
        win.title = win.webContents.getTitle()
    })
    win.webContents.on('will-prevent-unload', (e) => {
        win.minimize()
    })
    win.webContents.setWindowOpenHandler((e) => {
        shell.openExternal(e.url)
    })
    win.webContents.on("did-navigate-in-page", (_, url) => {
        ipcMain.emit("url-update", url)
    })
    win.webContents.on("context-menu", (e, params) => {
        e.preventDefault()
        const menu = Menu.buildFromTemplate([
            {
                label: "Undo",
                registerAccelerator: false,
                accelerator: 'CommandOrControl+Z',
                enabled: params.editFlags.canUndo,
                click(_, browserWindow) {
                    browserWindow.webContents.undo()
                }
            },
            {
                label: "Redo",
                registerAccelerator: false,
                accelerator: 'CommandOrControl+Y',
                enabled: params.editFlags.canRedo,
                click(_, browserWindow) {
                    browserWindow.webContents.redo()
                }
            },
            { type: 'separator' },
            {
                label: "Copy",
                registerAccelerator: false,
                accelerator: 'CommandOrControl+C',
                enabled: params.editFlags.canCopy,
                click(_, browserWindow) {
                    browserWindow.webContents.copy()
                }
            },
            {
                label: "Cut",
                registerAccelerator: false,
                accelerator: 'CommandOrControl+X',
                enabled: params.editFlags.canCut,
                click(_, browserWindow) {
                    browserWindow.webContents.cut()
                }
            },
            {
                label: "Paste",
                registerAccelerator: false,
                accelerator: 'CommandOrControl+V',
                enabled: params.editFlags.canPaste,
                click(_, browserWindow) {
                    browserWindow.webContents.paste()
                }
            },
            { type: 'separator' },
            {
                label: "Back",
                click(_, browserWindow) {
                    browserWindow?.webContents.goBack()
                },
                enabled: win.webContents.canGoBack(),
                registerAccelerator: false,
                accelerator: 'Alt+Left'
            },
            {
                label: "Forward",
                click(_, browserWindow) {
                    browserWindow?.webContents.goForward()
                },
                enabled: win.webContents.canGoForward(),
                registerAccelerator: false,
                accelerator: 'Alt+Right'
            },
            {
                label: "Refresh",
                click(_, browserWindow) {
                    browserWindow?.webContents.reload()
                },
                registerAccelerator: false,
                accelerator: 'CommandOrControl+R'
            },
            { type: 'separator' },
            {
                label: "Copy page link",
                click() {
                    clipboard.writeText(params.pageURL, 'selection')
                }
            }
        ])
        menu.popup({ 
            x: params.x,
            y: params.y,
            sourceType: params.menuSourceType,
            window: win
        })
    })
    win.on('closed', () => {
        if (client.isConnected) {
            client.user?.clearActivity()
        }
    })
    win.setMenu(null)
    const userAgent = `Mosilla/5.0 (${os.type().replace(/_/gm, ' ')} ${os.release()}; x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36`
    win.loadURL("https://music.youtube.com/", {
        userAgent
    })
    mainWindowState.manage(win);
    mainWindow = win
}

app.whenReady().then(() => {
    ipcMain.on("update-discord-precense", (_, data) => {
        if (!client.isConnected) {
            return
        }
        if (data.video_id === null || typeof data.video_id === "undefined") {
            client.user?.clearActivity()
            return
        }
        try {
            const activity = {
                largeImageKey: "icon2",
                details: data.title,
                state: data.author,
                type: 2,
                buttons: [
                    {
                        url: data["video_url"],
                        label: "YouTube Music"
                    }
                ]
            }
            client.user?.setActivity(activity).catch((e) => {
                console.error(e)
            })
        } catch(e) {
            console.error(e)
            client.user?.clearActivity()
        }
    })
    ipcMain.handle("load-language", (_, key) => {
        try {
            const file = resources.getPath(`lang/${key}.json`)
            return fs.readFileSync(file, { encoding: "utf-8" })
        } catch (e) {
            console.error(e)
            return fs.readFileSync(resources.getPath("lang/en.json"), { encoding: "utf-8" })
        }
    })
    ipcMain.handle("delete-cache", () => {
        return mainWindow.webContents.session.clearCache()
    })
    ipcMain.handle("request-platform", () => {
        return Promise.resolve(process.platform)
    })
    createWindow()
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            if (client.isConnected) {
                client.user?.clearActivity().then(() => client.destroy()).finally(() => app.quit())
            }
        }
    })
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
    client.login().catch((err) => {
        console.error(err)
    })
}).catch((e) => {
    console.error(e)
    app.quit()
})

app.on("open-url", (_, url) => {
    console.log(url)
})
