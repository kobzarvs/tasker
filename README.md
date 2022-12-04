# tasker

Simple task launcher to run your commands or scripts.
Tasker finds and runs your tasks from tasks.yaml file.

## Requirements
Your need to have `deno` installed.

## Run

```bash
~ deno run --allow-run --allow-read https://deno.land/x/tasker/main.ts --help
Usage: deno run --allow-read --allow-run https://deno.land/x/tasker/main.ts [options] [task]

Options:
    -h, --help      Show this help
    -l, --list      List all tasks
    -v, --version   Show version
```

tasks.yaml example:

```yaml
- help: |
    Available commands:
      {{cmd}}                    {{help}}

    Options:
      -a, --all                  Lorem Ipsum is simply dummy text of the 
      -A, --almost-all           printing and typesetting industry.
          --author               Lorem Ipsum has been the industry's standard dummy
                                 e.g., '--block-size=M'; see SIZE format below
- start: |
    # Help Lorem Ipsum is simply dummy text of the
    echo Starting....
    echo cmd 2
    
    // Lorem Ipsum is simply dummy text of the
    echo cmd 3

- stop: |
    # Lorem Ipsum is simply dummy text of the
    # Lorem Ipsum is simply dummy text of the
    echo Stopping...
    echo cmd 2
    echo cmd 3
```
