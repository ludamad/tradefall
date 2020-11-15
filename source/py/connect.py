import config
import random
import util
_FIRST_NAMES_MALE = ["Joe", "Jim", "Jack", "Sam", "Adam", "Reggie", "Johnny", "John", "Bob", "Robert", "Mohammed", "Scott", "Jimmy"]
_FIRST_NAMES_FEMALE = ["Susan", "Samantha", "Jessica", "Sindy", "Laura", "Taisha", "Sangary", "Huiyan"]
_LAST_NAMES = ["Little", "Blow", "Crabhead", "Carpenter", "Bin Laden", "Bush", "Singh", "Chan", "Wang", "Smith", "Freeman", "the Snitch", "the Punisher"]

def updateoffers(usr):
	anynew = False
	for s in usr.connections:
		s.nomoredeals = False
		i = 0
		while i < len(s.currentOffers):
			s.currentOffers[i].timeleft -= 1
			if not s.currentOffers[i].timeleft:
				s.currentOffers.pop(i)
			else:
				i += 1
		if random.random() <= s.probability:
			if not anynew:
				print "You have new offers!"
				anynew = True
			s.addOffer(Connect.Offer(usr,s))
			print s.currentOffers[-1]
def offers(usr):
	for s in usr.connections:
		for i in s.currentOffers:
			yield i
class Connect:
	class Offer:
		def __init__(self, usr, c):
			self.connect = c
			self.timeleft = random.randint(1,4)
			self.isbuying = random.random() < c.buytosell
			if self.isbuying:				
				self.money = random.randint(int(c.doseslowbuy*usr.powder.baseprice),int(c.doseshighbuy*usr.powder.baseprice))
			else:	
				self.money = random.randint(int(c.doseslowsell*usr.powder.baseprice),int(c.doseshighsell*usr.powder.baseprice))					
			self.grams = usr.powder.gramsForPrice( ( (c.buyvalue if self.isbuying else c.sellvalue) + util.boundgauss(.1,0,-0.3,0.3))*self.money)
		def __str__(self):
			return str(self.timeleft)+" days "+("+$" if self.isbuying else "-$") +str(self.money) +(" -" if self.isbuying else " +") +\
				str(self.grams)+"g from " + self.connect.name + " ($"+str(int(self.money/self.grams*100)/100.0)+"/g)"
		def enact(self,usr):
			if usr.energy < 1:
				print "You don't have enough drug fueled energy."
				return False
			if self.isbuying:
				if usr.stash < self.grams:
					print "Your stash is too small."
					return False
				usr.stash -= self.grams
				usr.money += self.money
			else:
				if usr.money < self.money:
					print "You don't have enough cash."
					return False
				usr.stash += self.grams
				usr.money -= self.money
			usr.stash = int(usr.stash*100)/100.0
			usr.totaltraffic += self.grams
			usr.energy -= 1
			self.remove()
			print "Transaction completed without a hitch."
			return True
		def remove(self):
			self.connect.currentOffers.remove(self)
	def addOffer(self,off):
		self.currentOffers.append(off)
	def __init__(self, level):
		self.nomoredeals = False#After they say no once, you won't get any more deals from negotiation
		self.gender = random.random() >= .5 
		self.name = util.randomEntry(_FIRST_NAMES_MALE if self.gender else _FIRST_NAMES_FEMALE)
		self.name += " " + util.randomEntry(_LAST_NAMES)
		self.doseslowsell = util.boundgauss(.1,.5,.2) * 5 * (2 ** (level-1))*4
		self.doseshighsell = self.doseslowsell + util.boundgauss(.1)* 10 *(2 ** (level-1)) *4 
		self.doseslowbuy = util.boundgauss(.1,.5,.2) * 5 * (2 ** (level-1))
		self.doseshighbuy = self.doseslowbuy + util.boundgauss(.1)* 10 *(2 ** (level-1))  
		self.buyvalue = util.boundgauss(.1, .9, .7, 1.3)
		self.level = level
		self.sellvalue = util.boundgauss(.1, 1.0, .7, 1.2)
		self.buytosell = util.boundgauss(0.2,0.7)#Can't have too many selling deals since they are so large
		self.currentOffers = []
		self.probability = util.boundgauss(0.1,0.35)

	def status(self,usr):
		print "Name: " + self.name
		print util.lineformat( ["Buy Rate: " + str(int(self.buytosell*100)) + "%","Sell Rate: " + str(100-int(self.buytosell*100)) + "%",],2)
		qual = (self.buyvalue - 1)*self.buytosell + (1 - self.sellvalue)*(1 - self.buytosell)
		lownumsell = self.doseslowsell*usr.powder.baseprice
		highnumsell = self.doseshighsell*usr.powder.baseprice
		lownumbuy = self.doseslowbuy*usr.powder.baseprice
		highnumbuy = self.doseshighbuy*usr.powder.baseprice
		print util.lineformat( ["Buy size: $" + str(int(lownumbuy)) + " to $" + str(int(highnumbuy)), 
					"Sell size: $" + str(int(lownumsell)) + " to $" + str(int(highnumsell))],2)
		print util.lineformat( ["Daily Offer Chance: " + str(int(self.probability*100)) + "%", "Price Quality: " + str(int(qual*100+110))+"%"],2)		
		if self.nomoredeals:
			print self.name,"is not interested in any more deals today."

