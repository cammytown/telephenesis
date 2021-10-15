# TODO
## PHASE 1
### 3

- sort stars
	popularity sort
		i think we distinguish between partial plays and full plays; full plays count more towards popularity score
			also distinguish between total/guest plays and confirmed user plays
			store play history of users; allow them to go back through it

- refactor code
	- split up routes.js probably
	- rename Stars.js so not confused with Star.js
	- clean up how we pass star data around; very sloppy atm
	- rewrite Spc
	- should we be using transform css prop instead of left and top? (probably?)
	- replace Anm with animejs; i suppose make a wrapper around animejs with some convenience functions like fadeIn fadeOut
	- make aud submodule?
	- should TelepAPI be a singleton? and Usr?

- figure out how to sustain hosting costs
	- maybe only subscribers can upload and if you cancel then at some point your track may be moved to archive.org hosting
		- alternatively, we just monthly make a big archive.org post with the tracks if they don't mind

- future-proof and tamper-proof star placement

- draw constellation line after placing

### 2

- if keeping gradient background, background of inputs is blocky

- personal sorts
	| playlists
	| liked/bookmarked

- should we allow people to tag stars? maybe not the artists, but the public can add tags and others can vote those tags up if they feel it's relevant?

- clicking stars should open a menu near them
	| maybe it's a radial menu

- do we maybe not want to reveal exact time of star creation (for user privacy?)

- make first stars appear slightly different

- reimplement admin features

- update usrMeta (creator name) of stars when original doc is updated

- star radial progress bar that wraps around star and fills in

- create a shifting color theme which effects all elements
	| allow for user to select consistent color(s)

- perhaps your coordinates are kept as parameters in the URI for a variety of reasons; easier to share, easier to return to a place
	in this case, i think stars don't really shift around; but the focal point of the universe (that users -- especially new ones -- are pushed towards) moves

- add numbers/tier level to stars

- does/should HistoryTime.navigateTo() need a page title argument? probably have some kind of routing config that matches uris to page titles

### 1
- hitting escape or clicking in space should close the menu; already closes uiboxes

- improve appearance/interface of bookmarks (probably part of general UI work on navigating stars)

- change theme of interface to color of playing star (didn't we already start something like this?)
	| make color lockable

### 0
- get webpack config to handle SASS?
- rename instances of "sid" to "starID", probably

## PHASE 2
- implement image/video stars
	- visual stars are squares, music are circles?
- are images part of the player or do you view them separately?
