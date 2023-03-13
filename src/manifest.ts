import pkg from '../package.json';
import {ManifestType} from '@src/manifest-type';

const manifest: ManifestType = {
    manifest_version: 3,
    // name: pkg.displayName,
    name: "__MSG_name__",
    version: pkg.version,
    description: "__MSG_description__",
    // options_page: 'src/pages/options/index.html',
    background: {
        service_worker: 'src/pages/background/index.js',
        type: 'module',
    },
    action: {
        default_popup: 'src/pages/popup/index.html',
        default_icon: 'icon-34.png',
    },
    // chrome_url_overrides: {
    //   newtab: 'src/pages/newtab/index.html',
    // },
    icons: {
        "128": 'icon-128.png',
    },
    content_scripts: [
        {
            matches: ['https://seelie.inmagi.com/*', 'https://seelie.me/*'],
            js: ['src/pages/content/index.js'],
            // css: ['contentStyle.css'],
        },
    ],
    // devtools_page: 'src/pages/devtools/index.html',
    web_accessible_resources: [
        {
            resources: ['contentStyle.css', 'icon-128.png', 'icon-34.png'],
            matches: [],
        },
    ],
    permissions: ['storage', 'cookies', 'alarms', 'notifications', "tabs", "declarativeNetRequest"],
    host_permissions: [
        "https://*.mihoyo.com/*",
        "https://*.hoyoverse.com/*",
        "https://seelie.inmagi.com/*",
        "https://seelie.me/*",
    ],
    default_locale: "zh_CN"
};

export default manifest;
