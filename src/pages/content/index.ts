chrome.runtime.onMessage.addListener(({method, params}, sender, sendResponse) => {
    switch (method) {
        case "addCharacter":
            addCharacter(params.characterDataEx)
            break
        case "batchUpdateTalent":
            batchUpdateTalent(params.all, params.normal, params.skill, params.burst)
            break
        case "batchUpdateCharacter":
            batchUpdateCharacter(params.all, params.characterStatusGoal)
            break
        case "batchUpdateWeapon":
            batchUpdateWeapon(params.all, params.characterStatusGoal)
            break
        case "reload":
            location.reload();
            break
    }
    sendResponse({});
});

import TalentGoal = seelie.TalentGoal;
import Goal = seelie.Goal;
import CharacterGoal = seelie.CharacterGoal;
import WeaponGoal = seelie.WeaponGoal;
import CharacterStatus = seelie.CharacterStatus;
import CharacterDataEx = mihoyo.CharacterDataEx;

const getAccount = () => localStorage.account || "main";

const getGoals = () =>
    JSON.parse(
        localStorage.getItem(`${getAccount()}-goals`) || "[]"
    );

const setGoals = (goals: any) => {
    // console.log(`${getAccount()}-goals`)
    // console.log(JSON.stringify(goals))
    localStorage.setItem(`${getAccount()}-goals`, JSON.stringify(goals));
    localStorage.setItem("last_update", new Date().toISOString());
};

const getInactive = () =>
    Object.keys(JSON.parse(localStorage.getItem(`${getAccount()}-inactive`) || "{}"));

const addGoal = (data: any) => {
    let index;
    const goals = getGoals();

    if (data.character) {
        index = goals.findIndex(
            (g: any) => g.character === data.character && g.type === data.type
        );
    } else if (data.id) {
        index = goals.findIndex((g: any) => g.id === data.id);
    }

    if (index >= 0) {
        goals[index] = {...goals[index], ...data};
    } else {
        const lastId = goals
            ?.map((g: any) => g.id)
            ?.filter((id: any) => typeof id == "number")
            ?.sort((a: number, b: number) => (a < b ? 1 : -1))[0];

        data.id = (lastId || 0) + 1;
        goals.push(data);
        console.log(data);
    }
    setGoals(goals);
};

const addTalentGoal = (talentCharacter: string, skill_list: mihoyo.Skill[]) => {
    const totalGoal: Goal[] = getGoals();
    const ids = totalGoal.map(g => g.id);
    const id = Math.max(...ids) + 1 || 1;
    const talentIdx = totalGoal.findIndex(g => g.type == "talent" && g.character == talentCharacter);
    const [normalCurrent, skillCurrent, burstCurrent] = skill_list.filter(a => a.max_level == 10).sort().map(a => a.level_current)
    let talentGoal: TalentGoal;
    if (talentIdx < 0) {
        talentGoal = {
            type: "talent",
            character: talentCharacter,
            c3: false,
            c5: false,
            normal: {
                current: normalCurrent,
                goal: normalCurrent
            },
            skill: {
                current: skillCurrent,
                goal: skillCurrent
            },
            burst: {
                current: burstCurrent,
                goal: burstCurrent
            },
            id
        }
    } else {
        const seelieGoal = totalGoal[talentIdx] as TalentGoal;
        const {normal, skill, burst} = seelieGoal;
        const {goal: normalGoal} = normal;
        const {goal: skillGoal} = skill;
        const {goal: burstGoal} = burst;
        talentGoal = {
            ...seelieGoal,
            normal: {
                current: normalCurrent,
                goal: normalCurrent > normalGoal ? normalCurrent : normalGoal
            }, skill: {
                current: skillCurrent,
                goal: skillCurrent > skillGoal ? skillCurrent : skillGoal
            }, burst: {
                current: burstCurrent,
                goal: burstCurrent > burstGoal ? burstCurrent : burstGoal
            }
        }
    }
    addGoal(talentGoal)
};

const addCharacterGoal = (level_current: number, nameEn: string, name: string, type: string) => {
    const totalGoal: Goal[] = getGoals();
    const ids = totalGoal.map(g => g.id);
    const id = Math.max(...ids) + 1 || 1;
    const characterPredicate = (g: Goal) => g.type == type && g.character == nameEn;
    const weaponPredicate = (g: Goal) => g.type == type && g.weapon == nameEn;
    const characterIdx = totalGoal.findIndex(type == "character" ? characterPredicate : weaponPredicate);
    const characterStatus: CharacterStatus = initCharacterStatus(level_current);

    let characterGoal: Goal

    function initCharacterGoal() {
        return {
            type,
            character: nameEn,
            current: characterStatus,
            goal: characterStatus,
            id
        } as CharacterGoal
    }

    function initWeaponGoal() {
        return {
            type,
            character: "",
            weapon: nameEn,
            current: characterStatus,
            goal: characterStatus,
            id
        } as WeaponGoal
    }

    if (characterIdx < 0) {
        characterGoal = type == "character" ? initCharacterGoal() : initWeaponGoal();
    } else {
        const seelieGoal = type == "character" ? totalGoal[characterIdx] as CharacterGoal : totalGoal[characterIdx] as WeaponGoal
        const {goal, current} = seelieGoal;
        const {level: levelCurrent, asc: ascCurrent} = current;
        const {level: levelGoal, asc: ascGoal} = goal;
        const {level, asc} = characterStatus;

        characterGoal = {
            ...seelieGoal,
            current: level >= levelCurrent && asc >= ascCurrent ? characterStatus : current,
            goal: level >= levelGoal && asc >= ascGoal ? characterStatus : goal,
        }
    }
    addGoal(characterGoal)
};

function addCharacter(characterDataEx: CharacterDataEx) {

    const {character, skill_list, weapon} = characterDataEx;
    const {name, element_attr_id} = character;

    //{"type":"character","character":"traveler","current":{"level":70,"asc":4,"text":"70"},"goal":{"level":70,"asc":4,"text":"70"},"id":1},
    //{"type":"weapon","weapon":""deathmatch"","current":{"level":70,"asc":4,"text":"70"},"goal":{"level":70,"asc":4,"text":"70"},"id":1},
    //{"type":"talent","character":"traveler_geo","c3":false,"c5":false,"normal":{"current":1,"goal":6},"skill":{"current":1,"goal":6},"burst":{"current":1,"goal":6},"id":2}

    if (weapon) {
        const {name, level_current: weaponLeveL} = weapon;
        // const weaponId = getWeaponId(name);
        const weaponId = getWeaponId(name);
        if (weaponId) {
            addCharacterGoal(weaponLeveL, weaponId, name, "weapon");
        }
    }
    const {level_current: characterLevel} = character;
    const characterId = getCharacterId(name);
    if (!characterId) {
        return
    }
    addCharacterGoal(characterLevel, characterId, name, "character");

    let talentCharacter = characterId;
    if (characterId == "traveler") {
        const elementAttrName = getElementAttrName(element_attr_id);
        talentCharacter = `traveler_${elementAttrName}`;
    }
    addTalentGoal(talentCharacter, skill_list);

}

const characterStatusList: CharacterStatus[] = [
    {level: 1, asc: 0, text: "1"},
    {level: 20, asc: 0, text: "20"},
    {level: 20, asc: 1, text: "20 A"},
    {level: 40, asc: 1, text: "40"},
    {level: 40, asc: 2, text: "40 A"},
    {level: 50, asc: 2, text: "50"},
    {level: 50, asc: 3, text: "50 A"},
    {level: 60, asc: 3, text: "60"},
    {level: 60, asc: 4, text: "60 A"},
    {level: 70, asc: 4, text: "70"},
    {level: 70, asc: 5, text: "70 A"},
    {level: 80, asc: 5, text: "80"},
    {level: 80, asc: 6, text: "80 A"},
    {level: 90, asc: 6, text: "90"},
]

const initCharacterStatus = (level_current: number) => {
    let initCharacterStatus = characterStatusList[0];
    if (level_current < 20) {
        return initCharacterStatus;
    }
    for (const characterStatus of characterStatusList) {
        const {level} = characterStatus;
        if (level_current < level) {
            return initCharacterStatus;
        } else if (level_current == level) {
            return characterStatus;
        } else if (level_current > level) {
            initCharacterStatus = characterStatus
        }
    }
    return initCharacterStatus;
};

const updateTalent = (talent: TalentGoal, normalGoal = 9, skillGoal = 9, burstGoal = 9) => {
    const {normal: {current: normalCurrent}, skill: {current: skillCurrent}, burst: {current: burstCurrent}} = talent;
    const talentNew = {
        ...talent,
        normal: {
            current: normalCurrent,
            goal: normalCurrent > normalGoal ? normalCurrent : normalGoal
        }, skill: {
            current: skillCurrent,
            goal: skillCurrent > skillGoal ? skillCurrent : skillGoal
        }, burst: {
            current: burstCurrent,
            goal: burstCurrent > burstGoal ? burstCurrent : burstGoal
        }
    }
    addGoal(talentNew)
}

const batchUpdateTalent = (all: boolean, normal: number, skill: number, burst: number) => {
    getGoals().filter((a: { type: string; }) => a.type == 'talent').filter((a: { character: string; }) => all || !getInactive().includes(a.character as string))
        .map((a: TalentGoal) => updateTalent(a as TalentGoal, normal, skill, burst))
}


const updateCharacter = (character: CharacterGoal, characterStatusGoal: CharacterStatus) => {
    const {current} = character;
    const {level: levelCurrent, asc: ascCurrent} = current;
    const {level, asc} = characterStatusGoal;

    const characterGoalNew = {
        ...character,
        goal: level >= levelCurrent && asc >= ascCurrent ? characterStatusGoal : current,
    }
    addGoal(characterGoalNew)
}

const batchUpdateCharacter = (all: boolean, characterStatusGoal: CharacterStatus,) => {
    getGoals().filter((a: { type: string; }) => a.type == "character").filter((a: { character: string; }) => all || !getInactive().includes(a.character as string))
        .map((a: CharacterGoal) => updateCharacter(a as CharacterGoal, characterStatusGoal))
}

const batchUpdateWeapon = (all: boolean, characterStatusGoal: CharacterStatus,) => {
    getGoals().filter((a: { type: string; }) => a.type == "weapon").filter((a: { weapon: string; }) => all || !getInactive().includes(a.weapon as string))
        .map((a: CharacterGoal) => updateCharacter(a as CharacterGoal, characterStatusGoal))
}

//query.ts
////
interface queryName {
    id: string,
    name: string
}

// Where we will expose all the data we retrieve from storage.sync.
const storageCache = {};
// Asynchronously retrieve data from storage.sync, then cache it.
const initStorageCache = getAllStorageSyncData().then(items => {
    // Copy the data retrieved from storage into storageCache.
    Object.assign(storageCache, items);
});

// chrome.action.onClicked.addListener(async (tab) => {
//     try {
//         await initStorageCache;
//     } catch (e) {
//         // Handle error that occurred during storage initialization.
//     }
//     // Normal action handler logic.
//     console.log(storageCache);
// });

let characters: queryName[] = [], weapons: queryName[] = [];
(async () => {
    await initStorageCache;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ({character: characters, weapon: weapons} = storageCache);
})();

// Reads all data out of storage.sync and exposes it via a promise.
//
// Note: Once the Storage API gains promise support, this function
// can be greatly simplified.
function getAllStorageSyncData() {
    // Immediately return a promise and start asynchronous work
    return new Promise((resolve, reject) => {
        // Asynchronously fetch all data from storage.sync.
        chrome.storage.sync.get(null, (items) => {
            // Pass any observed errors down the promise chain.
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            // Pass the data retrieved from storage down the promise chain.
            resolve(items);
        });
    });
}

// const characters = JSON.parse(GM_getResourceText("character")) as queryName[];
// const weapons = JSON.parse(GM_getResourceText("weapon")) as queryName[];

// const charactersNum = characters?.length || 100;

const getCharacterId = (queryName: string) => {
    for (const e of characters) {
        const {id, name} = e
        if (queryName == name) {
            return id;
        }
    }
    console.error(`getCharacterId ${queryName} 查询失败`)
    return ""
};

const getWeaponId = (queryName: string) => {
    for (const e of weapons) {
        const {id, name} = e
        if (queryName == name) {
            return id;
        }
    }
    console.error(`getWeaponrId ${queryName} 查询失败`)
    return ""
};

const elementAttrIds = [
    {element_attr_id: 1, name: "pyro"},
    {element_attr_id: 2, name: "anemo"},
    {element_attr_id: 3, name: "geo"},
    {element_attr_id: 4, name: "electro"},
    {element_attr_id: 5, name: "hydro"},
    {element_attr_id: 6, name: "cryo"},
    {element_attr_id: 7, name: "dendro"},
]


const getElementAttrName = (queryName: number) => {

    for (const e of elementAttrIds) {
        const {element_attr_id, name} = e
        if (queryName == element_attr_id) {
            return name;
        }
    }
    console.error(`getElementAttrName: ${queryName} 查询失败`)
    return ""
};
