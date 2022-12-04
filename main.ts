import { YamlLoader } from 'https://deno.land/x/yaml_loader/mod.ts';
import { Args, parse } from 'https://deno.land/std/flags/mod.ts';
import { showAppHelp } from './app-help.ts';
import { exitWithError } from './utils.ts';


const VERSION = '1.1.1';
const PLACEHOLDER_CMD = '{{cmd}}';
const PLACEHOLDER_HELP = '{{help}}';
let filename = 'tasks.yaml';

const foreignArgsIdx = Deno.args.findIndex((v) => v === '--');
const args = Deno.args.slice(0, foreignArgsIdx >= 0 ? foreignArgsIdx : (Deno.args.length + 1));
const parsedArgs: Args = parse(args);
let foreignArgs = [];
let argCount = 0;

if (foreignArgsIdx !== -1) {
    foreignArgs = Deno.args.slice(foreignArgsIdx + 1);
}

argCount = Object.keys(parsedArgs).length - 1 + parsedArgs._.length;

if (parsedArgs.file || parsedArgs.f) {
    filename = parsedArgs.file || parsedArgs.f || filename;
    argCount--;
}

const yamlLoader = new YamlLoader();
let parsedYamlFile;

try {
    parsedYamlFile = await yamlLoader.parseFile(filename);
} catch (e) {
    exitWithError(`Error: Can't open file '${filename}'\n`);
}

const appHelpByTask: Record<string, string[]> = {};
const taskRegistry: Record<string, string[]> = {};
let helpTemplate = '';
let helpPartial = '';

for (let item of parsedYamlFile) {
    const keys = Object.keys(item);
    if (keys.length !== 1) {
        exitWithError('Error: Invalid yaml file structure\n');
    }
    const key = keys[0];

    if (key === 'help') {
        helpTemplate = item[key];
    }

    for (let j of item[keys[0]]?.split('\n')) {
        if (j.startsWith('#') || j.trim().startsWith('//') || key === 'help') {
            j = j.replace(/^\s*(\#|\/\/)\s?/, '');

            if (key === 'help' && j.includes(PLACEHOLDER_CMD)) {
                helpPartial = j;
            } else {
                appHelpByTask[key] ||= [];
                appHelpByTask[key].push(j);
            }
        } else if (j.trim()) {
            taskRegistry[key] ||= [];
            taskRegistry[key].push(j.trim());
        }
    }
}

const startCmd = helpPartial.indexOf(PLACEHOLDER_CMD);
const startHelp = helpPartial.indexOf(PLACEHOLDER_HELP);

function showTasksHelp() {
    const tasksHelpLines: string[] = [];

    Object.keys(appHelpByTask)
        .map((task) => {
            if (task !== 'help') {
                for (let line in appHelpByTask[task]) {
                    let leftColumn = '';
                    let rightColumn = appHelpByTask[task][line] ?? '';
                    if (+line === 0) {
                        const taskTitle = leftColumn.padStart(startCmd, ' ') + task;
                        leftColumn = taskTitle.padEnd(startHelp, ' ');
                    } else {
                        leftColumn = leftColumn.padStart(startHelp, ' ');
                    }
                    tasksHelpLines.push(leftColumn + rightColumn);
                }
            }
        });
    console.log(helpTemplate.replace(helpPartial, tasksHelpLines.join('\n')));
}


switch (true) {
    case argCount === 0 || parsedArgs.help || parsedArgs.h:
        showAppHelp();
        showTasksHelp();
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

    default:
        const cmd = Object.keys(taskRegistry).find((c) => Deno.args.includes(c));
        if (typeof cmd === 'undefined') {
            exitWithError('Error: Invalid command\n');
        } else {
            for await (let c of taskRegistry[cmd]) {
                try {
                    const proc = Deno.run({
                        cmd: c.split(' ').concat(foreignArgs),
                        stdout: 'inherit',
                        stderr: 'inherit',
                    });
                    await proc.status();
                } catch (e) {
                    exitWithError('Error: Command failed: "' + c + '" in section "' + cmd + '"');
                }
            }
        }
}
