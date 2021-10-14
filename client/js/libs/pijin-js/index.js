class Pijin {
	constructor() {
		this.callbacks = {
			'submit': [],
			'response': [],
		};

		this.selectorCallbacks = {
			'submit': [],
			'response': [],
		};
	}

	init(pijinClass = 'pijinForm') { ///REVISIT architecture
		let pijinForms = document.getElementsByClassName(pijinClass);
		for (var formIndex = 0; formIndex < pijinForms.length; formIndex++) {
			var pijinForm = pijinForms[formIndex];
			pijinForm.addEventListener('submit', (event) => this.onPijinFormSubmit(event));
		}
	}

	watch(selector, event, callback) { ///REVISIT architecture
		this.selectorCallbacks[event][selector] = callback;

		// if(selector[0] == '#') {
		// 	// selecting an id
		// 	var ele = document.getElementById(selector);
		// } else {
		// 	throw 'Pijin: unhandled selector'; ///REVISIT
		// }
	}

	onPijinFormSubmit(submitEvent) { //// temporary; should find more robust solution probably // converts all form elements to ajax
		submitEvent.preventDefault();

		var form = submitEvent.target;

		this.submit(form);

		return true;
	}

	submit(form) {
		// Run user-defined general submit callbacks:
		for (var cbIndex = 0; cbIndex < this.callbacks.submit.length; cbIndex++) {
			var submitCallback = this.callbacks.submit[cbIndex];
			submitCallback(submitEvent);
		}

		// Run user-defined callbacks for matching selectors: ///TODO currently only one callback allowed
		var selector = '#' + form.id;
		var selectorSubmitCallback = this.selectorCallbacks['submit'][selector];
		if(typeof selectorSubmitCallback === 'function') {
			///REVISIT should we make sure this returns before moving on?
			selectorSubmitCallback(submitEvent);
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

		fetch(form.action, request)
			.then(response => response.json())
			.then(result => {
				///TODO probably check classes, too. (and what about compound class selectors like .one.two ?)

				for (var cbIndex = 0; cbIndex < this.callbacks.responseText.length; cbIndex++) {
					var responseCallback = this.callbacks.responseText[cbIndex];
					responseCallback(result, this.parseRequest(request), submitEvent)
				}

				var selectorResponseCallback = this.selectorCallbacks['response'][selector];
				// console.log(selectorCallback);

				if(typeof selectorResponseCallback === 'function') {
					// responsePromise = responsePromise.then(result => selectorResponseCallback);
					selectorResponseCallback(
						result, // the parsed response
						this.parseRequest(request), // the initial request as an object of params
						submitEvent
					); ///TODO the nature of request.body is unreliable. do we want some convenience functions
				}
			});

		return true;
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

export default new Pijin(); ///REVISIT architecture
