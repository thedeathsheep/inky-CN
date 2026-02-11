/**
 * Chinese-to-ink syntax preprocessor.
 * Transforms Chinese keywords to standard ink syntax before compilation.
 * Enabled via View -> Chinese Syntax Mode.
 *
 * Mapping (Chinese -> ink):
 *   主段 名称 -> === 名称 === (knot)
 *   子段 名称 -> = 名称 (stitch)
 *   跳转 目标 -> -> 目标 (divert, 结束->END, 完成->DONE)
 *   选项 文本 -> * 文本 (choice)
 *   持久 文本 -> + 文本 (sticky choice)
 *   收束 文本 -> - 文本 (gather)
 *   变量 -> VAR
 *   临时 -> temp
 *   列表 -> LIST
 *   常量 -> CONST
 *   包含 -> INCLUDE
 *   外部 -> EXTERNAL
 *   函数 -> function
 */

function preprocessChineseToInk(inkContent) {
    if (!inkContent || typeof inkContent !== 'string') return inkContent;

    const lines = inkContent.split('\n');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const trimmed = line.trimStart();
        const indent = line.slice(0, line.length - trimmed.length);

        // Skip empty lines
        if (trimmed.length === 0) {
            result.push(line);
            continue;
        }

        // Skip comment lines - preserve as-is
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            result.push(line);
            continue;
        }

        // Knot: 主段 名称 or 主段 名称 === -> === 名称 ===
        if (/^\s*主段\s+/.test(line)) {
            const nameMatch = line.match(/^\s*主段\s+([^\s=]+)(?:\s*===\s*)?/);
            if (nameMatch) {
                line = indent + '=== ' + nameMatch[1].trim() + ' ===';
            }
        }

        // Stitch: 子段 名称 -> = 名称
        else if (/^\s*子段\s+/.test(line)) {
            const nameMatch = line.match(/^\s*子段\s+([^\n]+)/);
            if (nameMatch) {
                line = indent + '= ' + nameMatch[1].trim();
            }
        }

        // Divert: 跳转 目标 (special: 结束->END, 完成->DONE)
        else if (/^\s*跳转\s+/.test(line)) {
            let target = line.replace(/^\s*跳转\s+/, '').trim();
            if (target === '结束') target = 'END';
            else if (target === '完成') target = 'DONE';
            line = indent + '-> ' + target;
        }

        // Choice: 选项 文本 -> * 文本
        else if (/^\s*选项\s+/.test(line)) {
            line = indent + '* ' + line.replace(/^\s*选项\s+/, '').trim();
        }

        // Sticky choice: 持久 文本 -> + 文本
        else if (/^\s*持久\s+/.test(line)) {
            line = indent + '+ ' + line.replace(/^\s*持久\s+/, '').trim();
        }

        // Gather: 收束 文本 -> - 文本
        else if (/^\s*收束\s+/.test(line)) {
            line = indent + '- ' + line.replace(/^\s*收束\s+/, '').trim();
        }

        // Keywords at line start only (avoid replacing in story text)
        else if (/^\s*变量\s+/.test(line)) {
            line = line.replace(/^\s*变量\s+/, indent + 'VAR ');
        }
        else if (/^\s*临时\s+/.test(line)) {
            line = line.replace(/^\s*临时\s+/, indent + 'temp ');
        }
        else if (/^\s*列表\s+/.test(line)) {
            line = line.replace(/^\s*列表\s+/, indent + 'LIST ');
        }
        else if (/^\s*常量\s+/.test(line)) {
            line = line.replace(/^\s*常量\s+/, indent + 'CONST ');
        }
        else if (/^\s*包含\s+/.test(line)) {
            line = line.replace(/^\s*包含\s+/, indent + 'INCLUDE ');
        }
        else if (/^\s*外部\s+/.test(line)) {
            line = line.replace(/^\s*外部\s+/, indent + 'EXTERNAL ');
        }

        // 函数 in "=== 函数 name" (knot function declaration)
        line = line.replace(/===\s*函数\s+/, '=== function ');

        // Divert targets: -> 结束, -> 完成 (anywhere in line)
        line = line.replace(/->\s*结束(?=[\s\n]|$)/g, '-> END');
        line = line.replace(/->\s*完成(?=[\s\n]|$)/g, '-> DONE');

        result.push(line);
    }

    return result.join('\n');
}

module.exports = {
    preprocessChineseToInk
};
