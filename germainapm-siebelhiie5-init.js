/* global GermainAPM, GermainAPMSiebelHIIE5Utils */
GermainAPM.init({
    beacon_url: 'https://${domain}/ingestion/beacon',
    ChangeMonitoring: {enabled: false, eventInit: "page_ready"},
    ClickMonitoring: {enabled: false, frameMonitoringEnabled: false, fullMonitoringEnabled: false},
    ConsoleMonitoring: {enabled: false},
    KeyboardMonitoring: {enabled: false, eventInit: "page_ready"},
    IframeMonitoring: {enabled: false, eventInit: "page_ready"},
    MouseMonitoring: {enabled: false, frameMonitoringEnabled: true, snapshotInterval: 1000, pushInterval: 15, eventInit: "page_ready"},
    PopupDialogMonitoring: {enabled: false},
    RT: {enabled: true}
}, {
    PAGE_TITLE: GermainAPMSiebelHIIE5Utils.titleLookup,
    REQUEST_BODY_MONITORING: false, // catch request body 
    SEND_SYNC_ON_UNLOAD: true, // this only applies when the navigator.sendBeacon is unavailable (IE)
    USER_CLICK: {
        refreshInterval: 15, // (in seconds) we check periodically if we can close current user click txn and send current cum. txn
        excludeUrls: [],
        labelGenerator: GermainAPMSiebelHIIE5Utils.viewLookup
    },
    DATA_TIMEOUT : 10000, // how long we can try to send collect data back (in ms)
    EXCLUDE_URLS: [
		/germainapm-.+-component.js/i,
		/germainapm-.+-init.js/i
	]
}, {
    appName: 'Siebel',
    // serverHost: null, // provide if you want to hardcode serverHost value
    username: GermainAPMSiebelHIIE5Utils.usernameLookup,
    session: GermainAPMSiebelHIIE5Utils.sessionLookup
});
