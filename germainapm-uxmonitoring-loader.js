// germain APM - UX Monitoring Loader

germainApmInit(
    /* germain services root URL:             */ "${germainApmRootUrl}", // e.g. "http://localhost:8080"
    /* Monitoring profile name:               */ "${profileName}", // e.g. "Siebel IP17"
    /* Web application name:                  */ "${appName}", // e.g. "Callcenter"
    /* Hard-coded server hostname (optional): */ ""  // e.g. "cc3.domain.com"
);

function germainApmInit(servicesUrl, monitoringProfileName, appName, serverHost) {

    serverHost = serverHost || window.location.host;
    var ingestionUrl = servicesUrl + '/ingestion';
    var profile = readLocalProfile();
    var username;

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
    


    function getUsernameFromMonitoring() {
        try { return window.BOOMR.data.username; }
        catch(e) { return null; }
    }
    
    function runProfile(profile) {
        if (!profile || typeof profile !== 'object') return;
        if (!profile.monitoringScript) return;
        if (germainApmInit.hasRunProfile) return;
        
        if (username) {
            var md = readLocalProfileMetadata();
            if (md && md.username !== username)
                return; // Don't run cached profile if for different user
        }
        
        germainApmInit.hasRunProfile = true;
        
        try {
            var install = new Function(profile.monitoringScript);                      // Isolated from local scope. Must define globals through window.
            var init    = new Function('beaconUrl', 'appName', 'serverHost', 'excludedUsernames', profile.initScript); // Isolated from local scope. Must reference globals through window.
            
            install();
            var excludedUsernames /*:string[]*/ = profile.excludedUsernames && profile.excludedUsernames.contents instanceof Array
                ? profile.excludedUsernames.contents
                : [];
            init(ingestionUrl + '/beacon', appName, serverHost, excludedUsernames);
        } catch(e) {
            console.error("germainAPM: Exception during initialization of UX monitoring scripts. ", e);
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
            username: username || '',
            monitoringScriptVersionCached: cachedScriptVersion || ''
        };

        var queryTerms = [];
        for(var key in args)
            queryTerms.push(encodeURIComponent(key) + '=' + encodeURIComponent(args[key] || ''));

        var req = new XMLHttpRequest();
        req.addEventListener('load', function(event) {
            if (event.target.status === 200)
                updateLocalProfile(JSON.parse(event.target.responseText));
        });
        req.open("GET", ingestionUrl + "/uxprofile?" + queryTerms.join('&'));
        req.send();
    }

}
