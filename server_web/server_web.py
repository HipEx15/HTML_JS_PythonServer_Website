import socket
import os
import threading
import gzip
import json
import traceback


def handle_request(clientsocket, address):
    print ('S-a conectat un client.')
    cerere = ''
    linieDeStart = ''
    while True:
        data = clientsocket.recv(1024)
        if not data: 
            break
        cerere = cerere + data.decode()
        print ('S-a citit mesajul: \n---------------------------\n' + cerere + '\n---------------------------')
        pozitie = cerere.find('\r\n')
        if (pozitie > -1 and linieDeStart == ''):
            linieDeStart = cerere[0:pozitie]
            print ('S-a citit linia de start din cerere: ##### ' + linieDeStart + '#####')
            break
    print ('S-a terminat cititrea.')
        
    numeResursaCeruta = linieDeStart.split(' ')

    if linieDeStart == '':
            clientsocket.close()
            print ("S-a terminat comunicarea cu clientul - nu s-a primit niciun mesaj.")
            return

    if numeResursaCeruta[0] == "POST":
        start = cerere.find('{')
        stop = cerere.find('}')+1
        text = ""

        for i in range(start,stop):
            text+=cerere[i]
       
        fisier =  open("../continut/resurse/utilizatori.json", 'r')
        input = fisier.read()
        fisier.close()

        print(input)
        input = input.replace("]", ",")
        print(input)
        input = input + text + "]"
        print(input)

        fisier =  open("../continut/resurse/utilizatori.json", 'w')
        fisier.write(input)
        clientsocket.sendall('HTTP/1.1 200 OK\r\n'.encode("utf-8"))
    
    elif numeResursaCeruta[0] == "GET":
        numeFisier = '../continut' + numeResursaCeruta[1]
        fisier = None
        try:
            fisier = open(numeFisier,'rb')

            numeExtensie = numeFisier[numeFisier.rfind('.')+1:]
            tipuriMedia = {
                'html': 'text/html; charset=utf-8',
                'css': 'text/css; charset=utf-',
                'js': 'text/javascript; charset=utf-8',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'ico': 'image/x-icon',
                'xml': 'application/xml; charset=utf-8',
                'json': 'application/json; charset=utf-8'
            }
            tipMedia = tipuriMedia.get(numeExtensie,'text/plain; charset=utf-8')

            buf =  fisier.read()
            gzipBuffer = gzip.compress(buf)

            clientsocket.sendall('HTTP/1.1 200 OK\r\n'.encode("utf-8"))
            clientsocket.sendall(('Content-Length: ' + str(len(gzipBuffer)) + '\r\n').encode("utf-8"))
            clientsocket.sendall(('Content-Type: ' + tipMedia +'\r\n').encode("utf-8"))
            clientsocket.sendall(('Content-Encoding: gzip' + '\r\n').encode("utf-8"))
            clientsocket.sendall('Server: My PW Server\r\n'.encode("utf-8"))
            clientsocket.sendall('\r\n'.encode("utf-8"))

            # trimit la server continutul compresat
            clientsocket.send(gzipBuffer)
        
        except Exception as E:
            msg = 'Eroare! Resursa ceruta ' + numeResursaCeruta[1] + ' nu a putut fi gasita!'
            traceback.print_exc()
            clientsocket.sendall('HTTP/1.1 404 Not Found\r\n'.encode("utf-8"))
            clientsocket.sendall(('Content-Length: ' + str(len(msg.encode('utf-8'))) + '\r\n').encode("utf-8"))
            clientsocket.sendall('Content-Type: text/plain; charset=utf-8\r\n'.encode("utf-8"))
            clientsocket.sendall('Server: My PW Server\r\n'.encode("utf-8"))
            clientsocket.sendall('\r\n'.encode("utf-8"))
            clientsocket.sendall(msg.encode("utf-8"))
        finally:
            if fisier:
                fisier.close()
        clientsocket.close()
        print ('S-a terminat comunicarea cu clientul.')

serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
serversocket.bind(('', 5678))
serversocket.listen(5)

while True:
    print ('Asteptam conexiuni...')
    clientsocket, address = serversocket.accept()
    print ('S-a stabilit conexiunea cu ' + str(address))
    t = threading.Thread(target=handle_request, args=(clientsocket, address))
    t.start()

