#!/usr/bin/env python
from flask import Flask, render_template, request
import os
import sys
import json
import DnD
import threading, time



class TimeoutError(Exception):
    pass

app = Flask(__name__)

@app.route('/<string:page_name>/', methods=['GET', 'POST'])
def render_static(page_name):
    print(request.method);
    if request.method == 'GET':
        return (sendindex())
    if request.method == 'POST':
        return (poster(start_response))
    #return render_template('static.html')
#'%s.html' % page_name

if __name__ == '__main__':
    place="local"
    host=8080
    apppath=""
else:
    place="server"
    host=8080 # used to be 8051
    apppath="/home/site/wwwroot/" #"app-root/repo/"
print(place)
DnD.Creature.beastiary=DnD.Creature.load_beastiary(apppath+'beastiary.csv')

def application(environ, start_response):
    # pretty sure I'm slowly deprecating this method
    sys.stdout =environ['wsgi.errors']
    if environ['REQUEST_METHOD'] == 'POST':
        return poster(start_response)
    else:  #get
        return getter(environ, start_response)

def sendindex():
    print("SendIndex")
    #Add creatures from bestiary to dropdown selection 
    DnD.Creature.beastiary=DnD.Creature.load_beastiary(apppath+'beastiary.csv')
    ctype = 'text/html'
    h=open(apppath+"static.html")
    response_body = h.read()
    x='<!--serverside values-->'
    #read creatures in from beastiary
    for name in sorted([DnD.Creature.beastiary[beast]['name'] for beast in DnD.Creature.beastiary],key=str.lower):
        x+='<option value="'+name+'">'+name+'</option>,'
    x.split(',')
    response_body=response_body.replace("<!--LABEL-->",x)
    response_body = response_body.encode('utf-8')
    #print(response_body)
    return response_body

def line_prepender(filename, line):
    with open(filename, 'r+', encoding='utf-8') as f:
        content = f.read()
        f.seek(0, 0)
        f.write(line.rstrip('\r\n') + '\n' + content)

def sendreviewpage():
    return open(apppath+"tales.txt", encoding='utf-8').read().replace("<br/>","\n").encode('utf-8')

def add_to_tales(battle):
    line_prepender(apppath+"tales.txt",str(battle))

def getter(environ, start_response):
    ctype = 'text/plain'
    #if not environ['PATH_INFO']:  #this never happens.! I thought it did, but it was an ecoding error
    #    ctype,response_body=sendindex()
    if environ['PATH_INFO'] == '/health':
        response_body = "1"
    elif environ['PATH_INFO'] == '/review':
        response_body = sendreviewpage()
    elif environ['PATH_INFO'] == '/favicon.ico':
        ctype='image/x-icon'
        response_body = open('wsgi/static/favicon.ico','rb').read()
    elif environ['PATH_INFO'].find('/static') != -1: #why is localhost wsgi/static not working?!! It i quicker to botch it for now.
        #ctype = environ['HTTP_ACCEPT'].split(',')[0]
        print("path.... ", environ['PATH_INFO'])
        protoctype=environ['PATH_INFO'].split('.')[-1]
        if protoctype =='css':
            ctype='text/css'
            response_body = open('wsgi'+environ['PATH_INFO'],encoding='utf-8').read().encode('utf-8')
        elif protoctype =='js':
            ctype='text/javascript'
            response_body = open('wsgi'+environ['PATH_INFO'],encoding='utf-8').read().encode('utf-8')
        elif protoctype =='ico':
            ctype='image/x-icon'
            response_body = open('wsgi'+environ['PATH_INFO'],'rb').read()
        elif protoctype =='woff2' or protoctype =='woff':
            ctype='application/x-font-woff'
            response_body = open('wsgi'+environ['PATH_INFO'],'rb').read()
        elif protoctype =='ttf':
            ctype='application/x-font-TrueType'
            response_body = open('wsgi'+environ['PATH_INFO'],'rb').read()
        else:
            ctype='text/plain'
            response_body = open('wsgi'+environ['PATH_INFO'],'rb').read()
    elif environ['PATH_INFO'] == '/env':
        response_body =""
        '''
        response_body = ['%s: %s' % (key, value) for key, value in sorted(environ.items())]
        response_body = '\n'.join(response_body)
        '''
    else:
        ctype,response_body=sendindex()
    status = '200 OK'
    response_headers = [('Content-Type', ctype), ('Content-Length', str(len(response_body)))]
    start_response(status, response_headers)
    return [response_body]

@app.route('/poster/', methods=['POST'])
def poster():              #If POST...
    #from cgi import parse_qs
    print("Poster");
    list = json.loads(request.form)
    print("request form as string : " + list)
    print()
    request_body = ""
    try:
        request_body_size = requestl.environ['CONTENT_LENGTH']
        print("body size : " + request_body_size)
        print("request body : " + request.form.read(request_body_size))
        #request_body = request.environ['wsgi.input'].read(request_body_size)
        for entry in request.form:
            request_body += entry
        print(request_body)
    except (TypeError, ValueError):
        request_body = "0"
        print("No request found")

    #parsed_body = parse_qs(request_body)
    #value = parsed_body.get('test_text', [''])[0] #Returns the first value

    try:
        l = json.loads(str(request_body)[2:-1])
        print("l : " + l)
        wwe = DnD.Encounter(*l)
        w=threading.Thread(target=wwe.go_to_war,args=(5,)) #default is 1000, changing to 5 for testing
        w.start()
        time.sleep(10)
        wwe.KILL = True
        response_body = wwe.battle(1, 1).json()
        add_to_tales(wwe)
    except Exception as e:
        print(e)
        response_body = json.dumps({'battles':"Error: "+str(e)})
    ctype = 'text/plain'
    response_body = response_body.replace("\n","<br/>")
    response_body = response_body.encode('utf-8')
    status = '200 OK'
    response_headers = [('Content-Type', ctype), ('Content-Length', str(len(response_body)))]
    #start_response(status, response_headers)
    # The view function did not return a valid response. 
    # The return type must be a string, dict, tuple, Response instance, or WSGI callable, but it was a list.
    print("resopnse body : " + str(response_body))

    return response_body

# comment out when deploying to "real" web server?
if __name__ == '__main__':
    app.run(debug=True, port=8080)
    #from wsgiref.simple_server import make_server
    #httpd = make_server('localhost', host, application)
    #httpd.serve_forever()

#hopefully this will provide something for Docker to find, and then direct it to the right function.
#class Application(object):
#    def __init__(self, environ, start_fn):
#        start_fn(application(environ, start_response))

#    app = Application()