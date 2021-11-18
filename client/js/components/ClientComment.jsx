//import Navigation from './Navigation';
import Nano from 'nano-jsx';
export default ClientComment;

/**
 * Represents a comment for a star on the client interface.
 * @param {object} commentData
 * @constructor
 */
function ClientComment(commentData) { ///REVISIT element not in use atm
	const me = this;

	const identityProps = [
		'publicID',
		'starID',
		'replyingTo',
		'user',
		'text',
		'timestamp',
	];

	/** The ID of the star for which this is a comment. **/
	this.starID = null;

	/** Text content of the comment. **/
	this.text = null;

	/** The user who created the comment. **/
	this.user = null;

	/** The time at which the comment was created. **/
	this.timestamp = null;

	/** The HTML Element which represents the comment. **/
	this.element = null;

	function init() {
		if(commentData) {
			me.loadData(commentData);
		}

		me.render();
	}

	//function onSubmitComment(event) {
	//    event.preventDefault();

	//    console.log('submitting comment reply');

	//    var requestBody = {
	//        starID: ,
	//        commentText: ,
	//        replyingTo: , //@REVISIT naming
	//    };

	//    POST('/ajax/create-comment')
	//        .then(response => response.json())
	//        .then(result => {
	//            //@TODO-4
	//            console.log(result);
	//        })
	//        .catch(err => {
	//            //@TODO-1
	//            console.error(err);
	//        });
	//}
	
	function onReplyClick(event) {
		event.preventDefault();

		var activeControls = document.querySelector('.comment-controls.replying');
		if(activeControls) {
			activeControls.classList.remove('replying');
		}

		//@REVISIT architecture:
		var commentControlsEle = event.currentTarget.parentNode;
		commentControlsEle.classList.add('replying');

		//var replyForm = event.currentTarget.parentNode.querySelector('.comment-reply-form');
		//replyForm.classList(
	}

	this.loadData = function(dataObject) {
		for(var identityProp of identityProps) {
			if(dataObject.hasOwnProperty(identityProp)) {
				me[identityProp] = dataObject[identityProp];
			}
		}
	}

	this.render = function() {
		// Save reference to old element (may not exist):
		var oldElement = me.element;

		me.element = (
			<li id={'comment_' + me.publicID} class='comment-list-item'>
				<div class='comment'>
					<div class='comment-text'>
						{ me.text }
					</div>

					<div class='comment-meta'>
						<span class='comment-user'>
							by
							&nbsp;
							<a href='#'>
								{ me.user.displayName
									? me.user.displayName : "Anonymous" }
							</a>
						</span>

						&nbsp;

						<span class='comment-date'>
							{ new Date(me.timestamp).toLocaleDateString() }
						</span>

						<div class='comment-controls'>
							<a class='open-reply-panel' onclick={onReplyClick} href='#'>&#11178; Reply</a>

							<form
								class='ajax comment-reply-form'
								method='POST'
								data-ajax-action='/ajax/create-comment'
							>
								<textarea
									name='commentText'
									class='comment-text'
									placeholder="Type your reply here..."
								></textarea>
								<input type='hidden' name='starID' value={me.starID} />
								<input type='hidden' name='replyingTo' value={me.publicID} />
								<button type='submit'>Post Reply</button>
							</form>
						</div>
					</div>
				</div>

				<ul class='replies'></ul>
			</li>
		);

		if(oldElement) {
			// Already in the DOM; replace previous manifestation:
			oldElement.replaceWith(me.element);
		} else {
			//@REVISIT naming:
			var commentsUL = document.body.querySelector('div#playingComments ul.comments');

			// Not yet in the DOM; add it:
			if(me.replyingTo) { // Is a reply.
				//var parentComment = document.getElementById('comment_' + me.replyingTo);
				var repliesUL = commentsUL.querySelector('#comment_' + me.replyingTo + ' ul.replies');
				repliesUL.prepend(me.element);

			} else { // Is not a reply.
				// Add to root comments node:
				commentsUL.prepend(me.element); ////TODO IE compatibility for prepend
			}
		}
	}

	init();
}
