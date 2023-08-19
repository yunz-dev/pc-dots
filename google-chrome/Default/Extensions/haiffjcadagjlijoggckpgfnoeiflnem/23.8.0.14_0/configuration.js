/*Copyright (c) 2014 - 2023 Citrix Systems, Inc.All Rights Reserved. Confidential & Proprietary.
The materials in this file are protected by copyright and other intellectual property laws.
Copying and use is permitted only by end users to enable use of Citrix server technology.
Any other reproduction or use of this file, or any portion of it, is unlicensed.
In no event may the file be reverse engineered or may copies be made in association with deobfuscation, decompilation or disassembly.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

globalThis["HTML5_CONFIG"] = {
	'type':'update',
	'vc_channel' : {
	},
	'userinput' : {
		'mousetimer' : '*'
	},
	'analytics' : {
		'enabled' : true,
		'sendPublicIPToCAS': true,
		"connectionEnabled" : true
	},
	'thirdPartyServices' :{
		'enableLaunchDarkly' : true
	},
	'ui' : {
		'toolbar' : {
			'menubar':true,
			'clipboard':true,
			'usb': true,
			'fileTransfer':true,
			'about':true,
			'lock':true,
			'disconnect':true,
			'logoff':true,
			'fullscreen':true,
			'keyboard':true,
			'multitouch':true,
			'switchApp':true,
			'preferences':true,
			'gestureGuide':true,
			'viewLogs':true,
			'multiMonitor' :true,
			'multiMonitorDialog' :false,
			'displayResolution' : true,
			'cdm' : true
		},
		"hide":{
			"urlredirection" : false,
			"error" : false,
			'ftu' : false,
			'printDialog': false,
			"clipboardOnBoarding":true,
			"copyToDeviceConfirmation" : false,
			"highDPIOnBoarding" : true,
			"windowPlacementDenyDialog": false
		},
		'sessionsize' : {
			'minwidth' : 240, 
			'minheight' : 120,
			'available' : {
				"default" : "Fit_To_Window",
				"values" : ["Fit_To_Window", "Use_Device_Pixel_Ratio","1280x800","1440x900","1600x1200"]	
			}
		},
		'appSwitcher': {
				'enhancedAppSwitcher': true,
				'showTaskbar': true,
				'showAutoHide': false,
				'autoHide': false,
				'showIconsOnly': false
		},
		'handleMouseCursorUsingDivForIE' : true,
		'resizeOverlayDuration' : 3500,
		'showServerCursor': true,
		'touch' :{
			'defaultMode' : 'panning', //'panning' and 'multitouch' are the accepted values
			'detectTabletMode' : true,			
			'enableMobileComboBoxRedirection' : true,
			'enablePointerForTouchEvents' : true
		}
	},
	'features' : {
		'ime': {
			'keyboardIMEHotkeys': false,
			'genericIME': false,
			'multiMonitor': true,
			'scancode': false,
			'mode': {}
		},
		'seamlesswindow' : false,
		'seamlessclip' : true,
		'sessionsharing' : true,
		'icaConnectOnAppLaunchFail': true,
		'sendAllKeys' : true,
		'directClipboard':true,
		'accessibility': {
			'enable': false
		},
		'audio' : {
			'HTML5_Audio_Buffer_Duration' : -1,
			'HTML5_Audio_Lag_Threshold': -1,
			'EnableAdaptiveAudio': true,   // Opus Codec
			'EnableStereoRecording': false, // Echo Cancellation will be disabled if this flag is true
			'AudioRedirectionV4': true
		},
		'video':{
			'enable': true,
			'config': {
				'codecType': 1 // 1 - HARDWARE_CODEC with SOFTWARE_CODEC fallback, 2 - Only SOFTWARE_CODEC, 3 - Only HARDWARE_CODEC
			}
		},
		'graphics' : {
			'jpegSupport' : true,
            'avoidCache' : true,
            'selectiveH264' : true,
            'useGlTexH264': true,
			'h264Support' : {
				'enabled' : true,
				'losslessOverlays' : true,
				'dirtyRegions' : true,
				'yuv444Support' : false
			},
            'noWaitForSpaceEx': false,
            "useThinwireV2" : true,
            'spanMonitorSubset':true,
			'multiMonitor': true,
			'trueMMSupportForHTML5': true,
            'graphicsWebWorker' : {
				'enabled' : true
            },
			'graphicsWasmRender' : true
		},
		'filetransfer' : {
			'allowupload' : true,
			'allowdownload' : true,
			'maxuploadsize'	: 2147483647,//2GB
			'maxdownloadsize' : 2147483647//2GB
		},
		'com':{
			'portname':"COM5"
		},
		'pdfPrinting':{
			'directPrint':{
				'supportedBrowsers':true, //Chrome,Firefox,Chromium Edge
				'IE':false,
				'printResolution':150
			},
			'disableForBrowsers' : [] // Disable PdfPrinting in the browsers mentioned in the array, By Default it's empty
			//	Template Browser String
			// 'ALL', 'MSIE', 'FIREFOX', 'Chrome', 'SAFARI', 'BB10', 'MSEDGE', 'CHROMIUMEDGE'
			// 'ALL' 			- All the browsers - Use 'ALL' if PdfPrinting needs to be disabled for all the browsers
			// 'MSIE' 			- Internet Explorer
			// 'FIREFOX' 		- Firefox
			// 'Chrome' 		- Chrome
			// 'SAFARI' 		- Safari
			// 'BB10' 			- Blackberry
			// 'MSEDGE' 		- Microsoft Edge - EDGE HTML aka Old Edge
			// 'CHROMIUMEDGE' 	- Chromium Edge aka New Edge
		},
		'msTeamsOptimization':{
			'screenSharing' : false,
			'shareAllContent' : false,
			'seamlessApps' : true,
			'webcamSupportInMM' : true,
			'backgroundEffects' : false,
			'originTrialToken' : {
				'chrome': ""
			},
			'includeSelfBrowserSurface' : true
		},
		'keyboard': {
			'captureAllKeys': true //allows or disallows redirecting few additional shortcuts like alt+Tab, Esc, Windows logo key shortcuts like Win+R, Win+X, Win+D etc in fullscreen mode
		},
		'fontAppearance': {
			'enableFontSmoothing' : true, //Enables Font Smoothing info to be sent to server
			'fontSmoothingType' : 2
			// Allowed values for Font Smoothing :
			// * FONT_SMOOTHING_NONE				- 0x0000
			// * FONT_SMOOTHING_STANDARD 			- 0x0001
			// * FONT_SMOOTHING_CLEARTYPE			- 0x0002
			// * FONT_SMOOTHING_SERVER_DEFAULT		- 0x0003
        },
		'edt': {
			'enabled': false,
			'logLevel' : 0
			// Available values for EDT log level
			// NONE (default) - 0
            // ERROR          - 1
            // WARN           - 2
            // DEBUG          - 3
            // VERBOSE        - 4
		},
		'clientDriveMapping': {
			'enabled': true,
			'availableAccessLevels': ["Read-write","Read-only","No-access"],
			'accessLevel': "Read-write"		//This is the default access level and will be applicable for 1st usage only. 2nd time onwards, user's selection will be re-applied.
		},
		// setting for the url redirection
		'UrlRedirection': {
			// if forceOpenInClient true - the url will always open in client browser window with out showing redirection dialog.
			'forceOpenInClient': false
		}
	},
	'customVC':[
		// {"streamName": "<streamName>", 'appId': "<html=https://URL/Thirdparty.html>"}
	],
	'customVCWhitelistURL':[
		// {"url": "<https://FQDN-URL>", "permissions": ["media"]}
	],

	// For debugging purpose - Please use this for clearing WebView cache
	// This setting will be removed in production.
	'customVCWebViewClearCache':{
		'appcache': true,
		'cookies': false,
		'fileSystems': false,
		'indexedDB': false,
		'localStorage': false,
		'webSQL': false,
		'cache': true
	},
	'domain' : {
		//'src':list of domain seperated by ;
		//'message':
	},
	'hardware' : {
		'webgl' : true,
		'webglSubTex' : true,
		'webglHighPrecision': true
	},
	'transport' : {
		'outbufscountclient' : 100,
		'outbufscounthost' : 100,
		'cgpEnabled' : true,
		'wasmCgpEnabled' : true,
		'aggressiveSRTrigger': false,
        'webTransport' : false
	},
	'other' : {
		'sec_protocol' : "",
		'workerdisable' : false,
		'h264nonworker' : false
	},
	'fpsMeter':{
		'visibility':false,
		'updateFrequency':0 // fps update frequence in secs
	},
	'ica' : {
		'fullSizedVirtualWrites' : true,
		'v4Reducer' : true
	},
	//Preferences for chrome app
	'appPrefs':{
		'chromeApp':{
			'ui' : {
				'toolbar' : {
					'menubar':true,
					'clipboard': false,
					'usb' : true,
					'fileTransfer':true
				},
				"sessionsize": {
            		"windowstate": "maximized"
        		},
				"netPromoters" : true,
				"splashScreen" : false,
				"assistiveCursor" : false,
				'refreshStore': false
			},
			'transport' : {
				'nativeSocket' : true
			},
			'features' : {
				'graphics' : {
					'dpiSetting': {
						'scaleToDPI': true
					},
					'multiMonitor': true,
					'kioskMultimonitor' : true
				},
				'ime' : {
					'genericIME': true
				},
				'multipleStores' : {
					'enable': true
				},
				'usb':{
					'resetDevice': false,
					'enableDoubleHop' : true,
					'enableCompositeDeviceSplit': true,
					'allowUserConfigForAutoRedirection': true,
					'enableDDCUSBPolicy': true,
					'enableDefaultAllowPolicy': true
				},
				'networkPrinting':{
					'enable': true
				},
				'shield' : {
					'enable': true,
					//LaunchPreference - IcaOnly, IcaFallbackToLease, LeaseOnly 
					'launchPreference':'IcaFallbackToLease'
				},
				'IWS' : {
					'enable': true
				},
				'bcr': {
					'javascript': {
						'disable': false
					}
				}
			},
			'smartcard' : {
				'managerappid' : 'khpfeaanjngmcnplbdlpegiifgpfgdco'
			},
			'uniqueID' : {
				'prefixKey' : "CR-",
				'restrictNameLength' : false,
				'useAssetID' : false
			},
			'seamless' : {
			}
		}
	}
};
