
	// 	// tutorial
	// 	var guide = document.createElement('div');
	// 	guide.className = 'tutorial small';
	// 	guide.style.left = -100 + 'px';
	// 	guide.style.top = -30 + 'px';
	// 	var text = document.createElement('div');
	// 	text.innerHTML = "Uploading your track. Let's place the origin star of your constellation.";
	// 	guide.appendChild(text);
	// 	spc.map.appendChild(guide);


	// ///:
	// var fillR = 255;
	// var fillG = 0;
	// var fillB = 0;
	// var increment = 40
	 
	// function cycle() {
	//     if (fillR == 255) {
	//         if (fillB > 0) {
	//             fillB = fillB - increment;
	//             if (fillB < 0) { fillB = 0; }
	//         }
	//         else {
	//             fillG = fillG + increment;
	//             if (fillG > 255) { fillG = 255; }
	//         }
	//     }
	 
	//     if (fillG == 255) {
	//         if (fillR > 0) {
	//             fillR = fillR - increment;
	//             if (fillR < 0) { fillR = 0; }
	//         }
	//         else {
	//             fillB = fillB + increment;
	//             if (fillB > 255) { fillB = 255; }
	//         }
	//     }
	 
	//     if (fillB == 255) {
	//         if (fillG > 0) {
	//             fillG = fillG - increment;
	//             if (fillG < 0) { fillG = 0; }
	//         }
	//         else {
	//             fillR = fillR + increment;
	//             if (fillR > 255) { fillR = 255; }
	//         }
	//     }
	    
	//     return "rgba(" + fillR + "," + fillG + "," + fillB + ", 0.1)";
	// }

	// var cycling = false;
	// me.spectrum = function(b) {
	// 	var l = function() {
	// 		if(cycling) {
	// 			spc.element.style.backgroundColor = cycle();
	// 			setTimeout(function() {
	// 				l();
	// 			}, 400);
	// 		}
	// 	}

	// 	if(b) { cycling = true; l(); }
	// 	else {
	// 		cycling = false;
	// 		spc.element.style.backgroundColor = null;
	// 	}
	// }

	// me.tutorial = function() {
	// 	/// document.getElementById('tutorial').parentNode(removeChild());
	// 	/// ^ or fade out the tutorial question mark until it's closed

	// 	///:
	// 	var ptut = document.getElementsByClassName('invite tutorial');
	// 	ptut = ptut.length ? ptut = ptut[0] : false;
	// 	if(ptut) {
	// 		document.body.className = null;
	// 		me.spectrum(false);
	// 		Anm.fadeOut(ptut, 80);
	// 	}

	// 	var t_step = 0;
	// 	var t_texts = ["Welcome to Telephenesis! I am a sarcastic tutorial and I was creatively named.",
	// 		"I'll help you understand what's going on here. I'm very excited.",
	// 		"To navigate, click and drag the universe around.",
	// 		"Every star in this galaxy resembles a piece of music. Click one to play and pause it.",
	// 		"You're so good at this. In Telephenesis, a musician picks a star and recreates it. The line between two stars symbolizes this connection.",
	// 		"Use the arrow keys to go forwards and backwards between stars and their recreations. Seriously... do that now.",
	// 		//"Now ye' gettin' it, kid! You're the greatest! Let's right click this star and look at all the wonderful things we can do.",
	// 		"You've displayed much skill, today. But now we must part. I'll always remember our time together... friend."]

	// 	var tutorial = document.createElement('div');
	// 	tutorial.className = 'tutorial large';
	// 	tutorial.style.top = '40%';
	// 	var text = document.createElement('div');
	// 	text.innerHTML = t_texts[0];
	// 	tutorial.appendChild(text);
	// 	var meta = document.createElement('div');
	// 	meta.className = 'meta';
	// 	var prev = document.createElement('a');
	// 	prev.className = 'prev btn o';
	// 	prev.innerHTML = 'previous';
	// 	prev.style.display = 'none';
	// 	prev.onclick = function() { step(-1) };
	// 	meta.appendChild(prev);
	// 	var next = document.createElement('a');
	// 	next.className= 'next btn g';
	// 	next.innerHTML = 'next';
	// 	next.onclick = function() { step(1) };
	// 	meta.appendChild(next);
	// 	var close = document.createElement('a');
	// 	close.className = 'close btn r';
	// 	close.innerHTML = 'close';
	// 	close.onclick = function() {
	// 		tutorial.parentNode.removeChild(tutorial);

	// 		///:
	// 		if(!ptut) {
	// 			spc.ctr(0, 0);
	// 			spc.flt(false);
	// 			Anm.fadeIn(spc.map);
	// 		}
	// 		if(ptut) {
	// 			document.body.className = 'inverse';
	// 			telep.spectrum(true);
	// 			Anm.fadeIn(ptut);
	// 			spc.flt(true);
	// 			Anm.fadeOut(spc.map);
	// 		}
	// 	}
	// 	meta.appendChild(close);
	// 	tutorial.appendChild(meta);

	// 	Anm.fadeOut(spc.map);
	// 	spc.flt(true);

	// 	function step(s) {
	// 		t_step += s;

	// 		Anm.fadeOut(tutorial, 150, function() {
	// 			text.innerHTML = t_texts[t_step];

	// 			if(t_step < 2) document.body.appendChild(tutorial);
	// 			else spc.map.appendChild(tutorial);

	// 			switch(t_step) {
	// 				case 0:
	// 					prev.style.display = 'none';
	// 					next.style.display = null;
	// 					tutorial.style.left = '30%';
	// 					tutorial.style.top = '40%';
	// 					break;
	// 				case 1:
	// 					prev.style.display = null;
	// 					next.style.display = null;
	// 					tutorial.style.left = '30%';
	// 					tutorial.style.top = '40%';
	// 					break;

	// 				case 2:
	// 					meta.style.display = 'none';
	// 					prev.style.display = null;
	// 					next.style.display = null;

	// 					spc.flt(false);
	// 					spc.ctr(0, 0);

	// 					Anm.fadeIn(spc.map);

	// 					/// arguments.callee?
	// 					cor.al(spc.element, 'mousedown', function() {
	// 						cor.al(spc.element, 'mousemove', function() {
	// 							text.innerHTML += "  That's fresh.";
	// 							Anm.fadeIn(meta);

	// 							cor.rl(spc.element, 'mousemove', arguments.callee);
	// 						});

	// 						cor.rl(spc.element, 'mousedown', arguments.callee);
	// 					});

	// 					tutorial.style.left = 0 - window.innerWidth/2 + 150 + "px";
	// 					tutorial.style.top = 0 - window.innerHeight/2 + 150 + "px";

	// 					break;

	// 				case 3:
	// 					meta.style.display = 'none';

	// 					cor.al(spc.element, 'click', function(e) {
	// 						console.log(e.target.parentNode);
	// 						if(e.target.parentNode.className.indexOf('star') === -1) return false;
	// 						step(1);
	// 						cor.rl(spc.element, 'click', arguments.callee);
	// 					});

	// 					spc.ctr(0,0);
	// 					tutorial.style.left = '-200px';
	// 					tutorial.style.top = '50px';

	// 					break;

	// 				case 4:
	// 					meta.style.display = null;
	// 					//next.style.display = null;

	// 					var xo = playing_star.offsetLeft;
	// 					var yo = playing_star.offsetTop;
	// 					tutorial.style.left = xo+150+'px';
	// 					tutorial.style.top = yo-50+'px';
	// 					spc.ctr(xo+200, yo);
	// 					break;

	// 				case 5:
	// 					meta.style.display = 'none';

	// 					cor.al(window, 'keydown', function(e) {
	// 						if(e.keyCode == 39 || e.keyCode == 37) {
	// 							step(1);
	// 							cor.rl(window, 'keydown', arguments.callee);
	// 						}
	// 					});

	// 					break;

	// 				case 6:
	// 					meta.style.display = null;
	// 					next.style.display = 'none';

	// 					var xo = playing_star.offsetLeft;
	// 					var yo = playing_star.offsetTop;
	// 					tutorial.style.left = xo+150+'px';
	// 					tutorial.style.top = yo-50+'px';
	// 					spc.ctr(xo+200, yo);
	// 					var stars = document.getElementsByClassName('star');
	// 					for(var i=0, j=stars.length; i<j; i++) {
	// 						cor.al(stars[i].children[0], 'contextmenu', function() {
	// 							step(1);
	// 							for(var i=0, j=stars.length; i<j; i++) {
	// 								cor.rl(stars[i].children[0], 'contextmenu', arguments.callee);
	// 							}
	// 						});
	// 					}

	// 					break;

	// 				case 7:
	// 					var xo = playing_star.offsetLeft;
	// 					var yo = playing_star.offsetTop;
	// 					tutorial.style.left = xo-500+'px';
	// 					tutorial.style.top = yo-50+'px';
	// 					spc.ctr(xo-200, yo);
	// 			}

	// 			Anm.fadeIn(tutorial);
	// 		});
	// 	}

	// 	document.body.appendChild(tutorial);
	// }

