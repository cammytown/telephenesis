export default new Pijin(); ///REVISIT architecture

function Pijin() {
	var me = this;

	me.callbacks = {
		'submit': [],
		'response': [],
	};

	me.selectorCallbacks = {
		'submit': [],
		'response': [],
	};

	me.options = {
		className: 'pijinForm',
		actionAttribute: false,
		submitCallback: false,
		responseCallback: false,
	}

	me.init = function(options) { ///REVISIT architecture
		Object.keys(options).forEach(prop => { ///REVISIT architecture
			if(!me.options.hasOwnProperty(prop)) {
				throw Error("Pijin received unhandled option: " + prop);
			}
		});

		me.options = Object.assign(me.options, options);

		let pijinForms = document.getElementsByClassName(me.options.className);
		for (var formIndex = 0; formIndex < pijinForms.length; formIndex++) {
			var pijinForm = pijinForms[formIndex];
			// pijinForm.addEventListener('submit', me.onPijinFormSubmit);
			pijinForm.addEventListener('submit', (event) => me.onPijinFormSubmit(event));
		}

		if(me.options.submitCallback) {
			me.callbacks.submit.push(me.options.submitCallback);
		}

		if(me.options.responseCallback) {
			me.callbacks.response.push(me.options.responseCallback);
		}
	}

	me.watch = function(selector, event, callback) { ///REVISIT architecture
		me.selectorCallbacks[event][selector] = callback;

		// if(selector[0] == '#') {
		// 	// selecting an id
		// 	var ele = document.getElementById(selector);
		// } else {
		// 	throw 'Pijin: unhandled selector'; ///REVISIT
		// }
	}

	me.onPijinFormSubmit = function(submitEvent) { //// temporary; should find more robust solution probably // converts all form elements to ajax
		submitEvent.preventDefault();

		var form = submitEvent.target;

		// Build request object:
		var request = generateRequest(form);

		///TODO currently only one callback allowed:
		// Run user-defined pre-submit callbacks for matching selectors:
		var selector = '#' + form.id;
		var selectorSubmitCallback = me.selectorCallbacks['submit'][selector];
		if(typeof selectorSubmitCallback === 'function') {
			///REVISIT should we make sure this returns before moving on?
			selectorSubmitCallback(request, submitEvent);
		}

		// Run user-defined general submit callbacks:
		for (var cbIndex = 0; cbIndex < me.callbacks.submit.length; cbIndex++) {
			var submitCallback = me.callbacks.submit[cbIndex];
			submitCallback(request, submitEvent);
		}

		// Regenerate request in case user callbacks manipulated the form:
		///REVISIT optimization. At the very least, we can not run this if
		//there are no callbacks:
		request = generateRequest(form);

		var actionURI = form.action;

		// If form has user-defined action override attribute:
		if(form.hasAttribute(me.options.actionAttribute)) {
			actionURI = form.getAttribute(me.options.actionAttribute);
		}

		fetch(actionURI, request)
			.then(response => response.json())
			.then(result => {
				///TODO probably check classes, too. (and what about compound class selectors like .one.two ?)

				for (var cbIndex = 0; cbIndex < me.callbacks.response.length; cbIndex++) {
					var responseCallback = me.callbacks.response[cbIndex];
					responseCallback(result, me.parseRequest(request), submitEvent);
				}

				var selector = '#' + form.id;
				var selectorResponseCallback = me.selectorCallbacks['response'][selector];
				// console.log(selectorCallback);

				if(typeof selectorResponseCallback === 'function') {
					// responsePromise = responsePromise.then(result => selectorResponseCallback);
					selectorResponseCallback(
						result, // the parsed response
						me.parseRequest(request), // the initial request as an object of params
						submitEvent
					); ///TODO the nature of request.body is unreliable. do we want some convenience functions
				}
			});

		return true;
	}

	function generateRequest(form) {
		var method = form.method;

		// Support PUT and DELETE even though form method attribute does not by
		// reading an (optional) manually created input with name _method:
		///REVISIT compatibility of querySelectorAll()? concat multiple getElementsByTagName?
		var formInputs = form.querySelectorAll('input,textarea,select');
		for (var inputIndex = 0; inputIndex < formInputs.length; inputIndex++) {
			var formInput = formInputs[inputIndex];
			if(formInput.name == '_method') {
				method = formInput.value;
				break;
			}
		}

		// Build payload:
		var payload = new FormData(form);

		// // store request data in object in case client wants to use it in callbacks
		// var requestObject = {};

		// PUT and DELETE currently do not often work with web servers and FormData
		// So, we must use POST and deal with determining the intended method server-side.
		///REVISIT when they improve web standards
		let brokenMethods = ['PUT', 'DELETE'];
		let usingBrokenMethod = brokenMethods.indexOf(method) != -1

		var headers = {};

		let hasFile = false;
		if(hasFile) {
			///TODO implement!

			throw 'Pijin does not yet handle file uploads.';

			method = usingBrokenMethod ? method : 'POST';
		} else {
			if(usingBrokenMethod) {
				// convert to normal object because PUT and DELETE are currently usually broken with FormData

				headers['Content-Type'] = 'application/json';
				payload = Object.fromEntries(payload);
				// requestObject = payload;
				payload = JSON.stringify(payload);
			}
		}

		var request = {
			method,
			headers,
			body: payload
		};

		return request;
	}

	me.parseRequest = function(request) {
		switch(typeof request.body) {
			case 'object': {
				if(request.body instanceof FormData) {
					request.body = Object.fromEntries(request.body);
				}

				return request;
			} break;

			case 'string': {
				request.body = JSON.parse(request.body);

				return request;
			} break;

			default: {
				throw 'Pijin: unhandled request.body type somehow'; ///REVISIT
			}
		}
	}

	// formDataToObject(formData) { ///REVISIT implementation
	// 	var serializedObject = {};

	// 	////TODO I.E. does not support formData.entries(); we will have to loop through input tags and build it ourselves, I think.
	// 	for (var entry of formData.entries()) {
	// 		serializedObject[entry[0]] = entry[1];
	// 	}

	// 	return serializedObject;
	// }
}
