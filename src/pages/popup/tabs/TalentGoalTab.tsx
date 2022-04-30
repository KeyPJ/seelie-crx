import React, {useState} from "react";

import ToggleSwitch from "../switch/ToggleSwitch";
import ListboxSelect from "../select/ListboxSelect";
import {batchUpdateTalent, showMessage} from "@pages/popup/message";

function TalentGoalTab() {

    const [selectAllRoles, setSelectAllRoles] = useState<boolean>(() => true);

    const [talentGoalLevel, setTalentGoalLevel] = useState({
        normal: 1,
        skill: 6,
        burst: 6
    });

    const talentLevels: number[] = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10
    ].reverse();

    const batchSetCharacterTalentLevel = () => {
        console.log("批量设置角色目标天赋")
        const {normal, skill, burst} = talentGoalLevel;
        batchUpdateTalent(!selectAllRoles, normal, skill, burst)
    }

    return <div>
        <div className="flex pt-4">
            <ToggleSwitch
                className='w-full'
                checked={selectAllRoles}
                onChange={setSelectAllRoles}
                labelLeft={chrome.i18n.getMessage("ALL")}
                labelRight={chrome.i18n.getMessage("onlyActive")}
            />
        </div>
        <div className="grid grid-rows-2 grid-flow-col gap-2">
            <div className='mt-10'>{chrome.i18n.getMessage("normal")}</div>
            <div>
                <ListboxSelect
                    selected={talentGoalLevel.normal}
                    setSelected={num => setTalentGoalLevel({
                        ...talentGoalLevel,
                        normal: num
                    })}
                    optionList={talentLevels}
                    show={num => `${num}`}
                />
            </div>
            <div className='mt-10'>{chrome.i18n.getMessage("skill")}</div>
            <div>
                <ListboxSelect
                    selected={talentGoalLevel.skill}
                    setSelected={num => setTalentGoalLevel({
                        ...talentGoalLevel,
                        skill: num
                    })}
                    optionList={talentLevels}
                    show={num => `${num}`}
                />
            </div>
            <div className='mt-10'>{chrome.i18n.getMessage("burst")}</div>
            <div>
                <ListboxSelect
                    selected={talentGoalLevel.burst}
                    setSelected={num => setTalentGoalLevel({
                        ...talentGoalLevel,
                        burst: num
                    })}
                    optionList={talentLevels}
                    show={num => `${num}`}
                />
            </div>
        </div>
        <div className="flex pt-2">
            <div className="w-full">
                <button className="text-white bg-blue-500 px-4 py-2"
                        onClick={batchSetCharacterTalentLevel}>{chrome.i18n.getMessage("batchSet",chrome.i18n.getMessage("Talent"))}
                </button>
            </div>
        </div>
    </div>
}

export default TalentGoalTab;
