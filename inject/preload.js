const { contextBridge, ipcRenderer } = require("electron")

let _onUrlUpdateListener = null

ipcRenderer.on("url-update", (_, url) => {
    if (_onUrlUpdateListener) {
        _onUrlUpdateListener(url)
    }
})

contextBridge.exposeInMainWorld("ytmclient", {
    updateDiscordPrecense(data) {
        ipcRenderer.send("update-discord-precense", data)
    },
    loadLanguage(key) {
        return ipcRenderer.invoke("load-language", key)
    },
    deleteCache() {
        return ipcRenderer.invoke("delete-cache")
    },
    onUrlUpdateListener(handler) {
        _onUrlUpdateListener = handler
    },
    requestPlatform() {
        return ipcRenderer.invoke("request-platform")
    }
})
