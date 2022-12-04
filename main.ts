import { YamlLoader } from 'https://deno.land/x/yaml_loader/mod.ts';
import { parse } from 'https://deno.land/std/flags/mod.ts';

const VERSION = '1.0.0';
const HELP = `Usage: deno run --allow-read --allow-run https://deno.land/x/tasker/main.ts [options] [task]

Options:
    -h, --help      Show this help
    -l, --list      List all tasks
    -v, --version   Show version
`;

const parsedArgs = parse(Deno.args)

const PLACEHOLDER_CMD = '{{cmd}}';
const PLACEHOLDER_HELP = '{{help}}';
let filename = 'tasks.yaml';


if (parsedArgs.file || parsedArgs.f) {
    filename = parsedArgs.file || parsedArgs.f || filename;
}

const yamlLoader = new YamlLoader();
let parsedYamlFile;

try {
    parsedYamlFile = await yamlLoader.parseFile(filename);
} catch (e) {
    console.error('Task file not found\n');
    console.log(HELP);
    Deno.exit(1);
}


const helps = {};
const cmds = {};
let originalHelp = '';
let template = '';

for (let item of parsedYamlFile) {
    const keys = Object.keys(item);
    if (keys.length !== 1) {
        throw new Error('Invalid yaml file structure');
    }
    const key = keys[0];

    if (key === 'help') {
        originalHelp = item[key];
    }

    for (let j of item[keys[0]]?.split('\n')) {
        if (j.startsWith('#') || j.trim().startsWith('//') || key === 'help') {
            j = j.replace(/^\s*(\#|\/\/)\s?/, '');

            if (key === 'help' && j.includes(PLACEHOLDER_CMD)) {
                template = j;
            } else {
                helps[key] ||= [];
                helps[key].push(j);
            }
        } else if (j.trim()) {
            cmds[key] ||= [];
            cmds[key].push(j.trim());
        }
    }
}

const startCmd = template.indexOf(PLACEHOLDER_CMD);
const startHelp = template.indexOf(PLACEHOLDER_HELP);

function showHelp() {
    let help = helps?.help?.join('\n');
    const lines = [];

    Object.keys(helps)
        .map((k) => {
            if (k !== 'help') {
                let firstLine = (''.padStart(startCmd, ' ') + k);
                for (let hk in helps[k]) {
                    if (+hk === 0) {
                        lines.push(firstLine.padEnd(startHelp, ' ') + helps[k][hk]);
                    } else {
                        lines.push(''.padStart(startHelp, ' ') + helps[k][hk]);
                    }
                }
            }
        });

    help = originalHelp.replace(
        template,
        lines.join('\n'),
    );
    console.log(help);
}


switch(true) {
    case parsedArgs.help || parsedArgs.h:
        console.log(HELP);
        Deno.exit(0);

    case parsedArgs.list || parsedArgs.l:
        console.log('Tasks:');
        Object.keys(cmds).forEach((k) => console.log('  ' + k));
        Deno.exit(0);

    case parsedArgs.version:
        console.log('v1.0.5');
        Deno.exit(0);

    case parsedArgs?._.includes('help'):
        showHelp();
        Deno.exit(0);

    default:
        const cmd = Object.keys(cmds).find((c) => Deno.args.includes(c));
        if (!cmd) {
            console.error('Error: Invalid command\n');
            showHelp();
            Deno.exit(1);
        }

        for await (let c of cmds[cmd]) {
            try {
                const p = Deno.run({
                    cmd: c.split(' '),
                    stdout: 'inherit',
                    stderr: 'inherit',
                });
                await p.status();
            } catch (e) {
                console.error(e);
                console.error('Error: Command failed: "' + c + '" in section "' + cmd + '"');
                Deno.exit(1);
            }
        }
}
