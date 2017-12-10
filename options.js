// Saves options to chrome.storage
function save_options() {
    var urlElement  = document.getElementById('url');
    var url         = urlElement.value;
    url.trim();

    if(typeof url == 'undefined' || url == "") {
        var status = document.getElementById('status');
        update_status_message("Complete all required options.", true)
        return;
    }

    var screensaver = document.querySelector('#screensaver:checked') == null ? false : true;

    chrome.storage.sync.set({
        redmineurl: url,
        enable_screensaver: screensaver
    }, function() {
        update_status_message("Options Saved.", false)
    });
}

function update_status_message(message, alert) {
    var status = document.getElementById('status');
    status.style.display = 'block';

    if(alert == true) {
        document.getElementById('url').style.border = "1px solid red";
        status.classList.add('alert-danger');
    } else {
        document.getElementById('url').style.border = "1px solid initial";
        status.classList.add('alert-success');
    }

    status.textContent = message;
    setTimeout(function() {
        status.textContent = '';
        status.style.display = 'none';
        status.classList.remove('alert-danger');
        status.classList.remove('alert-success');
        document.getElementById('url').style.border = "1px solid #ccc";
    }, 2000);
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get('redmineurl', function(items) {
        if(typeof items.redmineurl != 'undefined' && items.redmineurl != "") {
            document.getElementById('url').value = items.redmineurl;
        }
    });

    chrome.storage.sync.get('enable_screensaver', function(items) {
        if(typeof items.enable_screensaver != 'undefined' && items.enable_screensaver != "") {
            document.querySelector('#screensaver').checked = items.enable_screensaver;
        }
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);