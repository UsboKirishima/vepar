import socketio
import json
import bcrypt
import os
from dotenv import load_dotenv

sio = socketio.Client()

load_dotenv()

password = os.getenv('PASSWORD')

@sio.event
def connect():
    print('Connection established')

    command = 'send Hello, this is a test message'

    data = {
        "auth": str(password), 
        "command": command  
    }

    json_data = json.dumps(data)

    sio.emit('message', json_data)
    
def ping():
    sio.emit('message', 'Pinged zombie!')

@sio.event
def message(data):
    print('Message from server:', data)
    
    command=data.split(' ')
    
    commands=[
        {
            'name': ['ping', 'check', 'hello'],
            'callback': ping
        }
    ]
    
    for cmd in commands:
        if data[0] in cmd['name']:
            cmd['callback']()

@sio.event
def disconnect():
    print('Disconnected from server')

def main():
    sio.connect('http://localhost:3000')
    sio.wait()

if __name__ == '__main__':
    main()