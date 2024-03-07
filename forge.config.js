module.exports = {
  packagerConfig: {
    asar: true,
    icon: './icon',
    name: 'YTMusicClient',
    executableName: 'YTMusicClient',
    extraResource: [
      "./inject",
      "./lang",
      "./icon.png",
      "./icon-small.ico"
    ]
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: './icon-small.ico',
        name: "YTMusicClient"
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './icon.png'
        }
      },
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
