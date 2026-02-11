const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_KEY = process.env.AIHUBMIX_API_KEY;
const BASE_URL = process.env.AIHUBMIX_BASE_URL || 'https://aihubmix.com/v1';
const MODEL = process.env.AIHUBMIX_MODEL || 'gpt-4o-mini';
const DELAY_MS = parseInt(process.env.AIHUBMIX_DELAY_MS || '500', 10);

const SOURCE_MD = path.join(__dirname, '../app/resources/Documentation/WritingWithInk.md');
const TARGET_MD = path.join(__dirname, '../app/resources/Documentation/WritingWithInk.zh-CN.md');
const EMBEDDED_HTML = path.join(__dirname, '../app/renderer/documentation/embedded.zh-CN.html');
const WINDOW_HTML = path.join(__dirname, '../app/renderer/documentation/window.zh-CN.html');
const DOC_CSS = path.join(__dirname, '../app/resources/Documentation/documentation.css');
const WINDOW_PREFAB = path.join(__dirname, '../app/resources/Documentation/documentationWindowPrefab.html');

function requireApiKey() {
    if (!API_KEY) {
        console.error('Missing AIHUBMIX_API_KEY. Set it in your environment before running.');
        process.exit(1);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function chunkMarkdown(markdown) {
    const lines = markdown.split('\n');
    const chunks = [];
    let current = [];
    let inCodeBlock = false;

    for (const line of lines) {
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
        }

        const isHeading = !inCodeBlock && /^#+\s+/.test(line);
        if (isHeading && current.length > 0) {
            chunks.push(current.join('\n'));
            current = [];
        }
        current.push(line);
    }

    if (current.length > 0) {
        chunks.push(current.join('\n'));
    }
    return chunks;
}

async function translateChunk(chunk) {
    const body = {
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: [
                    'You are a professional technical translator.',
                    'Translate the user content to Simplified Chinese.',
                    'Preserve Markdown structure, links, inline code, code blocks, and all identifiers.',
                    'Do NOT translate code blocks or inline code.',
                    'Keep headings, lists, and formatting intact.'
                ].join(' ')
            },
            { role: 'user', content: chunk }
        ]
    };

    const resp = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(body)
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`API error ${resp.status}: ${text}`);
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('No content in API response.');
    }
    return content;
}

// Same character replacement as createDocumentnavigation.js so nav and embedded ids match
const NAV_CHARACTERS = ['#x', '?x-', '>x', '<x', ')x-', '(x-', ':x', ' x-', '.x', '/x-', "'x-", '`x', '"x', ',x', '!x-', '--x-', '--x-', '--x-', '--x-', '--x-', '--x-'];

function slugFromHeadline(headline) {
    let id = headline.toLowerCase();
    for (const character of NAV_CHARACTERS) {
        const [from, to] = character.split('x');
        id = id.split(from).join(to);
    }
    return id;
}

/** Returns array of { headline, slug, headlineType } from markdown, with deduplicated slugs so anchors are unique. */
function getHeadingsWithSlugs(markdownPath) {
    const data = fs.readFileSync(markdownPath, 'utf8');
    const items = [];
    const slugCount = new Map();
    for (const line of data.split('\n')) {
        if (line.indexOf('#') === -1 || line.charAt(0) !== '#') continue;
        const headline = line.split('#').join('').trim();
        let slug = slugFromHeadline(headline);
        const n = (slugCount.get(slug) || 0) + 1;
        slugCount.set(slug, n);
        if (n > 1) slug = slug + '-' + (n - 1);
        items.push({
            headline,
            slug,
            headlineType: 'h' + (line.match(/#/g) || []).length
        });
    }
    return items;
}

/** Rewrite heading ids in embedded HTML to match nav slugs (fixes broken anchors from markdown-html on Chinese). */
function fixEmbeddedHeadingIds(embeddedPath, markdownPath) {
    const headings = getHeadingsWithSlugs(markdownPath);
    let html = fs.readFileSync(embeddedPath, 'utf8');
    let index = 0;
    html = html.replace(/<h([1-6])\s+id="[^"]*">/gi, (match, level) => {
        const item = headings[index++];
        if (!item) return match;
        return `<h${level} id="${item.slug}">`;
    });
    fs.writeFileSync(embeddedPath, html);
}

function generateWindowHtml(markdownPath, outputPath, embeddedFilename) {
    const prefab = fs.readFileSync(WINDOW_PREFAB, 'utf8').split('<!--navigationentries-->');
    const headings = getHeadingsWithSlugs(markdownPath);

    let output = prefab[0];
    for (const item of headings) {
        output += ` <li><a id="#${item.slug}" onclick="openPath(this.id)" class="nav-${item.headlineType}">${item.headline}</a></li>\n`;
    }
    output += prefab[1];
    if (embeddedFilename && embeddedFilename !== 'embedded.html') {
        output = output.replace(/embedded\.html/g, embeddedFilename);
    }
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output);
}

function regenerateChineseDocHtmlOnly() {
    if (!fs.existsSync(TARGET_MD)) {
        console.error('WritingWithInk.zh-CN.md not found. Run full translation first.');
        process.exit(1);
    }
    const markdownHtml = path.join(__dirname, '../app/node_modules/.bin/markdown-html');
    execSync(`\"${markdownHtml}\" \"${TARGET_MD}\" -s \"${DOC_CSS}\" -o \"${EMBEDDED_HTML}\"`, { stdio: 'inherit' });
    fixEmbeddedHeadingIds(EMBEDDED_HTML, TARGET_MD);
    generateWindowHtml(TARGET_MD, WINDOW_HTML, 'embedded.zh-CN.html');
    console.log('Documentation (zh-CN) HTML regenerated.');
}

async function main() {
    const htmlOnly = process.argv.includes('--html-only');
    if (htmlOnly) {
        regenerateChineseDocHtmlOnly();
        return;
    }
    requireApiKey();

    const source = fs.readFileSync(SOURCE_MD, 'utf8');
    const chunks = chunkMarkdown(source);
    const translated = [];

    for (let i = 0; i < chunks.length; i++) {
        console.log(`Translating chunk ${i + 1}/${chunks.length}...`);
        const translatedChunk = await translateChunk(chunks[i]);
        translated.push(translatedChunk);
        await sleep(DELAY_MS);
    }

    fs.writeFileSync(TARGET_MD, translated.join('\n\n'));
    console.log(`Translated markdown written to ${TARGET_MD}`);

    // Generate embedded HTML (markdown-html is already in devDependencies)
    const markdownHtml = path.join(__dirname, '../app/node_modules/.bin/markdown-html');
    execSync(`\"${markdownHtml}\" \"${TARGET_MD}\" -s \"${DOC_CSS}\" -o \"${EMBEDDED_HTML}\"`, { stdio: 'inherit' });

    // Sync heading ids in embedded to match nav (markdown-html produces wrong/duplicate ids for Chinese)
    fixEmbeddedHeadingIds(EMBEDDED_HTML, TARGET_MD);

    // Generate navigation window HTML
    generateWindowHtml(TARGET_MD, WINDOW_HTML, 'embedded.zh-CN.html');

    console.log('Documentation (zh-CN) HTML generated.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
