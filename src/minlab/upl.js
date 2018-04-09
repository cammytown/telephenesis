// v0.01
// requires cor.js

/*
i : input
d : data
r : request
u : url
p : progress
c : completion
f : failure
s : stop
*/

/// add support for multiple files

export default Upl;

import cor from './cor';

function Upl(u, i, p, c) {
	/// ie>=10 only

	var me = this;

	window.onbeforeunload = function() { return "You're in the middle of an upload."; }

	var d = new FormData();
	d.append(i.name, i.files[0]); /// should we use getAttribute('name') ?
	var r = new XMLHttpRequest();

	cor.al(r.upload, "progress", p);
	cor.al(r, "load", c);
	cor.al(r, "error", me.f);
	cor.al(r, "abort", me.s);

	r.open('POST', u);
	r.send(d);









	// me.p = function(e) {
	// 	console.log('t');
	// 	if(e.lengthComputable) {
	// 		var percentComplete = e.loaded / e.total;
	// 		progress.innerHTML = Math.round(percentComplete*100) + '% uploaded';
	// 		//link.style.background = 'rgba(100, 255, 100, '+percentComplete+')';
	// 	} else {
	// 		console.log('total size is unknown');
	// 	}
	// }

	// me.c = function(e) {
	// 	window.onbeforeunload = false;
	// 	/// check for errors
	// 	console.log('e');
	// 	//console.log(r.responseText);
	// 	// var r = JSON.parse(r.responseText);
	// 	// placer.id = 's'+r.sid;
	// 	// if(!placed) uploaded = true;
	// 	// else finish(r.sid, parseInt(placer.style.left), parseInt(placer.style.top), rgb);
	// }

	me.f = function(e) {
		console.log("An error occurred while transferring the file.");
	}

	me.s = function(e) {
		console.log("The transfer has been canceled by the user.");
	}
}