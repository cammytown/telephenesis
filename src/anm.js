export default { animate, fadeIn, fadeOut };

function animate(o, p, v, d) {
	d = (typeof d === "undefined") ? 250 : d;
	var px = v.substr(-2) == 'px';
	var f = 0;
	var fs = d/2 | 0;

	var vi = o.style[p].split(' ');
	var vs = v.split(' ');
	var vd = [];

	for(var i=0, j=vs.length; i<j; i++) {
		vs[i] = parseInt(vs[i]);
		vi[i] = parseInt(vi[i]);
		vd[i] = vs[i] - vi[i];
	}

	var l = function() {
		var vn = '';
		for(var i=0, j=vs.length; i<j; i++) {
			if(i) vn += ' ';
			vn += vi[i] + (vd[i] * f/fs);
			if(px) vn += 'px';
		}

		o.style[p] = vn;

		f++;
		if(f<=fs) setTimeout(l, 2); /// imprecise
	};

	l();
}


/// consolidate In and Out?
function fadeIn(o, d, c) {
	d = (typeof d === "undefined") ? 250 : d;
	c = (typeof c === "undefined") ? false : c;

	if(o.style.opacity == 1) return false;

	var fs = d/5 | 0;
	var f = 0;

	o.style.display = ''; ///

	var l = function() {
		o.style.opacity = 0+1*(f/fs);
		f++;
		if(f<=fs) setTimeout(l, 5);
		else if(c) c();
	};	

	l();
};


function fadeOut(o, d, c) {
	d = (typeof d === "undefined") ? 250 : d;
	c = (typeof c === "undefined") ? false : c;

	var fs = d/5 | 0;
	var f = 0;
	var t = null;

	var l = function(){
		o.style.opacity = 1-1*(f/fs);
		f++;
		if(f<=fs) t = setTimeout(l, 5);
		else { o.style.display = 'none'; if(c) c() }
	};

	l();
};
