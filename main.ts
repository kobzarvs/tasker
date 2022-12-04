import { YamlLoader } from 'https://deno.land/x/yaml_loader/mod.ts';


const PLACEHOLDER_CMD = '{{cmd}}';
const PLACEHOLDER_HELP = '{{help}}';

const yamlLoader = new YamlLoader();
const parsedYamlFile = await yamlLoader.parseFile('tasks.yaml');

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

if (['help', '--help', '?', '-h'].some((i) => Deno.args.includes(i))) {
    showHelp();
    Deno.exit(0);
} else {
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
