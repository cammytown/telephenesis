# TODO
## PHASE 1
### 3

- reimplement admin features
- sort stars

- make first stars appear slightly different

- progress bar along bottom
	| also in header probably

- refactor code
	- make aud submodule
	- move js files and libs into js/libs folder
	- clean up how we pass star data around; very sloppy atm

- organize/filter the universe by newness, popularity, etc.
- figure out how to sustain hosting costs
	- maybe only subscribers can upload and if you cancel then at some point your track may be moved to archive.org hosting
		- alternatively, we just monthly make a big archive.org post with the tracks if they don't mind

### 2
- update usrMeta (creator name) of stars when original doc is updated

- create a shifting color theme which effects all elements
	| allow for user to select consistent color(s)

- perhaps your coordinates are kept as parameters in the URI for a variety of reasons; easier to share, easier to return to a place
	in this case, i think stars don't really shift around; but the focal point of the universe (that users -- especially new ones -- are pushed towards) moves

- add numbers/tier level to stars

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
