"use strict";

function queryApi(path, onDone, filters) {
    var query = {
        filters: filters
    };
    query = 'q=' + encodeURIComponent(JSON.stringify(query));

    var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
        onDone(JSON.parse(this.responseText));
    });

    read_config(function(config) {
        req.open('GET', config.dirServerUri + path + '?' + query);
        req.send();
    });
}

function fileExistsInNSRL(fileName, sha1, md5) {

}

function urlExistsInDirectory(sourceUrl, f) {
    queryApi('user_file', f, [
        {name: 'source_url', op: 'eq', val: sourceUrl}
    ]);
}

function submitFileToDirectory(timestamp, sourceUrl, fileName, sha1, md5) {
    console.log('Submitting file');
    var req = new XMLHttpRequest();

    read_config(function(config) {
        req.open('POST', config.dirServerUri + 'user_file');
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify({
            timestamp: timestamp,
            sha1: sha1,
            md5: md5,
            file_name: fileName,
            source_url: sourceUrl
        }));
    });
}

function notifyMe(title, message) {
    if (!Notification) {
        alert('Desktop notifications not available.'); 
        return;
    }

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else {
        new Notification(title, {
            icon: 'icon48.png',
            body: message
        });
    }
}

chrome.downloads.onChanged.addListener(function(delta) {
    if (!delta.state || delta.state.current != 'complete') {
        return;
    }

    chrome.downloads.search({id: delta.id}, function(results) {
        if(!results.length) {
            return;
        } else {
            var download = results[0];
            var sourceUrl = download.url;
            var filePath = download.filename;
            var fileName = filePath.replace(/^.*[\\\/]/, '');
            console.log('Got download complete event for ' + filePath);

            read_config(function(config) {
                function connectNative(hostName) {
                    console.log('Connecting to native application: ' + hostName);
                    var port = chrome.runtime.connectNative(hostName);

                    port.onMessage.addListener(function(in_msg) {
                        console.log('Response received: ' + JSON.stringify(in_msg));
                        var downloadSha1 = in_msg.sha1;
                        var downloadMd5 = in_msg.md5;

                        if (!config.useDirServer)
                            return;

                        urlExistsInDirectory(sourceUrl, function(response) {
                            // TODO response might be paginated
                            if (response.objects.length == 0) {
                                notifyMe(fileName, "No record of files from source URL.");
                            } else {
                                var nMatches = 0;
                                response.objects.forEach(function(x) {
                                    if (x.sha1 == downloadSha1)
                                        nMatches += 1;
                                });
                                notifyMe(fileName, "Found " + nMatches +
                                        " record(s) matching this file (" +
                                        Math.floor(nMatches / response.objects.length) +
                                        "% agreement).");
                            }

                            // Submit a record of our file now, if desired
                            if (config.submitToDirServer) {
                                submitFileToDirectory(download.starttime, sourceUrl,
                                                      fileName, downloadSha1, downloadMd5);
                            } else {
                                console.log('Skipping submission due to configuration');
                            }
                        });
                    });

                    port.onDisconnect.addListener(function() {
                        console.log(chrome.runtime.lastError);
                        console.log('Disconnected from native application');
                        port = null;
                    });

                    var msg = {path: filePath};
                    console.log('Sending message: ' + JSON.stringify(msg));
                    port.postMessage(msg);
                }

                connectNative(config.nativeHostName);
            });
        }
    });
});

