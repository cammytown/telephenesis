import { POST } from '../libs/minlab/cor';
import ClientStar from './ClientStar';
import ClientComment from './ClientComment.jsx';
import tlpInterface from './Interface';
import CONSTS from '../../../abstract/constants';

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
	
	/** The textarea for creating a new comment (not a reply). **/
	var createCommentTextarea;

	/** The element that holds comments. **/
	var commentsListEle;

	/** Loading graphic for loading comments. **/
	var commentsLoadingEle;

	/** Element with message to user when there are no comments. **/
	var commentsEmptyEle;

	this.init = function() {
		createCommentTextarea = document.querySelector('#createCommentForm textarea.comment-text');

		createCommentTextarea.addEventListener('input', resizeCommentTextarea);

		var commentToggleEle = document.querySelector('#togglePlayingComments');
		commentToggleEle.addEventListener('click', me.toggleComments);

		commentsListEle = document.querySelector('#playingComments ul.comments');

		commentsLoadingEle = tlpInterface.createLoaderElement();

		commentsEmptyEle = document.querySelector('#playingComments div.noComments')
	}

	//this.ready = function() {
	//    // Initialize comment textarea height:
	//    resizeCommentTextarea();
	//}

	/**
	 * Resize the textarea for creating a comment based on its content.
	 **/
	function resizeCommentTextarea() {
		// Reset height:
		createCommentTextarea.style.height = 0;


		// Set to content height:
		createCommentTextarea.style.height = createCommentTextarea.scrollHeight + 'px';
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


		// Replace <ul> with loading graphic until comments are loaded:
		commentsListEle.replaceWith(commentsLoadingEle);

		POST('/ajax/get-star-comments', { starID: clientStar.publicID })
			.then(response => response.json())
			.then(result => {
				// Replace loading image with comments:
				commentsLoadingEle.replaceWith(commentsListEle);

				if(result.comments.length) {
					// Hide empty comments message:
					commentsEmptyEle.style.display = 'none';
					console.log(commentsEmptyEle);

					result.comments.forEach(comment => {
						new ClientComment(comment);
					});
				} else { // If there are no comments on the star.
					// Show empty comments message:
					commentsEmptyEle.style.display = 'block';
				}
			})
			.catch(err => {
				///REVISIT
				console.error(err);
			});
	}

	/**
	 * Toggles display of comments in the interface.
	 * @param {null|boolean} [visibleInput]
	 **/
	this.toggleComments = function(visibleInput = null) {
		if(typeof visibleInput == 'boolean') {
			if(visibleInput == visible) {
				return true;
			}

			visible = visibleInput;
		} else {
			// Toggle visible:
			visible = !visible;
		}

		if(!visible) {
			///REVISIT architecture of using body classes for everything:
			// Remove comments class from body:
			document.body.classList.remove('show-comments');
		} else {
			// Add comments class to body:
			document.body.classList.add('show-comments');

			//@TODO-2 ensure this attempt to set the height of an empty
			//textarea works across browsers:
			//@REVISIT-1 I don't like this solution but I'm at my wits end for
			//trying to get CSS to behave as I would expect it to:
			resizeCommentTextarea();
		}

		if(tlpInterface.order != CONSTS.ORDER.GALAXY) {
			// Refresh position of stars if shifted by comments panel:
			//@TODO bad architecture; maybe a .refresh() or something:
			tlpInterface.sort();
		}
	}
}
