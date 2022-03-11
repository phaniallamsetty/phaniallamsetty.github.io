var events = lpTag.events;
var engagementDisplayStart;
var engagementDisplayEnd;
var messagingWindowLoadStart;
var messagingWindowLoadEnd;
var siteId;
var engagementDisplayedAlready = false;
var windowOpenedAlready = false;

bindToEvents();

function bindToEvents() {
	events.bind({
		eventName: "OFFER_IMPRESSION",
		appName: "LP_OFFERS",
		func: engagementDisplayedCallback
	});

	events.bind({
		eventName: "OFFER_CLICK",
		appName: "LP_OFFERS",
		func: engagementClickCallback
	});

	events.bind({
		eventName: "state",
		appName: "lpUnifiedWindow",
		func: messagingWindowInteractiveCallback
	});
}

function engagementDisplayedCallback(data) {
	if(!engagementDisplayedAlready) {
		engagementDisplayEnd = new Date();

		if(engagementDisplayStart) {
			pushToGA('engagement_displayed');
		}
		engagementDisplayedAlready = true;
	}
}

function engagementClickCallback(data) {
	messagingWindowLoadStart = new Date();
}

function messagingWindowInteractiveCallback(data) {
	if(!windowOpenedAlready) {
		messagingWindowLoadEnd = new Date();

		if(messagingWindowLoadStart && data && data.state && data.state == "init") {
			pushToGA('messaging_window_ready');
		}
		windowOpenedAlready = true;
	}
}

function pushToGA(eventName) {
	var eventDescription = '';
	var timeElapsed = 0;
	var key;
	var value;
	var cookieItem;
	var lpVisitorId = '';
	var sessionCookieId = 'LPSID-' + siteId;

	var isNewUser = window.isNewUser ? window.isNewUser : false;
	var isNewUserVal = "No";
	if(isNewUser) {
		isNewUserVal = "Yes";
	}

	if(eventName === 'engagement_displayed') {
		eventDescription = 'Event recording the time from when the page was loaded to the time when the engagement icon is visible to the user.';
		timeElapsed = engagementDisplayEnd.getTime() - window.engagementDisplayStart.getTime();
	} else if(eventName === 'messaging_window_ready') {
		eventDescription = 'Event recording the time from when the engagement icon is clicked to when the messaging window is ready to use.';
		timeElapsed = messagingWindowLoadEnd.getTime() - messagingWindowLoadStart.getTime();
	}

	var cookieArray = document.cookie ? document.cookie.split(';') : [];

	for(var i = 0; i < cookieArray.length; i++) {
		cookieItem = cookieArray[i].trim();
		key = cookieItem.substring(0, cookieItem.indexOf('='));
		value = cookieItem.substring(cookieItem.indexOf('=') + 1);

		if(key === 'LPVID') {
			lpVisitorId = value;
		} else if(key === sessionCookieId) {
			lpSessionId = value;
		}
	}

	if(gtag) {
		let eventData = {
			'event_category': 'performance',
			'value': timeElapsed,
			'lp_event_new_user': isNewUserVal,
			'lp_event_visitor_id': lpVisitorId,
			'lp_event_session_id': lpSessionId
		};

		//gtag('event', eventName, eventData);

		appendEventToLog(eventName, eventData);
	} else {
		appendEventToLog('gtag not defined');
	}
}

function pushToGtm(eventName) {
	var eventDescription = '';
	var timeElapsed = 0;
	var key;
	var value;
	var cookieItem;
	var lpVisitorId = '';
	var sessionCookieId = 'LPSID-' + siteId;

	var isNewUser = window.isNewUser ? window.isNewUser : false;
	var isNewUserVal = "No";
	if(isNewUser) {
		isNewUserVal = "Yes";
	}

	if(eventName === 'engagement_displayed') {
		eventDescription = 'Event recording the time from when the page was loaded to the time when the engagement icon is visible to the user.';
		timeElapsed = engagementDisplayEnd.getTime() - window.engagementDisplayStart.getTime();
	} else if(eventName === 'messaging_window_ready') {
		eventDescription = 'Event recording the time from when the engagement icon is clicked to when the messaging window is ready to use.';
		timeElapsed = messagingWindowLoadEnd.getTime() - messagingWindowLoadStart.getTime();
	}

	var cookieArray = document.cookie ? document.cookie.split(';') : [];

	for(var i = 0; i < cookieArray.length; i++) {
		cookieItem = cookieArray[i].trim();
		key = cookieItem.substring(0, cookieItem.indexOf('='));
		value = cookieItem.substring(cookieItem.indexOf('=') + 1);

		if(key === 'LPVID') {
			lpVisitorId = value;
		} else if(key === sessionCookieId) {
			lpSessionId = value;
		}
	}

	if(window.dataLayer) {
		let eventData = {
			event: eventName,
			lp_event: eventName,
			lp_event_description: eventDescription,
			lp_event_timestamp: new Date(),
			lp_event_time_elapsed: timeElapsed,
			lp_event_category: 'performance',
			lp_event_new_user: isNewUserVal,
			lp_event_visitor_id: lpVisitorId,
			lp_event_session_id: lpSessionId
		};

		window.dataLayer.push(eventData);

		appendEventToLog(eventName, eventData);
	} else {
		appendEventToLog('window.datalayer not defined');
	}
}

function appendEventToLog(eventName, eventData) {
    var elem = document.getElementById('data-layer-log');
    elem.innerHTML += '<br>';
    elem.innerHTML += '<code><b>' + eventName + (eventData && eventData.lp_event_time_elapsed ? ' (' + eventData.lp_event_time_elapsed + 'ms)' : '') + '</b>' + (eventData && eventData !== {} ? ':<br />' + syntaxHighlight(JSON.stringify(eventData, null, 4)) : '') + '</code>';
	elem.innerHTML += '<br>';
}

function loginClick(event) {
	event.preventDefault();
	siteId = document.getElementById('siteId').value;
	const username = document.getElementById('username').value;    
  
	if(window.location.href.indexOf(username) > -1) {
		window.history.replaceState(null, null, window.location.pathname);
	}

	if(username === '') {
		window.location.href = updateQueryStringParameter(window.location.href, 'siteId', siteId);
	} else {
		const href = updateQueryStringParameter(window.location.href, 'siteId', siteId);
		window.location.href = updateQueryStringParameter(href, "username", username);
	}
}

function updateQueryStringParameter(uri, key, value) {
    const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    const separator = uri.indexOf('?') !== -1 ? "&" : "?";

    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

window.addEventListener('DOMContentLoaded', function(evt) {
	var qString = window.location.search;
	var queryParams = {};
	var queryArray = qString.substring(1).split('&');
	
	queryArray.forEach(function(x) {
		if(x.indexOf('=') > 0) {
			var qArray = x.split('=');
			if(qArray.length == 2) {
				queryParams[decodeURIComponent(qArray[0])] = decodeURIComponent(qArray[1]);
			}
		}
	});

	if(queryParams.siteId && queryParams.siteId.length > 0) {
		document.getElementById('siteId').value = queryParams.siteId;
		siteId = queryParams.siteId;

		if(queryParams.username && queryParams.username.length > 0) {
			document.getElementById('username').value = queryParams.username;
		}
	}
})