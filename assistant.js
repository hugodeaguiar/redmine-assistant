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
				document.getElementById('action-button').style.display = "none";
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
	},

	save_option : function(data) {
	    chrome.storage.sync.set(data);
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

					if(!Helper.isEmpty(Assistant.tab)) {
						Helper.execute_script("document.querySelector('a[data-replace=\"#time-logger-menu\"]').className;", Assistant.get_current_status_callback)
					} else {
						document.getElementById('action-button').style.display = "none";
						document.getElementById('status').textContent = "ABA NÃO ENCONTRADA";
					}
				});
			}
		});
	},


	run_action : function() {
		var actionButton 	= document.getElementById('action-button');
		var class_name 		= actionButton.className;

		if(class_name.indexOf('play-button') != -1) {
			Assistant.change_task('pause');
		} else if(class_name.indexOf('pause-button' != -1)) {
			Assistant.change_task('start');
		}
	},

	change_task : function(state) {
		Helper.execute_script("document.querySelector('a[data-replace=\"#time-logger-menu\"]').click();", (response) => {
			setTimeout(function() {
				Assistant.changeActionButton(state);
				Assistant.getTaskNumber();
			}, 300);
		});
	},

	// icon icon-start
	// icon-action icon-pause-action
	// icon-action icon-start-aciton
	get_current_status_callback : function(response) {
		var class_name = response[0];

		if(Helper.isEmpty(class_name) == false) {
			Assistant.update_class_name(class_name);
			var state = false;

			if(class_name.indexOf('icon-pause-action') != -1) {
				state = 'pause';
			} else if(class_name.indexOf('icon-start-action') != -1 || class_name.indexOf('icon-start') != -1) {
				state = 'start';
			} else {
				Helper.execute_script("document.querySelector('a[data-replace=\"#time-logger-menu\"]').textContent;", Assistant.set_current_status)
			}

			if(state != false) {
				Assistant.changeActionButton(state);
				Assistant.getTaskNumber();
			}
		} else {
			document.getElementById('action-button').style.display = "none";
			Assistant.update_status('Nenhuma tarefa em execução');
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
	},

	changeActionButton : function(state) {
		var button = document.getElementById('action-button');

		if(state == 'start') {
			button.classList.remove('pause-button');
			button.className = 'play-button';
		} else {
			button.classList.remove('play-button');
			button.className = 'pause-button';
		}
	},

	getTaskNumber : function(time) {
		Helper.execute_script("document.querySelector('#time-logger-menu a.icon').textContent", (task) => {
			Assistant.update_status(task[0]);
		});
	},

	screensaver_monitor : function() {
		chrome.storage.sync.get('enable_screensaver', function(items) {
			if(items.enable_screensaver == true) {
				chrome.idle.setDetectionInterval(15);
				chrome.idle.onStateChanged.addListener(function(state) {
					if(state == 'idle' || state == 'locked') {
						if(document.getElementById('action-button').className.indexOf('pause-button') != -1) {
							Helper.save_option({auto_update : true})
							Assistant.run_action();
						}
					} else if(state == 'active') {
					    chrome.storage.sync.get('auto_update', function(items) {
					        if(!Helper.isEmpty(items.auto_update) && items.auto_update == true) {
								Helper.save_option({auto_update : false})
								Assistant.run_action();
							}
					    });
					}
				});
			}
	    });
	}
};

document.addEventListener('DOMContentLoaded', Assistant.active_assistant);
document.getElementById('action-button').addEventListener("click", Assistant.run_action);
document.getElementById('options').addEventListener("click", Helper.options_redirect);

document.addEventListener('DOMContentLoaded', Assistant.screensaver_monitor);