import os
import sys
import json
import DnD
import threading, time


 


#hopefully this will provide something for Docker to find, and then direct it to the right function.
class Application(object):
    def __init__(self, environ, start_fn):
        start_fn(application(environ, start_response))

	def application(environ, start_response):
		sys.stdout =environ['wsgi.errors']
		apppath="/home/site/wwwroot" #"app-root/repo/"
		DnD.Creature.beastiary=DnD.Creature.load_beastiary(apppath+'beastiary.csv')

		if environ['REQUEST_METHOD'] == 'POST':
			return poster(environ, start_response)
		else:  #get
			return getter(environ, start_response)	

	def getter(environ, start_response):
		ctype = 'text/plain'
		ctype,response_body=sendindex()
		status = '200 OK'
		response_headers = [('Content-Type', ctype), ('Content-Length', str(len(response_body)))]
		start_response(status, response_headers)
		return [response_body]

	def sendindex():
		#Add creatures from bestiary to dropdown selection 
		ctype = 'text/html'
		h=open(apppath+"static.html")
		response_body = h.read()
		x='<!--serverside values-->'
		for name in sorted([DnD.Creature.beastiary[beast]['name'] for beast in DnD.Creature.beastiary],key=str.lower):
			x+='<option value="'+name+'">'+name+'</option>'
		response_body=response_body.replace("<!--LABEL-->",x)
		response_body = response_body.encode('utf-8')
		return ctype, response_body

	def poster(environ, start_response):              #If POST...
		#from cgi import parse_qs
		try:
			request_body_size = int(environ['CONTENT_LENGTH'])
			request_body = environ['wsgi.input'].read(request_body_size)
		except (TypeError, ValueError):
			request_body = "0"
			print("No request found")

		#parsed_body = parse_qs(request_body)
		#value = parsed_body.get('test_text', [''])[0] #Returns the first value

		try:
			l = json.loads(str(request_body)[2:-1])
			wwe = DnD.Encounter(*l)
			w=threading.Thread(target=wwe.go_to_war,args=(5,)) #default is 1000, changing to 5 for debugging
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
		start_response(status, response_headers)
		return [response_body]

app = Application()