/** 
 * addEventListener polyfill
 * modified from Daniel Hug's version
 * https://gist.github.com/Daniel-Hug/9221945
 */
(function(win, doc) {

	if(win.addEventListener) return;		//No need to polyfill
 
	function docHijack(p){
		var old = doc[p];
		doc[p] = function(v) {
			return addListen(old(v))
		}
	}

	//addEvent
	function addEvent(on, fn, self){
		return (self = this).attachEvent('on' + on, function(e){
			e = e || win.event;
			e.preventDefault  = e.preventDefault  || function(){e.returnValue = false}
			e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true}
			fn.call(self, e);
		});
	}

	//removeEvent
	function removeEvent (element, type, handler) {
		if (element.removeEventListener) {
			element.removeEventListener(type, handler, false);
		} 
		else if (element.detachEvent) {
			element.detachEvent("on" + type, handler);
		} else {
			element["on" + type] = null;
		}
	}

	//add polyfill to DOM
	function addListen(obj, i){
		if(i = obj.length) {
			while(i--) {
				obj[i].addEventListener = addEvent;
				obj[i].removeEventListener = removeEvent;
			}
		}
		else {
			obj.addEventListener = addEvent;
			obj.removeEventListener = removeEvent;
		}
		return obj;
	}

	addListen([doc, win]);

	if('Element' in win) {
		win.Element.prototype.addEventListener = addEvent;			//IE8
		win.Element.prototype.removeEventListener = removeEvent; 
	}
	else{		//IE < 8
		doc.attachEvent('onreadystatechange', function(){addListen(doc.all)});		//Make sure we also init at domReady
		docHijack('getElementsByTagName');
		docHijack('getElementById');
		docHijack('createElement');
		addListen(doc.all);
	}

})(window, document);


