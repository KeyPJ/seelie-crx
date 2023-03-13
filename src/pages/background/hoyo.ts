let charactersNum = 100;
(async () => {
    chrome.storage.sync.get("character").then((items: any) => {
        charactersNum = items?.character?.length || 100;
    });
})();


import Role = mihoyo.Role;
import Data = mihoyo.Data;
import Character = mihoyo.Character;
import CharacterData = mihoyo.CharacterData;
import CharacterDataEx = mihoyo.CharacterDataEx;
import {
    BBS_URL,
    BBS_URL_GLOBAL,
    CHARACTERS_DETAIL_URL,
    CHARACTERS_DETAIL_URL_GLOBAL,
    CHARACTERS_URL,
    CHARACTERS_URL_GLOBAL,
    ROLE_URL,
    ROLE_URL_GLOBAL,
    setExtraHeadersByIsGlobal
} from "@pages/background/net";


export const isGlobal = (region: string) => {
    return !["cn_gf01", "cn_qd01"].includes(region);
}


const requestPageSize = 50;

const showMessage = (message: string) => {
    chrome.notifications.create(
        {iconUrl: "/icon-34.png", message, title: "", type: "basic"}
    )
};

export const getAccount = async (isGlobal: boolean) => {

    setExtraHeadersByIsGlobal(isGlobal)
    const response = await fetch(isGlobal ? ROLE_URL_GLOBAL : ROLE_URL);
    const res = await response.json();
    const {retcode, message, data} = res;
    if (retcode === 0) {
        const {list: accountList} = await data as Data<Role>;
        return accountList;
    } else {
        showMessage(message);
        await chrome.tabs.create({url: isGlobal ? BBS_URL_GLOBAL : BBS_URL})
        return [];
    }

};

const getCharacters = async (uid: string, region: string, page = 1) => {

    setExtraHeadersByIsGlobal(isGlobal(region))
    const url = isGlobal(region) ? CHARACTERS_URL_GLOBAL : CHARACTERS_URL;
    const response = await fetch(url, {
        method: "post", body:
            JSON.stringify({
                "element_attr_ids": [],
                "weapon_cat_ids": [],
                "page": page,
                "size": requestPageSize,
                "uid": uid,
                "region": region,
                "lang": "zh-cn"
            }), credentials: 'include'
    });
    const res = await response.json();
    const {retcode, message, data} = res;
    if (retcode === 0) {
        const {list: characterList} = await data as Data<Character>;
        return characterList;
    } else {
        chrome.notifications.create(
            {iconUrl: "/icon-34.png", message, title: "", type: "basic"}
        )
        await chrome.tabs.create({url: isGlobal(region) ? BBS_URL_GLOBAL : BBS_URL})
        return [];
    }
};

const getCharacterDetail = async (character: Character, uid: string, region: string) => {

    setExtraHeadersByIsGlobal(isGlobal(region))

    const {id} = character;
    const params = `?avatar_id=${id}&uid=${uid}&region=${region}&lang=zh-cn`
    const URL = isGlobal(region) ? CHARACTERS_DETAIL_URL_GLOBAL : CHARACTERS_DETAIL_URL;

    const response = await fetch(URL + params, {
        credentials: 'include',
    });
    const res = await response.json();
    const {retcode, message, data} = res;
    if (retcode === 0) {
        const characterData = await data as CharacterData;
        return {character, ...characterData} as CharacterDataEx;
    } else {
        console.error(message);
    }
};

export const getDetailList = async (game_uid: string, region: string) => {

    const maxPageSize = Math.ceil(charactersNum / requestPageSize);
    const idxs = Array.from(new Array(maxPageSize).keys());

    const characters: Character[] = [];
    for await (const i of idxs) {
        // eslint-disable-next-line prefer-spread
        characters.push.apply(characters, await getCharacters(game_uid, region, i + 1))
    }

    const details = characters.map(c => getCharacterDetail(c, game_uid, region));
    const detailList = [];
    for await (const d of details) {
        if (d) {
            detailList.push(d);
        }
    }
    return detailList;
}



