# TODO
## PHASE 1
### 3
- future-proof star placement
	a star is placed.
	client repositions stars.
	color star
	actualize
	server validates repo

### 2
- better aesthetic for scrolling through list view

- future-proof large amounts of stars

- consider drawing constellations during view transition; just don't cache line start and end

- draw constellation line after placing

- i think fade context menus in a little bit

- improve star sorting UI

- give sorts their own URIs

- if keeping gradient background, background of inputs is blocky

- bug: lines sometimes not there when i come back after a while?

- figure out how to sustain hosting costs
	- maybe only subscribers can upload and if you cancel then at some point your track may be moved to archive.org hosting
		- alternatively, we just monthly make a big archive.org post with the tracks if they don't mind

- personal sorts
	| playlists
	| liked/bookmarked

- should we allow people to tag stars? maybe not the artists, but the public can add tags and others can vote those tags up if they feel it's relevant?

- i think we distinguish between partial plays and full plays; full plays count more towards popularity score
	also distinguish between total/guest plays and confirmed user plays
	store play history of users; allow them to go back through it

- zooming

- clicking stars should open a menu near them
	| maybe it's a radial menu

- do we maybe not want to reveal exact time of star creation (for user privacy?)

- make first stars appear slightly different

- reimplement admin features

- update usrMeta (creator name) of stars when original doc is updated

- star radial progress bar that wraps around star and fills in

- create a shifting color theme which effects all elements
	| allow for user to select consistent color(s)

- refactor code
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

- page titles; does/should HistoryTime.navigateTo() need a page title argument? probably have some kind of routing config that matches uris to page titles

### 1
- server side rendering or at least populating page with correct content per URI

- hitting escape or clicking in space should close the menu; already closes uiboxes

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
