import util
import connect
import config
import player
import random

def mainmenu(usr):
	print "You sit in your house contemplating your next move."
	opt = util.options(usr, ["Offers", "Connections", "Underworld", "Pass Out", "Cheat"])
	if opt == 3:
		if usr.powderdone == 0:
			print "Go to bed without using?"
			if util.options(usr,["No","Yes"]) == 0:
				return
		if usr.energy >= 1:
			print "Go to bed with energy left?"
			if util.options(usr,["No","Yes"]) == 0:
				return
		usr.daypass()		
	elif opt == 4:
		try:
			exec(util.noexcept_input("Enter executable string:"))
		except:
			print "An exception was thrown, try again."	
	else:
		usr.menu = (offers, connections, underworld)[opt]
def madscience(usr):
	print "Which shady, questionably-safe procedure will you have?"
	print "Complications arise through repeated use, however enough money should simplify them."
	opt = util.options(usr,["Energy Enhancement","Organ Fixup", "Tolerance Treatment", "Back"],2)
	if opt == 3:
		usr.menu = mainmenu
		return
	use = usr.surgerydata[opt]+1
	if opt == 0:
		print "Surgery will result in +1 energy per day."
	elif opt == 1:
		print "Surgery will result in 5 to 15 more health"
		amount = random.randint(5,15)	
	else:
		print "Treatment will lower your tolerance by 15%."
	price = int((1.35**use)*usr.powder.startprice)*10
	print "This procedure will cost $" + str(price) + "."
	if usr.money < price:
		print "Alas, you cannot afford it."
		return
	print "Proceed?"
	if util.options(usr, ["No Thanks...", "Yes Please! (2 energy)"],2):
		if usr.energy < 2:
			print "You are too tired to endure the trials of surgery."
			usr.menu = mainmenu
			return
		usr.energy -= 2
		usr.money -= price
		usr.surgerydata[opt] += 1
		print "Surgery was a success!"
		if opt == 0:
			usr.startenergy += 1
			print "Though worn out from surgery, you feel a new energy in you."
		elif opt == 1:
			print "Your organs had a nice performance boost. You feel alive."
			print "You rise from ",usr.health,"health",
			usr.health += random.randint(15,50)
			print " to",usr.health,"health."
		else:
			print "You have come to terms with a fraction of your " + usr.powder.nickname + " need."
			olddose = usr.doseneed
			usr.doseneed *= .85
			if usr.doseneed < usr.powder.startdose/2:
				print "Your addiction has bottomed out. However there is no escaping the drug.\nTo your horror your addiction, though lessened, still controls you."
				usr.doseneed = usr.powder.startdose/2
			else:
				usr.doseneed = int(usr.doseneed*100)/100.0
				print "You now need",usr.doseneed,"g instead of",olddose,"g."

			
def underworld(usr):
	print "You hit the streets and alleyways to hang with shady characters"
	opt = util.options(usr, ["Buy "+usr.powder.name, "Get Connected (1 energy)", "Shady Clinic", "Back"],2)
	
	if opt == 1:
		usr.menu = getconnected
		return
	if opt == 2:
		usr.menu = madscience
		return
	if opt == 3:
		usr.menu = mainmenu
		return
	if usr.energy < 1:
		print "You lack the drug fueled energy."
		return
	print "Buy how much?"
	opt2 = util.commandinput(usr)
	if opt2 == "max":
		num = usr.powder.gramsForPrice(usr.money/config.mafiasell)
	else:
		try:
			num = float(opt2)
		except:
			print "Enter a number or 'max'."
			return
	num = int(num*100)/100.0
	if num < usr.powder.startdose:
		print "You can't buy less than a dose."
		return;
	price = int(usr.powder.rawprice(num)*config.mafiasell)
	if price > usr.money:
		print "You can't afford that."
		return
	opt3 = util.options(usr, ["Buy " + str(num) + "g for $" + str(price) + " (1 energy, $" +str(int(price/num*100)/100.0)+"/g)" , "Cancel"],1)
	if opt3 == 0:
		usr.money -= price
		usr.money = int(usr.money)
		usr.stash += num
		usr.totaltraffic += num
		usr.energy -=1;
		print "Transaction complete."
		return
def getconnected(usr):
	if usr.energy < 1:
		print "You don't have enough drug fueled energy to meet with potential business partners."
		usr.menu = mainmenu
		return
	if len(usr.connections) >= config.maxconnects:
		print "You have the maximum number of connections. Depart with some to make more."
		usr.menu = mainmenu
		return
	print "You start tracking down premium hookups, an expensive venture."
	print "Meeting a candidate will take 1 energy, and money exponential to client level."
	print "What level do you want to meet? Enter 0 to exit."
	level = util.commandinput(usr)
	level = util.toint(level)
	if level is None or level < 0:
		print "Please input a positive integer." 
		return
	if level == 0:
		usr.menu = mainmenu
		return
	price = int(2 ** (level-1) * usr.powder.startprice)*5
	print "Price for level " + str(level) + " is $" + str(price)
	if price > usr.money:
		print "Can't afford this level!"
		return
	while 1:
		usr.energy -= 1
		con = connect.Connect(level)
		con.status(usr)
		print "Do you want to be connected with this individual?"
		opt2 = util.options(usr,  ["Back", "Connect ($"+str(price)+")"] + (["Try Again (1 energy)"] if usr.energy >= 1 else []) )
		if opt2 == 1:
			usr.money -= price
			usr.addConnect(con)
			print "Connection made successfully."
			if usr.energy < 1:
				usr.menu = mainmenu
			return
		elif opt2 == 0:
			usr.menu = mainmenu
			return
		else:
			continue
def offers(usr):
	print "Choose an offer to consider"
	offs = connect.offers(usr)
	opts = sorted(offs,key = lambda x:(-10000 if x.isbuying else 0) + x.money/x.grams*(-1 if x.isbuying else 1))
	strlist = ["Cancel"] + list(str(i) for i in opts)
	opt = util.options(usr, strlist,1)
	if opt == 0:
		usr.menu = mainmenu
		return
	print strlist[opt]
	opt2 = util.options(usr, ["Back", "Renegotiate (1 energy)", "Agree (1 energy)", "Dismiss(!)"],2)
	if opt2 == 3:
		opts[opt-1].remove()
	elif opt2 == 2:	
		if usr.energy < 1:
			print "You don't have enough drug fueled energy."
		else:
			opts[opt-1].enact(usr)	
	elif opt2 == 1:	
		if usr.energy < 1:
			print "You don't have enough drug fueled energy."
		else:
			person = opts[opt-1].connect
			usr.energy -= 1
			opts[opt-1].remove()
			person.addOffer(connect.Connect.Offer(usr,person))
			print "New offer: "			
			print person.currentOffers[-1]
				
def connections(usr):
	print "Who do you want to lookup?"
	strlist = ["Cancel"] + list(i.name for i in usr.connections)
	opt = util.options(usr, strlist, 1)
	if opt == 0:
		usr.menu = mainmenu
		return
	person = usr.connections[opt-1]
	person.status(usr)
	opt2 = util.options(usr, ["Back","Negotiate (1 energy)","Break Contact(!)"])
	if opt2 == 1:
		if person.nomoredeals:
			print person.name, "already told you",("he" if person.gender else "she"),"wasn't interested, you shouldn't waste your energy"
			return
		if usr.energy < 1:
			print "You're too burned out to talk to " + person.name + "."
			return
		usr.energy -= 1
		if random.random() <= person.probability:
			print "An offer has been added to your list:"
			person.addOffer(connect.Connect.Offer(usr,person))
			print person.currentOffers[-1]
		else:
			print person.name, "isn't interested in any more deals today."
			person.nomoredeals = True

	elif opt2 == 2:
		print "You tell them to take a hike."
		usr.removeConnect(person)
