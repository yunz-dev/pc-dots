/*! For license information please see options.js.LICENSE.txt */
(()=>{var t={544:(t,e,r)=>{"use strict";var o=r(203);Object.defineProperty(e,"__esModule",{value:!0}),e.doInit=function(){if(void 0===localStorage[f]||""==localStorage[f]){var t=new Array({ext:"flv",size:10},{ext:"hlv",size:10},{ext:"f4v",size:10},{ext:"mp4",size:10},{ext:"mp3",size:10},{ext:"wma",size:10},{ext:"wav",size:10},{ext:"m4a",size:10},{ext:"webm",size:10},{ext:"ogg",size:10},{ext:"ogv",size:10},{ext:"acc",size:10},{ext:"mov",size:10},{ext:"mkv",size:10},{ext:"m3u8",size:0},{ext:"ts",size:1e11});localStorage[f]=JSON.stringify(t)}if(void 0===localStorage.Type){var e=new Array({Type:"video/*",size:2048},{Type:"audio/*",size:10});localStorage.Type=JSON.stringify(e)}if(void 0===localStorage.BlockedDomains){var r=new Array;localStorage.BlockedDomains=JSON.stringify(r)}void 0===localStorage.repeat&&(localStorage.repeat=!1),void 0===localStorage.repeatReg&&(localStorage.repeatReg="\\?[\\S]+"),void 0===localStorage.Debug&&(localStorage.Debug=!1),void 0===localStorage.TitleName&&(localStorage.TitleName=!1),void 0===localStorage.popListCount&&(localStorage.popListCount=30),void 0===localStorage.showCountOnIcon&&(localStorage.showCountOnIcon=!0)},e.tr=function(t){$("#"+t).html(m(t))},e.getLanguage=h,e.getExtManifest=function(){return d.runtime.getManifest()},e.isActivePro=S,e.getDLMUrl=function(){var t,e=h(),r="://cococut.net/";return t="other"!=e?"dlm.html":"odlm.html",S()&&(r="://pro.cococut.net/",t="dlm.vhtml","other"==e&&(t="odlm.vhtml")),r+"dlm/"+(g.includes(e)?e+"/":"")+t},e.getLoaderUrl=e.DISABLE_DOWNLOADING_FROM_YOUTUBE_REGEXP=e.supportedLanguages=e.t=e.PRE_DEF_EXTS=e.YTDLUIPAGE=e.YTDLPAGE=e.HOMEPAGE=e.ISEDGE=e.PROENV=void 0;var n,a,i,c=o(r(824)),l=o(r(29)),u=r(692),s=r(962),p=(n=(0,l.default)(c.default.mark((function t(){var e,r,o;return c.default.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return(e=b()).dailycount||(e.dailycount=20),t.next=4,(0,s.getExpItem)("dailyDlCount");case 4:return(r=t.sent)&&r>e.dailycount&&(o="exceeded.html"),t.abrupt("return",o);case 7:case"end":return t.stop()}}),t)}))),function(){return n.apply(this,arguments)}),d=navigator.userAgent.includes("Chrome")?chrome:browser;e.PROENV=!0,e.ISEDGE=!1,e.HOMEPAGE=a,e.YTDLPAGE=i,e.YTDLUIPAGE="https://finditandzip.ga/",e.HOMEPAGE=a="https://cococut.net",e.YTDLPAGE=i="https://pro.cococut.net/yt/";var f="Ext04";e.PRE_DEF_EXTS=f,d.browserAction.setIcon({path:{16:"assets/icons/16x16_gray.png",32:"assets/icons/32x32_gray.png",48:"assets/icons/48x48_gray.png",64:"assets/icons/64x64_gray.png",128:"assets/icons/128x128_gray.png"}});var m=d.i18n.getMessage;e.t=m;var g=["zh_tw","zh_cn"];function h(){var t=d.i18n.getUILanguage();return t.match(/zh-CN/)?"zh_cn":t.match(/zh-TW/)?"zh_tw":t.startsWith("zh")?"zh_cn":t.startsWith("en")?t.substr(0,2):"other"}if(e.supportedLanguages=g,d.runtime.onInstalled.addListener((function(t){var e=h(),r="https://cococut.net/"+(g.includes(e)?e+"/":"")+"installed.html";localStorage.getItem("installed")?chrome.storage.sync.set({installed:"t"}):d.tabs.create({url:r},(function(t){console.log("Hi, wellcome:)"),localStorage.setItem("installed","t"),chrome.storage.sync.set({installed:"t"})}))})),d.runtime.setUninstallURL){var v=h(),y="https://cococut.net/"+(g.includes(v)?v+"/":"")+"uninstalled.html";d.runtime.setUninstallURL(y)}function S(){return!(!localStorage.getItem("pui")||"active"!=(0,u.decipher)("CocoCut pro user")(localStorage.getItem("pui")).split("||")[3])}e.DISABLE_DOWNLOADING_FROM_YOUTUBE_REGEXP=/^https?:\/\/www\.youtube\.com\//;var x,b=function(){var t=localStorage.option,e={counter:0,domain:{}};try{t&&Object.assign(e,JSON.parse(t)),e.counter=Math.max(0,Math.floor(Number(e.counter)||0)),e.rcounterr=Math.max(0,Math.floor(Number(e.rcounterr)||0)),localStorage.option=JSON.stringify(e)}catch(t){console.log(t.stack)}return e},E=(x=(0,l.default)(c.default.mark((function t(){var e,r,o,n,a;return c.default.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e=h(),r="://cococut.net/",o="other"!==e?"hls.html":"ohls.html",t.next=5,p();case 5:return(n=t.sent)&&(o=n),S()&&(r="://pro.cococut.net/",o="hls.vhtml","other"==e&&(o="ohls.vhtml")),a=r+(g.includes(e)?e+"/":"")+o,t.abrupt("return",a);case 10:case"end":return t.stop()}}),t)}))),function(){return x.apply(this,arguments)});e.getLoaderUrl=E},692:(t,e,r)=>{"use strict";var o=r(203),n=r(501);Object.defineProperty(e,"__esModule",{value:!0}),e.setLocalStoreWithExpiry=function(t,e,r){var o={value:e,expiry:(new Date).getTime()+r};localStorage.setItem(t,JSON.stringify(o))},e.getLocalStoreWithExpiry=function(t){var e=localStorage.getItem(t);if(!e)return null;var r=JSON.parse(e);return(new Date).getTime()>r.expiry?(localStorage.removeItem(t),null):r.value},e.remainTimeMinutes=f,e.plusDlCount=e.decipher=e.cipher=e.fetch_retry=e.fetchWithTimeout=void 0;var a=o(r(824)),i=o(r(29)),c=o(r(231)),l=function(t,e){if(t&&t.__esModule)return t;if(null===t||"object"!==n(t)&&"function"!=typeof t)return{default:t};var r=u(e);if(r&&r.has(t))return r.get(t);var o={},a=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var i in t)if("default"!==i&&Object.prototype.hasOwnProperty.call(t,i)){var c=a?Object.getOwnPropertyDescriptor(t,i):null;c&&(c.get||c.set)?Object.defineProperty(o,i,c):o[i]=t[i]}return o.default=t,r&&r.set(t,o),o}(r(962));function u(t){if("function"!=typeof WeakMap)return null;var e=new WeakMap,r=new WeakMap;return(u=function(t){return t?r:e})(t)}function s(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,o)}return r}function p(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?s(Object(r),!0).forEach((function(e){(0,c.default)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):s(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}var d=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:5e3,o=new AbortController,n=p({},e,{signal:o.signal});return setTimeout((function(){o.abort()}),r),fetch(t,n).then((function(t){if(!t.ok)throw new Error("".concat(t.status,": ").concat(t.statusText));return t})).catch((function(t){if("AbortError"===t.name)throw new Error("Response timed out");throw new Error(t.message)}))};function f(){return 1440-60*(new Date).getHours()-(new Date).getMinutes()}e.fetchWithTimeout=d,e.fetch_retry=function t(e,r,o){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1;return d(e,r,o).catch((function(a){if(1===n)throw a;return t(e,r,o,n-1)}))},e.cipher=function(t){var e=function(t){return t.split("").map((function(t){return t.charCodeAt(0)}))},r=function(t){return("0"+Number(t).toString(16)).substr(-2)},o=function(r){return e(t).reduce((function(t,e){return t^e}),r)};return function(t){return t.split("").map(e).map(o).map(r).join("")}},e.decipher=function(t){var e=function(e){return(r=t,r.split("").map((function(t){return t.charCodeAt(0)}))).reduce((function(t,e){return t^e}),e);var r};return function(t){return t.match(/.{1,2}/g).map((function(t){return parseInt(t,16)})).map(e).map((function(t){return String.fromCharCode(t)})).join("")}};var m,g=(m=(0,i.default)(a.default.mark((function t(){var e,r;return a.default.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,l.getExpItem("dailyDlCount");case 2:e=(e=t.sent)?parseInt(e)+1:1,r=60*f()*1e3,l.setExpItem("dailyDlCount",e,r);case 6:case"end":return t.stop()}}),t)}))),function(){return m.apply(this,arguments)});e.plusDlCount=g},842:()=>{},29:t=>{function e(t,e,r,o,n,a,i){try{var c=t[a](i),l=c.value}catch(t){return void r(t)}c.done?e(l):Promise.resolve(l).then(o,n)}t.exports=function(t){return function(){var r=this,o=arguments;return new Promise((function(n,a){var i=t.apply(r,o);function c(t){e(i,n,a,c,l,"next",t)}function l(t){e(i,n,a,c,l,"throw",t)}c(void 0)}))}},t.exports.__esModule=!0,t.exports.default=t.exports},231:(t,e,r)=>{var o=r(40);t.exports=function(t,e,r){return(e=o(e))in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t},t.exports.__esModule=!0,t.exports.default=t.exports},203:t=>{t.exports=function(t){return t&&t.__esModule?t:{default:t}},t.exports.__esModule=!0,t.exports.default=t.exports},337:(t,e,r)=>{var o=r(501).default;function n(){"use strict";t.exports=n=function(){return e},t.exports.__esModule=!0,t.exports.default=t.exports;var e={},r=Object.prototype,a=r.hasOwnProperty,i=Object.defineProperty||function(t,e,r){t[e]=r.value},c="function"==typeof Symbol?Symbol:{},l=c.iterator||"@@iterator",u=c.asyncIterator||"@@asyncIterator",s=c.toStringTag||"@@toStringTag";function p(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{p({},"")}catch(t){p=function(t,e,r){return t[e]=r}}function d(t,e,r,o){var n=e&&e.prototype instanceof g?e:g,a=Object.create(n.prototype),c=new _(o||[]);return i(a,"_invoke",{value:T(t,r,c)}),a}function f(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}e.wrap=d;var m={};function g(){}function h(){}function v(){}var y={};p(y,l,(function(){return this}));var S=Object.getPrototypeOf,x=S&&S(S($([])));x&&x!==r&&a.call(x,l)&&(y=x);var b=v.prototype=g.prototype=Object.create(y);function E(t){["next","throw","return"].forEach((function(e){p(t,e,(function(t){return this._invoke(e,t)}))}))}function w(t,e){function r(n,i,c,l){var u=f(t[n],t,i);if("throw"!==u.type){var s=u.arg,p=s.value;return p&&"object"==o(p)&&a.call(p,"__await")?e.resolve(p.__await).then((function(t){r("next",t,c,l)}),(function(t){r("throw",t,c,l)})):e.resolve(p).then((function(t){s.value=t,c(s)}),(function(t){return r("throw",t,c,l)}))}l(u.arg)}var n;i(this,"_invoke",{value:function(t,o){function a(){return new e((function(e,n){r(t,o,e,n)}))}return n=n?n.then(a,a):a()}})}function T(t,e,r){var o="suspendedStart";return function(n,a){if("executing"===o)throw new Error("Generator is already running");if("completed"===o){if("throw"===n)throw a;return{value:void 0,done:!0}}for(r.method=n,r.arg=a;;){var i=r.delegate;if(i){var c=O(i,r);if(c){if(c===m)continue;return c}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if("suspendedStart"===o)throw o="completed",r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);o="executing";var l=f(t,e,r);if("normal"===l.type){if(o=r.done?"completed":"suspendedYield",l.arg===m)continue;return{value:l.arg,done:r.done}}"throw"===l.type&&(o="completed",r.method="throw",r.arg=l.arg)}}}function O(t,e){var r=e.method,o=t.iterator[r];if(void 0===o)return e.delegate=null,"throw"===r&&t.iterator.return&&(e.method="return",e.arg=void 0,O(t,e),"throw"===e.method)||"return"!==r&&(e.method="throw",e.arg=new TypeError("The iterator does not provide a '"+r+"' method")),m;var n=f(o,t.iterator,e.arg);if("throw"===n.type)return e.method="throw",e.arg=n.arg,e.delegate=null,m;var a=n.arg;return a?a.done?(e[t.resultName]=a.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=void 0),e.delegate=null,m):a:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,m)}function k(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function D(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function _(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(k,this),this.reset(!0)}function $(t){if(t){var e=t[l];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,o=function e(){for(;++r<t.length;)if(a.call(t,r))return e.value=t[r],e.done=!1,e;return e.value=void 0,e.done=!0,e};return o.next=o}}return{next:C}}function C(){return{value:void 0,done:!0}}return h.prototype=v,i(b,"constructor",{value:v,configurable:!0}),i(v,"constructor",{value:h,configurable:!0}),h.displayName=p(v,s,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===h||"GeneratorFunction"===(e.displayName||e.name))},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,v):(t.__proto__=v,p(t,s,"GeneratorFunction")),t.prototype=Object.create(b),t},e.awrap=function(t){return{__await:t}},E(w.prototype),p(w.prototype,u,(function(){return this})),e.AsyncIterator=w,e.async=function(t,r,o,n,a){void 0===a&&(a=Promise);var i=new w(d(t,r,o,n),a);return e.isGeneratorFunction(r)?i:i.next().then((function(t){return t.done?t.value:i.next()}))},E(b),p(b,s,"Generator"),p(b,l,(function(){return this})),p(b,"toString",(function(){return"[object Generator]"})),e.keys=function(t){var e=Object(t),r=[];for(var o in e)r.push(o);return r.reverse(),function t(){for(;r.length;){var o=r.pop();if(o in e)return t.value=o,t.done=!1,t}return t.done=!0,t}},e.values=$,_.prototype={constructor:_,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(D),!t)for(var e in this)"t"===e.charAt(0)&&a.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=void 0)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function r(r,o){return i.type="throw",i.arg=t,e.next=r,o&&(e.method="next",e.arg=void 0),!!o}for(var o=this.tryEntries.length-1;o>=0;--o){var n=this.tryEntries[o],i=n.completion;if("root"===n.tryLoc)return r("end");if(n.tryLoc<=this.prev){var c=a.call(n,"catchLoc"),l=a.call(n,"finallyLoc");if(c&&l){if(this.prev<n.catchLoc)return r(n.catchLoc,!0);if(this.prev<n.finallyLoc)return r(n.finallyLoc)}else if(c){if(this.prev<n.catchLoc)return r(n.catchLoc,!0)}else{if(!l)throw new Error("try statement without catch or finally");if(this.prev<n.finallyLoc)return r(n.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&a.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var n=o;break}}n&&("break"===t||"continue"===t)&&n.tryLoc<=e&&e<=n.finallyLoc&&(n=null);var i=n?n.completion:{};return i.type=t,i.arg=e,n?(this.method="next",this.next=n.finallyLoc,m):this.complete(i)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),m},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),D(r),m}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var o=r.completion;if("throw"===o.type){var n=o.arg;D(r)}return n}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,r){return this.delegate={iterator:$(t),resultName:e,nextLoc:r},"next"===this.method&&(this.arg=void 0),m}},e}t.exports=n,t.exports.__esModule=!0,t.exports.default=t.exports},27:(t,e,r)=>{var o=r(501).default;t.exports=function(t,e){if("object"!==o(t)||null===t)return t;var r=t[Symbol.toPrimitive];if(void 0!==r){var n=r.call(t,e||"default");if("object"!==o(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)},t.exports.__esModule=!0,t.exports.default=t.exports},40:(t,e,r)=>{var o=r(501).default,n=r(27);t.exports=function(t){var e=n(t,"string");return"symbol"===o(e)?e:String(e)},t.exports.__esModule=!0,t.exports.default=t.exports},501:t=>{function e(r){return t.exports=e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t.exports.__esModule=!0,t.exports.default=t.exports,e(r)}t.exports=e,t.exports.__esModule=!0,t.exports.default=t.exports},824:(t,e,r)=>{var o=r(337)();t.exports=o;try{regeneratorRuntime=o}catch(t){"object"==typeof globalThis?globalThis.regeneratorRuntime=o:Function("r","regeneratorRuntime = r")(o)}},962:(t,e,r)=>{"use strict";r.r(e),r.d(e,{getExpItem:()=>s,getItem:()=>n,getLocalItem:()=>a,removeItem:()=>l,setExpItem:()=>u,setItem:()=>i,setLocalItem:()=>c});const o=navigator.userAgent.includes("Chrome")?chrome:browser,n=t=>new Promise(((e,r)=>o.storage.sync.get(t,(n=>o.runtime.lastError?r(Error(o.runtime.lastError.message)):e(n?n[t]:void 0))))),a=t=>new Promise(((e,r)=>o.storage.local.get(t,(n=>o.runtime.lastError?r(Error(o.runtime.lastError.message)):e(n?n[t]:void 0)))));function i(t,e){const r={};return r[t]=e,o.storage.sync.set(r)}function c(t,e){const r={};return r[t]=e,o.storage.local.set(r)}function l(t){return o.storage.sync.remove(t)}function u(t,e,r){i(t,{value:e,expiry:(new Date).getTime()+r})}async function s(t){const e=await n(t);return e?(new Date).getTime()>e.expiry?(l(t),null):e.value:null}}},e={};function r(o){var n=e[o];if(void 0!==n)return n.exports;var a=e[o]={exports:{}};return t[o](a,a.exports,r),a.exports}r.d=(t,e)=>{for(var o in e)r.o(e,o)&&!r.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},(()=>{"use strict";r(842);var t=r(544);(0,t.doInit)(),function(){for(var e=0,r=["TcustomTypeIgn","TcustomSetting","TcustomExt","TcustomExtDec","TcustomExtName","TcustomExtSize","TcustomAdd","TcustomCtDec","TcustomCtMIME","TcustomOt","TcustomOtIgnore","TcustomOtIgnoreDec","TcustomOtReg","TcustomOtFilename","TcustomDebug","ResetExt","SaveExt","modalOkBtn","modalCancelBtn","TcustomAddMine","importSettingsOkBtn","importSettingsCancelBtn","importSettingsWarning","importSettingsFilelabel","importSettingsFilename","exportSettingBtn","importSettingBtn","customNavIEbtns","TcustomBlockedDomains","TcustomBlockedDomainsDec","TcustomBlockedDomainExample","TcustomMaxDisplayCount","TcustomShowCountOnIcon"];e<r.length;e++){var o=r[e];(0,t.tr)(o)}}();var e=new Array;e=JSON.parse(localStorage[t.PRE_DEF_EXTS]);for(var o=0;o<e.length;o++)$("#ExtTd").append(i(e[o].ext,e[o].size));var n=new Array;for(n=JSON.parse(localStorage.Type),o=0;o<n.length;o++)$("#ExtTy").append(c(n[o].Type,n[o].size));var a=new Array;for(a=JSON.parse(localStorage.BlockedDomains),o=0;o<a.length;o++)$("#blockedDomainsTd").append(l(a[o]));function i(){var e=arguments[0]?arguments[0]:"",r=arguments[1]?arguments[1]:"0";return'<tr><td><input type="text" class="ext input" placeholder="'+(0,t.t)("TcustomExtName")+'" value="'+e+'"></td><td class="TdSize"><input type="text" class="size input" placeholder="'+(0,t.t)("TcustomExtSize")+'" value="'+r+'"></td><td class="SizeButton">kb</td><td id="RemoveExt" class="RemoveButton"><a class="delete"></a></td></tr>'}function c(){var e=arguments[0]?arguments[0]:"",r=arguments[1]?arguments[1]:"0";return'<tr><td><input type="text" class="Type input" placeholder="'+(0,t.t)("TcustomCtMIME")+'" value="'+e+'"></td><td class="TdSize"><input type="text" class="size input" placeholder="'+(0,t.t)("TcustomExtSize")+'" value="'+r+'"></td><td class="SizeButton">kb</td><td id="RemoveType" class="RemoveButton"><a class="delete"></a></td></tr>'}function l(){var e=arguments[0]?arguments[0]:"";return'<tr><td><input type="text" class="blockedDomain input" placeholder="'+(0,t.t)("TcustomBlockedDomainPlaceholder")+'" value="'+e+'"></td><td id="RemoveBlockedDomain" class="RemoveButton"><a class="delete"></a></td></tr>'}function u(t,e){$("#confMsg").addClass("is-active"),$("html").addClass("is-clipped"),$("#TempntcText").html(t),e&&($("#modalCancelBtn").show(),$("#modalOkBtn").addClass("comfirmDoit"))}function s(){$("#confMsg").removeClass("is-active"),$("html").removeClass("is-clipped"),$("#modalCancelBtn").hide()}"true"==localStorage.repeat&&$("#repeat").attr("checked","checked"),$("#repeatReg").val(localStorage.repeatReg),"true"==localStorage.Debug&&$("#Debug").attr("checked","checked"),"true"==localStorage.TitleName&&$("#TitleName").attr("checked","checked"),"true"==localStorage.showCountOnIcon&&$("#showCountOnIcon").attr("checked","checked"),$("#MaxDisplayCount").attr("value",localStorage.popListCount),$("#AddExt").bind("click",(function(){$("#ExtTd").prepend(i()),$("#RemoveExt*").bind("click",(function(){$(this).parent().remove()}))})),$("#AddType").bind("click",(function(){$("#ExtTy").prepend(c()),$("#RemoveType*").bind("click",(function(){$(this).parent().remove()}))})),$("#AddBlockedDomain").bind("click",(function(){$("#blockedDomainsTd").prepend(l()),$("#RemoveBlockedDomain*").bind("click",(function(){$(this).parent().remove()}))})),$("#modalOkBtn").click((function(){s()})),$("#modalCancelBtn").click((function(){s()})),$("#RemoveExt*").bind("click",(function(){$(this).parent().remove()})),$("#RemoveType*").bind("click",(function(){$(this).parent().remove()})),$("#RemoveBlockedDomain*").bind("click",(function(){$(this).parent().remove()})),$("#SaveExt").bind("click",(function(){var e=new Array,r=new Array,o=new Array,n=!0;$("#ExtTd tr").each((function(e){var o=$(this).find(".ext").val();if(null==o||null==o||""==o)return u((0,t.t)("TcustomExtNameEmpty")),n=!1,!1;var a=$(this).find(".size").val();null!=a&&null!=a&&""!=a||(a=0,$(this).find(".size").val("0")),r[e]={ext:o,size:a}})),$("#ExtTy tr").each((function(r){var o=$(this).find(".Type").val();if(null==o||null==o||""==o)return u((0,t.t)("TcustomMineEmpty")),n=!1,!1;var a=$(this).find(".size").val();null!=a&&null!=a&&""!=a||(a=0,$(this).find(".size").val("0")),e[r]={Type:o,size:a}})),$("#blockedDomainsTd tr").each((function(e){var r=$(this).find(".blockedDomain").val();if(null==r||null==r||""==r)return u((0,t.t)("TcustomBlockedDomainEmpty")),n=!1,!1;o[e]=r})),n&&(localStorage[t.PRE_DEF_EXTS]=JSON.stringify(r),localStorage.Type=JSON.stringify(e),localStorage.BlockedDomains=JSON.stringify(o),u((0,t.t)("TcustomSaved"))),localStorage.repeatReg=$("#repeatReg").val(),localStorage.popListCount=$("#MaxDisplayCount").val()})),$("#repeat").bind("click",(function(){$(this).prop("checked")?($("#repeat").attr("checked","true"),localStorage.repeat=!0):($("#repeat").removeAttr("checked"),localStorage.repeat=!1)})),$("#Debug").bind("click",(function(){$(this).prop("checked")?($("#Debug").attr("checked","true"),localStorage.Debug=!0):($("#Debug").removeAttr("checked"),localStorage.Debug=!1)})),$("#TitleName").bind("click",(function(){$(this).prop("checked")?($("#TitleName").attr("checked","true"),localStorage.TitleName=!0):($("#TitleName").removeAttr("checked"),localStorage.TitleName=!1)})),$("#showCountOnIcon").bind("click",(function(){$(this).prop("checked")?($("#showCountOnIcon").attr("checked","true"),localStorage.showCountOnIcon=!0):($("#showCountOnIcon").removeAttr("checked"),localStorage.showCountOnIcon=!1)})),$("#ResetExt").click((function(){u((0,t.t)("TcustomComfirmRest"),!0),$(".comfirmDoit").bind("click",(function(e){e.preventDefault(),delete localStorage[t.PRE_DEF_EXTS],delete localStorage.repeatReg,delete localStorage.repeat,delete localStorage.Debug,delete localStorage.Type,delete localStorage.TitleName,delete localStorage.showCountOnIcon,delete localStorage.popListCount,delete localStorage.BlockedDomains,location.reload()}))})),$("#exportSettingBtn").click((function(){var e={Type:JSON.parse(localStorage.Type),BlockedDomains:JSON.parse(localStorage.BlockedDomains)};e[t.PRE_DEF_EXTS]=JSON.parse(localStorage[t.PRE_DEF_EXTS]),e.repeatReg=localStorage.repeatReg,e.Debug=localStorage.Debug,e.TitleName=localStorage.TitleName,e.popListCount=localStorage.popListCount,e.showCountOnIcon=localStorage.showCountOnIcon,e.repeat=localStorage.repeat;var r="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(e)),o=document.getElementById("settingDownloadAnchorElem");o.setAttribute("href",r),o.setAttribute("download","cococutSettings.json"),o.click()})),$("#importSettingBtn").click((function(){function e(){$("#importSettingsModal").removeClass("is-active"),$("html").removeClass("is-clipped"),$("#importSettingsCancelBtn").hide()}$("#importSettingsModal").addClass("is-active"),$("html").addClass("is-clipped"),$("#importSettingsCancelBtn").show(),$("#importSettingsOkBtn").addClass("comfirmDoit"),$("#importSettingsOkBtn").click((function(){!function(){var e=r.files[0];if(e){var o=new FileReader;o.readAsText(e,"UTF-8"),o.onload=function(e){!function(e){try{var r=JSON.parse(e);localStorage.Type=JSON.stringify(r.Type),localStorage.repeat=r.repeat,localStorage.repeatReg=r.repeatReg,localStorage.Debug=r.Debug,localStorage.TitleName=r.TitleName,localStorage.showCountOnIcon=r.showCountOnIcon,localStorage.popListCount=r.popListCount,localStorage[t.PRE_DEF_EXTS]=JSON.stringify(r[t.PRE_DEF_EXTS]),localStorage.BlockedDomains=JSON.stringify(r.BlockedDomains),location.reload()}catch(t){alert("Import settings error, error message is:"+t)}}(e.target.result)},o.onerror=function(t){console.log("error reading file")}}}(),e()})),$("#importSettingsCancelBtn").click((function(){e()}));var r=document.querySelector("#importSettingsFile input[type=file]");r.onchange=function(){r.files.length>0&&(document.querySelector("#importSettingsFile .file-name").textContent=r.files[0].name)}}))})()})();