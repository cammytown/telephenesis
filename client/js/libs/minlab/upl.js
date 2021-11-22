//TODO add support for multiple files

export default Upl;

//@TODO convert to params object:
function Upl(url, inputEle, progressCallback, completeCallback, method = "PUT", binary = false) {
	if(!inputEle) {
		console.log(inputEle);
		throw "Upl(): no valid inputEle provided";
	}

	var me = this;

	window.onbeforeunload = function() { return "You're in the middle of an upload."; }

	var r = new XMLHttpRequest();

	r.upload.addEventListener("progress", progressCallback);
	r.addEventListener("load", completeCallback);
	r.addEventListener("error", defaultErrorCallback);
	r.addEventListener("abort", me.s);

	r.open(method, url);

	if(binary) {
		r.send(inputEle.files[0]);
	} else {
		var data = new FormData();
		data.append(inputEle.name, inputEle.files[0]);
		r.send(data);
	}


	function defaultErrorCallback(e) {
		console.log("An error occurred while transferring the file.");
	}

	me.s = function(e) {
		console.log("The transfer has been canceled by the user.");
	}

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
}
