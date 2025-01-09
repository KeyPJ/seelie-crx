import Rule = chrome.declarativeNetRequest.Rule;
import updateDynamicRules = chrome.declarativeNetRequest.updateDynamicRules;

export const BBS_URL = 'https://webstatic.mihoyo.com/ys/event/e20210928review/index.html'
export const ROLE_URL = 'https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_cn'
export const CHARACTERS_URL = 'https://api-takumi.mihoyo.com/event/e20200928calculate/v1/sync/avatar/list'
export const CHARACTERS_DETAIL_URL = 'https://api-takumi.mihoyo.com/event/e20200928calculate/v1/sync/avatar/detail'

export const BBS_URL_GLOBAL = 'https://act.hoyoverse.com/ys/event/e20230205-firework-xm7wly/index.html'
export const ROLE_URL_GLOBAL = 'https://api-os-takumi.hoyoverse.com/binding/api/getUserGameRolesByLtoken?game_biz=hk4e_global'
export const CHARACTERS_URL_GLOBAL = 'https://sg-public-api.hoyoverse.com/event/calculateos/sync/avatar/list'
export const CHARACTERS_DETAIL_URL_GLOBAL = 'https://sg-public-api.hoyoverse.com/event/calculateos/sync/avatar/detail'

const targetPages = [
    ROLE_URL, CHARACTERS_URL, //CHARACTERS_DETAIL_URL,
    // ROLE_URL_GLOBAL, CHARACTERS_URL_GLOBAL, CHARACTERS_DETAIL_URL_GLOBAL
]

const range = (start: number, end: number) => Array.from({length: end - start + 1}, (_, i) => start + i)

let currentReferer = ''
let currentUA = ''
let ruleID = 2333

export function generate12CharString(number = 12) {
    const characters = 'abcdef0123456789';
    let result = '';
    for (let i = 0; i < number; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

export const updateRules = async (fp = "") => {
    let requestHeaders = [
        {header: 'Referer', operation: 'set', value: currentReferer},
        {header: 'Origin', operation: 'set', value: currentReferer},
        {header: 'User-Agent', operation: 'set', value: currentUA},
    ];
    console.log("fp", fp)
    if (fp) {
        ruleID = 3333
        requestHeaders = [
            {header: 'Referer', operation: 'set', value: currentReferer},
            {header: 'Origin', operation: 'set', value: currentReferer},
            {header: 'User-Agent', operation: 'set', value: currentUA},
            {header: 'x-rpc-device_fp', operation: 'set', value: fp},]
    }
    const rules = []
    for (let i = 0; i < targetPages.length; i++) {
        rules.push({
            id: ruleID + i,
            priority: 1,
            action: {
                type: 'modifyHeaders',
                requestHeaders: requestHeaders,
            },
            condition: {urlFilter: targetPages[i]},
        })
    }
    await updateDynamicRules({
        removeRuleIds: range(ruleID, ruleID + targetPages.length),
        addRules: rules as Rule[],
    })
}

export const resetRules = async () => {
    await updateDynamicRules({
        removeRuleIds: range(ruleID, ruleID + targetPages.length),
    })
}

const headers = {
    Referer: "https://webstatic.mihoyo.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
}




export const setExtraHeaders = async (
    referer: string,
    ua: string,
    fp = "",
) => {
    currentReferer = referer
    currentUA = ua
    await updateRules(fp)
}


export function setExtraHeadersByIsGlobal(isGlobal: boolean, fp = "") {
    setExtraHeaders(headers.Referer, headers["User-Agent"], fp)
}
