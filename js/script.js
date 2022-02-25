var events = lpTag.events;
var engagementDisplayStart;
var engagementDisplayEnd;
var messagingWindowLoadStart;
var messagingWindowLoadEnd;

bindToEvents();

function bindToEvents() {
	events.bind({
		eventName: "START",
		appName: "LP_OFFERS",
		func: engagementDisplayInitiatedCallback
	});

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

function engagementDisplayInitiatedCallback(data) {
	engagementDisplayStart = new Date();
}

function engagementDisplayedCallback(data) {
	engagementDisplayEnd = new Date();
	var timeElapsed = 0;

	if(engagementDisplayStart) {
		timeElapsed = engagementDisplayEnd.getTime() - engagementDisplayStart.getTime();

		if(window.dataLayer) {
			window.dataLayer.push({
				event: "engagement_shown",
				source: window.location,
				timestamp: engagementDisplayEnd,
				timeElapsed: timeElapsed
			});

            appendEventToLog('engagement_shown');
		}
	}
}

function engagementClickCallback(data) {
	messagingWindowLoadStart = new Date();
}

function messagingWindowInteractiveCallback(data) {
	messagingWindowLoadEnd = new Date();
	var timeElapsed = 0;

	if(messagingWindowLoadStart && data && data.state && data.state == "chatting") {
		timeElapsed = messagingWindowLoadEnd.getTime() - messagingWindowLoadStart.getTime();
		window.dataLayer.push({
			event: "messagin_window_interactive",
			source: window.location,
			timestamp: messagingWindowLoadEnd,
			timeElapsed: timeElapsed
		});
        
        appendEventToLog('messagin_window_interactive');
	}
}

function appendEventToLog(eventName) {
    console.log('append event');
    var elem = document.getElementById('data-layer-log');
    elem.innerHTML += '<br>';
    elem.innerHTML += '<code>' + eventName + '</code>';
}
