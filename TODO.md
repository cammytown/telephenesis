# TODO
## PHASE 1
### 3
### 2
- figure out how to sustain hosting costs
	- maybe only subscribers can upload and if you cancel then at some point your track may be moved to archive.org hosting
		- alternatively, we just monthly make a big archive.org post with the tracks if they don't mind

- figure out best way to limit uploads
	| maybe a credit system. one new constellation every month; 3 recreations every month

- i think we distinguish between partial plays and full plays; full plays count more towards popularity score
	also distinguish between total/guest plays and confirmed user plays
	store play history of users; allow them to go back through it

- update usrMeta (creator name) of stars when original doc is updated

- refactor code
	- centralize star shifting code in client and server
		| maybe Star has a method which takes a starSet and a new position and returns the shifted set
	- probably get rid of passing callbacks around now that everything is Promises
	- split up routes.js probably
	- rename Stars.js so not confused with Star.js
	- rewrite Spc
	- should we be using transform css prop instead of left and top? (probably?)
	- replace Anm with animejs; i suppose make a wrapper around animejs with some convenience functions like fadeIn fadeOut
	- make aud submodule?
	- should TelepAPI be a singleton? and Usr?

- perhaps your coordinates are kept as parameters in the URI for a variety of reasons; easier to share, easier to return to a place
	in this case, i think stars don't really shift around; but the focal point of the universe (that users -- especially new ones -- are pushed towards) moves

- add numbers/tier level to stars

### 1
- improve appearance/interface of bookmarks (probably part of general UI work on navigating stars)
- change theme of interface to color of playing star (didn't we already start something like this?)
	| make color lockable

### 0
- get webpack config to handle SASS?
- rename instances of "sid" to "starID", probably

## PHASE 2
- tamper-proof star placement
- make efforts to subjugate media play spoofing

- implement image/video stars
	- visual stars are squares, music are circles?
- are images part of the player or do you view them separately?
