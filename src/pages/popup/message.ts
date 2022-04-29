import CharacterDataEx = mihoyo.CharacterDataEx;
import CharacterStatus = seelie.CharacterStatus;

function checkAndSendMessage(sendMessage4AddCharacter: (id: number) => void) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const length = tabs.length;
        if (length == 0) {
            return;
        }
        const tab: chrome.tabs.Tab = tabs[0];
        const {url, id} = tab;
        //matches: ['https://seelie.inmagi.com/*', 'https://seelie.me/*', 'https://localhost:3000/*'],
        if (url && !(url.includes('https://seelie.me')
            || url.includes('https://seelie.inmagi.com')
            || url.includes('https://localhost')
        )) {
            alert('please open https://seelie.me or https://seelie.inmagi.com ')
            return
        }
        id && sendMessage4AddCharacter(id);
    });
}

function refresh(id: number) {
    chrome.tabs.sendMessage(id, {method: "reload"})
}

export const addCharacter = (res: CharacterDataEx[]) => {
    function sendMessage4AddCharacter(id: number) {
        res.forEach((value, index) => {
            const payload = {
                method: "addCharacter",
                params: {
                    characterDataEx: value
                }
            }
            id && chrome.tabs.sendMessage(id, payload, () => {
                //最后提醒并刷新
                if (res.length == index + 1) {
                    console.log(`米游社数据无法判断是否突破,请自行比较整数等级是否已突破`)
                    console.log(`角色信息同步完毕`)
                    id && showMessage("角色信息同步完毕")
                    refresh(id);
                }
            });
        });
    }

    checkAndSendMessage(sendMessage4AddCharacter);
};

function batchUpdate(method: string, all: boolean, characterStatusGoal: seelie.CharacterStatus) {
    const sendMessage4BatchUpdate = (id: number) => {
        const payload = {
            method: method,
            params: {
                all,
                characterStatusGoal
            }
        }
        id && chrome.tabs.sendMessage(id, payload, () => {
            showMessage(`目标等级设置完毕`)
            refresh(id);
        });
    };
    checkAndSendMessage(sendMessage4BatchUpdate);
}

export const batchUpdateCharacter = (all: boolean, characterStatusGoal: CharacterStatus) => {
    const method = "batchUpdateCharacter";
    batchUpdate(method, all, characterStatusGoal);
};

export const batchUpdateWeapon = (all: boolean, characterStatusGoal: CharacterStatus) => {
    const method = "batchUpdateWeapon";
    batchUpdate(method, all, characterStatusGoal);
};

export const batchUpdateTalent = (all: boolean, normal: number, skill: number, burst: number) => {
    const sendMessage4BatchUpdateCharacter = (id: number) => {
        const payload = {
            method: "batchUpdateTalent",
            params: {
                all, normal, skill, burst
            }
        }
        id && chrome.tabs.sendMessage(id, payload, () => {
            showMessage("角色目标天赋设置完毕")
            refresh(id);
        });
    };
    checkAndSendMessage(sendMessage4BatchUpdateCharacter);
};


export const showMessage = (message: string) => {
    chrome.notifications.create(
        {iconUrl: "/icon-34.png", message, title: "", type: "basic"}
    )
};
