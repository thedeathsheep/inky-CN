const fs = require('fs');
const path = require('path');
const i18n = require("./i18n/i18n.js");

// Find longer snippets folder (base English)
const snippetsDirRelease = path.join(__dirname, "../../app.asar.unpacked/main-process", "ink/longer-ink-snippets");
const snippetsDirDev = path.join(__dirname, "ink/longer-ink-snippets");
const snippetsDirZhRelease = path.join(__dirname, "../../app.asar.unpacked/main-process", "ink/longer-ink-snippets-zh");
const snippetsDirZhDev = path.join(__dirname, "ink/longer-ink-snippets-zh");

var snippetsDir = snippetsDirRelease;
try { fs.accessSync(snippetsDir) }
catch(e) {
    snippetsDir = snippetsDirDev;
}

function getSnippetsDir() {
    const isZh = i18n.currentLocale && (i18n.currentLocale === 'zh-CN' || i18n.currentLocale.startsWith('zh'));
    if (isZh) {
        try {
            fs.accessSync(snippetsDirZhRelease);
            return snippetsDirZhRelease;
        } catch (e) {
            try {
                fs.accessSync(snippetsDirZhDev);
                return snippetsDirZhDev;
            } catch (e2) {
                return snippetsDir;
            }
        }
    }
    return snippetsDir;
}

function loadLongerSnippet(inkFilename) {
    const dir = getSnippetsDir();
    const filePath = path.join(dir, inkFilename);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8') + "\n";
    }
    return fs.readFileSync(path.join(snippetsDir, inkFilename), 'utf8') + "\n";
}

// Returns localized inline snippet (story text in Chinese when locale is zh-CN)
function inlineSnippet(en, zh) {
    return function() {
        const isZh = i18n.currentLocale && (i18n.currentLocale === 'zh-CN' || i18n.currentLocale.startsWith('zh'));
        return isZh ? zh : en;
    };
}

//-------------------
// STYLE GUIDELINE
// PLEASE READ!
//-------------------
// For multi-line style snippets please include a final newline (\n)
// so that they appear as a full block. This includes snippets that
// are single but full lines (e.g. choices).
// The only time you shouldn't put a newline on the end is if the
// snippet is definitely meant to be insert into the middle of
// a line (such as an inline conditional).
//
// You can use {separator: true} either in the category or individual
// snippet lists to insert a separator in the menu.

exports.snippets = [

    //-------------------
    // Basic structure
    //-------------------
    {
        categoryName: i18n._('Basic structure'),
        snippets: [
            {
                name: i18n._('Knot (main section)'),
                ink: inlineSnippet(
                    "=== knotName ===\nThis is the content of the knot.\n-> END\n",
                    "=== knotName ===\n这是 knot 的内容。\n-> END\n"
                )
            },
            {
                name: i18n._('Stitch (sub-section)'),
                ink: inlineSnippet(
                    "= stitchName\nThis is the content of the stitch that should be embedded within a knot.\n-> END\n",
                    "= stitchName\n这是 stitch 的内容，应嵌入在 knot 内。\n-> END\n"
                )
            },
            {separator: true},
            {
                name: i18n._('Divert'),
                ink: "-> targetKnotName"
            },
            {
                name: i18n._('Ending indicator'),
                ink: "-> END\n"
            }
        ]
    },

    //-------------------
    // CHOICES
    //-------------------
    {
        categoryName: i18n._('Choices'),
        snippets: [
            {
                name: i18n._('Basic Choice'),
                ink: inlineSnippet(
                    "* This is a choice that can only be chosen once\n",
                    "* 这是一个只能选择一次的选项\n"
                )
            },
            {
                name: i18n._('Sticky choice'),
                ink: inlineSnippet(
                    "+ This is a sticky choice - the player can choose it more than once\n",
                    "+ 这是持久选项 - 玩家可以多次选择\n"
                )
            },
            {
                name: i18n._('Choice without printing'),
                ink: inlineSnippet(
                    "* [A choice where the content isn't printed after choosing]\n",
                    "* [选择后不输出这段文字的选项]\n"
                )
            },
            {
                name: i18n._('Choice with mixed output'),
                ink: inlineSnippet(
                    "* Try [it] this example!\n",
                    "* 试试[这个]例子！\n"
                )
            },
        ]
    },

    //-------------------
    // VARIABLES
    //-------------------
    {
        categoryName: i18n._('Variables'),
        snippets: [
            {
                "name": i18n._('Global variable'),
                "ink": "VAR myNumber = 5\n"
            },
            {
                "name": i18n._('Temporary variable'),
                "ink": "temp myTemporaryValue = 5\n"
            },
            {
                "name": i18n._('Modify variable'),
                "ink": "~ myNumber = myNumber + 1\n"
            },
            {
                name: i18n._('Get variable type'),
                ink: () => loadLongerSnippet("type_of.ink")
            }

        ]
    },

    //-------------------
    // INLINE LOGIC
    //-------------------
    {
        categoryName: i18n._('Inline logic'),
        snippets: [
            {
                name:  i18n._('Condition'),
                ink: inlineSnippet(
                    "{yourVariable: This is written if yourVariable is true|Otherwise this is written}",
                    "{yourVariable: yourVariable 为真时输出这里|否则输出这里}"
                )
            }
        ]
    },

    //-------------------
    // MULTI-LINE LOGIC
    //-------------------
    {
        categoryName: i18n._('Multi-line logic'),
        snippets: [
            {
                name: i18n._('Condition'),
                ink: inlineSnippet(
                    "{yourVariable:\n    This is written if yourVariable is true.\n  - else:\n    Otherwise this is written.\n}\n",
                    "{yourVariable:\n    yourVariable 为真时输出这里。\n  - else:\n    否则输出这里。\n}\n"
                )
            }
        ]
    },

    //-------------------
    // COMMENTS
    //-------------------
    {
        categoryName: i18n._('Comments'),
        snippets: [
            {
                name: i18n._('Single-line comment'),
                ink: inlineSnippet(
                    "// This line is a comment.\n",
                    "// 这是单行注释。\n"
                )
            }, 
            {
                name: i18n._('Block comment'),
                ink: inlineSnippet(
                    "/* ---------------------------------\n\n   This whole section is a comment \n\n ----------------------------------*/\n",
                    "/* ---------------------------------\n\n   整块为注释内容 \n\n ----------------------------------*/\n"
                )
            }
        ]
    },

    {separator: true},

    //-------------------
    // LIST FUNCTIONS
    //-------------------
    {
        categoryName: i18n._('List-handling'),
        snippets: [
            {
                name: i18n._('List: pop'),
                ink: () => loadLongerSnippet("list_pop.ink")
            },
            {
                name: i18n._('List: pop_random'),
                ink: () => loadLongerSnippet("list_pop_random.ink")
            },
            {
                name: i18n._('List: LIST_NEXT and LIST_PREV'),
                ink: () => loadLongerSnippet("list_prev_next.ink")
            },
            {
                name: i18n._('List: list_item_is_member_of'),
                ink: () => loadLongerSnippet("list_item_is_member_of.ink")
            },
            {
                name: i18n._('List: list_random_subset'),
                ink: () => loadLongerSnippet("list_random_subset.ink")
            },
            {
                name: i18n._('List: list_random_subset_of_size'),
                ink: () => loadLongerSnippet("list_random_subset_of_size.ink")
            },
            {
                name: i18n._('List: string_to_list'),
                ink: () => loadLongerSnippet("string_to_list.ink")
            }
        ]
    },

    //-------------------
    // USEFUL FUNCTIONS
    //-------------------

    {
        categoryName: i18n._('Useful functions'),
        snippets: [
            {
                name: i18n._('Logic: maybe'),
                ink: () => loadLongerSnippet("maybe.ink")
            },
            {separator: true},
            {
                name: i18n._('Mathematics: divisor'),
                ink: "=== function divisor(x, n)\n" +
                      "~ return (x - x mod n) / n"
            },
            {
                name: i18n._('Mathematics: abs'),
                ink: "=== function abs(x)\n" +
                      "{ x < 0:\n" + 
                      "      ~ return -1 * x\n" +
                      "  - else: \n" +
                      "      ~ return x\n" + 
                      "}"
            },
            {separator: true},
            {
                name: i18n._('Flow: came_from'),
                ink: () => loadLongerSnippet("came_from.ink")
            },
            {
                name: i18n._('Flow: seen_very_recently'),
                ink: () => loadLongerSnippet("seen_very_recently.ink")
            },
            {
                name: i18n._('Flow: seen_more_recently_than'),
                ink: () => loadLongerSnippet("seen_more_recently_than.ink")
            },
            {
                name: i18n._('Flow: seen_this_scene'),
                ink: () => loadLongerSnippet("seen_this_scene.ink")
            },
            {
                name: i18n._('Flow: thread_in_tunnel'),
                ink: () => loadLongerSnippet("thread_in_tunnel.ink")
            },
            {separator: true},
            {
                name: i18n._('Printing: a (or an)'),
                ink: () => loadLongerSnippet("a_or_an.ink")
            },
            {
                name: i18n._('Printing: UPPERCASE'),
                ink: () => loadLongerSnippet("uppercase.ink")
            },
            {
                name: i18n._('Printing: print_number'),
                ink: () => loadLongerSnippet("print_number.ink")
            },
            {
                name: i18n._('Printing: list_with_commas'),
                ink: () => loadLongerSnippet("list_with_commas.ink")
            }
        ]
    },
    {
        categoryName: i18n._('Useful systems'),
        snippets: [
            {
                name: i18n._('List Items as Integer Variables'),
                ink: () => loadLongerSnippet("listToNumber.ink")
            },
            {
                name: i18n._('Swing Variables'),
                ink: () => loadLongerSnippet("swing_variables.ink")
            },
            {
                name: i18n._('Storylets'),
                ink: () => loadLongerSnippet("storylets.ink")
            }
        ]
    },

    {separator: true},

    {
        categoryName: i18n._('Full stories'),
        snippets: [
            {
                name: i18n._('Crime Scene (from Writing with Ink)'),
                ink: () => loadLongerSnippet("murder_scene.ink")
            },
            {
                name: i18n._('Swindlestones (from Sorcery!)'),
                ink: () => loadLongerSnippet("swindlestones.ink")
            },  
            {
                name: i18n._('Pontoon Game (from Overboard!)'),
                ink: () => loadLongerSnippet("pontoon_example.ink")
            },
            {
                name: i18n._('The Intercept'),
                ink: () => loadLongerSnippet("theintercept.ink")
            }
        ]
    }
];
