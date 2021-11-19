import cor from '../libs/minlab/cor';
import Pijin from '../libs/pijin-js';
// import HistoryTime from '../libs/history-time';

import clientState from './ClientState';
import navigation from './Navigation';
import ClientUser from './ClientUser';
import ClientComment from './ClientComment.jsx';

export default new ClientForms();

function ClientForms() {
	///REVISIT architecture:
	var commentingStar;

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

	function onAjaxSubmit(request, event, responsePromise) {
		var form = event.target;
		//var op = form.action.split('/').pop();
		var op = form.getAttribute('data-ajax-action').split('/').pop();

		//@REVISIT I don't like this architecture. Perhaps solution would be to
		//have this class have a method that allows us to hook into this
		//function; i.e. bindForm()
		switch(op) {
			case 'create-comment': {
				commentingStar = clientState.playingStar;

				// If user is still on the star they left a comment for:
				if(clientState.playingStar == commentingStar) {
					var requestProps = Object.fromEntries(request.body); //@REVISIT architecture
					new ClientComment(requestProps, responsePromise);

					responsePromise.then((result) => {
						// If new comment is a reply:
						if(result.newComment.replyingTo) {
							// Close reply controls:
							var activeControls = document.querySelector('.comment-controls.replying');
							if(activeControls) { //@REVISIT necessary?
								activeControls.classList.remove('replying');
							}

						// Comment is not a reply:
						} else {
							// Reset comment textarea:
							form.querySelector('textarea.comment-text').value = '';
						}
					});
				}

			} break;
		}

		/// quick-fix; if working on a star, update the field values
		//appropriately; this should happen somewhere else; at least in the
		//switch block above:
		if(clientState.actingStar) {
			var activeStarIdInputs = document.getElementsByClassName('activeStarIdInput');
			for (var inputIndex = 0; inputIndex < activeStarIdInputs.length; inputIndex++) {
				var input = activeStarIdInputs[inputIndex];
				input.value = clientState.actingStar.id;
			}
		}
	}

	// function onFormSubmit(event) { //// temporary; should find more robust
	// solution probably // converts all form elements to ajax
	function onAjaxResponse(result, request, event) {
		// event.preventDefault();

		var form = event.target;
		// var children = form.children;
		//var op = form.id.split('-page')[0]; ///REVISIT bad architecture
		///REVISIT not very future-proof architecture:
		var op = form.getAttribute('data-ajax-action').split('/').pop();

		if(result.errors.length) {
			// console.error(result.errors);
			// throw new Error(result.errors);

			var errorsWrapper = form.getElementsByClassName('errors')[0]; ///REVISIT architecture

			if(!errorsWrapper) {
				throw "No .errors wrapper available in <form> element.";
			}

			console.log(result.errors);
			for(var error of result.errors) {
				///REVISIT architecture:
				var errorItemEle = document.createElement('li');
				var errorLabelEle = document.createElement('label');
				errorLabelEle.innerText = error;
				///TODO add 'for' attribute and link it to correlated form field if appropriate
				errorItemEle.appendChild(errorLabelEle);
				errorsWrapper.appendChild(errorLabelEle);
			}
		} else {
			///
			// HistoryTime.goBack()
			//history.back(); ////

			// window.history.go(-1);
			// navigate('/'); /// previous screen

			///
			// if(state.path.split('/')[1] == 'invite') {
			// 	window.reload();
			// }

			switch(op) {
				case 'register':
				case 'login':
				{
					var user = new ClientUser(result.user);
					clientState.login(user);
					navigation.navigate('/'); ///
				} break;

				case 'create-comment': {
					// Nothing.
				} break;

				default: {
					console.error("onAjaxResponse(): unhandled op '" + op + '"');
				}
			}
		}
	}
}
