!function(e){var t={};function s(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,s),i.l=!0,i.exports}s.m=e,s.c=t,s.d=function(e,t,r){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(s.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)s.d(r,i,function(t){return e[t]}.bind(null,i));return r},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=0)}([function(e,t,s){let r=s(1);new class extends r{constructor(e){super("192.168.2.209",28e3),this.ping()}Pong(e,t){console.log("Pong!!"),this.ping()}ping(){console.log("sending ping"),this.send("Ping",{},(e,t)=>{console.log("ping callback",e,t)})}}},function(e,t,s){let{StreamParser:r}=s(2);e.exports=class{constructor(e,t){this._status="CLOSED",this._sendQueue=[],this._callbacks={},this._messageCount=0,this._buffer="",this._url=`ws://${e}:${t}`,this._connect()}_connect(){this._socket=new WebSocket(this._url),this._socket.onopen=this._opened.bind(this),this._socket.onclose=this._closed.bind(this),this._socket.onerror=this._error.bind(this),this._socket.onmessage=this._message.bind(this),this._parser=new r({write:{writable:!0,on:(e,t)=>{this._closedListener=t},write:this._socket.send.bind(this._socket)}}),this._parser.on("reply",({err:e,cmd:t})=>{let s=t.Passport.Pid;this._callbacks[s](e,t)}),this._parser.on("query",e=>{this._dispatch(e)})}_message(e){this._parser.data(e.data.toString())}_dispatch(e){e.Cmd in this&&this[e.Cmd](e,(e,t)=>{this._parser.reply(e,t)})}_error(e){console.log(e)}_closed(e){this._status="CLOSED",this._closedListener(e),console.log("setTimeout"),setTimeout(this._connect.bind(this),0)}_opened(e){this._status="OPEN";for(let e in this._sendQueue){let[t,s]=this._sendQueue[e];this._send(t,s)}this._sendQueue=[]}async send(e,t,s){let r=++this._messageCount,i=Object.assign(t,{Cmd:e,Passport:{Query:!0,Pid:""+r}}),n=s?"query":"ping";if(this._send(n,i),!s)return await new Promise(e=>{this._callbacks[r]=((t,s)=>{delete this._callbacks[r],e(t?[t,s]:s)})});this._callbacks[r]=((e,t)=>{delete this._callbacks[r],s(e,t)})}_send(e,t){"CLOSED"!==this._status?this._parser[e](t):this._sendQueue[t.Passport.Pid]=[e,t]}}},function(e,t,s){"undefined"!=typeof self&&self,e.exports=function(e){var t={};function s(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,s),i.l=!0,i.exports}return s.m=e,s.c=t,s.d=function(e,t,r){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(s.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)s.d(r,i,function(t){return e[t]}.bind(null,i));return r},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=0)}([function(e,t,s){const r=s(1).EventEmitter;e.exports.StreamParser=class extends r{constructor(e){super(),this.buffer="",this._STATE="CLOSED","read"in e&&e.read.readable&&(e.read.on("data",this.data.bind(this)),e.read.on("close",this.close.bind(this)),this._STATE="OPEN"),"write"in e&&e.write.writable&&(this._writeStream=e.write,e.write.on("close",this.close.bind(this)),this._STATE="OPEN")}error(e){this.emit("error",e)}close(e){"CLOSED"!==this._STATE&&(this._STATE="CLOSED",this.emit("close",e))}sendMessage(e){this.emit("message",e)}async data(e){if("CLOSED"===this._STATE)return void this.error({type:"E_STREAM_CLOSED",data:e});this.emit("data",e);let t=e.toString().split(/([\x02\x03])/g);for(let e of t)""===e?this.buffer="":""===e?this.parseMessageType(this.buffer):this.buffer+=e}parseMessageType(e){let t=e[0];switch(e=e.substr(1),t){case"p":try{let s=JSON.parse(e);this.emit("ping",s),this.sendMessage({type:"ping",cmd:s})}catch(t){this.error({type:"E_COMMAND_PARSE_ERROR",data:e,error:t})}break;case"q":try{let s=JSON.parse(e);this.emit("query",s),this.sendMessage({type:"query",cmd:s})}catch(t){this.error({type:"E_COMMAND_PARSE_ERROR",data:e})}break;case"r":try{let[s,r]=e.split("\0");r=JSON.parse(r),""===s&&(s=null),this.emit("reply",{err:s,cmd:r}),this.sendMessage({type:"reply",err:s,cmd:r})}catch(t){this.error({type:"E_COMMAND_PARSE_ERROR",data:e})}break;default:this.error({type:"E_NO_MESSAGE_TYPE",data:t+e})}}reply(e,t){if("CLOSED"===this._STATE)return void this.error({type:"E_STREAM_CLOSED"});let s;if(null===e||!1===e)s="";else try{s=e.toString()}catch(t){try{s=JSON.stringify(e)}catch(t){s="E_ERROR_PARSE_ERROR",this.error({type:"E_ERROR_PARSE_ERROR",data:e})}}this._writeStream.write(`r${s}\0${JSON.stringify(t)}`)}ping(e){"CLOSED"!==this._STATE?this._writeStream.write(`p${JSON.stringify(e)}`):this.error({type:"E_STREAM_CLOSED"})}query(e){"CLOSED"!==this._STATE?this._writeStream.write(`q${JSON.stringify(e)}`):this.error({type:"E_STREAM_CLOSED"})}}},function(e,t){function s(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function r(e){return"function"==typeof e}function i(e){return"object"==typeof e&&null!==e}function n(e){return void 0===e}e.exports=s,s.EventEmitter=s,s.prototype._events=void 0,s.prototype._maxListeners=void 0,s.defaultMaxListeners=10,s.prototype.setMaxListeners=function(e){if(!function(e){return"number"==typeof e}(e)||e<0||isNaN(e))throw TypeError("n must be a positive number");return this._maxListeners=e,this},s.prototype.emit=function(e){var t,s,o,h,a,l;if(this._events||(this._events={}),"error"===e&&(!this._events.error||i(this._events.error)&&!this._events.error.length)){if((t=arguments[1])instanceof Error)throw t;var u=new Error('Uncaught, unspecified "error" event. ('+t+")");throw u.context=t,u}if(n(s=this._events[e]))return!1;if(r(s))switch(arguments.length){case 1:s.call(this);break;case 2:s.call(this,arguments[1]);break;case 3:s.call(this,arguments[1],arguments[2]);break;default:h=Array.prototype.slice.call(arguments,1),s.apply(this,h)}else if(i(s))for(h=Array.prototype.slice.call(arguments,1),o=(l=s.slice()).length,a=0;a<o;a++)l[a].apply(this,h);return!0},s.prototype.addListener=function(e,t){var o;if(!r(t))throw TypeError("listener must be a function");return this._events||(this._events={}),this._events.newListener&&this.emit("newListener",e,r(t.listener)?t.listener:t),this._events[e]?i(this._events[e])?this._events[e].push(t):this._events[e]=[this._events[e],t]:this._events[e]=t,i(this._events[e])&&!this._events[e].warned&&(o=n(this._maxListeners)?s.defaultMaxListeners:this._maxListeners)&&o>0&&this._events[e].length>o&&(this._events[e].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[e].length),"function"==typeof console.trace&&console.trace()),this},s.prototype.on=s.prototype.addListener,s.prototype.once=function(e,t){if(!r(t))throw TypeError("listener must be a function");var s=!1;function i(){this.removeListener(e,i),s||(s=!0,t.apply(this,arguments))}return i.listener=t,this.on(e,i),this},s.prototype.removeListener=function(e,t){var s,n,o,h;if(!r(t))throw TypeError("listener must be a function");if(!this._events||!this._events[e])return this;if(o=(s=this._events[e]).length,n=-1,s===t||r(s.listener)&&s.listener===t)delete this._events[e],this._events.removeListener&&this.emit("removeListener",e,t);else if(i(s)){for(h=o;h-- >0;)if(s[h]===t||s[h].listener&&s[h].listener===t){n=h;break}if(n<0)return this;1===s.length?(s.length=0,delete this._events[e]):s.splice(n,1),this._events.removeListener&&this.emit("removeListener",e,t)}return this},s.prototype.removeAllListeners=function(e){var t,s;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[e]&&delete this._events[e],this;if(0===arguments.length){for(t in this._events)"removeListener"!==t&&this.removeAllListeners(t);return this.removeAllListeners("removeListener"),this._events={},this}if(r(s=this._events[e]))this.removeListener(e,s);else if(s)for(;s.length;)this.removeListener(e,s[s.length-1]);return delete this._events[e],this},s.prototype.listeners=function(e){return this._events&&this._events[e]?r(this._events[e])?[this._events[e]]:this._events[e].slice():[]},s.prototype.listenerCount=function(e){if(this._events){var t=this._events[e];if(r(t))return 1;if(t)return t.length}return 0},s.listenerCount=function(e,t){return e.listenerCount(t)}}])}]);