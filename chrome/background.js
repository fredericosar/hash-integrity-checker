chrome.downloads.onChanged.addListener(function(delta) {
  if (!delta.state ||
      (delta.state.current != 'complete')) {
    return;
  }
	chrome.downloads.search({id: delta.id}, function(results) {
		if(!results.length)
			return;
		else {
			console.log(results[0].filename);
			var shortFileName = results[0].filename.replace(/^.*[\\\/]/, '')
			var xhr = new XMLHttpRequest();
			xhr.open('GET', chrome.extension.getURL('/Downloads/'+shortFileName), true);
			xhr.responseType = "blob";
			xhr.onreadystatechange = function()
			{
					if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
					{
						
						var a = new FileReader();
							a.readAsBinaryString(xhr.response);
							a.onloadend = function () {
								notifyMe(shortFileName + "\n" + CryptoJS.MD5(CryptoJS.enc.Latin1.parse(a.result)));
							};
					}
			};
			xhr.send();
		}
	});
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  chrome.downloads.download({url: info.linkUrl}, function(downloadId) {
  });
});

chrome.contextMenus.create({
  id: 'open3',
  title: chrome.i18n.getMessage('openContextMenuTitle'),
  contexts: ['link'],
});

function notifyMe(fileName) {
	if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('File Downloaded', {
      icon: 'icon48.png',
      body: fileName,
    });

    notification.onclick = function () {
			chrome.downloads.showDefaultFolder();
			window.open("https://md5file.com/calculator");
    };
  }
}