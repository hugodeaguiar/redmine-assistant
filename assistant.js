var tab, current_status;

function isEmpty(variable) {
	if(typeof variable == 'undefined' || variable == "" || variable == null) {
		return true;
	}

	return false;
}

function get_redmine_url(callback) {
	var url;

	chrome.storage.sync.get('redmineurl', function(items) {
	    url = items.redmineurl;

    	if(typeof url == 'undefined' || url == "") {
    		document.getElementById('options').style.display = "inline-block";
			callback(false);
		} else {
			url = url.toLowerCase();
			url = remove_protocol(url, true);
			url = remove_protocol(url, false);
    		document.getElementById('options').style.display = "none";
			callback(url);
		}
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

function options_redirect() {
	var options_url = chrome.extension.getURL("options.html");

	chrome.tabs.create({ url: options_url });
}


function execute_script(script, callback) {
	chrome.tabs.executeScript(tab.id, {
		code : script
	}, function(response) {
		callback(response);
	});
}

// icon icon-start
// icon-action icon-pause-action
// icon-action icon-start-aciton
function get_current_status_callback(response) {
	var class_name = response[0];

	if(isEmpty(class_name) == false) {
		class_name = class_name.split(' ');

		update_class_name(class_name);

		execute_script("document.querySelector('a[data-replace=\"#time-logger-menu\"]').textContent;", set_current_status)
	} else {
		update_status('Nenhum tarefa em execução');
	}
}

function set_current_status(response) {
	var status = response[0];

	update_status(status);
}

function update_status(status) {
	document.getElementById('status').textContent = status;
}

function update_class_name(class_name) {
	document.getElementById('status').className = class_name;
}

function run_action() {
	var statusElement = document.getElementById('status');
	var current_status = statusElement.textContent;

	switch(statusElement.dataset.status) {
		case 'start':
			chrome.tabs.executeScript(tab.id, {
				code : "document.getElementById('time-logger-menu').querySelector('a.icon-start').click();"
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
					execute_script("document.querySelector('a[data-replace=\"#time-logger-menu\"]').className;", get_current_status_callback)
				} else {
					document.getElementById('status').textContent = "ABA NÃO ENCONTRADA";
				}
			});
		}
	});
}

document.addEventListener('DOMContentLoaded', active_assistant);
document.getElementById('status').addEventListener("click", run_action);
document.getElementById('options').addEventListener("click", options_redirect);