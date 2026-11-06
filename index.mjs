import * as cheerio from 'cheerio';
import * as fs from 'fs';

const request = await fetch('https://www.useragents.me');
const document = await request.text();

const $ = cheerio.load(document);

const desktopRegex = new RegExp('^Mozilla\\/5\\.0 \\((Windows NT 1|Macintosh|X11).*$');
const mobileRegex = new RegExp('^Mozilla\\/5\\.0 \\((iPhone|iPad|Android|Linux; Android).*$');

const desktopUserAgents = [];
const mobileUserAgents = [];

$('textarea').map((_index, el) => {
    const userAgent = $(el).text().trim();
    if (!userAgent.startsWith('Mozilla/5.0 (')) {
        return;
    }

    if (desktopRegex.test(userAgent)) {
        desktopUserAgents.push(userAgent);
    } else if (mobileRegex.test(userAgent)) {
        mobileUserAgents.push(userAgent)
    }
});

// Fail the workflow instead of publishing empty lists when the page layout changes.
if (desktopUserAgents.length === 0 || mobileUserAgents.length === 0) {
    throw new Error(`Scraped ${desktopUserAgents.length} desktop and ${mobileUserAgents.length} mobile user agents`);
}

const userAgents = {
    recommended: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0',
    desktop: [...new Set(desktopUserAgents)].sort(),
    mobile: [...new Set(mobileUserAgents)].sort(),
};

const buildDir = './build';
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}
fs.writeFileSync(`${buildDir}/user-agents.json`, JSON.stringify(userAgents, null, 2));
fs.writeFileSync(`${buildDir}/user-agents.min.json`, JSON.stringify(userAgents));
