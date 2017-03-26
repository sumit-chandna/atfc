/*jslint onevar:true,undef:true,newcap:true,nomen:true,regexp:true,plusplus:true,bitwise:true,browser:true,sloppy:true,confusion:true,white:true*/
/*global updateCabin:false,updateTicket:false,OJurl:false,makeSelection:false,window:false,$:false,jQuery:false,alert:false,console:false*/

var ac_mmb_compliance = (document.nav_form) ? true : false,
    ac_user_audience = (ac_mmb_compliance) ? document.nav_form.audience.value : 'travel',
    ac_user_login = (ac_mmb_compliance) ? document.nav_form.logintype.value : 'public',
    ac_user_language = (ac_mmb_compliance) ? document.nav_form.language.value : 'en',
    ac_user_country = (ac_mmb_compliance) ? document.nav_form.country.value : 'gb',
    ac_results_count = 0,
    ac_results_selected = 1,
    ac_timeout,
    ac_timeout_last = 0,
    ac_parent,
    ac_scroll_active = false,
    ac_ie6_compliance = 1,
    ac_remainder = false,
    ac_touchtime = 300;

// String trim function
String.prototype.trim = function() { 
  	return this.replace(/^[\s]+|[\s]+$/gi,'');     
};

////////////////////////////////////////////////////////////////////////////////
//  Match text (adds a <span> around text that matches the supplied 'match')
////////////////////////////////////////////////////////////////////////////////
function matchAutoComplete(sample, match) {
	var i,
        array,
        position = sample.toLowerCase().indexOf(match.toLowerCase()),
        string,
        text,
        regex;

	if(position !== -1) {
	  	array = sample.split(',');

		for(i = 0; i < array.length; i += 1) {
			// Regex must be reset as we are utilising a global match - this
			// prevents sporadic null responses.
			regex = null;
			regex = new RegExp(match, 'gi');
			
			text = regex.exec(array[i]);
			
			if(text !== null) {
		  		string = '<span class="autoCompleteMatch">' + text + '</span>';
		  		array[i] = array[i].replace(regex, string);
			}
	  	}
        
		return array.join(',');
	}
    
	else { 
		return sample; 
	}
	
} // End matchAutoComplete() function

////////////////////////////////////////////////////////////////////////////////
  //  Results parsers
  //  Retrieve long names from DWRdests response
////////////////////////////////////////////////////////////////////////////////
function parseDWR_long(i, response) {
	var a, b;
    
	a = response.indexOf('s' + i + '=');
    a = response.indexOf('"', a) + 1;
    b = response.indexOf('"', a) - a;
    
	return response.substr(a, b);
}

////////////////////////////////////////////////////////////////////////////////
//  Retrieve short names from DWRdests response
////////////////////////////////////////////////////////////////////////////////
function parseDWR_short(i, response) {
	var a;
    
	if(response.indexOf('=s' + i + ';') !== -1 ) {
    	a = response.indexOf('\']=s' + i + ';');
        
		return response.substr(a-3, 3);
    }
    
	else { 
		return false; 
	}
}

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
function parseDWR_long_for_code(string) {
    var array;

	if(string &&string.indexOf(',') !== -1) {
		array = string.split(',');
	
		return array[2].trim();
	}
  
	else { 
		return false; 
	}
}

////////////////////////////////////////////////////////////////////////////////
//  Refactor OJ response
////////////////////////////////////////////////////////////////////////////////
function parseOJ(response, search) {
	var response_element = $(response.trim()),
        response_list = response_element.children('li');
    
	// Set ID on the UL element within our response.
    response_element.attr('id','destChoices');

	//  Highlight our first result.
	response_element.find('li:first').addClass('acHighlight');
	
	//  Loop through the result set to highlight our matched text.
	response_list.each(function() {
		$(this).html(matchAutoComplete($(this).html(), search));
	});
	
	ac_results_count = response_list.length;
	
	if(ac_ie6_compliance === 2) { 
		ac_results_count += 1; 
	}
	
	return response_list;
}

////////////////////////////////////////////////////////////////////////////////
// Take the search response and the original search key, and build relevant
// markup
////////////////////////////////////////////////////////////////////////////////
function parseDWR(response, search) {
	var i;
    var limit = 2;
    var markup = "";
	var locationCode = "";
	var liClass = "";
	var currentItemID = "";
	var tokenStart = 0;
    var tokenEnd = 0;
	var token = "";
	
	// Iterate through all the s0, s1, s2 etc. variables
	for(i = 1; i < limit; i += 1) {
		currentItemID = "s" + i;
		
		// If we find a match, increase our limit to allow another iteration,
		// and process the current item
		if(response.indexOf(currentItemID + "=") !== -1) {
			limit += 1;
			token = response;
			tokenStart = 0;
    		tokenEnd = token.indexOf("=s" + i + ";");
	
			// If we found '=s<index>;'...
			if(tokenEnd !== -1 ) {
				// Trim surplus from the end of the token
				token = token.substr(0, tokenEnd);
				
				// Now look for the last occurence of 's0['
				tokenStart = token.lastIndexOf("s0[");
				
				if(tokenStart !== -1) {
					// Trim surplus from the beginning of the token
					token = token.substr(tokenStart);
				}
			}
			
			// Get the location code for the current item
			locationCode = parseDWR_short(i, response);
			
			// Build <li> markup
			markup += '<li id="' + locationCode + '"';
			
			// Build class attribute
			liClass = "";
			
			// If this is the first item, then add an 'acHighlight' class
			// (default to the first item being the highlighted focus) 
			if(i === 1) { 
				liClass += "acHighlight "; 
			}
			
			// See if this item is a Title 'parent/header' (e.g. s0['Title1']=s3;)
			if(token.indexOf("['Title") !== -1) {
				liClass += "titleParent "; 
			}
			
			// See if this item is a Title 'child' (e.g. s0['Florida(ALL), USA::FLL']=s4;)
			if(token.indexOf("::") !== -1) {
				liClass += "titleChild ";
			}
			
			// If we have some classes to add, then build the class attribute and add to the markup
			if(liClass !== "") {
				liClass = " class=\"" + liClass + "\"";
				markup += liClass;
			}
			
			// Close the <li> opening tag
			markup += ">";
			
			// Add the content
			markup += matchAutoComplete(parseDWR_long(i, response),search);
			
			// Close the <li> item
			markup +='</li>'; 
			
		} // End if(we found a match)
		
	} // End for(all s0, s1, s2 etc. variables)

	// Resync our count
	ac_results_count = i - 2;
	
	// ???
	if(ac_ie6_compliance === 2) { 
		ac_results_count += 1; 
	}
	
	return (markup !== '') ? markup : false;
}

////////////////////////////////////////////////////////////////////////////////
  //  Reset autocomplete
////////////////////////////////////////////////////////////////////////////////
function clearAutoComplete() {
    ac_results_count = 0;
    
	ac_results_selected = ac_ie6_compliance;
    
	ac_scroll_active = false;
    
	$('.ajaxResults').hide().find('ul').html('');
    
	return true;
}

////////////////////////////////////////////////////////////////////////////////
//  Fire autocomplete call & parse response
////////////////////////////////////////////////////////////////////////////////  
function autoComplete(input, results, service, data_type) {
    var url,
        val = $('#'+ input).val();

	//  Reset timeout value to ensure multiple service calls are not made
	ac_timeout_last = 0;

	//  Ensure we are not searching for a blank input
	if(!val || val.trim() === '' || val.length < 3) { 
		clearAutoComplete(); 
		
		return false; 
	}
	
	//  Build service URL
	url = service + val.trim() + "&language=" + ac_user_language;
	
	//  Retrieve data from service
	$.get(url, function(response) {
		var i,
			results_element,
			results_native,
			prop,
			select_diff,
			y_start,
			y_end,
			ojId = $('#ojId'),
			ojGw = $('#ojGw'),
			
			/*Changes made for one way car rental  - Start */
			ojDropOffId = $('#ojDropOffId'),
			ojDropOffGw = $('#ojDropOffGw'),
			/*Changes made for one way car rental  - End */
			ojCountry = $('#ojCountry');
	
		response = response.trim();
	
		// If it looks like AJAX returned a valid response, then parse it into content
		if(response !== '<ul></ul>' || val.indexOf('s1') !== -1 ) {
			if(data_type === 'DWRdests' || data_type === 'Ancillarydests' ) { 
				response = parseDWR(response, val); 
			}
			
			// Changes made for one way car rental  - Start
			else if(data_type === 'OJdests' || data_type === 'OJDropdests' ) { 
				response = parseOJ(response, val); 
			}
			// Changes made for one way car rental  - End
			
			// If we have valid content, fill results container
			if(response) {
				results_element = $('#'+ results);
				
				$('ul#destChoices', results_element).html(response);
				
				results_element.show().children('ul#destChoices').scrollTop(0);
				
				//  Bind click events to new <li> elements
				$('ul li', results_element).click(function(e) {
					// If the clicked element is NOT a title/group parent, then process as normal
					if($(this).hasClass('titleParent') == false) {
						if(typeof makeSelection === 'function') { 
							makeSelection('#'+input, '#'+results, data_type); 
							
							return false;
						}
						
						var departure_airport,
							destination_airport;
						
						//  Set input field text to selected
						$('#'+ input).val($(this).text());
						
						// Dependant on data type fill appropriate hidden fields & fire functions
						if(data_type === 'OJdests' ) {
							ojId.attr('value', $(this).attr("id"));
							ojGw.attr('value', $(this).attr("gw"));
							ojCountry.attr('value', $(this).attr("country"));
							departure_airport = $("#fromPkg > option:selected").val();
							destination_airport = $(this).attr('gw');
							updateCabin(departure_airport, destination_airport, ac_user_language, "dp");
							updateTicket(departure_airport, destination_airport);
							
							/* Changes made for one way car rental  - Start */
						}
						
						else if(data_type === 'OJDropdests') {
							ojDropOffId.attr('value', $(this).attr("id"));
							ojDropOffGw.attr('value', $(this).attr("gw"));
							ojCountry.attr('value', $(this).attr("country"));
							departure_airport = $("#fromPkg > option:selected").val();
							destination_airport = $(this).attr('gw');
							updateCabin(departure_airport, destination_airport, ac_user_language, "dp");
							updateTicket(departure_airport, destination_airport);
						}
						/*Changes made for one way car rental  - End */
		
						else if(data_type === 'DWRdests') {
							if($('select#from').length > 0) { 
								departure_airport = $('select#from option:selected').val(); 
							}
					
							else { 
								departure_airport = parseDWR_long_for_code($('#from').val()); 
							}
					
							destination_airport = $(this).attr('id');
					
							var depDateValue = $('#depDate').val();
					
							// If there a departure date available take the date into consideration while updating cabins.
							// Changes for ImCAPFuncSup 110922-000007
							if(depDateValue && depDateValue!='DD/MM/YY' && depDateValue!='MM/DD/YY')  {
								updateCabinsForDate(departure_airport, destination_airport, ac_user_language, document.nav_form.country.value, depDateValue);
							}
							
							else {
								updateCabin(departure_airport, destination_airport, ac_user_language);
							}
					
							updateTicket(departure_airport, destination_airport);
						}
						
						else if(data_type === 'Ancillarydests') {
							matchedDest = $(this).attr('id');				
							
							$("#ojGw").val(matchedDest);              
						}
						
						//  Clear
						clearAutoComplete();
			  
						return true;
					}
					
					// Else, the clicked element IS a title/group parent so we ignore by returning false
					else {
						return false;
					}
				
				}); // End click() function for new <li> elements
	
				// Fire jQuery plugin to resolve IE 6 issues with bleeding input elements
				// This function has been overriden in non-IE 6 browsers with a simple "return false" statement and will have no effect.
				if(ac_ie6_compliance === 2) {
					$('ul#destChoices', results_element).bgiframe({height:$('ul#destChoices', results_element).get(0).scrollHeight});
				}
	
				$('ul li', results_element).mouseenter(function() {
					// To identify the current child position we must compare it to it's siblings.
					// As we are creating a collection, we also utilise this chain to remove our highlight.
					ac_results_selected = $(this).parent('ul#destChoices').children('li').removeClass('acHighlight').index(this) + ac_ie6_compliance;
					
					// Only add 'acHighlight' class if the item is NOT a group header/parent
					if($(this).hasClass("titleParent") == false) {
						$(this).addClass('acHighlight');
					}
				});
	
				if(touchEnabled() && $('ul#destChoices').is(':visible')) {
					// As we are natively binding our event handlers to an ID
					// To ensure compliance when more than 1 of these IDs exist
					// we must capture our element via DOM tree.
					results_native = document.getElementById(results).childNodes;
					
					if(results_native.length > 1 ) {
					  	for(i=0; i<results_native.length; i += 1) {
							if(results_native[i].id === 'destChoices') {
						  		results_native = results_native[i];
						  		
								break;
							}
					  	}
					}

					else {
						results_native = results_native[0];
					}
					
					results_native.ontouchmove = function(e) {
						if(e.touches.length < 2) {
							e.preventDefault();
						}
						
						prop = (e.touches && e.touches.length > 0) ? e.touches[0] : e;
					
						if(!y_start) {
							y_start = prop.clientY;
						}
						
						y_end = prop.clientY;
						
						return true;
					};
					
					results_native.ontouchend = function(e) {
						select_diff = ~~((y_start - y_end) * 1.3);
	
						$('ul#destChoices', results_element).animate({scrollTop:'+='+select_diff},{queue:false,duration:300});
					
						e.preventDefault();
					
						y_start = false;
					
						y_end = false;
						
						return true; 
					};
					
				} // End if(touch enabled and dest choices is shown)
				
			} // End if(We have a valid response to add to the page)
			
			// Else, no valid content so clear any existing, just in case.
			else { 
				clearAutoComplete(); 
				
				return false;
			}
		} // End if(AJAX returned a valid response)
		
		// Else AJAX returned invalid info, so just ensure we cleanup 
		// any existing display before returning
		else { 
			clearAutoComplete(); 
			
			return false; 
		}
		
	}); // End $.get()
	
} // End autocomplete() function

////////////////////////////////////////////////////////////////////////////////
// Touch events for Destinations 
//////////////////////////////////////////////////////////////////////////////// 

// Touch event to trigger the click event code when a autocomplete list item is touched
// touchmove and touchend are binded to this to detect a user scrolling instead of touching
$(document).on('touchstart','ul#destChoices li',function(){
	var hasMoved = false,
		that = $(this);
		
	that.bind('touchmove',function(){
		hasMoved = true;
	});
	
	that.bind('touchend',function(){
		that.unbind('touchmove touchend');
		if(!hasMoved) {
			that.trigger('mouseenter').click();
			return false;
		}
	});
});
	
$(document).on('touchend','#planTripFlightDestination', function(){
	var count = $(this).val().length;
	if(count > 3){
		$('#flightAutoCompleteResults').hide(); 
	} 
});  

$(document).on('touchend','#to', function(){
	var count = $(this).val().length;
	if(count > 3){
		$('#toAutoComplete').hide(); 
	} 
}); 



////////////////////////////////////////////////////////////////////////////////
// Bind autocomplete to input field
////////////////////////////////////////////////////////////////////////////////  
function setAutoComplete(input, results, service, data_type) {
    var input_element = ($('#' + input).length > 0) ? $('#' + input) : false;
    var results_element = ($('#' + results).length > 0) ? $('#' + results) : false;
    var timeout;

    // Ensure we have a valid results element
    if(!results_element || !input_element ) { 
		return false;
	}
    
	// Check that this element has not already got Autocomplete bound by testing
	// for keydown events.
    // Custom event handlers must be therefore bound AFTER the setAutocomplete call.
    if(input_element.data('events') && input_element.data('events').keydown ) { 
		return false;
	}
    
	// Ensure results container has appropriate class
    if(!results_element.hasClass('ajaxResults') ) {
		results_element.addClass('ajaxResults');
	}
    
	//  Ensure we have our UL
    if($('ul#destChoices', results_element).length === 0 ) { 
		results_element.html('<ul id="destChoices">'); 
	}
    
	//  Ensure browser native autocomplete is not enabled
    input_element.attr('autocomplete', 'off');
    
	// Close autocomplete when any other elements are clicked
    // This is done after 200ms to not interfere with results selection
    // Our event handlers are namespaced as to not conflict with possible 
	// unbinds on any given page
    if(touchEnabled()) {
		input_element.bind('blur.clearAutoComplete', 
						   function() {
								timeout = setTimeout(function() {
														if(ac_scroll_active) { 
															return false; 
														}
									
														else { 
															clearAutoComplete(); 
														}
							  
														clearTimeout(timeout);
													 }, 200);
						  });
	
		$('body').bind('click.clearAutoComplete', function() { 
														clearAutoComplete(); 
												  });
    }
    
	else {
		$('body').bind('click.clearAutoComplete', function() { 
														clearAutoComplete(); 
												  });
    }

    // To resolve the mouse & keyboard mix on poor browser scrollbar 
	// implementations, we must ensure focus is assigned to our input element.
    $('ul#destChoices', results_element).scroll(function() {
		if($(document.activeElement).attr('id') !== input) { 
			ac_scroll_active = true; $('#' + input).focus(); 
		}
    });

    //  Test to see if we are using the bgIframe plugin
    if(typeof jQuery().bgiframe === 'function' && 
	   $('ul#destChoices', results_element).bgiframe() !== false) {
			ac_ie6_compliance = 2;
	}

    // Event handlers
    input_element.click(function() {
    	var val = $(this).val(),
        
		element = document.getElementById(input);
      	
		//  Highlight text
      	if(element.setSelectionRange) { 
			element.setSelectionRange(0, 9999); 
		}
      	
		else { 
			element.select(); 
		}
      	
		//  Check if value exists and that there are more than 2 characters
      	if(val && val.trim().length > 2) {  
			autoComplete(input, results, service, data_type); 
		}
		
      	else { 
			return false;
		}
    
	}); // End click() function

	//////////////////////////////////////////////////////////////////////
	//
	//////////////////////////////////////////////////////////////////////
	input_element.keydown(function(key) {
		var val = $(this).val().trim();
		var code = key.keyCode || key.which;
		var temp;
		var sizzle = $('ul', results_element);
	
		if(sizzle.scrollTop() === ((ac_results_count * 18) - 72)) { 
			ac_remainder = true; 
		}
		
		else { 
			ac_remainder = false; 
		}
		
		//  Clear our hidden field values
		//  This replaces a change event function in plantripdynamics.js (Line 72~)
		
		// Changes made for one way car rental - Start
		if(input != 'carGOTo' && input != 'carDropOff') {
			$('#ojId').val('');
			$('#ojGw').val('');
			$('#ojCountry').val('');
		}
		
		// Changes made for one way car rental - End
			
		//  Ensure we have a valid value & string length
		//  Please note we are firing on keydown
		if(val.length >= 2 ) {
			if(code === 8 && val.length === 3) { 
				clearAutoComplete(); 
			}
			
			// If character is valid for autocomplete, fire new request after 200ms
			// Valid characters are a-z (capitals & lower case) & backspace
			else if((code > 64 && code < 91) || code === 8) {
				// We compare our timeout functions to ensure fast typers (-200ms a key)
				// do not queue large numbers of functions.
				// This aids in limiting unnecessary queueing of HTTP requests
				if(ac_timeout_last === 0) {
					ac_results_selected = ac_ie6_compliance;
					ac_timeout = setTimeout(function () {
												autoComplete(input, results, service, data_type); 
												clearTimeout(ac_timeout); 
											}, 200);
					ac_timeout_last = ac_timeout;
				}
			}
			
			//////////////////////////////////////////////////////////////
			// If user is attempting to use the down arrow
			//////////////////////////////////////////////////////////////
			else if(code === 40) {
				key.preventDefault();
				
				if(ac_results_selected === ac_results_count) {
					sizzle.animate({scrollTop:$('ul', results_element).get(0).scrollHeight}, {queue:false, duration:100});
					return false;
				}
			  
				else {
					$('ul#destChoices li:nth-child('+ ac_results_selected +')', results_element).removeClass('acHighlight');
				
					// Standard movement
					if((((ac_results_selected + 1) - ac_ie6_compliance) % 4 === 0 )) {
						$('ul', results_element).animate({scrollTop:'+=72'},{queue:false, duration:100});
					}
					
					ac_results_selected += 1;   //  This line must follow our conditional
					
					// We don't higlight group/title headers
					var selectedItem = $('ul#destChoices li:nth-child('+ ac_results_selected +')', results_element);

					if(selectedItem.hasClass("titleParent") == false) {
						selectedItem.addClass('acHighlight');
					}
				}
			
			} // End if(Down arroe)
			
			//////////////////////////////////////////////////////////////
			// If user is attempting to use the up arrow
			//////////////////////////////////////////////////////////////
			else if(code === 38) {
				key.preventDefault();
				
				if(ac_results_selected === ac_ie6_compliance) {
					sizzle.animate({scrollTop:0}, {queue:false, duration:100});
					return false;
				}
				
				else {
					$('ul#destChoices li:nth-child('+ ac_results_selected +')', results_element).removeClass('acHighlight');
					
					ac_results_selected -= 1;   //  This line must precede our conditional
				
					if(((ac_results_selected + 1) - ac_ie6_compliance ) === (((ac_results_count + 1) - ac_ie6_compliance) - (((ac_results_count + 1) - ac_ie6_compliance) % 4))) {
						temp = (( (ac_results_count + 1) - ac_ie6_compliance ) % 4)*18;
						sizzle.animate({scrollTop:'-='+temp}, {queue:false, duration:100});
					}
				
					//  Standard movement
					else if(((((ac_results_selected + 1) - ac_ie6_compliance) % 4) === 0) && (ac_results_selected < (( (ac_results_count + 1) - ac_ie6_compliance ) - (( (ac_results_count + 1) - ac_ie6_compliance ) % 4)))) {
						$('ul', results_element).animate({scrollTop:'-=72'}, {queue:false, duration:100});
					}
				  
					// We don't higlight group/title headers
					var selectedItem = $('ul#destChoices li:nth-child('+ ac_results_selected +')', results_element);

					if(selectedItem.hasClass("titleParent") == false) {
						selectedItem.addClass('acHighlight');
					}
					
					ac_remainder = false;
				}
				
			} // End if(Up arrow)
			
			//////////////////////////////////////////////////////////////
			//  If user has hit the return key
			//////////////////////////////////////////////////////////////
			else if(code === 13 && $('ul#destChoices', results_element).is(':visible')) {
				$('ul#destChoices li:nth-child('+ ac_results_selected +')', results_element).click();
				
				return false;
			}
			
		} // End if(input length is at least 3 chars)
		
		else { 
			clearAutoComplete(); 
		}
	
	}); // End keydown() function
	
} // End setAutoComplete()

//  PRE-EXISTING FUNCTIONS
//  ======================
////////////////////////////////////////////////////////////////////////////////
// The only change to "setDPDestination" has been the updated variable name 
// reflecting the user's chosen language.
////////////////////////////////////////////////////////////////////////////////  
// this function is used to pre-populate the plantrip destination field for
// non-flight products. Note. the code that calls this should be in a doc-ready 
// statement at the bottom of the page.
function setDPDestination(productType, stationCode) {
	// productType should be supplied as hotel, car, experience, flighthotel or 
	// flightcar stationCode is the 3-letter aiport code NB. some city codes may
	// work, though not all.
	var theTargetField = '';
	
	switch(productType) {
		case 'hotel':
			theTargetField = '#hotelGOTo';
		
			break;
		
		case 'car':
			theTargetField = '#carGOTo';
			
			break;
		
		case 'experience':
			theTargetField = '#expGOTo';
			
			break;
		
		case 'flighthotel':
			theTargetField = '#packageTo';
			
			break;
		
		case 'flightcar':
			theTargetField = '#packageTo';
			
			break;
	}
	
	// productType is car, hotel, experience, flightHotel or flightCar
	finalURL = OJUrl + 
			   '?capability=' + productType + 
			   '&ajaxSearch=' + stationCode + 
			   "&language=" + ac_user_language;
	
	$.get(finalURL, function(data) {
		// get the total of results
		var ansLength = data.length;
		
		// if there are results populate the results div
		if(ansLength > 0) {
			data = data.replace(/\r/g, '');
			data = data.replace(/\n/g, ''); //get rid line feeds
			
			//the data comes back in a <ul>
			var splitData = data.split("<li");
			
			// Go through each result
			for(var i=0; i<=splitData.length; i++) {
				var gwmatch = /gw="(.+?)"\s*country/.exec(splitData[i]);
				
				if(gwmatch) {
					// If the 'gw' value and the code match...
					if(gwmatch[1] == stationCode.toUpperCase()) {
						var ojGw=gwmatch[1];
						var textmatch = /">(.+?)<\/li>/.exec(splitData[i]);
						
						if(textmatch) {
							var ojText=textmatch[1];
							
							//if the code is in the text in brackets
							if(ojText.indexOf('('+stationCode.toUpperCase())!=-1) {
								var idmatch = /id\s*=\s*"(.+?)"\s*name/.exec(splitData[i]);
								
								if(idmatch) {
									var ojId=idmatch[1];
								}
								
								var countrymatch = /country\s*=\s*"(.+?)">/.exec(splitData[i]);
								
								if(countrymatch) {
									var ojCountry=countrymatch[1];
								}
								
								// sanity check
								if((ojId) && (ojGw) && (ojCountry) && (ojText)) {
									$("#ojId").val(ojId);
									$("#ojGw").val(ojGw);
									$("#ojCountry").val(ojCountry);
									$(theTargetField).val(ojText);
									return;
								}
							}
						}
						
					} // End if(If the 'gw' value and the code match)
					
				} // End if(gwmatch)
			
			} // End for(each result)
		
		} // End if(we got a response)
	
	}); // End $.get()
							
} // End setDPDestination() function

////////////////////////////////////////////////////////////////////////////////
// Detect if we are running in a 'touch' enabled browser and return true if we
// are or false if we aren't
////////////////////////////////////////////////////////////////////////////////
function touchEnabled() {
	return('ontouchstart' in window);
}