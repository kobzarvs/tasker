import { showAppHelp } from './show-app-help.ts';

export function exitWithError(error: string) {
    console.error(error);
    showAppHelp();
    Deno.exit(1);
}
