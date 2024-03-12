(function() {

    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        window.trustedTypes.createPolicy('default', {
            createHTML: (string, _) => string
        })
    }

    const ytMusicApp = document.querySelector("ytmusic-app")
    if (ytMusicApp === null) {
        return
    }

    let boundSettingsObserver = false
    let strings = {}
    let preferences = {
        discord: true,
        skipAds: true
    }

    function savePreferences() {
        const prefs = JSON.stringify(preferences)
        localStorage.setItem("ytm-client-preferences", prefs)
    }

    function loadPreferences() {
        const prefs = localStorage.getItem("ytm-client-preferences")
        if (prefs != null) {
            preferences = Object.assign({}, preferences, JSON.parse(prefs))
        }
    }

    function observeSettingsDialog() {
        const target = document.querySelector("ytmusic-settings-page.ytmusic-dialog")
        const observer = new MutationObserver((mutations, _) => {
            if (mutations.length > 0) {
                const fm = mutations[0]
                if (fm.addedNodes.length > 0 || fm.type === "attributes") {
                    addClientSettings()
                }
            }
        })
        observer.observe(target, {
            subtree: true,
            childList: true,
            attributes: true
        })
        boundSettingsObserver = true
    }

    function getYouTubePreferences() {
        const value = `; ${document.cookie}`
        const parts = value.split("; PREF=")
        const map = {}
        const pieces = parts[1].split('&')
        for (let p of pieces) {
            const param = p.split('=')
            map[param[0]] = decodeURIComponent(param[1])
        }
        return map
    }

    function id() {
        return Math.random().toString(32).substring(2)
    }

    function renderClientSettings() {
        const dialog = document.querySelector("ytmusic-settings-page.ytmusic-dialog")
        const list = dialog.querySelector(".content ytmusic-setting-category-collection-renderer #items")
        list.querySelectorAll("*").forEach((node) => {
            node.style.display = "none"
        })
        const discordId = id()
        const discordPresence = document.createElement("div")
        discordPresence.classList.add("ytmclient-settings")
        const discordLabelWrapper = document.createElement("div")
        discordLabelWrapper.classList.add("ytmclient-settings-label-wrapper")
        const discordLabel = document.createElement("label")
        discordLabel.classList.add("ytmclient-settings-label")
        discordLabel.htmlFor = discordId
        discordLabel.appendChild(document.createTextNode(strings["DISCORD_PRECENSE"]))
        discordLabelWrapper.appendChild(discordLabel)
        const discordCheck = document.createElement("input")
        discordCheck.type = "checkbox"
        discordCheck.id = discordId
        discordCheck.checked = preferences.discord
        discordCheck.addEventListener("change", () => {
            preferences.discord = discordCheck.checked
            savePreferences()
        })
        discordLabelWrapper.appendChild(discordCheck)
        discordPresence.appendChild(discordLabelWrapper)
        const discordSummary = document.createElement("p")
        discordSummary.classList.add("ytmclient-settings-summary")
        discordSummary.appendChild(document.createTextNode(strings["DISCORD_PRECENSE_SUMMARY"]))
        discordPresence.appendChild(discordSummary)
        list.appendChild(discordPresence)

        const skipAdsId = id()
        const skipAds = document.createElement("div")
        skipAds.classList.add("ytmclient-settings")
        const skipAdsWrapper = document.createElement("div")
        skipAdsWrapper.classList.add("ytmclient-settings-label-wrapper")
        const skipAdsLabel = document.createElement("label")
        skipAdsLabel.classList.add("ytmclient-settings-label")
        skipAdsLabel.appendChild(document.createTextNode(strings["SKIP_ADS"]))
        skipAdsLabel.htmlFor = skipAdsId
        skipAdsWrapper.appendChild(skipAdsLabel)
        const skipAdsCheck = document.createElement("input")
        skipAdsCheck.type = "checkbox"
        skipAdsCheck.id = skipAdsId
        skipAdsCheck.checked = preferences.skipAds
        skipAdsCheck.addEventListener("change", () => {
            preferences.skipAds = skipAdsCheck.checked
            savePreferences()
        })
        skipAdsWrapper.appendChild(skipAdsCheck)
        skipAds.appendChild(skipAdsWrapper)
        const skipAdsSummary = document.createElement("p")
        skipAdsSummary.classList.add("ytmclient-settings-summary")
        skipAdsSummary.appendChild(document.createTextNode(strings["SKIP_ADS_SUMMARY"]))
        skipAds.appendChild(skipAdsSummary)
        list.appendChild(skipAds)

        const deleteCache = document.createElement("div")
        deleteCache.classList.add("ytmclient-settings")
        const deleteCacheWrapper = document.createElement("div")
        deleteCacheWrapper.classList.add("ytmclient-settings-label-wrapper")
        const deleteCacheLabel = document.createElement("label")
        deleteCacheLabel.classList.add("ytmclient-settings-label")
        deleteCacheLabel.appendChild(document.createTextNode(strings["DELETE_CACHE"]))
        deleteCacheWrapper.appendChild(deleteCacheLabel)
        deleteCache.appendChild(deleteCacheWrapper)
        deleteCache.addEventListener("click", () => {
            ytmclient.deleteCache().then(() => {
                location.reload()
            })
        })
        list.appendChild(deleteCache)
    }

    function addClientSettings() {
        const dialog = document.querySelector("ytmusic-settings-page.ytmusic-dialog")
        const list = dialog.querySelector(".content tp-yt-paper-listbox.category-menu")
        if (list == null) {
            return
        }
        const existing = list.querySelector(".ytmclient-settings-menu-item")
        if (existing != null) {
            return
        }
        const item = document.createElement("a")
        item.href = "#"
        item.classList.add("ytmclient-settings-menu-item")
        item.appendChild(document.createTextNode(strings["CLIENT"]))
        item.role = "option"
        let index = 0
        list.querySelectorAll("tp-yt-paper-item").forEach((node) => {
            index++
            node.addEventListener("click", () => {
                item.classList.remove("selected")
            })
        })
        item.setAttribute("data-index", `${index}`)
        item.addEventListener("click", (e) => {
            e.preventDefault()
            dialog.setAttribute("selected-index", `${index}`)
            item.classList.add("selected")
            document.querySelectorAll("tp-yt-paper-item").forEach((node) => {
                node.classList.remove("iron-selected")
                node.setAttribute("aria-selected", "false")
            })
            renderClientSettings()
        })
        list.appendChild(item)
    }

    function getQueryParams() {
        const map = {}
        const query = window.location.href.split('?')
        if (query.length > 1) {
            const params = query[1]
            const pieces = params.split('&')
            for (let p of pieces) {
                const param = p.split('=')
                map[param[0]] = decodeURIComponent(param[1])
            }
        }
        return map
    }

    function getVideoUrl() {
        const params = getQueryParams()
        if ('v' in params) {
            return `https://music.youtube.com/watch?v=${params['v']}`
        } else {
            const data = ytMusicApp.playerApi.getVideoData()
            return `https://music.youtube.com/watch?v=${data['video_id']}`
        }
    }

    function bindHeader() {
        const materialLink = document.createElement("link")
        materialLink.rel = "stylesheet"
        materialLink.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,100,1,0"
        document.head.appendChild(materialLink)
    }

    function bindTitleBar() {
        ytmclient.requestPlatform().then((value) => {
            if (value === "win32" || value === "darwin") {
                const titleBar = document.createElement("div")
                titleBar.classList.add("ytmclient-titlebar")
                const target = document.querySelector("body ytmusic-app ytmusic-app-layout")
                target.appendChild(titleBar)
            }
        })
    }

    function bindNavigation() {
        const target = document.querySelector("body ytmusic-app ytmusic-app-layout ytmusic-nav-bar .center-content")
        const back = document.createElement("button")
        back.title = strings["BACK"] + " (Alt + 🠔)"
        back.classList.add("ytmclient-navigation-button")
        back.innerHTML = "<span class=\"material-symbols-outlined\">arrow_back</span>"
        back.addEventListener("click", (e) => {
            e.preventDefault()
            history.back()
        })
        target.insertBefore(back, target.querySelector("ytmusic-search-box"))
        const forward = document.createElement("button")
        forward.title = strings["FORWARD"] + " (Alt + 🠖)"
        forward.classList.add("ytmclient-navigation-button")
        forward.innerHTML = "<span class=\"material-symbols-outlined\">arrow_forward</span>"
        forward.addEventListener("click", (e) => {
            e.preventDefault()
            history.forward()
        })
        target.insertBefore(forward, target.querySelector("ytmusic-search-box"))
    }

    let mutedOnAd = false
    function initializeAdBlock() {
        setInterval(() => {
            let ad = false
            if (preferences.skipAds && (ytMusicApp.playerApi.getAppState() === 3 || ytMusicApp.playerApi.getPlayerState() === -1 || ytMusicApp.playerApi.getPresentingPlayerType() === 2)) {
                if (!ytMusicApp.playerApi.isMuted()) {
                    ytMusicApp.playerApi.mute()
                    mutedOnAd = true
                }
                const video = document.querySelector('ytmusic-app ytmusic-app-layout#layout ytmusic-player-page#player-page .content #main-panel ytmusic-player#player #song-video .player-wrapper #movie_player .html5-video-container video.video-stream')
                if (video.playbackRate === 1) {
                    video.playbackRate = 5
                    ad = true
                }
            } else {
                if (mutedOnAd && ytMusicApp.playerApi.isMuted()) {
                    ytMusicApp.playerApi.unMute()
                }
            }
            const button = document.querySelector('ytmusic-app ytmusic-app-layout#layout ytmusic-player-page#player-page .content #main-panel ytmusic-player#player #song-video .player-wrapper #movie_player .video-ads .ytp-ad-player-overlay .ytp-ad-player-overlay-skip-or-preview .ytp-ad-skip-button-slot .ytp-ad-skip-button-container button.ytp-ad-skip-button-modern.ytp-button')
            if (preferences.skipAds && button !== null) {
                ad = true
                button.click()
            }
            if (ad) {
                setTimeout(() => {
                    document.querySelectorAll('audio, video').forEach((element) => {
                        element.playbackRate = 1
                    })
                }, 250)
            }
        }, 250)
    }

    const prefs = getYouTubePreferences()
    ytmclient.loadLanguage("hl" in prefs ? prefs["hl"].substring(0, 2) : navigator.language.substring(0, 2)).then((lang) => {
        strings = JSON.parse(lang)
        loadPreferences()
        bindHeader()
        bindTitleBar()
        bindNavigation()
        initializeAdBlock()
        window.addEventListener('keydown', (e) => {
            if (e.altKey) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault()
                    history.back()
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault()
                    history.forward()
                }
            } else if (e.ctrlKey) {
                if (e.key === 'R') {
                    e.preventDefault()
                    location.reload()
                }
            }
        })
    }).catch((e) => {
        console.error(e)
    })
    
    const bodyObserver = new MutationObserver((mutations, _) => {
        for (let m of mutations) {
            for (let n of m.addedNodes) {
                if (n.nodeName.toLowerCase() === "ytmusic-dialog") {
                    if (!boundSettingsObserver) {
                        observeSettingsDialog()
                    }
                }
            }
        }
    })
    bodyObserver.observe(document.body, {
        childList: true,
        subtree: true
    })

    setInterval(() => {
        if (ytMusicApp.playerApi.getAppState() !== 5) {
            navigator.mediaSession.metadata = null
            ytmclient.updateDiscordPrecense({})
            return
        }
        const data = ytMusicApp.playerApi.getVideoData()
        if (typeof data.video_id === "undefined") {
            return
        }
        data["video_url"] = getVideoUrl()
        const imageThumb = document.querySelector('ytmusic-player-bar.ytmusic-app div.middle-controls.ytmusic-player-bar img.image.ytmusic-player-bar')
        if (imageThumb) {
            data['image_url'] = imageThumb.getAttribute('src')
        }
        const imageLarge = document.querySelector('ytmusic-player-page#player-page #main-panel ytmusic-player#player #song-image yt-img-shadow#thumbnail img#img')
        if (imageLarge) {
            data['large_image_url'] = imageLarge.getAttribute('src')
        }
        if (preferences.discord) {
            ytmclient.updateDiscordPrecense(data)
        } else {
            ytmclient.updateDiscordPrecense({})
        }
        navigator.mediaSession.metadata = new MediaMetadata({
            artist: data.author,
            title: data.title,
            artwork: [
                { 
                    src: data['image_url'],
                    sizes: '60x60',
                    type: 'image/jpeg'
                },
                { 
                    src: data['large_image_url'],
                    sizes: '544x544',
                    type: 'image/jpeg'
                }
            ]
        })
        navigator.mediaSession.playbackState = (ytMusicApp.playerApi.getPlayerState() === 1 ? 'playing' : (ytMusicApp.playerApi.getPlayerState() === 2 ? 'paused' : 'none'))
    }, 2000)

})()
