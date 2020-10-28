/* global GermainAPM, GermainAPMSiebelOpenUIUtils, beaconUrl, appName, serverHost, sessionReplayMonitoring, networkRequestsMonitoring, renderingTimeMonitoring, scriptTimeMonitoring */

GermainAPM.init(beaconUrl,
{
    AsyncMonitoring: {enabled: networkRequestsMonitoring, taggingEnabled: false
        /*additionalInfoLookup: GermainAPMSiebelOpenUIUtils.additionalInfoLookup*/
    },
    ChangeMonitoring: {enabled: true, eventInit: "page_ready", 
        hideFieldValueHelper: GermainAPMSiebelOpenUIUtils.hideFieldValueHelper, 
        /*additionalInfoLookup: GermainAPMSiebelOpenUIUtils.additionalInfoLookup,*/
        changeLabelLookup: GermainAPMSiebelOpenUIUtils.fieldLabelLookup},
    ClickMonitoring: {enabled: true, frameMonitoringEnabled: false, 
        fullMonitoringEnabled: true, 
        clickContainerLookup: GermainAPMSiebelOpenUIUtils.clickContainerLookup,
        clickLabelLookup: GermainAPMSiebelOpenUIUtils.fieldLabelLookup,
        /*additionalInfoLookup: GermainAPMSiebelOpenUIUtils.additionalInfoLookup,*/
        eventInit: "page_ready", eventClick: "mouseup", 
        hideFieldValueHelper: GermainAPMSiebelOpenUIUtils.hideFieldValueHelper},
    ConsoleMonitoring: {enabled: true, nameParser: GermainAPMSiebelOpenUIUtils.consoleNameParser},
    CpuMonitoring: {enabled: false, repeatSeconds: 60, samplesAveragedPerRound: 12, sampleTimeMillis: 2000, eventInit: "page_ready"},
    DomMonitoring: {enabled: sessionReplayMonitoring, eventInit: "page_ready", pushInterval: 10, 
        pushFullInterval: 300, dataTimeout: 30000, excludeAriaAttributes: true /*,excludeAttributes:[],excludeIds:[]*/},
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
    PopupDialogMonitoring: {enabled: true, messageParser: GermainAPMSiebelOpenUIUtils.popupMessageParser},
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
    StaticResourcesMonitoring: {enabled: sessionReplayMonitoring, eventInit: "page_ready" },
    VisibilityMonitoring: {enabled: true, eventInit: "page_ready"},
    HangMonitoring: { enabled: true, pingInterval: 10, minHangSeconds: 15 }
}, {
    CORS_PROXY_URL: null,
    DATA_QUEUE_PUSH_INTERVAL: 10,
    DATA_TIMEOUT: 10000, // how long we can try to send collect data back (in ms)
    PAGE_TITLE: GermainAPMSiebelOpenUIUtils.titleLookup, // extract request title
    RESPONSE_BODY_MONITORING: true, // catch response body 
    RESPONSE_BODY_PARSER: null,
    REQUEST_BODY_MONITORING: true, // catch POST request body
    SEND_SYNC_ON_UNLOAD: true, // this only applies when the navigator.sendBeacon is unavailable (IE)
    WITH_CREDENTIALS: false, // send requests with credentials/cookies
    USER_CLICK: {
        refreshInterval: 15, // (in seconds) we check periodically if we can close current user click txn and send current cum. txn
        queryStringGenerator: GermainAPMSiebelOpenUIUtils.queryStringGenerator, // user click txn query string extractor
        excludeUrls: [ // exclude http request from user click txn
            /\/marker/,
            /SWECmd=InvokeMethod&SWEService=Message\+Bar&SWEMethod=UpdatePrefMsg/,
            /SWECmd=InvokeMethod&SWEService=SWE\+Command\+Manager&SWEMethod=BatchCanInvoke/,
            /SWEService=Communications/,
            /SWECmd=Login/, 
            /channelservice/, 
            /ie-preamble/, 
            /Ping/,
            /SWECmd=InvokeMethod.*GetWebSessionInfo/,
            /SWECmd=InvokeMethod.*&SWEMethod=GetProfileAttr.*&SWEIPS=/,
            /GetAlarmInstances/,
            /GetAlarms/
        ],
        labelGenerator: GermainAPMSiebelOpenUIUtils.labelLookup
    },
    EXCLUDE_URLS: [ // exclude data points from monitoring by full URL (including query string)
        /germainapm.*\.js/i,
        /uxprofile\?monitoringProfile/i,
        /SWEService=Communications/,
        /SWECmd=InvokeMethod&SWEService=Message\+Bar&SWEMethod=UpdatePrefMsg/,
        /SWECmd=InvokeMethod&SWEService=SWE\+Command\+Manager&SWEMethod=BatchCanInvoke/,
        /SWECmd=InvokeMethod.*&SWEMethod=GetProfileAttr.*&SWEIPS=/
    ],
    SESSION_MARKER_END: ["Logout", "Log Out", "Utloggning"],
    REQUEST_INDEX_FILTER: GermainAPMSiebelOpenUIUtils.requestIndexFilter
}, {
    appName: appName || 'Siebel',
    serverHost: serverHost,
    username: GermainAPMSiebelOpenUIUtils.usernameLookup,
    session: GermainAPMSiebelOpenUIUtils.sessionLookup,
    sequence: BOOMR.utils.session.getSequence //GermainAPMSiebelOpenUIUtils.correlationIdLookup
});
