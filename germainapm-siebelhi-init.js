/* global GermainAPM, GermainAPMSiebelHIUtils, beaconUrl, appName, serverHost, replayExclusions, fieldExclusions, factEnrichers, profileName */

GermainAPM.init(beaconUrl,
{
    ChangeMonitoring: {enabled: false, eventInit: "page_ready"},
    ClickMonitoring: {enabled: false, frameMonitoringEnabled: false, fullMonitoringEnabled: false},
    ConsoleMonitoring: {enabled: false},
    IframeMonitoring: {enabled: false, eventInit: "page_ready"},
    KeyboardMonitoring: {enabled: true, eventInit: "page_ready"},
    MouseMonitoring: {enabled: false, frameMonitoringEnabled: true, snapshotInterval: 1000, pushInterval: 15, eventInit: "page_ready"},
    PopupDialogMonitoring: {enabled: false},
    RT: {enabled: true}
}, {
    PAGE_TITLE: GermainAPMSiebelHIUtils.titleLookup,
    REQUEST_BODY_MONITORING: false, // catch request body
    SEND_SYNC_ON_UNLOAD: true, // this only applies when the navigator.sendBeacon is unavailable (IE)
    WITH_CREDENTIALS: false, // send requests with credentials/cookies
    USER_CLICK: {
        refreshInterval: 15, // (in seconds) we check periodically if we can close current user click txn and send current cum. txn
        excludeUrls: [],
        labelGenerator: GermainAPMSiebelHIUtils.viewLookup
    },
    DATA_TIMEOUT : 10000, // how long we can try to send collect data back (in ms)
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
    appName: appName || 'Siebel',
    serverHost: serverHost,
    username: GermainAPMSiebelHIUtils.usernameLookup,
    session: GermainAPMSiebelHIUtils.sessionLookup
});
