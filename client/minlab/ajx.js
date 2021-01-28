/// param names
/// ajax file upload w/ progress option

export { ajx };

function ajx(url, params, callback, multipart) {
	multipart = (typeof multpart === "undefined") ? false : multipart;

	console.log(url);

	var httpRequest;
	if(window.XMLHttpRequest) httpRequest = new XMLHttpRequest();
	else return false;

	if(callback) httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState === 4 && httpRequest.status === 200){
			console.log(httpRequest.responseText);
			callback(httpRequest.responseText);
		}
	};

	httpRequest.open('POST', url);
	var contenttype = multipart ? 'multipart/form-data' : 'application/x-www-form-urlencoded';
	httpRequest.setRequestHeader("Content-type", contenttype);
	httpRequest.send(params);
}
