import { PLACEHOLDER_CMD, PLACEHOLDER_HELP } from './const.ts';
import { RawConfigType } from './load-config.ts';
import { exitWithError } from './utils.ts';

type ConfigType = {
    helpByTask: Record<string, string[]>;
    taskRegistry: Record<string, string[]>;
    helpTemplate: string;
    helpPartial: string;
    leftColumnPos: number;
    rightColumnPos: number;
    taskList: string[];
};

export function parseConfig(parsedYamlFile: RawConfigType): ConfigType {
    const helpByTask: Record<string, string[]> = {};
    const taskRegistry: Record<string, string[]> = {};
    let helpPartial = '  {{cmd}}             {{help}}';
    let helpTemplate = `Tasks: \n${helpPartial}`;

    for (const item of parsedYamlFile) {
        const keys = Object.keys(item);
        if (keys.length !== 1) {
            exitWithError('Error: Invalid yaml file structure\n');
        }
        const key = keys[0];

        if (key === 'help') {
            helpTemplate = item[key];
        }

        for (let taskHelpLine of item[keys[0]]?.split('\n')) {
            if (taskHelpLine.startsWith('#') || taskHelpLine.trim().startsWith('//') || key === 'help') {
                taskHelpLine = taskHelpLine.replace(/^\s*(\#|\/\/)\s?/, '');

                if (key === 'help' && taskHelpLine.includes(PLACEHOLDER_CMD)) {
                    helpPartial = taskHelpLine;
                } else {
                    helpByTask[key] ||= [];
                    helpByTask[key].push(taskHelpLine);
                }
            } else if (taskHelpLine.trim()) {
                taskRegistry[key] ||= [];
                taskRegistry[key].push(taskHelpLine.trim());
            }
        }
    }

    return {
        helpByTask,
        taskRegistry,
        helpTemplate,
        helpPartial,
        leftColumnPos: helpPartial.indexOf(PLACEHOLDER_CMD),
        rightColumnPos: helpPartial.indexOf(PLACEHOLDER_HELP),
        taskList: Object.keys(taskRegistry),
    };
}
