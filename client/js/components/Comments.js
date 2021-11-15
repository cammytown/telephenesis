import { POST } from '../libs/minlab/cor';
import ClientStar from './ClientStar';
import ClientComment from './ClientComment.jsx';

export default new Comments();

/**
 * Handles user comments.
 * @constructor
 **/
function Comments() {
	const me = this;

	/** Whether or not comments are visible in the interface. **/
	var visible = false;

	//var commentsEle = document.querySelector('#playingComments');
	
	/** The element that holds comments. **/
	var commentsListEle;

	this.init = function() {
		var commentToggleEle = document.querySelector('#togglePlayingComments');
		commentToggleEle.addEventListener('click', me.toggleComments);

		commentsListEle = document.querySelector('#playingComments ul.comments');
	}

	/**
	 * Load comments for a star into the interface.
	 * @param {ClientStar} clientStar - The star to get comments for.
	 **/
	this.loadStarComments = function(clientStar) {
		// Clear current children:
		///OPTIMIZATION ?
		while(commentsListEle.firstChild) {
			commentsListEle.removeChild(commentsListEle.firstChild);
		}

		POST('/ajax/get-comments', { starID: clientStar.id })
			.then(response => response.json())
			.then(result => {
				result.comments.forEach(comment => {
					new ClientComment(comment);
				});
			})
			.catch(err => {
				///REVISIT
				console.error(err);
			});
	}

	/**
	 * Toggles display of comments in the interface.
	 **/
	this.toggleComments = function() {

		// Toggle visible:
		visible = !visible;

		if(!visible) {
			///REVISIT architecture of using body classes for everything:
			// Remove comments class from body:
			document.body.classList.remove('show-comments');
		} else {
			// Add comments class to body:
			document.body.classList.add('show-comments');
		}
	}
}
