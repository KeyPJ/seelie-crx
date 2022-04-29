import pkg from '../package.json';
import {ManifestType} from '@src/manifest-type';

const manifest: ManifestType = {
    manifest_version: 3,
    name: pkg.displayName,
    version: pkg.version,
    description: pkg.description,
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
            matches: ['https://seelie.inmagi.com/*', 'https://seelie.me/*', 'https://localhost:3000/*'],
            js: ['src/pages/content/index.js'],
            // css: ['contentStyle.css'],
        },
    ],
    // devtools_page: 'src/pages/devtools/index.html',
    web_accessible_resources: [
        {
            resources: ['contentStyle.css', 'icon-128.png', 'icon-34.png'],
            matches: ["*://*.mihoyo.com/*"],
        },
    ],
    permissions: ['storage', 'cookies', 'alarms','notifications',"tabs"],
    host_permissions: [
        "https://*.mihoyo.com/*",
    ]
};

export default manifest;
