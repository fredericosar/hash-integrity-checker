"use strict";

function queryApi(path, onDone, filters) {
    var query = {
        filters: filters
    };
    query = 'q=' + encodeURIComponent(JSON.stringify(query));

    var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
        onDone(JSON.parse(this.responeText));
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

function submitFileToDirectory(sourceUrl, fileName, sha1, md5) {

}

function notifyMe(filePath, hashes) {
    if (!Notification) {
        alert('Desktop notifications not available.'); 
        return;
      }

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else {
        var body = filePath + "\n\n";
        ['sha1', 'md5', 'sha256'].forEach(function(ht) {
            if (hashes.hasOwnProperty(ht)) {
                body += ht + ": " + hashes[ht];
            }
        });
        var notification = new Notification('File Downloaded:', {
            icon: 'icon48.png',
            body: body,
        });
        notification.onclick = function () {
            window.open("https://www.virustotal.com/latest-scan/"+hashes['sha1']);
        };
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
            var filePath = download.filename;
            var sourceUrl = download.url;
            console.log('Got download complete event for ' + filePath);
            var shortFileName = filePath.replace(/^.*[\\\/]/, '');

            function connectNative(hostName)
            {
                console.log('Connecting to native application: ' + hostName);
                var port = chrome.runtime.connectNative(hostName);

                port.onMessage.addListener(function(in_msg) {
                    console.log('Response received: ' + JSON.stringify(in_msg));
                    urlExistsInDirectory(sourceUrl, console.log);
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

            read_config(function(items) {
                connectNative(items.nativeHostName);
            });
        }
    });
});

