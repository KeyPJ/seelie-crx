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


//debugger
// chrome.storage.onChanged.addListener(function (changes, namespace) {
//     for (const [key, {oldValue, newValue}] of Object.entries(changes)) {
//         console.log(
//             `Storage key "${key}" in namespace "${namespace}" changed.`,
//             `Old value was "${oldValue}", new value is "${newValue}".`
//         );
//     }
// });


const syncCnEnData = (str: string) => {
    fetch(`https://seelie-ex.vercel.app/${str}.json`).then(
        res => res.json()
    ).then(data => {
        chrome.storage.sync.set({[str]: data}, function () {
            // console.log('Value is set to ' + JSON.stringify(data));
        });
    })
};

chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log("Got an alarm!", alarm);
    syncCnEnData("character");
    syncCnEnData("weapon");
});

chrome.alarms.create("alarmName", {
        delayInMinutes: 0.1, periodInMinutes: 60
    }
);

