
	// 	var placer = document.createElement('div');
	// 	placer.className = 'star placer';
	// 	var link = document.createElement('a');
	// 	placer.appendChild(link);
	// 	var progress = document.createElement('span');
	// 	progress.className = 'progress';
	// 	progress.style.display = 'none';
	// 	placer.appendChild(progress);
	// 	spc.map.appendChild(placer);

	// 	var cwheel = document.createElement('div');
	// 	cwheel.className = 'wheel';
	// 	cwheel.style.display = 'none';
	// 	placer.appendChild(cwheel);

	// 	cor.al(spc.element, 'mousedown', placerdown);
	// 	cor.al(spc.element, 'mousemove', placermove);

	// 	/// move concept to either spc or telep global or 
	// 	var dragged = 0;
	// 	function placerdown(e) {
	// 		dragged = false;
	// 		cor.al(spc.element, 'mouseup', placerclick);
	// 	}

	// 	// placement
	// 	function placermove(e) {
	// 		var x = e.clientX - spc.map.offsetLeft;
	// 		var y = e.clientY - spc.map.offsetTop;
	// 		placer.style.left = x + 'px';
	// 		placer.style.top = y + 'px';
	// 		guide.style.left = x + 35 + 'px';
	// 		guide.style.top = y -35 + 'px'

	// 		dragged++;
	// 	}

	// 	function placerclick(e) {
	// 		if(dragged > 1) {
	// 			dragged = false;
	// 			return false;
	// 		}

	// 		/// ?:
	// 		cor.rl(spc.element, 'mousedown', placerdown);
	// 		cor.rl(spc.element, 'mousemove', placermove);
	// 		cor.rl(spc.element, 'mouseup', placerclick);

	// 		var x = e.clientX - spc.map.offsetLeft;
	// 		var y = e.clientY - spc.map.offsetTop;
	// 		placer.style.left = x + 'px';
	// 		placer.style.top = y + 'px';
	// 		placer.className = 'star';

	// 		Anm.fadeIn(cwheel, 250, function() {

	// 		});

	// 		cor.al(cwheel, 'click', function() {
	// 			rgb = link.style.backgroundColor.substr(4).slice(0, -1)
	// 			cor.rl(cwheel, 'mousemove', getColor);
	// 			if(!uploaded) {
	// 				placed = true;
	// 				Anm.fadeOut(guide);
	// 				Anm.fadeOut(cwheel);
	// 				Anm.fadeIn(progress);
	// 			}
	// 			else finish(placer.id.split('s')[1], x, y, rgb);
	// 		});

	// 		cor.al(cwheel, 'mousemove', getColor);

	// 		function getColor(e) {
	// 			var cx = -(x + (spc.map.offsetLeft - e.clientX));
	// 			var cy = (y + (spc.map.offsetTop - e.clientY));

	// 			var angle = -Math.atan2(cy, cx) * 180 / Math.PI + 180;

	// 			var selectedhue;
	// 			if(angle>0 && angle<60) selectedhue = 110;
	// 			else if(angle>60 && angle<120) selectedhue = 60;
	// 			else if(angle>120 && angle<180) selectedhue = 25;
	// 			else if(angle>180 && angle<240) selectedhue = 0;
	// 			else if(angle>240 && angle<300) selectedhue = 270;
	// 			else if(angle>300) selectedhue = 240;

	// 			link.style.backgroundColor = 'hsl('+selectedhue+', 45%, 80%)';
	// 		}

	// 		Anm.fadeOut(guide, 250, function() {
	// 			guide.innerHTML = "Now choose a color.";
	// 			guide.style.left = x + 50 + 'px';
	// 			guide.style.top = y - 15 + 'px';
	// 			Anm.fadeIn(guide);
	// 		});
	// 	}

	// 	function finish(sid, x, y, rgb) {
	// 		window.onbeforeunload = false;

	// 		progress.style.display = null;
	// 		link.style.background = 'rgb('+rgb+')';
	// 		///cor.al(link, 'click', )

	// 		/// call as ajx callback?:
	// 		document.body.removeAttribute('class');
	// 		Anm.fadeOut(guide, 300, function() {
	// 			guide.parentNode.removeChild(guide);
	// 		});

	// 		Anm.fadeOut(cwheel, 300, function() {
	// 			cwheel.parentNode.removeChild(cwheel);
	// 		});

	// 		spc.on = true;

	// 		var p = 'x='+x+'&y='+y+'&rgb='+rgb+'&sid='+sid;
	// 		ajx('/ajax/place', p, function(d) {
	// 			var r = JSON.parse(d);
	// 			progress.className = 'text name';
	// 			progress.innerHTML = r.creator;

	// 			var code = window.location.pathname.split('/').pop();
	// 			console.log(code);
	// 			window.location = "/activate/"+code;
	// 		});
	// 	}
	// }







	// me.populate = function(stars) {
	// 	for(var i=0, j=stars.length; i<j; i++) {
	// 		var s = stars[i];

	// 		var star = document.createElement('div');
	// 		star.className = 'star';
	// 		star.style.left = s.x+"px";
	// 		star.style.top = s.y+"px";

	// 		var a = document.createElement('a');
	// 		a.id = 's'+s.id;
	// 		a.href = "/f/"+s.id+".mp3";
	// 		star.appendChild(a);
	// 		a.onclick = load;

	// 		var sartist = document.createElement('span');
	// 		sartist.className = 'sartist';
	// 		sartist.innerHTML = s.creator;
	// 		star.appendChild(sartist);

	// 		var stime = document.createElement('span');
	// 		stime.className = 'stime';
	// 		star.appendChild(stime);

	// 		var line = document.createElement('img');
	// 		var lw = s.x - s.lx;
	// 		var lh = s.y - s.ly;

	// 		spc.map.appendChild(star);
	// 	}
	// }



