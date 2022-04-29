import React, {useState} from "react";
import CharacterStatus = seelie.CharacterStatus;

import ToggleSwitch from "../switch/ToggleSwitch";
import ListboxSelect from "../select/ListboxSelect";

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

interface IProps {
    showText: string,
    batchUpdateCharacter: (all: boolean, characterStatusGoal: seelie.CharacterStatus) => void
}

function CharacterGoalTab(props: IProps) {

    const {showText, batchUpdateCharacter} = props

    const [selectAllRoles, setSelectAllRoles] = useState<boolean>(() => true);

    const optionList = characterStatusList.slice(0).reverse();

    const [characterLevelGoal, setCharacterLevelGoal] = useState<CharacterStatus>(() => optionList[0]);

    const batchSetCharacterGoalLevel = () => {
        console.log(`批量设置${showText}目标等级`)
        batchUpdateCharacter(!selectAllRoles, characterLevelGoal)
    }

    return <div>
        <div className="flex pt-4">
            <ToggleSwitch
                className='w-full'
                checked={selectAllRoles}
                onChange={setSelectAllRoles}
                labelLeft={`全部${showText}`}
                labelRight={`仅激活${showText}`}
            />
        </div>
        <div className="flex pt-4">
            <div className="w-1/2 text-white-900">
                {showText}目标等级:
            </div>
            <div className="w-1/2">
                <ListboxSelect
                    selected={characterLevelGoal}
                    setSelected={setCharacterLevelGoal}
                    optionList={optionList}
                    show={characterStatus => `${characterStatus.text.replace("A", "破")}`}
                />
            </div>
        </div>
        <div className="flex pt-2">
            <div className="w-full">
                <button className="text-white bg-blue-500 px-4 py-2"
                        onClick={batchSetCharacterGoalLevel}>批量设置{showText}目标等级
                </button>
            </div>
        </div>
    </div>
}

export default CharacterGoalTab;
