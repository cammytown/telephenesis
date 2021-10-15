import cor from '../libs/minlab/cor';
import Pijin from '../libs/pijin-js';
import HistoryTime from '../libs/history-time';

import clientState from './ClientState';

export default new ClientForms();

function ClientForms() {
	this.init = function() {
		//// not a good solution:
		// var forms = document.getElementsByTagName('form');
		// for(var i=0, j=forms.length; i<j; i++) {
		// 	if(cor.cc(forms[i], 'ajax')) {
		// 		Pijin.listen(forms[i], 'response', onAjaxResponse);
		// 		// cor.al(forms[i], 'submit', onFormSubmit);
		// 	}
		// }

		Pijin.init({
			className: 'ajax',
			actionAttribute: 'data-ajax-action',
			submitCallback: onAjaxSubmit,
			responseCallback: onAjaxResponse,
		});
	}

	function onAjaxSubmit(event) {
		/// quick-fix; if working on a star, update the field values appropriately; this should obviously happen somewhere else
		if(clientState.actingStar) {
			var activeStarIdInputs = document.getElementsByClassName('activeStarIdInput');
			for (var inputIndex = 0; inputIndex < activeStarIdInputs.length; inputIndex++) {
				var input = activeStarIdInputs[inputIndex];
				input.value = clientState.actingStar.id.split('s')[1];
			}
		}

	}

	// function onFormSubmit(event) { //// temporary; should find more robust solution probably // converts all form elements to ajax
	function onAjaxResponse(result, request, event) {
		// event.preventDefault();

		var form = event.target;
		// var children = form.children;
		var op = form.id; ///REVISIT bad architecture

		if(result.error) {
			console.error(result.error);
			throw new Error(result.error);
		} else {
			///
			// HistoryTime.goBack()
			history.back(); ////

			// window.history.go(-1);
			// navigate('/'); /// previous screen

			///
			// if(state.path.split('/')[1] == 'invite') {
			// 	window.reload();
			// }

			if(op == 'register' || op == 'login') {
				cor.ac(document.body, 'in');
				HistoryTime.navigateTo('/'); ///
			}

			if(op == 'login' && result.lv) {
				cor.ac(document.body, 'creator');
				HistoryTime.navigateTo('/'); ///
			}
		}
	}
}