import { YamlLoader } from 'https://deno.land/x/yaml_loader@v0.1.0/mod.ts';
import { exitWithError } from './utils.ts';

export type RawConfigType = Record<string, string>[] & { help?: string };

export async function loadConfigAsync(filename: string): Promise<RawConfigType | undefined> {
    const yamlLoader = new YamlLoader();
    try {
        return (await yamlLoader.parseFile(filename)) as unknown as RawConfigType;
    } catch (_) {
        exitWithError(`Error: Can't open file '${filename}'\n`);
    }
}
