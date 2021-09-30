import cor from './minlab/cor';

var state = { path: window.location.pathname, updating: false, ref: false };

var active_box = false;

/* history */
cor.al(window, 'popstate', chrono);
history.replaceState(state, 'telephenesis', state.path) /// TODO: doesn't get title

if(state.path && state.path != 'login' && state.path != 'register') {
	//load(document.getElementById('s'+state.path));

	/// TODO: reexamine:
	var parts = state.path.split('/');
	var operation = parts[1];
	if(operation == 'invite' || operation == 'login' || operation == 'register') {
		///
	} else {
		navigate(state.path);
	}
}

function chrono(e) { // used on popstate; TODO: improve naming?
	state.updating = false;
	if(!e.state) {
		// console.log('NOW');
		navigate(window.location.pathname);
	}
	else {
		state.path = e.state.path;
		navigate(e.state.path);
	}
}
