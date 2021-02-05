/* global GermainAPM, beaconUrl, appName, serverHost, renderingTimeMonitoring, sessionReplayMonitoring,
scriptTimeMonitoring, networkRequestsMonitoring, replayExclusions, fieldExclusions, factEnrichers, profileName */

GermainAPM.init(beaconUrl,
{
    AsyncMonitoring: {enabled: networkRequestsMonitoring, taggingEnabled: false},
    FetchMonitoring: {enabled: networkRequestsMonitoring},
    RT: {enabled: true},
    IframeMonitoring: {enabled: networkRequestsMonitoring},
    WebSocketMonitoring: {enabled: false},
    ClickMonitoring: {enabled: true, frameMonitoringEnabled: true, fullMonitoringEnabled: true, eventInit: "page_ready"},
    CpuMonitoring: {enabled: false, repeatSeconds: 60, samplesAveragedPerRound: 12, sampleTimeMillis: 2000, eventInit: "page_ready"},
    FocusMonitoring: {enabled: sessionReplayMonitoring, pushInterval: 15, eventInit: "page_ready"},
    InputMonitoring: {enabled: sessionReplayMonitoring},
    MouseMonitoring: {enabled: true, frameMonitoringEnabled: true, snapshotInterval: 100,
        pushInterval: 5, eventInit: "page_ready"},
    ChangeMonitoring: {enabled: true, eventInit: "page_ready"},
    KeyboardMonitoring: {enabled: true, eventInit: "page_ready"},
    MemoryMonitoring: {enabled: true},
    VisibilityMonitoring: {enabled: true},
    InactivityMonitoring: {enabled: true, eventInit: "page_ready", threshold: 30},
    StaticResourcesMonitoring: {enabled: sessionReplayMonitoring, eventInit: "page_ready", cssMonitoringEnabled: true,
        cssParsingEnabled: true, imagesMonitoringEnabled: true, cacheEnabled: true},
    MediaPlayback: { enabled: sessionReplayMonitoring },
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
    MediaStateMonitoring: {enabled: true},
    DomMonitoring: {enabled: sessionReplayMonitoring, eventInit: "page_ready", pushInterval: 10, pushFullInterval: 300, dataTimeout: 30000},
    PopupDialogMonitoring: {enabled: true},
    RenderingMonitoring: {enabled: renderingTimeMonitoring},
    ConsoleMonitoring: {enabled: true},
    HangMonitoring: { enabled: true, pingInterval: 10, minHangSeconds: 15 },
    ContentIndex: { enabled: true, includeVisibleText: true, includeInputFields: true }
}, {
    DATA_QUEUE_PUSH_INTERVAL: 5,
    SEND_SYNC_ON_UNLOAD: true, // this only applies when the navigator.sendBeacon is unavailable (IE)
    REQUEST_BODY_MONITORING: true, // catch request body 
    RESPONSE_BODY_MONITORING: true, // catch response body 
    RESPONSE_BODY_PARSER: null,
    WITH_CREDENTIALS: false, // send requests with credentials/cookies
    PAGE_TITLE: function (_document) {
        return _document['title'];
    },
    DATA_TIMEOUT: 5000, // how long we can try to send collect data back (in ms)
    USER_CLICK: {
        count: 0,
        refreshInterval: 15, // (in seconds) we check periodically if we can close current user click txn and send current cum. txn
        sequence: new Date().getTime() + Math.random().toString(36).substring(6),
        excludeUrls: [],
        labelGenerator: function(){
            if(window.location.hash){
                return decodeURIComponent(window.location.hash.slice(1));
            } else {
                return window.location.pathname;
            }
        }
    },
    EXCLUDE_URLS: [
        /germainapm.*\.js/i,
        /ingestion\/beacon/i,
        /uxprofile\?monitoringProfile/i
    ],
    REPLAY_EXCLUSIONS: replayExclusions,
    FIELD_EXCLUSIONS: fieldExclusions,
    FACT_ENRICHERS: factEnrichers,
    PROFILE_NAME: profileName
}, {
    appName: appName || 'Html',
    serverHost: serverHost,
    username: '<default>',
    session: BOOMR.utils.session.getSessionId,
    sequence: BOOMR.utils.session.getSequence
});
