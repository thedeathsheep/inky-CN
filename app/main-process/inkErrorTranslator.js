/**
 * Translates ink compiler error/warning messages to Chinese when locale is zh-CN.
 * Handles common patterns from inklecate output.
 */

const errorPatterns = [
    {
        pattern: /^Apparent loose end exists where the flow runs out\. Do you need a '-> DONE' statement, choice or divert\? Note that if you intend to enter '([^']+)' next, you need to divert to it explicitly\.$/,
        zh: "流程在此处没有明确的后续。是否需要添加 '-> DONE'、选项或跳转？注意：若希望进入 '$1'，请显式添加跳转（如 跳转 $1）。"
    },
    {
        pattern: /^Apparent loose end exists where the flow runs out\. Do you need a '-> DONE' statement, choice or divert\?$/,
        zh: "流程在此处没有明确的后续。是否需要添加 '-> DONE'、选项或跳转？"
    },
    {
        pattern: /^Rename '([^']+)' to something else - we already have a (?:knot|stitch|function) called that\.$/,
        zh: "请将 '$1' 重命名，已存在同名的 knot/stitch/函数。"
    },
    {
        pattern: /^Variable '([^']+)' has not been assigned a value before being used\.$/,
        zh: "变量 '$1' 在使用前尚未赋值。"
    },
    {
        pattern: /^Could not find (?:knot|stitch|target) '([^']+)'$/,
        zh: "找不到 knot/stitch/目标 '$1'。"
    },
    {
        pattern: /^'([^']+)' could not be found$/,
        zh: "找不到 '$1'。"
    },
    {
        pattern: /^Unexpected end of content$/,
        zh: "意外到达内容末尾。"
    },
    {
        pattern: /^ran out of content\. Do you need a '-> DONE' or '-> END'\?$/,
        zh: "流程已结束。是否需要 '-> DONE' 或 '-> END'？"
    },
    {
        pattern: /^Runtime error: (.*)$/,
        zh: "运行时错误：$1"
    }
];

function translateErrorToChinese(message) {
    if (!message || typeof message !== 'string') return message;
    for (const { pattern, zh } of errorPatterns) {
        const match = message.match(pattern);
        if (match) {
            let result = zh;
            for (let i = 1; i < match.length; i++) {
                result = result.replace('$' + i, match[i]);
            }
            return result;
        }
    }
    return message;
}

module.exports = {
    translateErrorToChinese
};
