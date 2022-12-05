import { parseCmdLineArgs } from './parse-cmdline-args.ts';
import { showAppHelp } from './show-app-help.ts';
import { exitWithError } from './utils.ts';
import { RawConfigType, loadConfigAsync } from './load-config.ts';
import { parseConfig } from './parse-config.ts';
import { showTasksHelp } from './show-tasks-help.ts';
import { VERSION } from './const.ts';
import { buildBashMenuScript } from './bash-menu.ts';

export async function run(): Promise<void> {
    const { filename, argCount, parsedArgs, foreignArgs } = parseCmdLineArgs();
    const parsedYamlFile: RawConfigType | undefined = await loadConfigAsync(filename);

    if (typeof parsedYamlFile === 'undefined') {
        exitWithError(`Error: Incorrect format file '${filename}'\n`);
        return;
    }

    const { taskList, helpByTask, helpPartial, taskRegistry, helpTemplate, leftColumnPos, rightColumnPos } = parseConfig(parsedYamlFile);

    async function runTask(taskName: string): Promise<number> {
        try {
            const script = ['#!/bin/bash']
                .concat(taskRegistry[taskName])
                .join('\n')
                .replace(/\$args\$/, foreignArgs.join(' '));

            const proc = Deno.run({
                cmd: ['bash', '-c', script],
                stdout: 'inherit',
                stderr: 'inherit',
            });
            const { code } = await proc.status();
            return code;
        } catch (e) {
            console.error(e);
        }
        return 0;
    }

    switch (true) {
        case argCount === 0 && taskList.length !== 0: {
            const menuScript = buildBashMenuScript(taskList);
            
            try {
                const proc = Deno.run({
                    cmd: ['bash', '-c', menuScript],
                    stdout: 'inherit',
                    stderr: 'inherit',
                });
                const { code } = await proc.status();
                if (code !== 0) {
                    Deno.exit(await runTask(taskList[code - 1]));
                }
            } catch (e) {
                console.error(e);
            }
            Deno.exit(0);
            break;
        }

        case argCount === 0 || parsedArgs.help || parsedArgs.h:
            showAppHelp();
            showTasksHelp({ helpByTask, leftColumnPos, rightColumnPos, helpTemplate, helpPartial });
            Deno.exit(0);
            break;

        case parsedArgs.list || parsedArgs.l:
            console.log('Tasks:');
            Object.keys(taskRegistry).forEach((task) => console.log('- ' + task));
            Deno.exit(0);
            break;

        case parsedArgs.version || parsedArgs.v:
            console.log(VERSION);
            Deno.exit(0);
            break;

        default: {
            const taskName = Object.keys(taskRegistry).find((c) => Deno.args.includes(c));
            if (typeof taskName === 'undefined') {
                exitWithError('Error: Invalid command\n');
            } else {
                Deno.exit(await runTask(taskName));
            }
        }
    }
}
