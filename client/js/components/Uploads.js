import { POST } from '../libs/minlab/cor';

class Uploads {
	constructor() {
	}

	/**
	 * Request a URL to upload a file to.
	 * @param {ClientStar} workingStar
	 **/
	requestUploadURL(workingStar) {
		//@TODO replace fetch() calls with maybe COR.fetchJSON or maybe COR can
		//run as an engine supplied with config options like what should happen
		//when fetch is called:
		return POST('/ajax/request-upload-url', { workingStar })
			.then(response => response.json())
			.then(result => {
				console.log(result);
				return result.uploadURL;
			});
	}
}

export default new Uploads();
