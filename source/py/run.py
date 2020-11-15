import powder
import player
import util
import config
def help():
	print "This is a game of buying bulk, selling smart and making connections."
	print "Every major transaction will count as one 'mission', a unit of drug fueled energy."
	print "You can buy or sell powder with the underworld, or your connections."
	print "Connections are people that give you buy or sell offers, with typically a much better rate than the streets."
	print "You are assigned a score after " + config.maxdays + " days."
	print "You can keep up to " + config.maxconnects + " connections."
	print "You can write help <item number> on any list to get the full entry description if it is cutoff."
	print "You can write q, quit, or exit at any time to quit."
	print "You can write s, stats, or status to see your stats at any time."
	print "You can write r, reset, or restart to restart from day 1."
	print "You can write u <x>, or use <x> to use x doses."

def intro():
	while 1:
		print "Welcome to Powder."
		print "A new highly addictive chemical has hit the streets, and you have become irreversibly trapped in its grasp."
		print "Deal it to feed your growing addiction - or gamble with the deadly withdrawal."
		opt = util.options(None,["New Game", "Load Game", "Help", "Quit"],1)
		if opt == 0:
			p = player.Player(util.noexcept_input("Enter your name: "))
			gameloop(p)
		elif opt == 1:
			print "NOT YET!"
		elif opt == 2:
			help()
		elif opt == 3:
			return

def gameloop(p):
	class BackToMenu(Exception):
		def __init__(self,newusr):
			self.usr = newusr
	def goback(usr = None):
		raise BackToMenu(usr)
	setattr(p,"backtomenu",goback)
	print "Greetings to",
	p.status()
	while 1:
		try:
			p.menu(p)
		except BackToMenu, boo:
			if boo.usr:
				p = boo.usr
				setattr(p,"backtomenu",goback)
			pass
if __name__ == "__main__":
	intro()
