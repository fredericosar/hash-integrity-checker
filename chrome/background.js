"use strict";

var activeFileNames = {};

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
            var filePath = results[0].filename;
            console.log(filePath);
            var shortFileName = filePath.replace(/^.*[\\\/]/, '');
            // TODO this should be configured by cmake
            var hostName = "edu.utah.cs.cs6964.integrity_plugin";
            var port = null;

            connectNative();
            function connectNative()
            {
                console.log('Connecting to native application: ' + hostName);
                port = chrome.runtime.connectNative(hostName);
                port.onMessage.addListener(onMessage);
                port.onDisconnect.addListener(onDisconnect);
                sendNativeMessage({path: filePath});
            }
            function sendNativeMessage(msg) {
                console.log('Sending message: ' + JSON.stringify(msg));
                port.postMessage(msg);
                console.log('Message sent...');
            }
            function onMessage(in_msg) {
                console.log('Message received: ' + JSON.stringify(in_msg));
                notifyMe(shortFileName, in_msg);
            }
            function onDisconnect() {
                console.log(chrome.runtime.lastError);
                console.log('Disconnected from native application...');
                port = null;
            }
        }
    });
});

