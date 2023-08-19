/*Copyright (c) 2014 - 2023 Citrix Systems, Inc.All Rights Reserved. Confidential & Proprietary.
The materials in this file are protected by copyright and other intellectual property laws.
Copying and use is permitted only by end users to enable use of Citrix server technology.
Any other reproduction or use of this file, or any portion of it, is unlicensed.
In no event may the file be reverse engineered or may copies be made in association with deobfuscation, decompilation or disassembly.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

var isUT = ((typeof dependency) !== "undefined") && dependency.testEnv;
function getQueryParams(){
	var tempQueryParams = {};
	var temp = location.href.split('?');
	if(temp && temp[1]){
		var key_Values = temp[1].split('&');
		for (var i = 0; i < key_Values.length; i++) {
			var key_Value = key_Values[i].split("=");
			if (key_Value.length == 2)
				tempQueryParams[key_Value[0]] = key_Value[1];
		}
	}
	return tempQueryParams;
}

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

function addScriptToLauncher(filelist, onSuccessCallback, onErrorCallback) {
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
		document.body.appendChild(script);
	}
}

if(typeof window != "undefined" )
{

	var icaData = "";
	//PWA File handler API support
	if ('launchQueue' in window) {
		console.log('File handling API is supported!');

		window.launchQueue.setConsumer(async (launchParams) => {
			await handleFiles(launchParams.files);
		});
	}
	async function handleFiles(files) {
		for (const file of files) {
			const blob = await file.getFile();
			blob.handle = file;
			const text = await blob.text();
			icaData = text;
		}
	}


		var engine;
		var sessionId;
		var isPWAEnabledAtServer;
		globalThis["SRIOfScripts"] = {};//TODO when CDN implemented for On Prem. Declaring this to avoid errors in code.
		/*
		* Will be relative path for session launch via Storefront.
		* In case of session launch via SDK then we need client path. This will be set in HDXLauncher.js for SDK.
		*/
		globalThis["clientURL"] = "../";
		globalThis["RELATIVE_SOURCE_PATH"] = {
			'filepath' : "src/",                          // src folder path
			'imagepath' : "resources/",                   // resources folder path
			'localizationpath' : "locales/",              // locales folder path
			'thirdpartypath' : "ThirdPartyLibrary/",       // 3rd party lib path
			'workerpath' : "./citrixHTML5Launcher.js",  // main launcher path for worker
			'csspath' : "CascadingStyleSheet/"             // css folder path
		};
		var eventArray = new Array(0);
		var appViewMode = false;// used in session window
		window.isSDK = false;
		var isChromeApp = !!(window && window.chrome && window.chrome.storage);

		//Chrome HDX SDK - To get the launch id to set the session id		
		var hashParams = getHashParams();
		sessionId = (hashParams && hashParams["launchid"])? hashParams["launchid"] : null;

		//Redirect to StoreURL. This query param will be sent by PWA starturl
		if(hashParams && hashParams["redirectToStore"]){
			// Sample value : https://awddc1-0001.bvt.local/Citrix/StoreWeb/clients/HTML5Client/src/SessionWindow.html?redirectToStore=https://awddc1-0001.bvt.local/citrix/storeweb/
			window.location.replace(hashParams["redirectToStore"]);
		}

		//Chrome HDX SDK - To check if the session is embedded using appview
		var queryParams = getQueryParams();

		isPWAEnabledAtServer = (queryParams && queryParams["pwaenabled"]) === undefined ? false : queryParams["pwaenabled"];
		appViewMode = (queryParams && queryParams["appView"]) ? queryParams["appView"] : false;
		if(appViewMode == 'true'){
			appViewMode = true;
		}
		var engineType = "HTML5Engine";
		var selfDomain = window.location.origin ? window.location.origin : (window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''));
		window.isCloudStore = false;//Assuming false by default

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
			engine = new globalThis["HTML5Engine"]( );
			engine.setSessionId(sessionId);
			engine.setPWAEnabled && engine.setPWAEnabled(isPWAEnabledAtServer);
			engine.setParameter({'ui':{'root':"citrixuiElement"}});
			engine.setParameter({'ica':{'type':"unknown"}});
			engine.setParameter({'icaData': icaData});
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

			//Setting configuration path to null, sets it to default path - HTML5Client/Configuration.js
			engine.setConfigurationPath(null);
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
		
		//Loads the log dependent files 
		function openLogPage(){
			var uiElement = document.getElementById("citrixuiElement");
			uiElement.parentElement.removeChild(uiElement);			
			
			globalThis["loadDependentFiles"]({
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
									if(!window.isSDK && !globalThis["g"].environment.receiver.isChromeApp) {
										if((typeof globalThis["Store"] !== "undefined") && (typeof globalThis["Store"].utils !== "undefined") && (typeof globalThis["Store"].utils.isCloud !== "undefined")) {
											globalThis["Store"].utils.isCloud(window.location.origin, function (isCloud) {
												window.isCloudStore = isCloud;
												console.log("LoadEngine :|: isCloudStore :|: ", window.isCloudStore)
												addScriptToLauncher([globalThis["clientURL"] + "src/SessionWindow.js"], startHTMLSession, closeHTML5Session);
											});
										}
										else{
											addScriptToLauncher([globalThis["clientURL"] + "src/SessionWindow.js"], startHTMLSession, closeHTML5Session);
										}
									}else{
										addScriptToLauncher([globalThis["clientURL"] + "src/SessionWindow.js"], startHTMLSession, closeHTML5Session);
									}
									break;
				case 'shield':
					addScriptToLauncher([globalThis["clientURL"] + "AppVariableScope/ScopeDeclaration.js",globalThis["clientURL"] + "src/ShieldEngine.js"], () => {
						let shieldEngine = new globalThis["ShieldEngine"]();
						shieldEngine.init(addScriptToLauncher, globalThis["parent"]["HTML5_CONFIG"]);
					}, () => {
						window.close();
					});
					break;
				case 'log':			
									addScriptToLauncher([globalThis["clientURL"] + "src/Business/Logger/log.js"], openLogPage, function(){
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

		function loadScriptAndInitMainEngine() {
			const filesToLoad = [
				globalThis["clientURL"] + "src/Business/Logger/log.js",
				globalThis["clientURL"] + "AppVariableScope/ScopeDeclaration.js",
				globalThis["clientURL"] + "src/LegacyBrowserCheck.js"
			];
			addScriptToLauncher(filesToLoad, function () {
				globalThis["LegacyBrowserCheck"].isLegacyBrowser(globalThis["clientURL"], addScriptToLauncher,function (result) {
					if (result) {
						globalThis["clientURL"] = "../legacy/";
						console.log("citrixHTML5Launcher :  Browser detected as Legacy");
					}
					loadEngine();
				});
			}, function (err) {
				console.log("Unable to check if browser is legacy, assuming it's a modern browser", err);
				loadEngine();
			});
		}

		function registerServiceWorker() {
			if (navigator["serviceWorker"] && !isChromeApp) {
				navigator["serviceWorker"]["register"]("../ServiceWorker.js", {scope: '../'})
					.then(function (registration) {
						console.log("Service worker is registered with the scope: ", registration.scope);
					});
			} else {
				console.log('Service worker is not supported');
			}
		}

		function unRegisterServiceWorker() {
			if (navigator["serviceWorker"] && !isChromeApp) {
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
			globalThis["LOCAL_STORAGE"]["localStorage"]["getItemPromise"]('launchUiImprovement').then((obj) => {
				launchUiLoader["isFeatureEnabled"] = globalThis["LAUNCH_UI_LOADER"]["evaluateLauncherFeatureFlag"](obj);
				if(launchUiLoader["isFeatureEnabled"]){
					registerServiceWorker();
				} else{
					unRegisterServiceWorker();
				}
				if (launchUiLoader["isFeatureEnabled"] && engineType === 'HTML5Engine') {
					let ajaxHeader = {};
					let icaParams = {};
					icaLoader["parseUrlParams"](icaParams, ajaxHeader);
					icaParams["eventArray"] = eventArray;
					icaLoader["getIcaData"](icaParams, ajaxHeader);
				} else {
					// Setting the featureflag as false to prevent any other calls to LAUNCH_UI_LOADER other than HTML5Engine engine type
					launchUiLoader["isFeatureEnabled"] = false;
					launchUiLoader["ui"]["hide"]();
				}
				loadScriptAndInitMainEngine();
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
	globalThis["HTML5LocationParam"] = new Array(0);
	(function() {	
		globalThis["HTML5LocationParam"] = getQueryParams();
	})();
	importScripts(globalThis["HTML5LocationParam"]["filepath"] + "workerhelper.js");
}
