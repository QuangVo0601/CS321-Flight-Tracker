'''
Shell of a TCP server with basic outputs with a fake gyro and 
fake altimeter. Shutdown the server by sending it "close"
Version 0.6.9
Authors:
	Nick Marino
	Kiet Tran
	Tan Tran
	
	
	Modified by Sung Yang
'''
import socket
import math
import time
import thread

#ip and port here
bind_ip = '127.0.0.1'
bind_port = 13370 

#misc setup 
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind((bind_ip, bind_port))
server.listen(5)# max backlog of connections
global close_signal

print 'Listening on {}: {}'.format(bind_ip, bind_port)

#handles the actual connection
def handle_client_connection(client_socket):

	global close_signal
	sck = client_socket
	request = sck.recv(1024)
	print 'Received {}' + request
	output_to_client = ''
	f=open("data.txt", "r") #read in the data telemetry
	last_line = f.readlines()[-1] #receives the last line in the file!!!
	f.close()
	data = last_line.split(",")
	
	
	
	#parse the input and do what you gotta do
	if (request == 'Timestamp'):
		output_to_client = str(data[0])
	
	elif (request == 'Longitude'):	 
		output_to_client = str(data[1])	
	elif (request == 'Latitude'):	 
		output_to_client = str(data[2])	
	elif (request == 'Altitude'):	 
		output_to_client = str(data[3])	
	elif (request == 'External Temperature'):	 
		output_to_client = str(data[4])	
	elif (request == 'External Humidity'):	 
		output_to_client = str(data[5])	
	elif (request == 'close'):
		print 'Closing ...'
		output_to_client = 'closing'
		close_signal = True

		#hack to close the server nicely
		client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		client.connect(('127.0.0.1', 13370))
		client.close()

		sck.send(output_to_client)
		exit()
	
	else:
		output_to_client = 'not understood'

	sck.send(output_to_client)
	sck.close()




try:
	global close_signal
	close_signal = False

	while (not(close_signal)):
		print 'Accepting ...'

		#accept that dank connection to the client
		client_sock, address = server.accept()

		print 'Accepted connection from {}: {}'.format(address[0], address[1])
		thread.start_new_thread(handle_client_connection, (client_sock, ))
		# without comma you'd get a... TypeError:handle_client_connection()
		#argument after * must be a sequence, not _socketobject
except socket.error, f:
	#press f to pay respects and exit the system to prevent the program from
	#spamming the command line when something breaks
	print("something broke...\n" + str(f)); 
	quit()
finally:
    server.close()
