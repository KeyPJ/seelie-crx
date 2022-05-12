import CharacterDataEx = mihoyo.CharacterDataEx;
import CharacterStatus = seelie.CharacterStatus;

function checkAndSendMessage(sendMessage4AddCharacter: (id: number) => void) {
    chrome.tabs.query({
        active: true,
        currentWindow: true,
        url: ["https://seelie.me/*", "https://seelie.inmagi.com/*"],
    }, function (tabs) {
        const [tab] = tabs;
        const {id} = tab || {id: undefined}
        id ? sendMessage4AddCharacter(id) : alert(chrome.i18n.getMessage('alertMsg'));
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
                    console.log(chrome.i18n.getMessage("ascensionDataFail"))
                    console.log(chrome.i18n.getMessage("dataSyncSuccess"))
                    id && showMessage(chrome.i18n.getMessage("dataSyncSuccess"))
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
            showMessage(chrome.i18n.getMessage("setGoalLevelSuccess"))
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
            showMessage(chrome.i18n.getMessage("setTalentSuccess"))
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
