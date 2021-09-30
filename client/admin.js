
	/***
	** ADMIN FUNCTIONS
	***/
	function initializeRecolor() {
		/// consolidate:

		var colorwheelSelect = document.getElementById('colorwheelSelect');
		acting_star.appendChild(colorwheelSelect);
		Anm.fadeIn(colorwheelSelect);

		var x = parseInt(acting_star.style.left);
		var y = parseInt(acting_star.style.top);
		spc.ctr(x, y); /// create callback function for ctr? currently using validPlacementZone fadeOut delay

		//// preventmovement?

		var starLink = acting_star.getElementsByTagName('a')[0];

		cor.al(colorwheelSelect, 'mousemove', getColor);
		cor.al(colorwheelSelect, 'click', function() {
			cor.rl(colorwheelSelect, 'mousemove', getColor);

			var newrgb = starLink.style.backgroundColor.substr(4).slice(0, -1); /// bad code / maybe unreliable
			Anm.fadeOut(colorwheelSelect);

			var p = 'rgb='+newrgb+'&sid='+acting_star.id.split('s')[1];
			ajx('/ajax/recolor', p, function(d) {
				var r = JSON.parse(d);
			});

			acting_star = false;
		});

		function getColor(e) {
			var cx = -(x + (spc.map.offsetLeft - e.clientX));
			var cy = (y + (spc.map.offsetTop - e.clientY));

			var angle = -Math.atan2(cy, cx) * 180 / Math.PI + 180;

			var selectedhue;
			if(angle>0 && angle<60) selectedhue = 110;
			else if(angle>60 && angle<120) selectedhue = 60;
			else if(angle>120 && angle<180) selectedhue = 25;
			else if(angle>180 && angle<240) selectedhue = 0;
			else if(angle>240 && angle<300) selectedhue = 270;
			else if(angle>300) selectedhue = 240;

			starLink.style.backgroundColor = 'hsl('+selectedhue+', 45%, 80%)';
		}
	}

	function initializeMove() {
		cor.ac(acting_star, 'moving');

		setTimeout(function() { ////
			cor.al(spc.element, 'click', clickStarMove);
		}, 200);
		cor.al(spc.element, 'mousemove', mouseMoveStarMove);

		function mouseMoveStarMove(e) {
			acting_star.style.left = e.clientX + 'px'; /// new variable; moving_star ?
			acting_star.style.top = e.clientY + 'px'; /// new variable; moving_star ?
		}

		function clickStarMove(e) {
			var x = e.clientX - spc.map.offsetLeft;
			var y = e.clientY - spc.map.offsetTop;
			var p = 'x='+x+'&y='+y+'&sid='+acting_star.id.split('s')[1];
			ajx('/ajax/move', p, function(d) {
				var r = JSON.parse(d);
			}); /// could be confused with place

			acting_star = false;

			cor.rl(spc.element, 'mousemove', mouseMoveStarMove);
			cor.rl(spc.element, 'click', clickStarMove);
		}

	}
