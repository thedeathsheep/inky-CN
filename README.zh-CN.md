![](resources/icon-small.jpg)

# Inky

[English](README.md)

**Inky** 是 [ink](http://www.inklestudios.com/ink) 的编辑器。ink 是 inkle 的标记语言，用于在游戏中编写交互式叙事，如 [80 Days](http://www.inklestudios.com/80days) 中所用。它也是一个 IDE（集成开发环境），让你在一个应用中边写边玩，并随时修复代码中的错误。

![](resources/screenshot.gif)

## 功能特性

- **边写边玩**：播放面板会记住你做的选择，当 Inky 重新编译时，会快进到你上次在流程中的位置。
- **语法高亮**
- **输入时错误高亮**：Inky 持续编译，让你尽早发现并修复错误。
- **问题浏览器**：列出你的 **ink** 中的错误、警告和 TODO，并可跳转到源码中的具体行号和文件。
- **跳转到定义**：跳转目标（如 `-> theStreet`）会显示为超链接，可通过 Alt+点击跳转。
- **支持多文件项目**：Inky 会根据 `INCLUDE` 行自动推断故事结构，无需额外项目文件。要新建包含文件，只需在需要的位置输入 `INCLUDE yourfile.ink`。
- **导出为 JSON**：如果使用 [ink-Unity-integration 插件](https://assetstore.unity.com/packages/tools/integration/ink-unity-integration-60055) 则不必如此，但 Inky 支持导出 ink 编译后的 JSON 格式，这对其他 ink 运行时（如 [inkjs](https://github.com/y-lohse/inkjs)，用于在网页上运行 **ink**）特别有用。
- **文件监视**：Inky 等现代文本编辑器会监视磁盘上的文件变更，修改后会自动反映到编辑器中，对使用版本控制管理 **ink** 很有帮助。

## 项目状态

Inky 已被多位开发者广泛用于多个项目。但作为游戏开发者在业余时间编写的专业软件，它可能不如你常用的其他文本编辑器那样完善或功能全面。

非正式的 [TODO.md](TODO.md) 列出了部分缺失功能和已知问题。如需讨论或提出修复/新功能，请 [提交 GitHub issue](http://www.github.com/inkle/inky/issues)。

订阅 [邮件列表](http://www.inklestudios.com/ink#signup) 以获取 ink 的最新动态。

## 下载

### Mac、Windows 和 Linux

[下载最新版本](http://www.github.com/inkle/inky/releases/latest)

## 项目设置文件

**注意：以下操作需要了解 JSON 文件格式。**

要为你的 ink 项目自定义 Inky 设置，请创建一个 JSON 文件，文件名与主 ink 文件相同，扩展名为 `.settings.json`。例如主 ink 文件为 `my_great_story.ink`，则 JSON 文件应命名为 `my_great_story.settings.json`。

示例设置文件：

    {
        "customInkSnippets": [
            {
                "name": "Heaven's Vault",
                "submenu": [
                    {
                        "name": "Camera",
                        "ink": ">>> CAMERA: Wide shot"
                    },
                    {
                        "separator": true
                    },
                    {
                        "name": "Walk",
                        "ink": ">>> WALK: TheInscription"
                    },
                    {
                        "name": "More snippets",
                        "submenu": [
                            {
                                "name": "A snippet in a submenu",
                                "ink": "This snippet of ink came from a submenu."
                            },
                        ]
                    }
                ]
            }
        ],

        "instructionPrefix": ">>>"
    }

* `customInkSnippets` - 此数组用于向 Ink 菜单添加项目专属的 ink 代码片段。可添加三类项：
    * **ink 片段**：需要 `name`（菜单项名称）和 `ink`（将插入编辑器的 ink 片段）。
    * **分隔符**：使用 `{"separator": true}` 在菜单中插入水平分隔线。
    * **子菜单**：使用 `name` 作为子菜单名，`submenu` 为另一相同格式的数组，以嵌套更多片段。

* `instructionPrefix` - 常用做法是在 ink 中用特定文本格式指示游戏执行动作，而非直接展示给玩家。

    例如，inkle 会写 `>>> CAMERA: BigSwoop`。`>>>` 并非 ink 内置语法，整段文本会作为纯文本传递。自定义游戏代码可解析它并转为游戏内动作。若你有固定写法，可在 Inky 中定义 *instructionPrefix* 以便支持。
    
    Inky 会在编辑器和播放视图中高亮这些行，便于区分它们与游戏正文。

## 技术实现

Inky 基于以下技术构建：

* [Electron](http://electron.atom.io/)：GitHub 的跨平台桌面应用框架，使用 HTML、CSS 和 JavaScript。
* [Ace](https://ace.c9.io/#nav=about)：面向网页的代码编辑器。
* [Photon](http://photonkit.com/)：部分 UI 组件。可能可以移除，因为只用于少量 CSS。

Inky 内置 **inklecate**，即 ink 的命令行编译器。

## 参与开发

在 [issues 页面](https://github.com/inkle/inky/issues) 查找带有「help wanted」标签的 issue。我们会在添加该标签时提供基本的开发指引。

构建步骤：

* 若未安装，请先安装 [node.js](https://nodejs.org/en/)
* 克隆仓库
* Mac：双击 `INSTALL_AND_RUN.command`。Windows：打开 PowerShell，进入 app 目录，执行 `npm install`，然后 `npm start`。
* 之后若未更改 npm 包，Mac 可运行 `RUN.command`，Windows 在 shell 中执行 `npm start`。

### Linux

在 **Ubuntu 16.04 LTS** 全新 VM 上测试（其他发行版应有类似步骤）

* 安装构建工具

`sudo apt-get install -y dkms build-essential linux-headers-generic linux-headers-$(uname -r)`

* 安装依赖

`sudo apt install git`

`sudo apt install curl`

* 安装 node 和 npm

`curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`

`sudo apt-get install -y nodejs`

* 按 http://www.mono-project.com/download/stable/#download-lin 安装 mono

`sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF`

`echo "deb http://download.mono-project.com/repo/ubuntu stable-xenial main" | sudo tee /etc/apt/sources.list.d/mono-official-stable.list`

`sudo apt-get update`

`sudo apt-get install mono-complete`

* 克隆 inky 仓库

`git clone https://github.com/inkle/inky.git`

* 测试 inklecate_win（应输出用法信息）

`mono app/main-process/ink/inklecate_win.exe`

* 安装并运行 inky

`./INSTALL_AND_RUN.command`

* 之后若 npm 包未变，可直接运行（否则需重新执行上一步）：

`./RUN.command`

### 中文语法支持

当系统语言为简体中文时，可在菜单 `视图 -> 中文语法模式` 开关中文语法。开启后，编译前会自动将中文关键字转换为 ink 语法；英文语法始终可用（可中英混写）。关闭后仅保留原生英文语法。

| 中文 | ink 语法 | 说明 |
|------|----------|------|
| 节点 名称 | === 名称 === | Knot（主段落） |
| 章节 名称 | = 名称 | Stitch（子段落） |
| 跳转 目标 | -> 目标 | 跳转 |
| 跳转 结束 | -> END | 结束流程 |
| 跳转 完成 | -> DONE | 完成 |
| 选项 文本 | * 文本 | 选项 |
| 持久 文本 | + 文本 | 持久选项 |
| 变量 x = 5 | VAR x = 5 | 全局变量 |
| 临时 x = 5 | temp x = 5 | 临时变量 |
| 列表 x = a, b | LIST x = a, b | 列表 |
| 常量 x = 1 | CONST x = 1 | 常量 |
| 包含 文件.ink | INCLUDE 文件.ink | 包含文件 |
| 外部 函数名( | EXTERNAL 函数名( | 外部函数 |
| 函数 名称( | function 名称( | 函数定义 |

故事正文和注释可自由使用中文，不会被转换。

### 辅助工具

在 zh-CN 下，以下辅助功能已同步支持中文：

- **错误信息**：ink 编译器的常见错误/警告会自动翻译为中文提示
- **语法高亮**：中文关键字（节点、章节、跳转、选项、持久、变量、临时、列表、常量、包含、外部、函数）会与英文语法同样高亮显示

### 文档中文生成工具

提供脚本 `build/translateDocumentation.js` 用于将 `WritingWithInk.md` 翻译为中文，并生成可切换的文档页面。

使用方法（Windows PowerShell）：

```powershell
$env:AIHUBMIX_API_KEY="你的key"
$env:AIHUBMIX_BASE_URL="https://aihubmix.com/v1"
$env:AIHUBMIX_MODEL="gpt-4o-mini"
node .\build\translateDocumentation.js
```

输出文件：

- `app/resources/Documentation/WritingWithInk.zh-CN.md`
- `app/renderer/documentation/embedded.zh-CN.html`
- `app/renderer/documentation/window.zh-CN.html`

### 翻译

翻译文件位于 `app/main-process/i18n/`。  
若某语言文件缺失或缺少部分键，可执行：`cd app && npm run generate-locale -- <locale> ./main-process/i18n/` 生成。

## 许可证

**Inky** 和 **ink** 采用 MIT 许可证。虽然不强制署名，但如果你在项目中使用 **ink**，欢迎在 [Twitter](http://www.twitter.com/inkleStudios) 或 [邮件](mailto:info@inklestudios.com) 告知我们。

### MIT 许可证
Copyright (c) 2016 inkle Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

-

*Inky 得名于英国剑桥的一只黑猫。*
