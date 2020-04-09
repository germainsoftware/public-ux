/* global GermainAPM, GermainAPMSalesforceUtils */
GermainAPM.init({
    beacon_url: 'https://${domain}/ingestion/beacon',
    AsyncMonitoring: {enabled: true, queryStringGenerator: GermainAPMSalesforceUtils.xhrQueryStringGenerator, taggingEnabled: false},
    ChangeMonitoring: {enabled: true, eventInit: "page_ready"},
    ClickMonitoring: {enabled: true,
        fullMonitoringEnabled: true,
        frameMonitoringEnabled: false,
        clickContainerLookup: GermainAPMSalesforceUtils.clickContainerLookup,
        eventInit: "page_ready"
    },
    ConsoleMonitoring: {enabled: true},
    CpuMonitoring: {enabled: false, repeatSeconds: 60, samplesAveragedPerRound: 12, sampleTimeMillis: 2000, eventInit: "page_ready"},
    DomMonitoring: {enabled: true, eventInit: "page_ready", pushInterval: 10,
        pushFullInterval: 30, changesCountToSendFullBody: 500, dataTimeout: 30000, excludeAriaAttributes: true /*,excludeAttributes:[],excludeIds:[]*/},
    FetchMonitoring: {enabled: true},
    FocusMonitoring: {enabled: true, pushInterval: 15, eventInit: "page_ready"},
    IframeMonitoring: {enabled: false, eventInit: "page_ready"},
    InactivityMonitoring: {enabled: true, eventInit: "page_ready", threshold: 30},
    InputMonitoring: {enabled: true},
    KeyboardMonitoring: {enabled: true, eventInit: "page_ready"},
    MemoryMonitoring: {enabled: true, eventInit: "page_ready"},
    MouseMonitoring: {enabled: true, frameMonitoringEnabled: true, snapshotInterval: 100,
        pushInterval: 15, eventInit: "page_ready"},
    PopupDialogMonitoring: {enabled: true},
    RenderingMonitoring: {enabled: true},
    ResizeMonitoring: {enabled: true, eventInit: "dom_loaded"},
    RT: {enabled: true},
    ScriptingMonitoring: {enabled: true},
    ScrollMonitoring: {enabled: true, snapshotInterval: 1000, pushInterval: 15, eventInit: "page_ready"},
    StaticResourcesMonitoring: {enabled: true, eventInit: "page_ready"},
    VisibilityMonitoring: {enabled: true, eventInit: "page_ready"},
    HangMonitoring: { enabled: false, pingInterval: 10, minHangSeconds: 15 }
}, {
    CORS_PROXY_URL: null,
    DATA_QUEUE_PUSH_INTERVAL: 10,
    DATA_TIMEOUT: 10000, // how long we can try to send collect data back (in ms)
    PAGE_TITLE: GermainAPMSalesforceUtils.titleLookup, // extract request title
    RESPONSE_BODY_MONITORING: true, // catch response body 
    RESPONSE_BODY_PARSER: null,
    REQUEST_BODY_MONITORING: true, // catch POST request body
    SEND_SYNC_ON_UNLOAD: true, // this only applies when the navigator.sendBeacon is unavailable (IE)
    USER_CLICK: {
        count: 0,
        refreshInterval: 15, // (in seconds) we check periodically if we can close current user click txn and send current cum. txn
        sequence: new Date().getTime() + Math.random().toString(36).substring(6),
        queryStringGenerator: GermainAPMSalesforceUtils.queryStringGenerator, // user click txn query string extractor
        excludeUrls: [// exclude http request from user click txn
            /cometd\/replay/
        ],
        labelGenerator: GermainAPMSalesforceUtils.viewLookup
    },
    EXCLUDE_URLS: [// exclude data points from monitoring by full URL (including query string)
        /germainapm-.+-component.js/i,
        /germainapm-.+-init.js/i,
        /cometd\/replay/
    ]
}, {
    appName: 'Salesforce',
    username: GermainAPMSalesforceUtils.usernameLookup,
    session: GermainAPMSalesforceUtils.sessionLookup,
    sequence: BOOMR.utils.session.getSequence
});
