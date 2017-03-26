

///////////////////////////////////////////////////////////////////////////////
// getCookie and getCookieVal originally defined in utils.js
///////////////////////////////////////////////////////////////////////////////
function getCookie(name) {
	var arg = name + "=";
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;
	
	while(i < clen) {
		var j = i + alen;
		
		if(document.cookie.substring(i, j) == arg) {
			return getCookieVal(j);
		}
		
		i = document.cookie.indexOf(" ", i) + 1;
		
		if(i == 0) {
			break;
		}
	}
	
	return null;
}

function getCookieVal(offset) {
	var endstr = document.cookie.indexOf(";", offset);
	
	if(endstr == -1) {
		endstr = document.cookie.length;
	}

	return unescape(document.cookie.substring(offset, endstr));
}

function livesiteVisualSciencesSetup()
{
	// setup the v1st cookie tracking
	var v1stcookievar = getCookie("v1st");

	if (v1stcookievar) {
	    v1stcookievar = v1stcookievar.toLowerCase();
	    trackingInfo["v1stTracking"] = v1stcookievar;
	}
	
	// setup hostname and protocol tracking
	if(location) {
		var hostname = location.hostname;
		var protocol = location.protocol;
		
		if(protocol) {
		    protocol = protocol.substring(0, protocol.length - 1);			// remove the colon from protocol
		    trackingInfo["protocol"] = protocol;
		}
		
		if(hostname) {
			trackingInfo["hostname"] = hostname;
		}
	}
	
	var documentLocale = document.getElementsByTagName("html")[0].getAttribute("lang");

	if(documentLocale){
		var localeMatches = documentLocale.match(/^([a-z]{2})-([a-z]{2})$/i);
		if(localeMatches.length === 3) {
			trackingInfo["language"] = localeMatches[1];
			trackingInfo["country"] = localeMatches[2].toLowerCase();
		}
	}
	
	if(vsHardCodedName) {
		trackingInfo["pageID"] = vsHardCodedName;
	}
}