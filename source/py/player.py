import powder
import sys
import config
import menus
import util
import random
import math
import connect
import events
class Player:
	def __init__(self, name):
		self.powder = powder.Powder()
		self.money = int(config.startbases*self.powder.baseprice)
		self.stash = config.startdoses*self.powder.startdose
		self.startworth = int(self.money + self.powder.price(self.stash))
		self.doseneed = config.startneed*self.powder.startdose
		self.day = 1
		self.items = []
		self.eventdata = {}#used by events.py
		self.surgerydata = [0]*3#How much each has been used
		self.connections = []
		self.menu = menus.mainmenu
		self.name = name
		self.health = config.starthealth
		self.startenergy = config.startenergy
		self.energy = self.startenergy+1
		self.powderdone = self.doseneed
		self.totalpowderdone = self.powderdone
		self.totaltraffic = self.stash
	def addConnect(self,c):
		self.connections.append(c)
		self.connections.sort(key=lambda x: -x.level*1000 - x.probability )
	def removeConnect(self,c):
		self.connections.remove(c) 		
		print util.lineformat(["Total traffic: " + str(self.totaltraffic) +"g", "Total Use: " + str(self.totalpowderdone)+"g"],2) 

	def daypass(self):
		if self.day == config.maxdays:
			print "You survived your addiction for " + str(config.maxdays) + " days, but are now forced to retired due to heat."
			print "You are worth " + int(self.money/self.startworth) + "x your start worth."
			print "Keep playing?"
			if util.options(None,["Yes","No"],2):
				self.endgame()
		print "-"*util.LINELENGTH
		delta = self.doseneed/10.0
		self.energy = self.startenergy
		if self.powderdone < self.doseneed:
			print "Your craving for " + self.powder.name + " was never satisfied..."
			percent = self.powderdone / self.doseneed
			randnum = random.random()*1.5
			if randnum < percent+.5:
				if percent >= 0.5:
					print "You fight off the chills, and you actually feel OK and slightly energized."
				else:
					print "You came out of it great and energetic. You will need less " + self.powder.nickname + " today."
				delta *= (percent-0.5)
				self.energy += (1 - percent)*4*random.random()
			else:
				print "Your withdrawal takes a toll on your body. Your tolerance paradoxically increases."
				self.health -= int( (1 - percent)*20*random.random())
				self.energy -= (1 - percent)*4*random.random()
		elif self.powderdone >= self.doseneed*2:
			print "You had quite a large amount of " +self.powder.name + " last night..."
			doses = self.powderdone / self.doseneed
			if doses * random.gauss(.5,.5) > 5: 
				print "You feel horrible, the hangover is in full swing."
				self.energy -= doses / 3.0 * random.random()
				self.health -= int(doses * 2 * random.random()) 
			else:
				print "You manage to beat the hangover."
			delta *= doses
			print "Your tolerance has increased markedly."
		self.powderdone = 0
		self.doseneed += delta
		if self.doseneed < self.powder.startdose/2:
			print "Your addiction has bottomed out. However there is no escaping the drug.\nTo your horror your addiction, though lessened, still controls you."
			self.doseneed = self.powder.startdose/2
		self.doseneed = int(self.doseneed*100)/100.0
		if self.energy < 1:
			self.energy = 1
		self.day += 1
		print "Day " + str(self.day) + " for",
		self.status()
		events.eventmain(self)
		connect.updateoffers(self)
	def endgame(self):
		print "FINAL STATS"
		self.status()
		sys.exit()
	def score(self):
		return int( (self.worth()+sum( (2 ** (i.level-1))*self.powder.startprice*5 for i in self.connections))/self.startworth*1000-1000)
	def changehealth(self,health):
		self.health += health
		if self.health < 0:
			print "Your reckless life has caught up with you. You are dead."
			self.health = 0
			self.endgame()
		else:		
			print "Your health is now "+str(self.health)+"."
	def take(self,grams):
		grams = math.ceil(grams*100)/100.0
		if grams < 0:
			print "Sorry bro, there's no untaking it."	
		elif grams > self.stash:
			print "Easy there junkie, you don't have that much."
		else:
			print "You prepare some " + self.powder.nickname + " and let yourself know bliss."
			self.powderdone += grams
			self.powderdone
			self.stash -= grams
			self.totalpowderdone += grams
			self.energy = math.ceil(self.energy*100 + grams/self.doseneed*100)/100
			if self.powderdone > 3*self.doseneed:			
				print "Many things are incomprehensible, in a beautiful way.\nYou wish you could enjoy the moment, however the dealing must go on"
				print "Tomorrow may be a bad day, if you aren't still flying by then."
			if self.powderdone > 5*self.doseneed:
				grams = min(self.powderdone - 5*self.doseneed, grams)
				print "You took a very large amount. The toll on your body is evident."
				self.changehealth(int(-grams/self.doseneed*util.boundgauss(0.1,0.5,0.1,10)*10))
	def worth(self):
		return int(self.money + self.powder.price(self.stash))
	def status(self):
		print self.name, "the", self.powder.name, '"' + self.powder.nickname + '"', "dealer"
		print util.lineformat( ["Health: " + str(self.health), "Energy: " + str(int(self.energy)) + " mission" + ("" if int(self.energy) == 1 else "s") ],2)
		print util.lineformat(["Cash: $" + str(self.money),"Stash: " + str(self.stash) +"g"],2)
		print util.lineformat(["Tolerance: " + str(self.doseneed) +"g/dose", "Today's Use " + str(self.powderdone) + "g"],2)
		print util.lineformat(["Total traffic: " + str(self.totaltraffic) +"g", "Total Use: " + str(self.totalpowderdone)+"g"],2) 
		print util.lineformat(["Total Worth: $" + str(self.worth()) + " from $" + str(self.startworth), "Score: " + str(self.score())],2) 

		temp = self.powder.price
		print "Base Prices: 1g/$" + str(temp(1)) + ", 10g/$"+str(temp(10)) + ", 100g/$"+str(temp(100)) + ", 1000g/$"+str(temp(1000)) 
		if self.doseneed*5 <= self.powderdone:
			print "Current mood: Godly"
		elif self.doseneed*3 <= self.powderdone:
			print "Current mood: Heroic."
		elif self.doseneed*2 <= self.powderdone:
			print "Current mood: Amazing."
		elif self.powderdone < self.doseneed:
			print "Current mood: Fiending for " + self.powder.nickname + "."
