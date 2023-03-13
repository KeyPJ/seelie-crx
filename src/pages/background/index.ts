import {getAccount, getDetailList} from "@pages/background/hoyo";

chrome.runtime.onMessage.addListener(({method, params}, sender, sendResponse) => {
    // 2. A page requested user data, respond with a copy of `user`
    switch (method) {
        case "get-account":
            getAccount(params.isGlobal).then(sendResponse)
            return true;
        case "get-detail-list":
            getDetailList(params.game_uid, params.region).then(sendResponse)
            return true;
    }
});

const syncCnEnData = (str: string) => {
    fetch(`https://cdn.jsdelivr.net/gh/KeyPJ/seelieEx@main/src/data/${str}.json`).then(
        res => res.json()
    ).then(data => {
        chrome.storage.sync.set({[str]: data});
    })
};

chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log("syncCnEnData!", alarm);
    syncCnEnData("character");
    syncCnEnData("weapon");
});

chrome.alarms.create("alarmName", {
        delayInMinutes: 0.1, periodInMinutes: 60
    }
);
