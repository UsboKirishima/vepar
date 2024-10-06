export const single_zombie_commands: string[][] = [
    ['exec', 'shell']
]

export const all_zombie_commands: string[][] = single_zombie_commands.map(
    cmdArray => cmdArray.map(cmd => `${cmd}-all`)
);