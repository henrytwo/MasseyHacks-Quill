import os
import glob
f = glob.glob("**", recursive=True)

q = input("Query: ")

for f_name in f:
	if os.path.isfile(f_name):
		try:
			with open(f_name) as file:
				file = file.read().split()
			for l in file:
				if q in l:	
					print(f_name, l)
		except:
			pass
