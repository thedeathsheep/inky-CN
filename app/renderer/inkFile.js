const path = require("path");
const fs = require("fs");
const assert = require("assert");

const {ipcRenderer} = require("electron")
const mkdirp = require('mkdirp');

const InkFileSymbols = require("./inkFileSymbols.js").InkFileSymbols;

const Document = ace.require('ace/document').Document;
const EditSession = ace.require('ace/edit_session').EditSession;

var fileIdCounter = 0;

// -----------------------------------------------------------------
// InkFile
// -----------------------------------------------------------------

// anyPath can be relative or absolute
function InkFile(anyPath, mainInkFile, isBrandNew, inkMode, events) {
    
    this.id = fileIdCounter++;
    this.inkMode = inkMode;

    // Default filename if creating a new file, and passed null to constructor
    anyPath = anyPath || "Untitled.ink";

    this.mainInkFile = mainInkFile;

    // Obtain relative path by looking at main ink file
    if( path.isAbsolute(anyPath) ) {
        if( this.isMain() ) {
            this.relPath = path.basename(anyPath);
            this.projectDir = path.dirname(anyPath);
        } else {
            assert(this.mainInkFile.projectDir, "Main ink needs to be saved before we start loading includes with absolute paths.");
            this.relPath = path.relative(this.mainInkFile.projectDir, anyPath);
        }
    } 

    // Already relative
    else {
        this.relPath = anyPath;
    }

    this.events = events;

    // Create new Inky files with a comment already embedded placeholder comment.
    // This is a temporary solution to prevent the "INCLUDE x" blank file destructive deletion
    // issue, where saving automatically created blank files prevented properly saving and
    // removed Included files without warning the user.
    var initialContent = "";
    if( mainInkFile == null ) {
        initialContent = `// 欢迎使用 Inky！这是一个示例故事，展示汉化语法的常用写法。
// 在 视图 -> 中文语法模式 中可开启/关闭汉化语法。你可随时删除这些内容，开始写自己的故事。

// 主段、子段、跳转、选项、持久、收束、变量 等会被编译前转换为标准 ink 语法。

主段 从前
收束 从前……

选项 [开启冒险] 你踏上了未知的旅程。
    收束 
    选项 [向左走] 你发现了一条隐秘的小路。
        小路尽头是一座古老的遗迹。
        跳转 遗迹探险
    选项 [向右走] 你走进了茂密的森林。
        森林里传来奇怪的声音。
        跳转 森林深处
选项 [留在家中] 你决定今天不出门。
    但窗外传来的风声让你心神不宁。
    跳转 家中
选项 ->
    跳转 结束

主段 遗迹探险
// 变量声明与使用（变量 -> VAR）
变量 金币 = 0
变量 生命值 = 100

收束 遗迹的大门紧闭着，上面刻着神秘的符文。

选项 检查背包 {金币 > 0}
    你袋中有 {金币} 枚金币。
    收束 
    持久 [使用金币]
        ~ 金币 = 金币 - 1
        金币嵌入凹槽，大门缓缓打开。
        跳转 遗迹内部
    选项 ->
        跳转 遗迹内部
选项 {生命值 > 50} 强行推开大门
    你用尽全力推开了沉重的石门。
    ~ 生命值 = 生命值 - 10
    跳转 遗迹内部
选项 ->
    符文闪烁，仿佛在等待着什么。
    跳转 遗迹探险

子段 遗迹内部
遗迹内部昏暗而神秘。

持久 [点燃火把] 跳转 点燃火把后
持久 [在黑暗中摸索] 跳转 黑暗中摸索
选项 ->
    跳转 遗迹探险

子段 点燃火把后
火光驱散了黑暗，你看到了墙上的壁画。
~ 金币 = 金币 + 5
你在角落里发现了 5 枚金币！

持久 [仔细研究壁画]
    壁画讲述了一个古老的传说...
    跳转 结束
持久 [继续深入] 跳转 遗迹探险
选项 ->
    跳转 遗迹探险

子段 黑暗中摸索
在黑暗中，你撞到了墙壁。
~ 生命值 = 生命值 - 5
选项 [生命值 <= 0] 跳转 昏迷
收束 你受了些轻伤，但还能坚持。
持久 [点亮火把] 跳转 点燃火把后
选项 ->
    跳转 遗迹探险

子段 昏迷
你因伤势过重而昏迷了。
故事暂时告一段落。
跳转 结束

主段 森林深处
收束 森林深处静谧而神秘。

选项 观察四周
    你注意到地上有奇怪的脚印。
    收束 
    选项 [跟随脚印] 跳转 神秘小屋
    选项 [忽略脚印] 跳转 继续前行
    选项 ->
        跳转 神秘小屋
选项 大声呼喊
    你的声音在森林中回荡。
    {~没有任何回应。|一只鸟被惊飞了。|远处传来回声。}
    收束 
    持久 [继续探索] 跳转 森林深处
    选项 ->
        跳转 森林深处

子段 神秘小屋
你发现了一间猎人留下的木屋。
持久 [搜查木屋]
    你找到了一些补给品。~ 生命值 = 100
    生命值已恢复！
    收束 
    持久 [休息一会儿] 你休息后精神焕发。
    跳转 森林深处
持久 [离开] 跳转 继续前行
选项 ->
    跳转 继续前行

子段 继续前行
你继续深入森林，前方道路分叉。
持久 [向北] 北方似乎更加阴暗。
跳转 森林深处
持久 [向南] 南方传来了水声。
跳转 森林深处
选项 ->
    跳转 森林深处

主段 家中
收束 家中温暖而安静。

# 场景: 家中 # 章节1

收束 
选项 [煮一杯茶]
    茶香弥漫在房间里。
    收束 
    持久 [望向窗外]
        窗外的世界似乎比平时更加迷人。
        ~ 生命值 = 生命值 + 5
        你感到心情愉悦。
        收束 
        持久 [最终决定出门] 跳转 从前
        持久 [继续享受宁静] 跳转 家中
    持久 [阅读一本书]
        书中有趣的故事让你忘记了时间。
        跳转 家中
    选项 ->
        跳转 家中
持久 [整理行囊]
    ~ 金币 = 金币 + 10
    你在旧外套里发现了 10 枚金币！
    跳转 家中
持久 ->
    窗外天色渐暗，你决定早点休息。
    跳转 结束

/*
  汉化语法对照（编译前会自动转换）：
  
  主段 名称     -> === 名称 ===  （章节/ Knot）
  子段 名称     -> = 名称        （子段落/ Stitch）
  跳转 目标     -> -> 目标       （跳转，跳转 结束 = -> END）
  选项 文本     -> * 文本        （只能选一次的选项）
  持久 文本     -> + 文本        （可重复选的选项）
  收束 文本     -> - 文本        （收束点/ Gather）
  变量 x = 值   -> VAR x = 值
  临时 / 列表 / 常量 / 包含 / 外部 同理。
  
  条件、随机 {~A|B}、标签 #、注释 // 与标准 ink 相同。
*/

跳转 结束`
    }
    this.aceDocument = new Document(initialContent);
    this.aceSession = null;

    this.includes = [];

    // Temporarily set after fs.readFile completes so
    // we don't get a double fileChanged callback before
    // we're ready for it.
    // TODO: Verify this is true - can we simplify?
    this.justLoadedContent = false;

    // Flag to detect files that have data that hasn't been saved 
    // out into the compiler's temporary directory that needs to stay
    // in sync with the (potentially unsaved) editor version.
    this.compilerVersionDirty = true;

    // Flag used to ignore a file system watch event that causes the project
    // to attempt to reload data that has just changed on disk. When the
    // save was our own, we can safely ignore it.
    this.justSaved = false;

    this.symbols = new InkFileSymbols(this, {
        includesChanged: (includes) => {
            this.includes = includes.slice();
            this.events.includesChanged();
        }
    });

    // Assume it's new by default. We then attempt to load below
    // to check for sure
    this.hasUnsavedChanges = isBrandNew;
    this.isLoading = !isBrandNew;

    // If it has an absolute path, we expect it to exist on disk
    this.tryLoadFromDisk(err => {
        if( err ) {
            this.hasUnsavedChanges = true;
            this.events.loadError(err);
        } else {
            this.hasUnsavedChanges = false;
            this.isLoading = false;
        }
    });
    
    this.aceDocument.on("change", () => {
        this.hasUnsavedChanges = true;
        this.compilerVersionDirty = true;
        this.justSaved = false;
        
        if( !this.justLoadedContent ) 
            this.events.fileChanged();
    });

}

InkFile.prototype.isMain = function() {
    return this.mainInkFile == null;
}

InkFile.prototype.filename = function() {
    return path.basename(this.relPath);
}

// 20/09/2016 - Now using relative paths internally.
InkFile.prototype.relativePath = function() {
    return this.relPath;
}

InkFile.prototype.absolutePath = function() {
    var mainInk = this.isMain() ? this : this.mainInkFile;

    // Unsaved - can't get absolute path?
    if( !mainInk.projectDir )
        return null;
    
    // Normal case: combine the project directory with the file's relative path.
    return path.join(mainInk.projectDir, this.relPath);
}

InkFile.prototype.getValue = function() {
    return this.aceDocument.getValue();
}

InkFile.prototype.setValue = function(text) {
    this.aceDocument.setValue(text);
}

InkFile.prototype.getAceSession = function() {
    if( this.aceSession == null ) {
        this.aceSession = new EditSession(this.aceDocument, this.inkMode);
        this.aceSession.setUseWrapMode(true);
        this.aceSession.setUndoManager(new ace.UndoManager());
    }

    return this.aceSession;
}

InkFile.prototype.save = function(afterSaveCallback) {

    assert(this.isMain() || this.mainInkFile.projectDir, "Main ink file must be saved before we can save include files.");

    // Need to show save path dialog?
    if( !this.absolutePath() ) {
        ipcRenderer.invoke("showSaveDialog", { filters: [
            { name: 'Ink files', extensions: ['ink'] },
            { name: 'Text files', extensions: ['txt'] }
        ]}).then((result) => {
            console.log(result);
            let savedPath = result.filePath;
            if( savedPath ) {

                // If we're showing a save dialog, assume we're in the main ink file
                assert(this.isMain());
                this.relPath = path.basename(savedPath);
                this.projectDir = path.dirname(savedPath);

                // Loop back round for a quick save now we have the path
                this.save(afterSaveCallback);
            } else {
                if( afterSaveCallback )
                    afterSaveCallback(false);
            }
        });
    }

    // Quick save to existing path
    else {
        this.justSaved = true;
        var fileContent = this.aceDocument.getValue() || "";
        
        // Ensure that the enclosing folder exists beforehand
        var fileAbsPath = this.absolutePath();
        var fileDirectory = path.dirname(fileAbsPath);
        mkdirp.sync(fileDirectory);

        fs.writeFile(fileAbsPath, fileContent, "utf8", (err) => {
            if( err ) 
                afterSaveCallback(false);
            else {
                this.hasUnsavedChanges = false;
                afterSaveCallback(true);
            }
        })
    }
}

InkFile.prototype.deleteFromDisk = function() {
    var absPath = this.absolutePath();
    if( absPath )
        fs.exists(absPath, (exists) => { if( exists ) fs.unlink(absPath) });
}

InkFile.prototype.tryLoadFromDisk = function(loadCallback) {

    // Only being told to load from disk because the InkProject detected
    // a change event that was our own save? Ignore it just this once.
    if( this.justSaved ) {
        this.justSaved = false;
        return;
    }

    // Simplify code below by using a fallback
    loadCallback = loadCallback || (err => {});

    var absPath = this.absolutePath();
    if( !absPath ) {
        loadCallback("File doesn't yet have a project directory");
        return;
    }

    fs.stat(absPath, (err, stats) => {
        if( err || !stats.isFile() ) { 
            loadCallback(err.message || "ink file not found");
            return;
        }

        fs.readFile(absPath, 'utf8', (err, data) => {
            if( err ) {
                console.error("Failed to load include at: "+absPath);
                loadCallback(err.message);
                return;
            }

            // Strip any BOM
            // https://en.wikipedia.org/wiki/Byte_order_mark
            data = data.replace(/^\uFEFF/, '');

            // Success - fire this callback before other callbacks 
            // like document change get fired
            loadCallback(null);

            // Temporarily set justLoadedContent to true so that
            // we don't get a double fileChanged callback before
            // we're ready for it.
            // TODO: Verify this is true - can we simplify?
            this.justLoadedContent = true;

            this.aceDocument.setValue(data);
            if( this.aceSession ) this.aceSession.setUndoManager(new ace.UndoManager());
            this.hasUnsavedChanges = false;
            this.events.fileChanged();

            // Force immediate symbol re-parse (rather than the lazy scheduling)
            // in the newly loaded state so that we gather the includes and
            // project structure ASAP.
            this.symbols.parse();

            this.justLoadedContent = false;
        });

    });
}

InkFile.prototype.addIncludeLine = function(relativePath) {

    // Normally we allow the InkFileSymbols class to do this,
    // but by the time it gets round to doing parsing, it'll be too late.
    this.includes.push(relativePath);
    this.events.includesChanged();

    // Insert the include text itself
    var includeText = "INCLUDE "+relativePath+"\n";
    var lastIncludeRow = this.symbols.getLastIncludeRow();
    if( lastIncludeRow == -1 ) {
        this.aceDocument.insert({row: 0, column: 0}, includeText);
    } else {
        var lastIncludeRowContent = this.aceDocument.getLine(lastIncludeRow);
        this.aceDocument.insert({row: lastIncludeRow, column: lastIncludeRowContent.length}, "\n" + includeText);
    }
}

InkFile.prototype.setInkMode = function(newInkMode)
{
    this.inkMode = newInkMode;

    // Don't force greedy construction right now by calling getAceSession(), instead
    // allowing it to be created whenever it's wanted elsewhere.
    if( this.aceSession ) {
        this.aceSession.setMode(this.inkMode);
    }
}

exports.InkFile = InkFile;
