class ClientUser {
	constructor(userData) {
		this.element = null;

		//@TODO-3 quick-fix until we probably combine server and client user
		//into one or at least have a common class we extend from:
		for(var property in userData) {
			this[property] = userData[property];
		}

		console.log(this.render());
	}

	render() {
		this.element = (
			<div id="user-page" class="user-page uibox">
				<section>
					<span class="floatBeside">username</span>
					<h1>{ this.displayName }</h1>
				</section>

				<section>
					<h3>Artist Identities</h3>
					<ul>
						{ this.artists.map(artist => (
							<li>
								<div>{artist.name}</div>
								<div>
									<a href="{artist.externalLink}">
										{artist.externalLink}
									</a>
								</div>
							</li>
						))}
					</ul>
				</section>

				<section>
					<h3>Recent Comments</h3>
					<ul>
						{ this.comments.map(comment => (
							<li>
								{ comment.text }
							</li>
						))}
					</ul>
				</section>
			</div>
		);

		return this.element;
	}
}

export default ClientUser;
