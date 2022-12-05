type TaskHelpProps = {
    helpByTask: Record<string, string[]>;
    leftColumnPos: number;
    rightColumnPos: number;
    helpTemplate: string;
    helpPartial: string;
};

export function showTasksHelp(props: TaskHelpProps): void {
    const tasksHelpLines: string[] = [];
    const { helpByTask, leftColumnPos, rightColumnPos, helpTemplate, helpPartial } = props;

    Object.keys(helpByTask).map((task) => {
        if (task !== 'help') {
            for (const line in helpByTask[task]) {
                let leftColumn = '';
                if (+line === 0) {
                    const taskTitle = leftColumn.padStart(leftColumnPos, ' ') + task;
                    leftColumn = taskTitle.padEnd(rightColumnPos, ' ');
                } else {
                    leftColumn = leftColumn.padStart(rightColumnPos, ' ');
                }
                tasksHelpLines.push(leftColumn + helpByTask[task][line]);
            }
        }
    });

    if (tasksHelpLines.length !== 0) {
        console.log(helpTemplate.replace(helpPartial, tasksHelpLines.join('\n')));
    }
}
