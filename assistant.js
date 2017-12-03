function get_redmine_url(callback) {
	var url;

	chrome.storage.sync.get('redmineurl', function(items) {
	    url = items.redmineurl;

    	if(typeof url == 'undefined' || url == "") {
			callback(false);
		}

		url = url.toLowerCase();
		url = remove_protocol(url, true);
		url = remove_protocol(url, false);

		callback(url);
	});
}

function remove_protocol(url, ssl) {
	var stringProtocol = ssl == true ? 'https://' : 'http://';
	var protocolIndex = url.indexOf(stringProtocol);

	if(protocolIndex != -1) {
		var initialIndex = ssl == true ? 8 : 7;
		url = url.substring(initialIndex);
	}

	return url;
}

function update_status() {
	document.getElementById('status').textContent = status;
}

function active_assistant() {
	get_redmine_url((url) => {
		if(url !== false) {
			var queryInfo = {};
			chrome.tabs.query(queryInfo, function (tabs) {
				var tab;
				for(i in tabs) {
					if(tabs[i].url.indexOf(url) != -1) {
						tab = tabs[i];
						break;
					}
				}

				if(typeof tab != 'undefined' && tab != "") {
					chrome.tabs.executeScript(tab.id, {
						code : "document.getElementById('time-logger-menu').querySelector('.icon').textContent;"
					}, function(status) {
						document.getElementById('status').textContent = status;
					});
				}
			});
		}
	});
}

document.addEventListener('DOMContentLoaded', active_assistant);