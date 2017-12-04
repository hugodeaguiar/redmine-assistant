var tab;

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

function update_status(status) {
	document.getElementById('status').textContent = status;
}

function run_action() {
	var statusElement = document.getElementById('status');
	var current_status = statusElement.textContent;

	switch(statusElement.dataset.status) {
		case 'start':
			chrome.tabs.executeScript(tab.id, {
				code : "document.getElementById('time-logger-menu').querySelector('a.icon-start').click(); document.getElementById('time-logger-menu').querySelector('.icon').textContent;"
			}, update_status(status));
			break;
		case 'pause':
		break;
	}
}

function active_assistant() {
	get_redmine_url((url) => {
		if(url !== false) {
			var queryInfo = {};
			chrome.tabs.query(queryInfo, function (tabs) {
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
						status = status[0];
						if(typeof status != 'undefined' && status != "") {
							var statusElement = document.getElementById('status');
							statusElement.textContent = status;

							status = status.toLowerCase();

							if(status.indexOf("iniciar") != -1 || status.indexOf("start") != -1 || status.indexOf("play") != -1) {
								statusElement.dataset.status = 'start';
							} else if(status.indexOf("pausar") != -1 || status.indexOf("pause") != -1) {
								statusElement.dataset.status = 'pause';
							} else {
								statusElement.dataset.status = '';
							}
						} else {
							document.getElementById('status').textContent = "ABA NÃO ENCONTRADA";
						}
					});
				} else {
					document.getElementById('status').textContent = "ABA NÃO ENCONTRADA";
				}
			});
		}
	});
}

document.addEventListener('DOMContentLoaded', active_assistant);
document.getElementById('status').addEventListener("click", run_action);