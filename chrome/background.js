var fromContextMenu = false;

function notifyMe(filePath, hash) {
	if (!Notification) {
    alert('Desktop notifications not available.'); 
    return;
  }
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('File Downloaded:', {
      icon: 'icon48.png',
      body: filePath + "\n\n" + "SHA-256: " + hash,
    });
    notification.onclick = function () {
			window.open("https://www.virustotal.com/latest-scan/"+hash);
    };
  }
}

chrome.downloads.onChanged.addListener(function(delta) {
  if (!delta.state ||
      (delta.state.current != 'complete') || fromContextMenu == false) {
    return;
  }
	chrome.downloads.search({id: delta.id}, function(results) {
		if(!results.length)
			return;
		else {
			var filePath = results[0].filename;
			console.log(filePath);
			var shortFileName = filePath.replace(/^.*[\\\/]/, '');
			var hostName = "com.cs6694.hashcheckerexe";
			var port = null;

			connectNative();
			function connectNative()
			{
					console.log('Connecting to native application: ' + hostName);
					port = chrome.runtime.connectNative(hostName);
					port.onMessage.addListener(onMessage);
					port.onDisconnect.addListener(onDisconnect);
					sendNativeMessage(filePath);
			}
			function sendNativeMessage(in_msg) {
				msgJSON = {"msg" : in_msg};
				console.log('Sending message: ' + JSON.stringify(msgJSON));
				port.postMessage(msgJSON);
				console.log('Message sent...');
			}
			function onMessage(in_msg) {
				console.log('Message received: ' + JSON.stringify(in_msg));
				var sha256hash = JSON.parse(JSON.stringify(in_msg));
				notifyMe(shortFileName, sha256hash.msg);
			}
			function onDisconnect() {
				console.log(chrome.runtime.lastError);
				console.log('Disconnected from native application...');
				port = null;
			}
		}
	});
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	chrome.downloads.download({url: info.linkUrl}, function(downloadId) {
		fromContextMenu = true;
  });
});

chrome.contextMenus.create({
  id: 'open1_0',
  title: chrome.i18n.getMessage('openContextMenuTitle'),
  contexts: ['link'],
});