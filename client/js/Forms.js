import cor from './libs/minlab/cor';

export default new ClientForms();

function ClientForms() {
	this.init = function() {
		//// not a good solution:
		var forms = document.getElementsByTagName('form');
		for(var i=0, j=forms.length; i<j; i++) {
			if(cor.cc(forms[i], 'ajax')) {
				cor.al(forms[i], 'submit', onFormSubmit);
			}
		}
	}

	function onFormSubmit(event) { //// temporary; should find more robust solution probably // converts all form elements to ajax
		event.preventDefault();

		/// quick-fix; if working on a star, update the field values appropriately; this should obviously happen somewhere else
		if(clientState.actingStar) {
			var activeStarIdInputs = document.getElementsByClassName('activeStarIdInput');
			for (var inputIndex = 0; inputIndex < activeStarIdInputs.length; inputIndex++) {
				var input = activeStarIdInputs[inputIndex];
				input.value = clientState.actingStar.id.split('s')[1];
			}
		}

		var form = event.target;
		var children = form.children;
		var op = form.id; ///REVISIT weird solution?

		var p = "";
		for(var i=0, j=children.length-1; i<j; i++) { //// requires that the children be direct descendents of <form>
			if(i) p += "&";
			p += children[i].name + "=" + children[i].value;
		}

		ajx('/ajax/'+op, p, function(d) {
			var r = JSON.parse(d);
			console.log("eh?")
			if(r.error) {
				console.log("eh2?")
				console.log(r.error);
				throw new Error(r.error);
			} else {
				///
				// HistoryTime.goBack()
				history.back(); ////
				console.log("Success?");
				// window.history.go(-1);
				// navigate('/'); /// previous screen

				///
				// if(state.path.split('/')[1] == 'invite') {
				// 	window.reload();
				// }

				if(op == 'register' || op == 'login') {
					cor.ac(document.body, 'in');
				}

				if(op == 'login' && r.lv) {
					cor.ac(document.body, 'creator');
				}
			}
		});
	}
}