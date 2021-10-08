class Pidgeon {
	constructor() {
		this.selectorCallbacks = {
			'submit': [],
			'response': [],
		};

		// this.onPidgeonFormSubmit
	}

	init() { ///REVISIT architecture
		let pidgeonForms = document.getElementsByClassName('pidgeonForm');
		for (var formIndex = 0; formIndex < pidgeonForms.length; formIndex++) {
			var pidgeonForm = pidgeonForms[formIndex];
			pidgeonForm.addEventListener('submit', (event) => this.onPidgeonFormSubmit(event));
		}
	}

	watch(selector, event, callback) {
		///REVISIT architecture

		this.selectorCallbacks[event][selector] = callback;

		// if(selector[0] == '#') {
		// 	// selecting an id
		// 	var ele = document.getElementById(selector);
		// } else {
		// 	throw 'Pidgeon: unhandled selector'; ///REVISIT
		// }
	}

	onPidgeonFormSubmit(submitEvent) { //// temporary; should find more robust solution probably // converts all form elements to ajax
		submitEvent.preventDefault();

		var form = submitEvent.target;

		var selector = '#' + form.id;
		var submitCallback = this.selectorCallbacks['submit'][selector];

		if(typeof submitCallback === 'function') {
			///REVISIT should we make sure this returns before moving on?
			submitCallback(submitEvent);
		}

		var method = form.method;

		///REVISIT not really into this solution but for whatever reason there's no Element.getElementsByName():
		// support PUT and DELETE even though form method attribute does not
		var formInputs = form.getElementsByTagName('input');
		for (var inputIndex = 0; inputIndex < formInputs.length; inputIndex++) {
			var formInput = formInputs[inputIndex];
			if(formInput.name == '_method') {
				method = formInput.value;
				break;
			}
		}

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

			throw 'Pidgeon does not yet handle file uploads.';

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

		fetch(form.action, request)
			.then(response => response.json())
			.then(result => {
				///TODO probably check classes, too. (and what about compound class selectors like .one.two ?)

				var responseCallback = this.selectorCallbacks['response'][selector];
				// console.log(selectorCallback);

				if(typeof responseCallback === 'function') {
					// responsePromise = responsePromise.then(result => responseCallback);
					responseCallback(
						result, // the parsed response
						this.parseRequest(request), // the initial request as an object of params
						submitEvent
					); ///TODO the nature of request.body is unreliable. do we want some convenience functions
				}
			});


		return true;
		// return responsePromise;
	}

	parseRequest(request) {
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
				throw 'Pidgeon: unhandled request.body type somehow'; ///REVISIT
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

export default new Pidgeon(); ///REVISIT architecture
