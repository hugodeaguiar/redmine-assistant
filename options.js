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

    chrome.storage.sync.set({
        redmineurl: url
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
        document.getElementById('url').value = items.redmineurl;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);