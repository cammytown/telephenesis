import ReactDOM from 'react-dom'; //@REVISIT-3
//import Navigation from './Navigation';
//import 'nano-jsx';
//import React from 'react';
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

	//@REVISIT-3:
	var reactWrapper = null;

	/** The HTML Element which represents the comment. **/
	this.element = null;

	function init() {
		if(commentData) {
			me.loadData(commentData);
		}

		//@TODO-3 hopefully remove when we remove react dependency:
		initializeReactness();

		me.render();
	}

	function initializeReactness() {
		reactWrapper = document.createElement('li');
		reactWrapper.id = 'comment_' + me.publicID;
		reactWrapper.className = 'comment-list-item';

		var commentsUL = document.body.querySelector('div#playingComments ul.comments');
		if(me.replyingTo) { // Is a reply.
			var repliesUL = commentsUL.querySelector('#comment_' + me.replyingTo + ' ul.replies');
			repliesUL.prepend(reactWrapper);
		} else {
			commentsUL.prepend(reactWrapper);
		}
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
			//<li id={'comment_' + me.publicID} class='comment-list-item'>
			<div>
				<div className='comment'>
					<div className='comment-text'>
						{ me.text }
					</div>

					<div className='comment-meta'>
						<span className='comment-user'>
							by
							&nbsp;
							<a href='#'>
								{ me.user.displayName
									? me.user.displayName : "Anonymous" }
							</a>
						</span>

						&nbsp;

						<span className='comment-date'>
							{ new Date(me.timestamp).toLocaleDateString() }
						</span>

						<div className='comment-controls'>
							<a className='open-reply-panel' onClick={onReplyClick} href='#'>&#11178; Reply</a>

							<form
								className='ajax comment-reply-form'
								method='POST'
								data-ajax-action='/ajax/create-comment'
							>
								<textarea
									name='commentText'
									className='comment-text'
									placeholder="Type your reply here..."
								></textarea>
								<input type='hidden' name='starID' value={me.starID} />
								<input type='hidden' name='replyingTo' value={me.publicID} />
								<button type='submit'>Post Reply</button>
							</form>
						</div>
					</div>
				</div>

				<ul className='replies'></ul>
			</div>
			//</li>
		);

		//@TODO-3 choose one:
		if(reactWrapper) {
			ReactDOM.render(me.element, reactWrapper);
		} else {
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

					//repliesUL.prepend(me.element);

				} else { // Is not a reply.
					// Add to root comments node:
					commentsUL.prepend(me.element); ////TODO IE compatibility for prepend
				}
			}
		}
	}

	init();
}
