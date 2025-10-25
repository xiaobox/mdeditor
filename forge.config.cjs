const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path')
module.exports = {
  packagerConfig: {
    asar: true,
    name: 'Modern MD Editor',
    executableName: 'social-markdown-editor',
    icon: path.join(__dirname, 'public', 'logo'), // 不需要文件扩展名，Forge 会自动添加
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
        arch: ['arm64', 'x64'],
        icon: path.join(__dirname, 'public', 'logo.icns') // macOS 需要 ICNS 格式
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
        // Windows Squirrel 需要 Authors 等元信息
        authors: 'xiaobox',
        description: 'Modern Markdown Editor',
        title: 'Modern MD Editor',
        // 指定主可执行文件名（与 packagerConfig.executableName 一致）
        exe: 'social-markdown-editor.exe',
        setupIcon: path.join(__dirname, 'public', 'logo.ico'), // 指定 setup 图标
        iconUrl: 'file://' + path.join(__dirname, 'public', 'logo.ico') // 指定安装包图标
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
      config: {
        options: {
          // deb 包名需为小写且无需空格
          name: 'modern-md-editor',
          // 与可执行文件名保持一致，避免找不到二进制
          bin: 'social-markdown-editor'
        }
      }
    },
    // Linux RPM 包
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          name: 'modern-md-editor',
          bin: 'social-markdown-editor',
          license: 'MIT'
        }
      }
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
