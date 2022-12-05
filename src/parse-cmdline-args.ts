import { Args, parse } from 'https://deno.land/std@0.167.0/flags/mod.ts';

export type AppParamsType = {
    filename: string;
    argCount: number;
    parsedArgs: Args;
    foreignArgs: string[];
};

export function parseCmdLineArgs(): AppParamsType {
    let filename = 'tasks.yaml';
    const foreignArgsIdx = Deno.args.findIndex((v) => v === '--');
    const args = Deno.args.slice(0, foreignArgsIdx >= 0 ? foreignArgsIdx : Deno.args.length + 1);
    const parsedArgs: Args = parse(args);
    let foreignArgs: string[] = [];
    let argCount = 0;

    if (foreignArgsIdx !== -1) {
        foreignArgs = Deno.args.slice(foreignArgsIdx + 1);
    }

    argCount = Object.keys(parsedArgs).length - 1 + parsedArgs._.length;

    if (parsedArgs.file || parsedArgs.f) {
        filename = parsedArgs.file || parsedArgs.f || filename;
        argCount--;
    }

    return { filename, argCount, parsedArgs, foreignArgs };
}
