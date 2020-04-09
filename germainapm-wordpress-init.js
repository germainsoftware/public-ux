/* global GermainAPM */
GermainAPM.init({
    beacon_url: 'https://${domain}/ingestion/beacon',
    AsyncMonitoring: {enabled: true, taggingEnabled: false},
    FetchMonitoring: {enabled: false},
    RT: {enabled: true},
    IframeMonitoring: {enabled: true},
    WebSocketMonitoring: {enabled: false},
    ClickMonitoring: {enabled: true, frameMonitoringEnabled: true, fullMonitoringEnabled: true, eventInit: "page_ready"},
    FocusMonitoring: {enabled: true, pushInterval: 15, eventInit: "page_ready"},
    InputMonitoring: {enabled: true},
    MouseMonitoring: {enabled: true, frameMonitoringEnabled: true, snapshotInterval: 100,
        pushInterval: 5, eventInit: "page_ready"},
    ChangeMonitoring: {enabled: true, eventInit: "page_ready"},
    KeyboardMonitoring: {enabled: true, eventInit: "page_ready"},
    MemoryMonitoring: {enabled: true},
    VisibilityMonitoring: {enabled: true},
    InactivityMonitoring: {enabled: true, eventInit: "page_ready", threshold: 30},
    StaticResourcesMonitoring: {enabled: true, eventInit: "page_ready", cssMonitoringEnabled: true,
        cssParsingEnabled: true, imagesMonitoringEnabled: true, cacheEnabled: true},
    ScrollMonitoring: {enabled: true, snapshotInterval: 1000, pushInterval: 15, eventInit: "page_ready"},
    ResizeMonitoring: {enabled: true, eventInit: "dom_loaded"},
    DomMonitoring: {enabled: true, eventInit: "page_ready", pushInterval: 5, pushFullInterval: 30,
        changesCountToSendFullBody: 250, dataTimeout: 30000},
    PopupDialogMonitoring: {enabled: true},
    ConsoleMonitoring: {enabled: true},
    HangMonitoring: { enabled: false, pingInterval: 10, minHangSeconds: 15 }
}, {
    DATA_QUEUE_PUSH_INTERVAL: 5,
    SEND_SYNC_ON_UNLOAD: true, // this only applies when the navigator.sendBeacon is unavailable (IE)
    REQUEST_BODY_MONITORING: true, // catch request body 
    RESPONSE_BODY_MONITORING: true, // catch response body 
    RESPONSE_BODY_PARSER: null,
    PAGE_TITLE: function (_document) {
        return _document['title'];
    },
    DATA_TIMEOUT: 5000, // how long we can try to send collect data back (in ms)
    USER_CLICK: {
        count: 0,
        refreshInterval: 15, // (in seconds) we check periodically if we can close current user click txn and send current cum. txn
        sequence: new Date().getTime() + Math.random().toString(36).substring(6),
        excludeUrls: [],
        labelGenerator: undefined // use default generator
    },
    EXCLUDE_URLS: [
		/germainapm-.+-component.js/i,
		/germainapm-.+-init.js/i
	]
}, {
    appName: 'Wordpress',
    username: '<default>',
    session: BOOMR.utils.session.getSessionId,
    sequence: BOOMR.utils.session.getSequence
});
