import random
import util
import connect
import config
def eventmain(usr):
	r = random.random()
	if r < .05:
		priceraise(usr)
	elif r < .1:
		pricefall(usr)
	elif r < .15:
		newconnect(usr)
	elif r < .2:
		getshot(usr)
def getshot(usr):
	print "Someone tries to bust a cap in your during a driveby!"
	if random.random() < .4:
		print "But they miss!"
		return
	dmg = random.randint(5,10)
	print "You take",dmg,"damage."
	usr.changehealth(-dmg)
	print "You have",usr.health,"health left."

def newconnect(usr):
	print "Someone approached you looking for a connection!"
	if len(usr.connections) >= config.maxconnects:
		print "But you have the maximum amount of connections."
	l = max(max(i.level for i in usr.connections)-1,1)
	con = connect.Connect(l)
	con.status(usr)
	print "Do you want to keep this person as a connection?"
	if util.options(usr,["Yes (Free)","No"]) == 0:
		usr.addConnect(con)

def priceraise(usr):
	rand = random.randint(0,4)
	if rand == 0:
		print "Large amounts of " + usr.powder.name + " labs have been destroyed."
	elif rand == 1:
		print "Recent rounds of legislation have hit " + usr.powder.name + " producers especially hard."
	elif rand == 2:
		print "Undercover police uncover large amounts of \""+usr.powder.nickname +"\" that was due for the streets."
	elif rand == 3:
		print "A slew of movies are portraying sexy actresses using '"+usr.powder.nickname + "', demand skyrockets."
	elif rand == 4:
		print "A new study reverses a previous unflattering study about " + usr.powder.name + "."

	print "The price of " + usr.powder.name + " rose!"
	temp = usr.powder.price
	print "Old Base Prices: 1g/$" + str(temp(1)) + ", 10g/$"+str(temp(10)) + ", 100g/$"+str(temp(100)) + ", 1000g/$"+str(temp(1000)) 
	usr.powder.baseprice *= util.boundgauss(.01,1.05,1.01,1.10)
	print "New Base Prices: 1g/$" + str(temp(1)) + ", 10g/$"+str(temp(10)) + ", 100g/$"+str(temp(100)) + ", 1000g/$"+str(temp(1000))

def pricefall(usr):
	rand = random.randint(0,4)
	if rand == 0:
		print "Cheap recipes for " + usr.powder.name + " have created a boom of cheap labs."
	elif rand == 1:
		print "A very attractive new legal alternative to " + usr.powder.name + " has many less devoted users switching."
	elif rand == 2:
		print "Corrupt police uncover large amounts of \""+usr.powder.nickname+"\", they sell it for cheap."
	elif rand == 3:
		print "Waves of addicts are starting to die off..."
	elif rand == 4:
		print "A new study spells out quick death for users of " + usr.powder.name + "."

	print "The price of " + usr.powder.name + " fell!"
	temp = usr.powder.price
	print "Old Base Prices: 1g/$" + str(temp(1)) + ", 10g/$"+str(temp(10)) + ", 100g/$"+str(temp(100)) + ", 1000g/$"+str(temp(1000)) 
	usr.powder.baseprice /= util.boundgauss(.01,1.05,1.01,1.10)
	print "New Base Prices: 1g/$" + str(temp(1)) + ", 10g/$"+str(temp(10)) + ", 100g/$"+str(temp(100)) + ", 1000g/$"+str(temp(1000)) 
