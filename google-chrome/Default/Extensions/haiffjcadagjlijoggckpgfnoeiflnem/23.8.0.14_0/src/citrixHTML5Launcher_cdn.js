/*Copyright (c) 2014 - 2023 Citrix Systems, Inc.All Rights Reserved. Confidential & Proprietary.
The materials in this file are protected by copyright and other intellectual property laws.
Copying and use is permitted only by end users to enable use of Citrix server technology.
Any other reproduction or use of this file, or any portion of it, is unlicensed.
In no event may the file be reverse engineered or may copies be made in association with deobfuscation, decompilation or disassembly.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

var isUT = ((typeof dependency) !== "undefined") && dependency.testEnv;
var citrixHTML5Launcher_cdn = (function(){

	function addScriptWithSRI(filelist, onSuccessCallback, onErrorCallback) {
		var loadedFileCount = 0;
		var totalFileCount = filelist.length;
		var errorStatus = false;

		function onload() {
			loadedFileCount ++;
			if(totalFileCount === loadedFileCount) {
				errorStatus ? onErrorCallback() : onSuccessCallback();
			}
		}
		function onLoadSuccess() {
			onload();
		}

		function onLoadError() {
			errorStatus = true;
			onload();
		}

		for(var i = 0; i < totalFileCount; i++) {
			var script = document.createElement('script');
			script.src = filelist[i];
			script.async = false;
			script.onload = onLoadSuccess;
			script.onerror = onLoadError;
			var fileName = script.src.split("/");
			fileName = fileName[fileName.length-1];
			if(typeof globalThis["SRIOfScripts"] !== "undefined" && globalThis["SRIOfScripts"][fileName]){
				script["integrity"] = globalThis["SRIOfScripts"][fileName];
				script["crossOrigin"] = "anonymous";
			}
			document.body.appendChild(script);
		}
}

	// This function retrieves hash params from the url
	// Ex: for URL - https://<fqdn>/Citrix/StoreWeb/clients/HTML5Client/cdn/SessionWindow.html?launchid=1679634771394
	// The function will retrieve launchid param and it's value
	function getHashParams(){
		var tempHashParams = {};
		var temp = location.href.split('?');
		if(temp && temp[1]){
			var key_Values = temp[1].split('#');
			if(key_Values){
				for (var i = 0; i < key_Values.length; i++) {
					var key_Value = key_Values[i].split("=");
					if (key_Value.length == 2)
						tempHashParams[key_Value[0]] = key_Value[1];
				}
			}
		}
		return tempHashParams;
	}

if(typeof window != "undefined" )
{
		var engine;
		var eventArray = new Array(0);
		var version = "23.8.0.14"; // This should be updated during build.
		globalThis["clientURL"]  = CDN_BASE_URL+version+"/HTML5Out/";
  		window.configurationPath = window.clientURL; //We will always pick configuration from one location that is outer one
		globalThis["RELATIVE_SOURCE_PATH"]  = {
		'filepath' : "src/",                          // src folder path
		'imagepath' : "resources/",                   // resources folder path
		'localizationpath' : "locales/",              // locales folder path
		'thirdpartypath' : "ThirdPartyLibrary/",       // 3rd party lib path
		'workerpath': "./citrixHTML5Launcher." + version + ".js",  // main launcher path for worker
		'csspath' : "CascadingStyleSheet/"             // css folder path
	};

		var sessionId;

		var hashParams = getHashParams();
		sessionId = (hashParams && hashParams["launchid"])? hashParams["launchid"] : null;

		var engineType = "HTML5Engine";
		var preferredLang;
		var selfDomain = window.location.origin ? window.location.origin : (window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''));
		window.isCloudStore = true; //This file gets loaded only for cloud stores with cdn implementation, so assigning as true

		//Engine type to load log or multimonitor page
		function fetchEngineType(){
			var key_Values = location.href.split('#');

			if(key_Values[1]){
				//Fetching the engineType
				var key_Value = key_Values[1].split("=");
				if (key_Value.length == 2 && key_Value[0] === "engineType"){
					engineType = key_Value[1];
				}
			}
		}

		function startHTMLSession( ){
			engine = new HTML5Engine();
			engine.setConfigurationPath(window.configurationPath);
			engine.setSessionId(sessionId);
			engine.setParameter({
				'sourcecode' : {
					'filepath' : globalThis["clientURL"]+ globalThis["RELATIVE_SOURCE_PATH"]['filepath'],                          // src folder path
					'imagepath' : globalThis["clientURL"]+globalThis["RELATIVE_SOURCE_PATH"]['imagepath'],                   // resources folder path
					'localizationpath' : globalThis["clientURL"]+globalThis["RELATIVE_SOURCE_PATH"]['localizationpath'],              // locales folder path
					'thirdpartypath' : globalThis["clientURL"]+globalThis["RELATIVE_SOURCE_PATH"]['thirdpartypath'],       // 3rd party lib path
					'workerpath' : globalThis["RELATIVE_SOURCE_PATH"]['workerpath'],  // main launcher path for worker
					'csspath' : globalThis["clientURL"]+globalThis["RELATIVE_SOURCE_PATH"]['csspath']             // css folder path
				}
            });

			engine.setParameter({'ui':{'root':"citrixuiElement"}});
			engine.setParameter({'ica':{'type':"unknown"}});

			//To translate based on the browser's langugage
			var lang = (!preferredLang)?navigator.language : preferredLang;
			if(lang==null || lang==undefined){
				lang = navigator.browserLanguage; //IE 10 returns navigator.language as undefined.
			}
			engine.setParameter({'preferences' : {'lang' : lang }});

			engine.initEngine( );
			if(eventArray.length > 0){
				engine.handleMessage(eventArray, eventArray.length);
				eventArray = new Array(0);
			}
		}
		//If SessionWindow.js file is not reachable then throw onConnectionClosed event
		function closeHTML5Session(){
			var parentWindow = (window.opener || window.parent);
			if(parentWindow){
				parentWindow.postMessage({"type":"onConnectionClosed","sessionId": sessionId,"data":"UNREACHABLE_CLIENT","source":"HTML5Client"},selfDomain);
			}
			window.close();
		}

		function openLogPage(){
			var uiElement = document.getElementById("citrixuiElement");
			uiElement.parentElement.removeChild(uiElement);

			loadDependentFiles({
				'sourcecode' : {
					'localizationpath' : globalThis["clientURL"]+globalThis["RELATIVE_SOURCE_PATH"]['localizationpath'],              // locales folder path
					'thirdpartypath' : globalThis["clientURL"]+globalThis["RELATIVE_SOURCE_PATH"]['thirdpartypath'],       // 3rd party lib path
					'csspath' : globalThis["clientURL"]+globalThis["RELATIVE_SOURCE_PATH"]['csspath']             // css folder path
				}
            });
		}

		//Loads appropriate engine
		function loadEngine(){
			fetchEngineType();

			switch(engineType){
				case 'HTML5Engine' :
									addScriptWithSRI([globalThis["clientURL"] + "src/SessionWindow.js"], startHTMLSession, closeHTML5Session);
									break;
				case 'log':
									addScriptWithSRI([globalThis["clientURL"] + "src/Business/Logger/log.js"], openLogPage, function(){
										window.close();
									});
									break;
				case 'displayWindow' : //Do nothing added as placeholder to handle anything in future if required
											break;
				default :
						console.log("Unrecognized engine type");
						break;
			}
		}

		//if CDN is inaccessible then falling back to locally installed engine path
		function loadScriptAndInitMainEngine(loadEngineCallback) {
			if ('undefined' === typeof globalThis["SRIOfScripts"]) {
				globalThis["clientURL"] = "../";
				window.configurationPath = globalThis["clientURL"]; //configuration path is set to outer folder path, which will be used irrespective of legacy or non-legacy browser
			}
			const filesToLoad = [
				globalThis["clientURL"] + "src/Business/Logger/log.js",
				globalThis["clientURL"] + "AppVariableScope/ScopeDeclaration.js",
				globalThis["clientURL"] + "src/LegacyBrowserCheck.js"
			];
			//sets the 'clientURL' based on underlying browser. Loading engine, even if we fail to check browser
			addScriptWithSRI(filesToLoad, function () {
				LegacyBrowserCheck.isLegacyBrowser(globalThis["clientURL"], addScriptWithSRI, function (result) {
					if (result) {
						globalThis["clientURL"] = globalThis["clientURL"] + "legacy/";
						addScriptWithSRI([globalThis["clientURL"] + "SRI.js"], loadEngineCallback);
						console.log("citrixHTML5Launcher_cdn :  Browser detected as Legacy");
					} else {
						loadEngineCallback();
					}
				});
			}, function (err) {
				console.log("Unable to check if browser is legacy, assuming it's a modern browser", err);
				loadEngineCallback();
			});
		}

		function registerServiceWorker() {
			if (navigator["serviceWorker"]) {
				navigator["serviceWorker"]["register"]("./ServiceWorker.js", {scope: "./"})
					.then(function (registration) {
						console.log("Service worker is registered with the scope: ", registration.scope);
					});
			} else {
				console.error('Service worker is not supported');
			}
		}

		function unRegisterServiceWorker() {
			if (navigator["serviceWorker"]) {
				navigator["serviceWorker"]["getRegistrations"]().then(function(registrations) {
					for(let registration of registrations) {
						if(registration["scope"]["includes"]("clients/HTML5Client")){
							registration["unregister"]();
							console.log("Service worker is unregistered");
						}
					}
				});
			}
		}

		if(!isUT) {
			fetchEngineType();
			let icaLoader = globalThis["ICA_LOADER"];
			let launchUiLoader = globalThis["LAUNCH_UI_LOADER"];
			let launcherEnhancementFeatureFlag;
			globalThis["LOCAL_STORAGE"]["localStorage"]["getItemPromise"]('launchUiImprovement').then((obj)=>{
				launcherEnhancementFeatureFlag = globalThis["LAUNCH_UI_LOADER"]["evaluateLauncherFeatureFlag"](obj);
				if(launchUiLoader["isFeatureEnabled"]){
					registerServiceWorker();
				} else{
					unRegisterServiceWorker();
				}
				if (launcherEnhancementFeatureFlag && engineType === 'HTML5Engine'){
					let ajaxHeader = {};
					let icaParams = {};
					icaLoader["parseUrlParams"](icaParams, ajaxHeader);
					icaParams["eventArray"] = eventArray;
					icaLoader["getIcaData"](icaParams, ajaxHeader);
				} else {
					// Setting the featureflag as false to prevent any other calls to LAUNCH_UI_LOADER
					launchUiLoader["isFeatureEnabled"] = false;
					launchUiLoader["ui"]["hide"]();
				}
				loadScriptAndInitMainEngine(loadEngine);
			}).catch((e) => {
				console.error("Error in Fetching Launcher UI Feature Flag", e["message"]);
			});
		}

	// To be used when posting ICA data via message to HTML5 Workspace app
		window.addEventListener("message", function(event) {
			if (engine) {
				engine.handleMessage(event);
			}else{
				eventArray[eventArray.length] = event;
			}		
		}, false);	
  
}else{
	globalThis["HTML5LocationParam"] = {};
	(function() {
		var key_Values = location.href.split('?')[1].split('&');
		for (var i = 0; i < key_Values.length; i++) {
			var key_Value = key_Values[i].split("=");
			if (key_Value.length == 2)
				globalThis["HTML5LocationParam"][key_Value[0]] = key_Value[1];
		}
	})();
	importScripts(globalThis["HTML5LocationParam"]["filepath"] + "workerhelper.js");
}

	
})();
