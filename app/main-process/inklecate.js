const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');
const path = require("path");
const electron = require('electron');
const ipc = electron.ipcMain;
// Resolve from app root so it works when launched from project root (e.g. npx electron app/main-process/main.js)
const mkdirp = require(path.join(__dirname, '..', 'node_modules', 'mkdirp'));
const { preprocessChineseToInk } = require('./inkPreprocessor.js');
const { translateErrorToChinese } = require('./inkErrorTranslator.js');
const { isEnabled: isChineseSyntaxEnabled } = require('./inkChineseSyntax.js');
const i18n = require('./i18n/i18n.js');

// inklecate is packaged outside of the main asar bundle since it's executable
const inklecateNames = {
    "darwin": "/ink/inklecate_mac",
    "win32":  "/ink/inklecate_win.exe",
    "linux": "/ink/inklecate_linux"
}
const inklecateRootPathRelease = path.join(__dirname, "../../app.asar.unpacked/main-process");
const inklecateRootPathDev = __dirname;

var inklecatePath = path.join(inklecateRootPathRelease, inklecateNames[process.platform]);

// If inklecate isn't available here, we're probably in development mode (not packaged into a release asar)
try { fs.accessSync(inklecatePath) }
catch(e) {
    inklecatePath = path.join(inklecateRootPathDev, inklecateNames[process.platform]);
}

var tempInkPath;
if (process.platform == "darwin" || process.platform == "linux") {
    tempInkPath = process.env.TMPDIR ? path.join(process.env.TMPDIR, "inky_compile") : "/tmp/inky_compile";
} else {
    tempInkPath = path.join(process.env.temp, "inky_compile")
}

var sessions = {};


function compile(compileInstruction, requester) {

    var sessionId = compileInstruction.sessionId;

    console.log(`Launching inklecate for session id '${sessionId}'`);

    var uniqueDirPath = path.join(tempInkPath, compileInstruction.namespace);

    // TODO: handle errors
    mkdirp.sync(uniqueDirPath);

    // Write out updated files
    const useChinesePreprocess = isChineseSyntaxEnabled();
    const useChineseErrors = i18n.currentLocale && (i18n.currentLocale === 'zh-CN' || i18n.currentLocale.startsWith('zh'));
    var mainPreprocessedContent = null;
    for(var relativePath in compileInstruction.updatedFiles) {

        var fullInkPath = path.join(uniqueDirPath, relativePath);
        var inkFileContent = compileInstruction.updatedFiles[relativePath];

        // Preprocess Chinese keywords to ink syntax when locale is zh-CN
        if (useChinesePreprocess) {
            inkFileContent = preprocessChineseToInk(inkFileContent);
        }
        if (relativePath === compileInstruction.mainName) {
            mainPreprocessedContent = inkFileContent;
        }

        if( path.dirname(relativePath) != "." ) {
            var fullDir = path.dirname(fullInkPath);
            mkdirp.sync(fullDir);
        }

        fs.writeFileSync(fullInkPath, inkFileContent);
    }

    // #region agent log
    if (mainPreprocessedContent != null) {
        var lines = mainPreprocessedContent.split('\n');
        var warnLines = [9, 28, 79, 84, 91, 113, 117];
        var aroundWarn = {};
        warnLines.forEach(function(n) {
            if (n >= 1 && n <= lines.length) {
                aroundWarn[n] = lines[n - 1];
            }
        });
        fetch('http://127.0.0.1:7934/ingest/9a4962ee-e8cc-4d2d-b27d-cd81561d43e1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'25b640'},body:JSON.stringify({sessionId:'25b640',location:'inklecate.js:preprocess',message:'preprocessed lines at warning positions',data:{aroundWarn,totalLines:lines.length},hypothesisId:'loose-end',timestamp:Date.now()})}).catch(()=>{});
    }
    // #endregion

    var mainInkPath = path.join(uniqueDirPath, compileInstruction.mainName);

    var inklecateOptions = ["-ckj"];

    if( compileInstruction.play )
        inklecateOptions[0] += "p";

    var jsonExportPath = null;
    if( compileInstruction.export )  {
        inklecateOptions.push("-o");
        jsonExportPath = path.join(uniqueDirPath, `export_${sessionId}.json`);
        inklecateOptions.push(jsonExportPath);
    }

    if( compileInstruction.stats ) {
        inklecateOptions.push("-s");
    }

    inklecateOptions.push(mainInkPath);

    var inklecatePathToUse = inklecatePath;
    if( compileInstruction.inkJsCompatible ) {
        var inklecateName = path.basename(inklecatePath);
        var inklecateFolderName = path.dirname(inklecatePath);
        inklecatePathToUse = path.resolve(inklecateFolderName, "inkjs-compatible", inklecateName);
    }

    const playProcess = spawn(inklecatePathToUse, inklecateOptions, {
        "cwd": path.dirname(inklecatePathToUse),
        "env": {
            "MONO_BUNDLED_OPTIONS": "--debug"
        }
    });

    sessions[sessionId] = {
        process:playProcess,
        requesterWebContents: requester,
        stopped: false,
        ended: false,
        evaluatingExpression: false,
        justRequestedDebugSource: false
    };
    var session = sessions[sessionId];

    playProcess.stderr.setEncoding('utf8');
    playProcess.stderr.on('data', (data) => {
        // Strip Byte order mark
        data = data.replace(/^\uFEFF/, '');
        if( data.length > 0 ) {
            requester.send('play-story-unexpected-error', data, sessionId);
        }
    });

    playProcess.stdin.setEncoding('utf8');
    playProcess.stdout.setEncoding('utf8');

    var inkErrors = [];
    var playMessageSeq = 0;

    var sendAnyErrors = () => {
        if( sessions[sessionId] && inkErrors.length > 0 ) {
            requester.send('play-generated-errors', inkErrors, sessionId);
            inkErrors = [];
        }
    };

    var onEndOfStory = (code) => {
        if( sessions[sessionId] && !sessions[sessionId].ended ) {
            sessions[sessionId].ended = true;
            // #region agent log
            if (compileInstruction.play) {
                fetch('http://127.0.0.1:7934/ingest/9a4962ee-e8cc-4d2d-b27d-cd81561d43e1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'25b640'},body:JSON.stringify({sessionId:'25b640',location:'inklecate.js:onEndOfStory',message:'story end',data:{fromJsonEnd:code===undefined,exitCode:code,playMessageSeq},hypothesisId:'play-end',timestamp:Date.now()})}).catch(()=>{});
            }
            // #endregion
            sendAnyErrors();

            if( code == 0 || code === undefined ) {
                requester.send('inklecate-complete', sessionId, jsonExportPath);
            }
            else {
                requester.send('play-exit-due-to-error', code, sessionId);
            }
        }
    }

    var issueRegex = /^(ERROR|WARNING|RUNTIME ERROR|RUNTIME WARNING|TODO): ('([^']+)' )?(line (\d+):)?(.*)/;
    var debugSourceRegex = /^DebugSource: (line (\d+) of (.*)|Unknown source)/;

    var stdoutTextBuffer = "";
    playProcess.stdout.on('data', (text) => {

        // Strip Byte order mark
        text = text.replace(/^\uFEFF/, '');
        if( text.length == 0 ) return;

        stdoutTextBuffer += text;
        // end of transmission should always be a \n or }
        // if not, wait for more data.
        if(!["\n", "}"].includes(stdoutTextBuffer.substr(-1))){
            return;
        }

        var lines = stdoutTextBuffer.split('\n');
        stdoutTextBuffer = ""; //we have enough : clear the buffer.

        for(var i=0; i<lines.length; ++i) {
            var line = lines[i].trim();

            // Ignore blank lines
            if( line.length == 0 )
                continue;
            
            
            try {
                var jsonResponse = JSON.parse(line);
            } catch(err) {
                console.error("Failed to parse JSON response from inklecate: "+line);
                continue;
            }

            if( requester.isDestroyed() ) {
                break;
            }

            // Issues
            if( jsonResponse.issues !== undefined ) {
                for(let issue of jsonResponse.issues) {
                    let issueMatches = issue.match(issueRegex);
                    if(issueMatches === null){ //fallback if regexp fails
                        let fallbackMsg = issue;
                        if (useChineseErrors) fallbackMsg = translateErrorToChinese(issue);
                        inkErrors.push({
                            type: "RUNTIME ERROR",
                            filename: "",
                            lineNumber: 0,
                            message: fallbackMsg
                        });
                        continue;
                    }
                    let msg = issueMatches[6].trim();
                    if (useChineseErrors) {
                        msg = translateErrorToChinese(msg);
                    }
                    if( session.evaluatingExpression ) {
                        requester.send('play-evaluated-expression-error', msg, sessionId);
                    } else {
                        var errEntry = {
                            type: issueMatches[1],
                            filename: issueMatches[3],
                            lineNumber: parseInt(issueMatches[5] || 0),
                            message: msg
                        };
                        inkErrors.push(errEntry);
                        // #region agent log
                        fetch('http://127.0.0.1:7934/ingest/9a4962ee-e8cc-4d2d-b27d-cd81561d43e1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'25b640'},body:JSON.stringify({sessionId:'25b640',location:'inklecate.js:issues',message:'compiler issue',data:errEntry,hypothesisId:'H2',timestamp:Date.now()})}).catch(()=>{});
                        // #endregion
                    }
                }

                requester.send('play-generated-errors', inkErrors, sessionId);
                inkErrors = [];
            }
            
            // Compile success?
            else if( jsonResponse["compile-success"] !== undefined ) {
                if (compileInstruction.play) { fetch('http://127.0.0.1:7934/ingest/9a4962ee-e8cc-4d2d-b27d-cd81561d43e1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'25b640'},body:JSON.stringify({sessionId:'25b640',location:'inklecate.js:play',message:'play msg',data:{seq:0,type:'compile-success',ok:jsonResponse['compile-success']},hypothesisId:'play-order',timestamp:Date.now()})}).catch(()=>{}); }
                // Whether true or false, it's done
                requester.send('compile-complete', sessionId);
            }
            
            // Tags
            else if( jsonResponse.tags !== undefined ) {
                requester.send('play-generated-tags', jsonResponse.tags, sessionId);
            }

            // Choices
            else if ( jsonResponse.choices !== undefined ) {
                if (compileInstruction.play) { playMessageSeq++; fetch('http://127.0.0.1:7934/ingest/9a4962ee-e8cc-4d2d-b27d-cd81561d43e1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'25b640'},body:JSON.stringify({sessionId:'25b640',location:'inklecate.js:play',message:'play msg',data:{seq:playMessageSeq,type:'choices',count:jsonResponse.choices.length},hypothesisId:'play-order',timestamp:Date.now()})}).catch(()=>{}); }
                for(let i=0; i<jsonResponse.choices.length; i++) {
                    requester.send("play-generated-choice", {
                        number: (i+1),
                        choice: jsonResponse.choices[i]
                    }, sessionId);
                }
            }

            // Input prompt - delay so choices (if any) are sent and processed before the prompt
            else if( jsonResponse.needInput ) {
                if( session.evaluatingExpression )
                    session.evaluatingExpression = false;
                // else if( session.justRequestedDebugSource )
                //     session.justRequestedDebugSource = false;
                else {
                    if (compileInstruction.play) { playMessageSeq++; fetch('http://127.0.0.1:7934/ingest/9a4962ee-e8cc-4d2d-b27d-cd81561d43e1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'25b640'},body:JSON.stringify({sessionId:'25b640',location:'inklecate.js:play',message:'play msg',data:{seq:playMessageSeq,type:'needInput'},hypothesisId:'play-order',timestamp:Date.now()})}).catch(()=>{}); }
                    setTimeout(function() { requester.send('play-requires-input', sessionId); }, 50);
                }
            }
            
            // DebugSource and expression result
            else if( jsonResponse.cmdOutput !== undefined ) {

                let debugSourceMatches = jsonResponse.cmdOutput.match(debugSourceRegex);
                if( debugSourceMatches ) {
                    // session.justRequestedDebugSource = true;
                    requester.send('return-location-from-source', sessionId, {
                        lineNumber: parseInt(debugSourceMatches[2]),
                        filename: debugSourceMatches[3]
                    });
                } else if( session.evaluatingExpression ) {
                    requester.send('play-evaluated-expression', jsonResponse.cmdOutput, sessionId);
                }
            }
            
            // Story text
            else if( jsonResponse.text !== undefined ) {
                if (compileInstruction.play) { playMessageSeq++; fetch('http://127.0.0.1:7934/ingest/9a4962ee-e8cc-4d2d-b27d-cd81561d43e1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'25b640'},body:JSON.stringify({sessionId:'25b640',location:'inklecate.js:play',message:'play msg',data:{seq:playMessageSeq,type:'text',preview:(jsonResponse.text||'').slice(0,80)},hypothesisId:'play-order',timestamp:Date.now()})}).catch(()=>{}); }
                requester.send('play-generated-text', jsonResponse.text, sessionId);
            }
            
            // End of story, but keep process running for debug source lookups
            else if( jsonResponse.end ) {
                if (compileInstruction.play) { playMessageSeq++; fetch('http://127.0.0.1:7934/ingest/9a4962ee-e8cc-4d2d-b27d-cd81561d43e1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'25b640'},body:JSON.stringify({sessionId:'25b640',location:'inklecate.js:play',message:'play msg',data:{seq:playMessageSeq,type:'end'},hypothesisId:'play-order',timestamp:Date.now()})}).catch(()=>{}); }
                onEndOfStory();
            }
            
            // Stats
            else if( jsonResponse.stats ) {
                requester.send('return-stats', jsonResponse.stats, sessionId);
            }

            continue;

        }

    })

    var processCloseExit = (code) => {

        if( !sessions[sessionId] ) {
            return;
        }

        var forceStoppedByPlayer = sessions[sessionId].stopped;
        if( !forceStoppedByPlayer ) {
            onEndOfStory(code);
        } else {
        }

        delete sessions[sessionId];

        console.log(` - Ended inklecate session id ${sessionId}`);
    };

    playProcess.on('close', processCloseExit);
    playProcess.on('exit', processCloseExit);
}

function stop(sessionId) {
    const processObj = sessions[sessionId];
    if( processObj ) {
        processObj.stopped = true;
        processObj.process.kill('SIGTERM');
        return true;
    } else {
        return false;
    }
}

function killSessions(optionalBrowserWindow) {
    for(var sessionId in sessions) {

        if( !optionalBrowserWindow || sessions[sessionId] &&
            sessions[sessionId].requesterWebContents == optionalBrowserWindow.webContents ) {
            stop(sessionId);
        }
    }
}

ipc.on("compile", (event, compileInstruction) => {
    compile(compileInstruction, event.sender);
});

ipc.on("play-stop-ink", (event, sessionId) => {
    const requester = event.sender;
    if( stop(sessionId) )
        requester.send('play-story-stopped', sessionId);
});

ipc.on("play-continue-with-choice-number", (event, choiceNumber, sessionId) => {
    if( sessions[sessionId] ) {
        const playProcess = sessions[sessionId].process;
        if( playProcess )
            playProcess.stdin.write(""+choiceNumber+"\n");
    }
});

ipc.on("evaluate-expression", (event, expressionText, sessionId) => {
    var session = sessions[sessionId];
    if( session ) {
        if( session.process ) {
            session.evaluatingExpression = true;
            session.process.stdin.write(`"${expressionText}"\n`);
        }
    }
});

ipc.on("get-location-in-source", (event, offset, sessionId) => {
    if( sessions[sessionId] ) {
        const playProcess = sessions[sessionId].process;
        if( playProcess )
            playProcess.stdin.write("DebugSource("+offset+")\n");
    }
});

ipc.on("get-runtime-path-in-source", (event, runtimePath, sessionId) => {
    if( sessions[sessionId] ) {
        const playProcess = sessions[sessionId].process;
        if( playProcess )
            playProcess.stdin.write("DebugPath "+runtimePath+"\n");
    }
});



exports.Inklecate = {
    killSessions: killSessions
}
