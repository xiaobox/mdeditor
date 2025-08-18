const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    name: 'Markdown编辑器',
    executableName: 'markdown-editor',
    ignore: [
      /^\/(?!dist|electron|package\.json|node_modules)/,
      /node_modules\/.*\/test/,
      /node_modules\/.*\/tests/,
      /\.git/,
      /\.vscode/,
      /\.idea/,
      /tests/,
      /docs/,
      /\.md$/,
      /\.log$/
    ]
  },
  rebuildConfig: {},
  makers: [
    // macOS DMG 安装包 (ARM64 + Intel)
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
        arch: ['arm64', 'x64']
      }
    },
    // macOS ZIP 压缩包 (ARM64 + Intel)
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        arch: ['arm64', 'x64']
      }
    },
    // Windows 安装程序
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Markdown编辑器'
      }
    },
    // Windows ZIP 压缩包
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32']
    },
    // Linux DEB 包
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    // Linux RPM 包
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true
    })
  ]
};
