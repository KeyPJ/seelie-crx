import React, {useState} from "react";
import CharacterGoalTab from "./tabs/CharacterGoalTab";
import TalentGoalTab from "./tabs/TalentGoalTab";
import {Disclosure, Tab} from "@headlessui/react";
import {ChevronUpIcon} from '@heroicons/react/solid'
import ToggleSwitch from "./switch/ToggleSwitch";
import ListboxSelect from "./select/ListboxSelect";
import '@assets/styles/tailwind.css';
import Role = mihoyo.Role;
import CharacterDataEx = mihoyo.CharacterDataEx;
import {addCharacter, batchUpdateCharacter, batchUpdateWeapon, showMessage} from "@pages/popup/message";

function ExDialog() {

    const [gameBizSwitchEnabled, setGameBizSwitchEnabled] = useState(() => false);

    const onChangeGameBiz = (e: boolean) => {
        setGameBizSwitchEnabled(e)
    };

    const [accountList, setAccountList] = useState<Role[]>([]);

    const [currentAccount, setCurrentAccount] = useState<Role>();

    const handleRoleSelectChange = (idx: number) => {
        setCurrentAccount(accountList[idx])
    }

    const accountShow = (idx: number) => {
        if (!accountList || !(accountList[idx])) {
            return '';
        }
        const role = accountList[idx];
        return `${role.game_uid}(${role.region})`
    }

    const getAccountList = () => {
        chrome.runtime.sendMessage({method: "get-account", params: {isGlobal: gameBizSwitchEnabled}}, res => {
            const roles: mihoyo.Role[] = res;
            setAccountList(roles)
            roles.length > 0 && setCurrentAccount(roles[0])
        })
    };

    const syncCharacterInfo = () => {
        if (!currentAccount) {
            console.error(chrome.i18n.getMessage("accountDataFail"))
            showMessage(chrome.i18n.getMessage("accountDataFail"))
            return
        }
        console.log(chrome.i18n.getMessage("dataSyncStart"))
        const {game_uid, region} = currentAccount;
        chrome.runtime.sendMessage({method: "get-detail-list", params: {game_uid, region}}, res => {
            {
                console.group('返回数据');
                console.groupCollapsed('角色');
                console.table(res.map((a: CharacterDataEx) => a.character))
                console.groupEnd();
                console.groupCollapsed('武器');
                console.table(res.map((a: CharacterDataEx) => a.weapon))
                console.groupEnd();
                console.groupCollapsed('角色天赋');
                res.forEach(
                    (c: CharacterDataEx) => {
                        const name = c.character.name;
                        console.groupCollapsed(name);
                        console.table(c.skill_list)
                        console.groupEnd();
                    }
                )
                console.groupEnd();
                console.groupEnd();
                addCharacter(res)
                // res.forEach(
                //     (v: CharacterDataEx) => {
                //         addCharacter(v)
                //         console.log(v)
                //     }
                // )
            }
        })
    }

    function classNames(...classes: string[]) {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <div
            className="fixed top-10 inset-x-[20%] mx-auto min-w-[50%] min-h-min rounded-md bg-slate-700 opacity-75 text-white text-center z-[1200]">
            <div className="w-full p-4">
                <div className="w-full max-w-md p-2 mx-auto bg-purple rounded-2xl">
                    <Disclosure>
                        {({open}) => (
                            <>
                                <Disclosure.Button
                                    className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-slate-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                                    <span>{chrome.i18n.getMessage("dataSync")}</span>
                                    <ChevronUpIcon
                                        className={`${
                                            open ? 'transform rotate-180' : ''
                                        } w-5 h-5 text-purple-500`}
                                    />
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-white-500">
                                    <div className="flex pt-4">
                                        <div className="w-1/2 text-white-900">
                                            {chrome.i18n.getMessage("gameBizSwitch")}:
                                        </div>
                                        <ToggleSwitch
                                            className='w-1/2'
                                            checked={gameBizSwitchEnabled}
                                            onChange={onChangeGameBiz}
                                            labelLeft={chrome.i18n.getMessage("gameBizCN")}
                                            labelRight={chrome.i18n.getMessage("gameBizGlobal")}
                                        />
                                    </div>
                                    <div className="flex pt-2">
                                        <div className="w-full">
                                            <button className="text-white bg-blue-500 px-4 py-2"
                                                    onClick={getAccountList}>{chrome.i18n.getMessage("accountInfo")}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex pt-4">
                                        <div className="w-1/2 text-white-900">
                                            {chrome.i18n.getMessage("accountSwitch")}:
                                        </div>
                                        <div className="w-1/2">
                                            <ListboxSelect
                                                selected={currentAccount ? accountList.indexOf(currentAccount) : 0}
                                                setSelected={handleRoleSelectChange}
                                                optionList={accountList.map((_, idx) => idx)}
                                                show={accountShow}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex pt-2">
                                        <div className="w-full">
                                            <button className="text-white bg-blue-500 px-4 py-2"
                                                    onClick={syncCharacterInfo}>{chrome.i18n.getMessage("dataSync")}
                                            </button>
                                        </div>
                                    </div>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                    <Disclosure as="div" className="mt-2">
                        {({open}) => (
                            <>
                                <Disclosure.Button
                                    className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-slate-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                                    <span>{chrome.i18n.getMessage("batchOperate")}</span>
                                    <ChevronUpIcon
                                        className={`${
                                            open ? 'transform rotate-180' : ''
                                        } w-5 h-5 text-purple-500`}
                                    />
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-white-500">
                                    <Tab.Group>
                                        <Tab.List className="flex p-1 space-x-1 bg-blue-900/20 rounded-xl">
                                            {[chrome.i18n.getMessage("Character"), chrome.i18n.getMessage("Talent"), chrome.i18n.getMessage("Weapon")].map((category) => (
                                                <Tab
                                                    key={category}
                                                    className={({selected}) =>
                                                        classNames(
                                                            'w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg',
                                                            'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                                                            selected
                                                                ? 'bg-white shadow'
                                                                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                                                        )
                                                    }
                                                >
                                                    {category}
                                                </Tab>
                                            ))}
                                        </Tab.List>
                                        <Tab.Panels>
                                            <Tab.Panel><CharacterGoalTab showText={chrome.i18n.getMessage("Character")}
                                                                         batchUpdateCharacter={batchUpdateCharacter}/></Tab.Panel>
                                            <Tab.Panel><TalentGoalTab/></Tab.Panel>
                                            <Tab.Panel><CharacterGoalTab showText={chrome.i18n.getMessage("Weapon")}
                                                                         batchUpdateCharacter={batchUpdateWeapon}/></Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </div>
            </div>
        </div>
    );
}

export default ExDialog;
