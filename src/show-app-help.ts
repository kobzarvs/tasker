const HELP = `Usage: deno run --allow-read --allow-run https://deno.land/x/tasker/main.ts [options] [task]

General options:
  -f, --file <file>   Specify an alternate Taskfile
  -l, --list          List all tasks
  -v, --version       Show version
      --              Stop parsing options and pass all following
  -h, --help          Show this help
`;

export function showAppHelp() {
    console.log(HELP);
}
