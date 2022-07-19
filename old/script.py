import pyperclip,time

while True:
	time.sleep(0.1)
	try:
	    s = pyperclip.waitForNewPaste(2000)
	except pyperclip.PyperclipTimeoutException:
	    s = 'No change'
	lat = s[:9]
	lng = s[10:]
	res = '['+lng+', '+lat
	print(res)
	pyperclip.copy(res)
# text to be copied

# -38.86353430192804, -62.08583014710833
