// v0.03

// var EXPORTED_SYMBOLS = ['al', 'rl', 'ac', 'rc', 'cc'];

export default { al, rl, ac, rc, cc };

function al(ele, eve, fnc) {
	if(!ele) return false;
	if(ele.addEventListener) ele.addEventListener(eve, fnc, false);
	else if(ele.attachEvent) ele.attachEvent('on'+eve, fnc)
}

function rl(ele, eve, fnc) {
	if(!ele) return false;
	if(ele.removeEventListener) ele.removeEventListener(eve, fnc, false);
	else if(ele.detachEvent) ele.detachEvent('on'+eve, fnc)
}

function ac(ele, cls) {
	if((' '+ele.className+' ').indexOf(' '+cls+' ') !== -1) return false;
	ele.className += ' '+cls;
}

function rc(ele, cls) {
	if((' '+ele.className+' ').indexOf(' '+cls+' ') === -1) return false;
	ele.className = ele.className.replace(cls, ''); ///
}

function cc(ele, cls) {
	if((' '+ele.className+' ').indexOf(' '+cls+' ') !== -1) return true;
	else return;
}
