function save_options() {
    var use = document.getElementById('use-server').checked;
    var submit = document.getElementById('submit-server').checked;
    var uri = document.getElementById('server-uri').value;

    chrome.storage.sync.set({
        useDirServer: use,
        submitToDirServer: submit,
        dirServerUri: uri
    }, function() {
        document.getElementById('status').textContent = 'Options saved';
    });
}

function restore_options() {
    read_config(function(items) {
        document.getElementById('use-server').checked = items.useDirServer;
        document.getElementById('submit-server').checked = items.submitToDirServer;
        document.getElementById('server-uri').value = items.dirServerUri;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
