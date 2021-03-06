/* global GermainAPM, GermainAPMSalesforceUtils, beaconUrl, appName, serverHost, scriptTimeMonitoring,
renderingTimeMonitoring, networkRequestsMonitoring, sessionReplayMonitoring, replayExclusions, fieldExclusions, factEnrichers, profileName */

GermainAPM.init(beaconUrl,
{
    AsyncMonitoring: {enabled: networkRequestsMonitoring, queryStringGenerator: GermainAPMSalesforceUtils.xhrQueryStringGenerator, taggingEnabled: false},
    ChangeMonitoring: {enabled: true, eventInit: "page_ready"},
    ClickMonitoring: {enabled: true,
        fullMonitoringEnabled: true,
        frameMonitoringEnabled: false,
        clickContainerLookup: GermainAPMSalesforceUtils.clickContainerLookup,
        eventInit: "page_ready"
    },
    ConsoleMonitoring: {enabled: true, errorEventListenerEnabled: false},
    CpuMonitoring: {enabled: false, repeatSeconds: 60, samplesAveragedPerRound: 12, sampleTimeMillis: 2000, eventInit: "page_ready"},
    DomMonitoring: {enabled: sessionReplayMonitoring, compressContent: false,
        pushInterval: 10, pushFullInterval: 300, dataTimeout: 30000,
        excludeAriaAttributes: true /*,excludeAttributes:[],excludeIds:[]*/},
    FetchMonitoring: {enabled: networkRequestsMonitoring},
    FocusMonitoring: {enabled: sessionReplayMonitoring, pushInterval: 15, eventInit: "page_ready"},
    IframeMonitoring: {enabled: networkRequestsMonitoring, eventInit: "page_ready"},
    InactivityMonitoring: {enabled: true, eventInit: "page_ready", threshold: 30},
    InputMonitoring: {enabled: sessionReplayMonitoring},
    KeyboardMonitoring: {enabled: true, eventInit: "page_ready"},
    MediaPlayback: { enabled: sessionReplayMonitoring },
    MemoryMonitoring: {enabled: true, eventInit: "page_ready"},
    MouseMonitoring: {enabled: true, frameMonitoringEnabled: true, snapshotInterval: 100,
        pushInterval: 15, eventInit: "page_ready"},
    PopupDialogMonitoring: {enabled: true},
    RenderingMonitoring: {enabled: renderingTimeMonitoring},
    MediaStateMonitoring: {enabled: true},
    RT: {enabled: true},
    ScriptingMonitoring: {enabled: scriptTimeMonitoring},
    DebuggerMonitoring: {
        enabled: false,
        profilePageLoad: true,
        profilerMaxSeconds: 30,
        chrome: { // Requires the germainAPM Chrome extension
            useWebSocket: true, // True requires Chrome to be launched with remote-debugging-port arg. False causes a warning banner in the UI.
            webSocketPort: 9922, // chrome.exe --remote-debugging-port=9922
            profilerSamplingInterval: 20 // milliseconds
        }
    },
    ScrollMonitoring: {enabled: true, snapshotInterval: 1000, pushInterval: 15, eventInit: "page_ready"},
    StaticResourcesMonitoring: {enabled: sessionReplayMonitoring, eventInit: "page_ready"},
    VisibilityMonitoring: {enabled: true, eventInit: "page_ready"},
    HangMonitoring: { enabled: true, pingInterval: 10, minHangSeconds: 15 },
    ContentIndex: { enabled: true, includeVisibleText: true, includeInputFields: true }
}, {
    CORS_PROXY_URL: null,
    DATA_QUEUE_PUSH_INTERVAL: 10,
    USE_WEB_WORKER: false,
    DATA_TIMEOUT: 10000, // how long we can try to send collect data back (in ms)
    PAGE_TITLE: GermainAPMSalesforceUtils.titleLookup, // extract request title
    RESPONSE_BODY_MONITORING: true, // catch response body 
    RESPONSE_BODY_PARSER: null,
    REQUEST_BODY_MONITORING: true, // catch POST request body
    REQUEST_BODY_PARSER: function(fact, reqBody){ fact.requestBody = decodeURIComponent(reqBody);},
    SEND_SYNC_ON_UNLOAD: true, // this only applies when the navigator.sendBeacon is unavailable (IE)
    WITH_CREDENTIALS: false, // send requests with credentials/cookies
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
        /germainapm.*\.js/i,
        /ingestion\/beacon/i,
        /uxprofile\?monitoringProfile/i,
        /cometd\/replay/
    ],
    REPLAY_EXCLUSIONS: replayExclusions,
    FIELD_EXCLUSIONS: fieldExclusions,
    FACT_ENRICHERS: factEnrichers,
    PROFILE_NAME: profileName
}, {
    appName: appName || 'Salesforce',
    serverHost: serverHost,
    username: GermainAPMSalesforceUtils.usernameLookup,
    session: GermainAPMSalesforceUtils.sessionLookup,
    sequence: BOOMR.utils.session.getSequence
});
