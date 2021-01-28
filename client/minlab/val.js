export { Val };

function Val() {
	var ins = document.getElementsByClassName('init');
	var vlu = [];

	for(var i=0, j=ins.length; i<j; i++) {
		//if(ins[i].type=='text' || ins[i].type=='password') {
			var id = iid(ins[i]);
			//ins[i].className += ins[i].className ? ' init' : 'init';
			vlu[id] = ins[i].value;
			ins[i].onfocus = function() {
				var cls = this.className;
				var ind = cls.indexOf("init");
				if(ind>=0) {
					var rep = (cls.charAt(ind-1) == " ") ? " init" : "init";
					this.value = '';
					this.className = cls.replace(rep, "");
				}
			};
			ins[i].onblur = function() {
				if(this.value == '') {
					this.className += ' init';
					this.value = vlu[this.id];
				}
			};
		//}
	}

	function iid(ele) {
		if(ele.id) return ele.id;

		var eid = ""; var iid = "";
		if(ele.name) iid = ele.name;
		else if(ele.value) iid = ele.value;
		var v = false; var i = 0;
		while(!v) {
			eid = iid+i;
			if(!document.getElementById(eid)) { ele.id = eid; v = true; }
			else { i++; }
		}

		return eid;
	}
}
