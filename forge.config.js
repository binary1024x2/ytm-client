module.exports = {
  packagerConfig: {
    asar: true,
    icon: './icon',
    name: 'YT Music Client',
    executableName: 'YT Music Client',
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
        iconUrl: './icon.ico',
        name: "YT Music Client"
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
