const locale = require('../locale/en_us.json');

/**
 * Get window/page title from page name.
 * @param {string} pageName
 * @param {Star} star
 * @param {object} queryParams
 **/
function getPageTitle(pageName, star, queryParams) {
	var siteTitle = "Telephenesis";
	var pageTitle = "";

	if(pageName) {
		switch(pageName) {
			case 'create': {
				pageTitle = locale['CREATE-A-NEW-STAR'];
			} break;

			case 'recreate': {
				pageTitle = locale['RECREATE-A-STAR'];
			} break;

			case 'star': {
				//@TODO probably some kind of filtering
				pageTitle = star.title;
			} break;

			default: {
				console.warn("getPageTitle: unhandled page '" + pageName + "'");
				// Capitalize:
				pageTitle = pageName[0].toUpperCase() + pageName.substr(1);
			}
		}
	}

	if(pageTitle) {
		return pageTitle + ' - ' + siteTitle;
	} else {
		return siteTitle;
	}
}

module.exports = {
	getPageTitle
};

