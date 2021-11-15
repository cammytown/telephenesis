//import Navigation from './Navigation';
import Nano from 'nano-jsx';
export default ClientComment;

/**
 * Represents a comment for a star on the client interface.
 * @param {string} text - Text content of the comment.
 * @param {object} commentData
 * @constructor
 */
function ClientComment(commentData) { ///REVISIT element not in use atm
	const me = this;

	const identityProps = [
		'starID',
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

	this.loadData = function(dataObject) {
		for(var identityProp of identityProps) {
			if(dataObject.hasOwnProperty(identityProp)) {
				me[identityProp] = dataObject[identityProp];
			}
		}
	}
	
	this.render = function() {
		// Save old element (may not exist):
		var oldElement = me.element;

		me.element = (
			<li class='comment'>
				<div class='comment-text'>
					{ me.text }
				</div>

				<div class='comment-meta'>
					<span class='comment-user'>
						by <a href='#'>
							{ me.user.displayName
								? me.user.displayName : "Anonymous" }
						</a>
					</span>
					&nbsp;
					<span class="comment-date">
						{ new Date(me.timestamp).toLocaleDateString() }
					</span>
				</div>
			</li>
		);

		if(oldElement) {
			// Already in the DOM; replace previous manifestation:
			oldElement.replaceWith(me.element);
		} else {
			// Not yet in the DOM; add it:
			var playingCommentsEle = document.body.querySelector('div#playingComments ul.comments');
			playingCommentsEle.prepend(Nano.render(me.element)); ////TODO IE compatibility for prepend
		}
	}

	init();
}
