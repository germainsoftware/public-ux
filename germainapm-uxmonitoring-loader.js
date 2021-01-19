// germain APM - UX Monitoring Loader

germainApmInit(
    /* germain services root URL:             */ "${germainApmRootUrl}", // e.g. "http://localhost:8080"
    /* Monitoring profile name:               */ "${profileName}", // e.g. "Siebel IP17"
    /* Web application name:                  */ "${appName}", // e.g. "Callcenter"
    /* Hard-coded server hostname (optional): */ ""  // e.g. "cc3.domain.com"
);

function germainApmInit(servicesUrl, monitoringProfileName, appName, serverHost) {

    germainApmInit.runLocalProfileRemotely = runLocalProfileRemotely; // Public export

    serverHost = serverHost || window.location.hostname;
    var ingestionUrl = servicesUrl + '/ingestion';
    var profile = readLocalProfile();
    var username;

    try {
        if (localProfileIsRecent(24 * 60)) {
            runProfile(profile);
            username = getUsernameFromMonitoring();
            if (!localProfileIsRecent(30)) {
                (window.requestIdleCallback || window.setTimeout)(function () {
                    fetchLatestProfile(profile ? profile.scriptVersion : null);
                });
            }
        } else {
            fetchLatestProfile(profile ? profile.scriptVersion : null);
        }
    } catch(e) {
        sendErrorReport("Exception during loader execution", e instanceof Error ? e.stack : e);
    }
    


    function runLocalProfileRemotely(proxyWindow) {
        var profile = readLocalProfile();
        if (profile)
            runProfileInContext(profile, proxyWindow);
    }
    
    function getUsernameFromMonitoring() {
        try { return window.BOOMR.data.username; }
        catch(e) { return null; }
    }
    
    function runProfile(profile) {
        if (!profile || typeof profile !== 'object') return;
        if (!profile.monitoringScript) return;
        if (germainApmInit.hasRunProfile || window.BOOMR) return;
        
        if (username) {
            var md = readLocalProfileMetadata();
            if (md && md.username !== username)
                return; // Don't run cached profile if for different user
        }
        
        germainApmInit.hasRunProfile = true;
        
        runProfileInContext(profile, window);
    }
    
    function runProfileInContext(profile, windowContext) {
        var taskLabel = '';
        try {
            taskLabel = "creation of monitoring install function";
            var install = windowContext.Function(profile.monitoringScript); // Isolated from local scope. Must define globals through window.
            
            taskLabel = "creation of init function";
            var init    = windowContext.Function('beaconUrl', 'appName', 'serverHost', 'excludedUsernames', 'fieldExclusions',
                'replayExclusions', 'factEnrichers', 'profileName', profile.initScript); // Isolated from local scope. Must reference globals through window.
            
            taskLabel = "evaluation of monitoring script";
            install();

            taskLabel = "evaluation of init script";
            var excludedUsernames = profile.excludedUsernames && profile.excludedUsernames.contents instanceof Array ? profile.excludedUsernames.contents : [];
            var fieldExclusions = profile.fieldExclusions && profile.fieldExclusions.contents instanceof Array ? profile.fieldExclusions.contents : [];
            var replayExclusions = profile.replayExclusions && profile.replayExclusions.contents instanceof Array ? profile.replayExclusions.contents : [];
            var factEnrichers = profile.factEnrichers && profile.factEnrichers.contents instanceof Array ? profile.factEnrichers.contents : [];
            init(ingestionUrl + '/beacon', appName, serverHost, excludedUsernames, fieldExclusions, replayExclusions, factEnrichers, monitoringProfileName);
        } catch(e) {
            sendErrorReport("Exception during " + taskLabel, e instanceof Error ? e.stack : e);
        }
    }

    function readLocalProfile() {
        if (window.localStorage.germainMonitoringProfile) {
            try {
                var profile = JSON.parse(window.localStorage.germainMonitoringProfile);
                if (profile && typeof profile === 'object') return profile;
            } catch(e) {}
        }
        return null;
    }

    function readLocalProfileMetadata() {
        if (window.localStorage.germainMonitoringProfileMetadata) {
            try {
                var md = JSON.parse(window.localStorage.germainMonitoringProfileMetadata);
                if (md && typeof md === 'object') return md;
            } catch(e) {}
        }
        return null;
    }

    function updateLocalProfile(newProfile) {
        if (!newProfile) return;
        
        var profile = readLocalProfile() || {};
        for(let field in newProfile) // Keeps existing monitoringScript value if not present in newProfile (because it was up to date)
            profile[field] = newProfile[field];

        window.localStorage.setItem('germainMonitoringProfileMetadata', JSON.stringify({
            updateTime: new Date().getTime(),
            forProfile: monitoringProfileName,
            forUsername: username
        }));
        window.localStorage.setItem('germainMonitoringProfile', JSON.stringify(profile));

        runProfile(profile); // Run only after updating localStorage metadata
    }

    function localProfileIsRecent(minutes) {
        if (!window.localStorage.germainMonitoringProfile)
            return false;
        var md = readLocalProfileMetadata();
        if (md) {
            if (md.forProfile === monitoringProfileName
                    && (!username || md.forUsername === username)
                    && md.updateTime > new Date().getTime() - minutes*60*1000) // Newer than 30 mins ago
                return true;
        }
        return false;
    }

    function fetchLatestProfile(cachedScriptVersion) {
        var args = {
            monitoringProfile: monitoringProfileName || '',
            username: username || '', // Deprecated. Can remove when all customers upgraded to 8.6.9
            monitoringScriptVersionCached: cachedScriptVersion || '',
            appName: appName, // To auto-register Web UX Agent
            hostname: serverHost // To auto-register Web UX Agent
        };

        var queryTerms = [];
        for(var key in args)
            queryTerms.push(encodeURIComponent(key) + '=' + encodeURIComponent(args[key] || ''));

        var req = new XMLHttpRequest();
        req.addEventListener('load', function(event) {
            if (event.target.status === 200)
                updateLocalProfile(JSON.parse(event.target.responseText));
            else
                sendErrorReport("Failed to fetch profile", 'status: ' + event.target.status);
        });
        req.open("GET", ingestionUrl + "/uxprofile?" + queryTerms.join('&'));
        req.send();
    }

    function sendErrorReport(errorLabel, details) {
        var data = {
            type: 'Browser:UX-Monitoring-Profile Loader Error',
            myClassName: 'com.germainsoftware.apm.data.model.UxEvent',
            timestamp: new Date().getTime(),
            name: errorLabel,
            system: {
                hostname: serverHost
            },
            application: {
                name: appName,
                component: monitoringProfileName
            },
            path: window.location.href,
            sequence: getBrowserFingerprint(),
            details: JSON.stringify(details)
        };

        var url = servicesUrl + '/ingestion/beacon?bulk=true';
        var body = JSON.stringify([data]);
        if (navigator && navigator.sendBeacon) {
            navigator.sendBeacon(url, body);
        } else {
            var req = new XMLHttpRequest();
            req.open("POST", url);
            req.send(body);
        }
    }

    function getBrowserFingerprint() {
        var id = localStorage.getItem('germainApmFingerprint');
        if (!id) localStorage.setItem('germainApmFingerprint', id = newUuid());
        return id;
    }

    function newUuid() {
        return hexInt() + hexInt(true) + hexInt(true) + hexInt();

        function hexInt(dashes) {
            var eight = (Math.random().toString(16) + "000000000").substr(2, 8);
            return dashes ? "-" + eight.substr(0, 4) + "-" + eight.substr(4, 4) : eight;
        }
    }
}
