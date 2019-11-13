'use strict';

import '../scss/main.scss';
import env from '../../env';
import routes from './routes/routes';
import {
	isAmazon,
	isAmazonAdvertising,
	getCurrentAmazonTab,
} from './util/helpers/amazon';

const init = () => {
	if (isAmazon()) {
		routes['common'].init();

		const PRIMARY_ROUTE = 'suits';
		const CURRENT_ROUTE =
			(window.CB && window.CB.tab) || getCurrentAmazonTab();

		if (CURRENT_ROUTE) {
			routes[CURRENT_ROUTE].init();
		} else {
			routes[PRIMARY_ROUTE].init();
		}
	} else {
		Object.keys(routes).forEach((route) => {
			routes[route].init();
		});
	}
};

const watchForNewNodes = (mutations, observer) => {
	mutations.forEach((mutation) => {
		if (!mutation.addedNodes) return;

		for (var i = 0; i < mutation.addedNodes.length; i++) {
			const NODE = mutation.addedNodes[i];

			if (
				NODE instanceof Node &&
				NODE.hasAttribute('id') &&
				NODE.getAttribute('id') === 'ad-landing-page-wrap'
			) {
				init();
				observer.disconnect();
			}
		}
	});
};

const TARGET_NODE = document.body;
const CONFIG = {childList: true, subtree: true};
const OBSERVER = new MutationObserver(watchForNewNodes);

(() => {
	if (isAmazon()) {
		try {
			document.body.classList.add(`${env.clientPrefix}-loaded`);

			if (!document.getElementById('ad-landing-page-wrap')) {
				OBSERVER.observe(TARGET_NODE, CONFIG);
			} else {
				init();
			}
		} catch (error) {
			document.body.classList.add(`${env.clientPrefix}-err`);
		}
	} else {
		if (!isAmazonAdvertising()) {
			init();
		}
	}
})();
