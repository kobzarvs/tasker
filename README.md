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

#### tasks.yaml example:

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

### Tasks list

```bash
~ deno run --allow-run --allow-read https://deno.land/x/tasker/main.ts --list
Tasks:
  start
  stop
```

### Tasks help from yaml file

```bash
~ deno run --allow-run --allow-read https://deno.land/x/tasker/main.ts help
Available commands:
  start                      Help Lorem Ipsum is simply dummy text of the
                             Lorem Ipsum is simply dummy text of the
  stop                       Lorem Ipsum is simply dummy text of the
                             Lorem Ipsum is simply dummy text of the

Options:
  -a, --all                  Lorem Ipsum is simply dummy text of the 
  -A, --almost-all           printing and typesetting industry.
      --author               Lorem Ipsum has been the industry's standard dummy
                             e.g., '--block-size=M'; see SIZE format below
```

### Run task

```bash
~ deno run --allow-run --allow-read https://deno.land/x/tasker/main.ts start
Starting....
cmd 2
cmd 3
```

### Pass arguments to task

```bash
~ deno run --allow-run --allow-read https://deno.land/x/tasker/main.ts ls -- -la
Listing...
total 24
drwxr-xr-x  1 diver diver  104 дек  4 06:51 .
drwxr-xr-x. 1 diver diver 2766 дек  4 05:01 ..
drwxr-xr-x  1 diver diver  204 дек  4 06:34 .git
-rw-r--r--  1 diver diver   12 дек  4 05:11 .gitignore
-rw-r--r--  1 diver diver 1071 дек  4 05:01 LICENSE
-rw-r--r--  1 diver diver 3875 дек  4 06:51 main.ts
-rw-r--r--  1 diver diver 2209 дек  4 06:33 README.md
-rw-r--r--  1 diver diver  779 дек  4 06:40 tasks.yaml
```
