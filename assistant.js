var Helper = {
	show_spinner : function() {
		document.getElementById('container').style.display = "none";
		document.getElementById('spinner').style.display = "block";
	},

	hide_spinner : function() {
		setTimeout(function() {
			document.getElementById('container').style.display = "block";
			document.getElementById('spinner').style.display = "none";
		}, 300);
	},

	isEmpty : function(variable) {
		if(typeof variable == 'undefined' || variable == "" || variable == null) {
			return true;
		}

		return false;
	},

	remove_protocol : function(url, ssl) {
		var stringProtocol = ssl == true ? 'https://' : 'http://';
		var protocolIndex = url.indexOf(stringProtocol);

		if(protocolIndex != -1) {
			var initialIndex = ssl == true ? 8 : 7;
			url = url.substring(initialIndex);
		}

		return url;
	},

	execute_script : function(script, callback) {
		Helper.show_spinner();
		chrome.tabs.executeScript(Assistant.tab.id, {
			code : script
		}, function(response) {
			Helper.hide_spinner();
			callback(response);
		});
	},

	get_redmine_url : function(callback) {
		var url;

		chrome.storage.sync.get('redmineurl', function(items) {
		    url = items.redmineurl;

	    	if(typeof url == 'undefined' || url == "") {
	    		document.getElementById('options').style.display = "inline-block";
				callback(false);
			} else {
				url = url.toLowerCase();
				url = Helper.remove_protocol(url, true);
				url = Helper.remove_protocol(url, false);
	    		document.getElementById('options').style.display = "none";
				callback(url);
			}
		});
	},

	options_redirect : function() {
		var options_url = chrome.extension.getURL("options.html");

		chrome.tabs.create({ url: options_url });
	}
};

var Assistant = {
	tab : false,

	active_assistant : function() {
		Helper.get_redmine_url((url) => {
			if(url !== false) {
				var queryInfo = {};
				chrome.tabs.query(queryInfo, function (tabs) {
					for(i in tabs) {
						if(tabs[i].url.indexOf(url) != -1) {
							Assistant.tab = tabs[i];
							break;
						}
					}

					if(typeof Assistant.tab != 'undefined' && Assistant.tab != "") {
						Helper.execute_script("document.querySelector('a[data-replace=\"#time-logger-menu\"]').className;", Assistant.get_current_status_callback)
					} else {
						document.getElementById('status').textContent = "ABA NÃO ENCONTRADA";
					}
				});
			}
		});
	},


	run_action : function() {
		var statusElement = document.getElementById('status');
		var current_status = statusElement.textContent;

		switch(statusElement.dataset.status) {
			case 'start':
				chrome.tabs.executeScript(tab.id, {
					code : "document.getElementById('time-logger-menu').querySelector('a.icon-start').click();"
				}, Assistant.update_status(status));
				break;
			case 'pause':
			break;
		}
	},

	// icon icon-start
	// icon-action icon-pause-action
	// icon-action icon-start-aciton
	get_current_status_callback : function(response) {
		var class_name = response[0];

		if(Helper.isEmpty(class_name) == false) {
			class_name = class_name.split(' ');

			Assistant.update_class_name(class_name);

			Helper.execute_script("document.querySelector('a[data-replace=\"#time-logger-menu\"]').textContent;", set_current_status)
		} else {
			Assistant.update_status('Nenhum tarefa em execução');
		}
	},

	set_current_status  : function(response) {
		var status = response[0];

		Assistant.update_status(status);
	},

	update_status : function(status) {
		document.getElementById('status').textContent = status;
	},

	update_class_name : function(class_name) {
		document.getElementById('status').className = class_name;
	}
};

document.addEventListener('DOMContentLoaded', Assistant.active_assistant);
document.getElementById('status').addEventListener("click", Assistant.run_action);
document.getElementById('options').addEventListener("click", Helper.options_redirect);