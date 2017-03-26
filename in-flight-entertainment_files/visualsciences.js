//==========================================================
// FILE DESCRIPTION:
//  Tracking script for Visual Sciences. Main function is
//  vsDoTracking (). 
//==========================================================

//==========================================================
// OVERRIDING FUNCTIONS 
//==========================================================
//  None

//==========================================================
// NON-OVERRIDING FUNCTIONS
//==========================================================
//  vsDoTracking()
//  vsSplitParameters(vsQueryList,vsNewArray)

//  vsDoTracking()
//  Parses the contents of variables that are set in the calling script and collects info 
//  from the browser. An image URL (relative to ba.com) is then generated with the info 
//  appended as HTTP GET variables.
function vsDoTracking(serverUrl) 
{
  // vsUrl - the URL of the current page
  // vs - array of parameters
  // vsImageString - the string that will be written out as an HTML <img> tag
  // vsObj - variable to be used when extracting values from the array of parameters
  // vsTrackingParameters - the array containing parameters that we are tracking
  // vsTradeUrl - URL present in window
  // vsTradeBool - whether trade exists in the URL
  // vsStrProtocol - the protocol
  // vsCookieVal - value of a cookie
  // vsCookieEndStr - position of last character in cookie
  // vsCugSource - CUG source
  var vsUrl,
      vs,
      vsImageString,
      vsObj,
      vsTrackingParameters,
      vsTradeUrl,
      vsTradeBool,
      vsStrProtocol,
      vsCookieVal,
      vsCookieEndStr,
      vsCugSource,
      vsExtraElement;

	if (serverUrl === undefined) serverUrl = "";

  vsTrackingParameters = new Array();
  vs = new Array();
  vsUrl= window.location.href;
 
  // check whether trackingInfo is defined and not null, then add contents to our array of parameters 
  // called vs
  if (!(window.trackingInfo === undefined))
  {
    if (trackingInfo !== null)
    {
      vs = trackingInfo;
    }
  }
  
  // now standard parameters to track - pageID, language etc.
  try 
  {
    vsExtraElement = (vs.pageidextra === undefined) ? "" : vs.pageidextra;	// DAR - CR11469

    vs.hostname = document.nav_form.hostname.value;	// DAR - CR11469
    vs.protocol = document.nav_form.protocol.value;	// DAR - CR11469
    vs.audience = document.nav_form.audience.value;
    vs.pageid = document.nav_form.pageid.value + vsExtraElement;	// DAR - CR11469
    vs.logintype = document.nav_form.logintype.value;	// DAR - CR11469
    vs.scheme = document.nav_form.scheme.value;		// DAR - CR11469
    vs.tier = document.nav_form.tier.value;		// DAR - CR11469
    vs.language = document.nav_form.language.value;
    vs.country = document.nav_form.country.value;
  }
  catch (e) 
  {
  }
  
  // if hardcoded name is provided, strip path info from string leaving filename.extension
  if (!(window.vsHardCodedName === undefined))
  {
    if (window.vsHardCodedName !== null)
    {
      vsIndex = vsHardCodedName.lastIndexOf("/");
      vs.hardcodedname = vsHardCodedName.substring(vsIndex + 1, vsHardCodedName.length);
    }
  }

  // collect information from client browser
  try 
  {
	  vs.dt = document.title;
	  vs.dr = document.referrer;
	  vs.cb = new Date().getTime();
	  vs.sw = screen.width;
	  vs.sh = screen.height;
	  vs.cd = screen.colorDepth;
  }
  catch (e)
  {
  }

  // now add any URL parameters, but only attempt if parameters are present in the URL
  if ((vsUrl.indexOf("?") > -1) && (vsUrl.indexOf("?") != (vsUrl.length - 1)))
  {
    vs = vsSplitParameters(vsUrl, vs);
  }
  
  // check that functionalInfo is defined and not null, and then add functionalInfo parameters
  if (!(window.functionalInfo === undefined))
  {
    if (functionalInfo !== null)
    {
      vs = vsSplitParameters(functionalInfo, vs);
    }
  }
  
  // Cookie functions are within utils.js
  vsStrProtocol = window.location.protocol;
  vsCookieVal = getCookie("texcookie");
  
  if (vsCookieVal)
  {
    vsTradeUrl = window.location.href;
    vsTradeBool = vsTradeUrl.indexOf("trade");
    
    if (vsTradeBool > 0)
    {
      vsCookieEndStr = vsCookieVal.indexOf(".");

      if (!vsCookieEndStr)
      {
        vsCookieEndStr = vsCookieVal.length ;
      }
      
      vsCookieVal = vsCookieVal.substring(0, vsCookieEndStr);
      vsImageString += "&" + "trade_user=" + vsCookieVal;   
    }
  }
  
  // CUG Source
  if(!(window.cugsource === undefined))
  {
    if(window.cugsource !== null)
    {
      vs.cugsource = window.cugsource;
    }
  }
  
  // Now all parameters have been collected, check their validity, add them to the tracking array and 
  // generate the image source URL to print out to the screen.
  
  // write first part of html image tag to string
  vsImageString = "<img src=\"" + serverUrl + "/cms/s.gif?Log=1";
  
  // Add all parameters that we've collected to the tracking array
  for (vsObj in vs) 
  {  
  	vsImageString = vsImageString + "&" + vsObj + "=" + escape(vs[vsObj]);
    vsTrackingParameters[vsObj] = escape(vs[vsObj]);
  }
  
  // write last part of image tag to string
  vsImageString += "\" height=\"1\" width=\"1\" alt=\"\" />";
  return vsImageString;
}

//  vsSplitParameters(vsQueryList, vsNewArray)

//  Takes a string (eg. a URL) and strips all the parameters off and adds them to a specified associative array

//  @return   vsNewArray;   Specified associative array to which params have been appended
//  @param    vsQueryList;  String of parameters;                   E.g. a URL
//  @param    vsNewArray;   Array that params are appended to;      E.g. dep,arr,sources
function vsSplitParameters(vsQueryList, vsNewArray)
{
  var vsQueryStart,
  vsQueryArray,
  vsKeyArray,
  vsKey,
  vsValue,
  vsIndex,
  vsValue_array,
  i,
  j;
  
  vsQueryStart = vsQueryList.indexOf("?");
  
  if (vsQueryStart > -1)
  {
    vsQueryList = vsQueryList.substring(vsQueryStart+1,vsQueryList.length);

    vsQueryArray = vsQueryList.split("&");
    for (i = 0; i < vsQueryArray.length; i++)
    {
      if(vsQueryArray[i] != "")
      {
        vsKeyArray = vsQueryArray[i].split("=");
        
        if(vsKeyArray.length == 2)
        {
          if(vsKeyArray[0]!==undefined)
          {
            vsKey = vsKeyArray[0];
            vsKey = vsKey.replace(/[^a-zA-Z0-9_\-.]+/g,'');
            if(vsKey!="")
            {
              if(vsKeyArray[1]!==undefined)
              {
                vsValue = vsKeyArray[1];
                if(vsValue != "")
                {
                  
                  //Do not change without consultation with ba.com front end architect team
                  //Decode params to handle server sending pages back with URL encoded params

                  vsValue = decodeURIComponent(vsValue);
                  //removed % from the regex pattern, for security reasons we should strip this out
                  vsValue = vsValue.replace(/[^a-zA-Z0-9_\-\|.]+/g,'');
                  
                  //count he number of pipes, if there are more than 15 this is the ban param
                  if(vsValue.replace(/[^\|]/g, "").length > 15){
                    
                    vsValue_array = vsValue.split('|');
                    
                    for(j=0; j<vsValue_array.length;j++){

                      //if the individiual value is longer than 70 remove that value
                      if(vsValue_array[j].length > 70) {
                        vsValue_array[j] = "";
                      }

                    }
                                        
                    vsValue = vsValue_array.join("|");
                    
                    //if the param in total is longer than 100 remove the entire param              
                    if(vsValue.length > 100) {
                      vsValue = "";
                    }
                                        
                  } else {
                    //if it has less than 15 pipes it is a normal param
                    //normal params can be no longer than 70 characters
                    //if they are longer remove the param
                    if(vsValue.length > 70) {
                      vsValue = "";
                    }
                  }
                }
                
                //Only set a parram in the tracking array if it has a value
                if(vsValue !== "") {
                  vsNewArray[vsKey] = vsValue;
                }
              }
            }
          }
        }
      }
    }
  }
  return vsNewArray;
}

///////////////////////////////////////////////////////////////////////////////
//
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

///////////////////////////////////////////////////////////////////////////////
//
///////////////////////////////////////////////////////////////////////////////
function getCookieVal(offset) {
  var endstr = document.cookie.indexOf(";", offset);
  
  if(endstr == -1) {
    endstr = document.cookie.length;
  }

  return unescape(document.cookie.substring(offset, endstr));
}