function union(sets) {
    const u = new Set();
    for (const set of sets) {
        for (const elem of set) {
            u.add(elem);
        }
    }
    return u;
}

// Helper function that gets all the divert targets from a list of InkFiles
function getAllDivertTargets(files) {
    return union(files.map((file) => file.symbols.getCachedDivertTargets()));
}

// Helper function that gets all the variable names from a list of InkFiles
function getAllVariables(files) {
    return union(files.map((file) => file.symbols.getCachedVariables()));
}

// Helper function that gets all the vocabulary words from a list of InkFiles
function getAllVocabWords(files) {
    return union(files.map((file) => file.symbols.getCachedVocabWords()));
}

// Helper function that generates suggestions for all the divert targets
function getAllDivertTargetSuggestions(inkFiles) {
    const targets = getAllDivertTargets(inkFiles);
    const suggestions = [];
    for (const target of targets) {
        suggestions.push({
            caption: target,
            value: target,
            meta: "Divert Target",
        });
    }
    return suggestions;
}

// Helper function that generates suggestions for all the variables
function getAllVariableSuggestions(inkFiles) {
    const variables = getAllVariables(inkFiles);
    const suggestions = [];
    for (const variable of variables) {
        suggestions.push({
            caption: variable,
            value: variable,
            meta: "Variable",
        });
    }
    return suggestions;
}

// Helper function that generates suggestions for all the vocabulary
function getAllVocabSuggestions(inkFiles) {
    const vocabWords = getAllVocabWords(inkFiles);
    const suggestions = [];
    for (const vocabWord of vocabWords) {
        suggestions.push({
            caption: vocabWord,
            value: vocabWord,
            meta: "Vocabulary",
        });
    }
    return suggestions;
}

function getFunctionSuggestions(language) {
    const meta = language === "zh-CN" ? "函数" : "Function";
    return [
        { caption: "CHOICE_COUNT()", value: "CHOICE_COUNT()", meta },
        { caption: "TURNS()", value: "TURNS()", meta },
        { caption: "TURNS_SINCE(-> knot)", value: "TURNS_SINCE(-> knot)", meta },
        { caption: "SEED_RANDOM()", value: "SEED_RANDOM()", meta },
        { caption: "RANDOM(min, max)", value: "RANDOM(min, max)", meta },
        { caption: "LIST_VALUE(list, value)", value: "LIST_VALUE(list, value)", meta },
    ];
}

function getSyntaxSuggestions(language) {
    if (language === "zh-CN") {
        return [
            { caption: "跳转 (->)", value: "跳转 ", meta: "语法" },
            { caption: "节点 (===)", value: "节点 ", meta: "语法" },
            { caption: "章节 (=)", value: "章节 ", meta: "语法" },
            { caption: "选项 (*)", value: "选项 ", meta: "语法" },
            { caption: "选项 (+)", value: "选项 ", meta: "语法" },
            { caption: "分支 (-)", value: "分支 ", meta: "语法" },
            { caption: "语句 (~)", value: "语句 ", meta: "语法" },
            { caption: "变量 (VAR)", value: "变量 ", meta: "语法" },
            { caption: "临时 (temp)", value: "临时 ", meta: "语法" },
            { caption: "列表 (LIST)", value: "列表 ", meta: "语法" },
            { caption: "常量 (CONST)", value: "常量 ", meta: "语法" },
            { caption: "包含 (INCLUDE)", value: "包含 ", meta: "语法" },
            { caption: "外部 (EXTERNAL)", value: "外部 ", meta: "语法" },
            { caption: "函数 (function)", value: "函数 ", meta: "语法" },
        ];
    }

    return [
        { caption: "-> (Divert)", value: "-> ", meta: "Syntax" },
        { caption: "=== (Knot)", value: "=== ", meta: "Syntax" },
        { caption: "= (Stitch)", value: "= ", meta: "Syntax" },
        { caption: "* (Choice)", value: "* ", meta: "Syntax" },
        { caption: "+ (Choice)", value: "+ ", meta: "Syntax" },
        { caption: "- (Gather)", value: "- ", meta: "Syntax" },
        { caption: "~ (Statement)", value: "~ ", meta: "Syntax" },
        { caption: "VAR", value: "VAR ", meta: "Syntax" },
        { caption: "temp", value: "temp ", meta: "Syntax" },
        { caption: "LIST", value: "LIST ", meta: "Syntax" },
        { caption: "CONST", value: "CONST ", meta: "Syntax" },
        { caption: "INCLUDE", value: "INCLUDE ", meta: "Syntax" },
        { caption: "EXTERNAL", value: "EXTERNAL ", meta: "Syntax" },
        { caption: "function", value: "function ", meta: "Syntax" },
    ];
}

exports.inkCompleter = {
    inkFiles: [],
    lastTriggerChar: null,
    lastTriggerAt: 0,
    workingLanguage: "en",

    setTriggerChar(char) {
        this.lastTriggerChar = char;
        this.lastTriggerAt = Date.now();
    },
    setWorkingLanguage(language) {
        this.workingLanguage = language || "en";
    },

    getCompletions(editor, session, pos, prefix, callback) {
        const now = Date.now();
        if (!prefix && this.lastTriggerChar && now - this.lastTriggerAt < 1000) {
            const trigger = this.lastTriggerChar;
            this.lastTriggerChar = null;
            if (trigger === "{") {
                callback(null, getFunctionSuggestions(this.workingLanguage));
                return;
            }
            if (trigger === " ") {
                callback(null, getSyntaxSuggestions(this.workingLanguage));
                return;
            }
        }

        // There are three possible ways we may want to suggest completions:
        //
        // 1) If we are in a divert or divert target, we should only suggest
        //    target names.
        // 2) If we are in a logic section, we should suggest variables,
        //    targets, (because they can be used as variables) and vocab words.
        //    (because logic can output text)
        // 3) If we are not in either, we should only suggest vocab words.

        const cursorToken = session.getTokenAt(pos.row, pos.column);
        const isCursorInDivert = (cursorToken.type.indexOf("divert") != -1);
        const isCursorInFlow = (cursorToken.type.indexOf("flow") != -1);
        const isCursorInLabel = (cursorToken.type.indexOf(".label") != -1);
        const isCursorInLogic = (cursorToken.type.indexOf("logic") != -1);

        // Ignore the prefix. ACE will find the most likely words in the list
        // for the prefix automatically.

        var suggestions;
        if( isCursorInDivert || isCursorInFlow || isCursorInLabel ) {
            suggestions = getAllDivertTargetSuggestions(this.inkFiles);
        } else if( isCursorInLogic ) {
            const divertTargetSuggestions = getAllDivertTargetSuggestions(this.inkFiles);
            const variableSuggestions = getAllVariableSuggestions(this.inkFiles);
            const vocabSuggestions = getAllVocabSuggestions(this.inkFiles);
            suggestions = divertTargetSuggestions.concat(variableSuggestions).
                    concat(vocabSuggestions);
        } else {
            suggestions = getAllVocabSuggestions(this.inkFiles);
        }

        if( !isCursorInDivert && !isCursorInFlow && !isCursorInLabel ) {
            suggestions = suggestions.concat(getSyntaxSuggestions(this.workingLanguage));
        }

        callback(null, suggestions);
    }
};
