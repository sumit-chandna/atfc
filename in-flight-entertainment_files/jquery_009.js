/********************************************************************************
/*  ba serverside countdown timer plugin                                        *
 *                                                                              *
 *  Author: Ian Forster	                                                        *
 *  Date: 09/09/2011                                                            *
 *  Dependencies: /cms/global/scripts/lib/jQuery_plugins/jquery.countdown.js    *
 *                /cms/functional/flash/serverDateTime.jsp                      *
 *                                                                              *
 *  This pluging extends the jquery.countdown.js plugin by getting the server   *
 *  from serverDateTime.jsp. It uses most of the defaults from                  *
 *  jquery.countdown.js and exposes only 'timezone' and 'until'.                *
 ********************************************************************************/
(function ($) {
	$.fn.bacountdown = function (options) {
		var settings = {
			'timezone'		: null,
			'until'			: null, // new Date(year, mth - 1, day, hr, min, sec)
			'layout' 		: '', // Build your own layout for the countdown
			'offsetTimezone' : false
		};

		function serverTime() {

			//time defaults to client time and is reset as server time for ajax call is succesful.
			var serverYear = null, serverMonth = null, serverDay = null, serverHour = null, serverMin = null, serverSec = null;
			
			$.ajax({
				   url: "/cms/functional/flash/serverDateTime.jsp",
				   async: false,
				   dataType: 'text',
				   type: "POST",
				   success: function( data ){

					   //Breakdown retrieved server time to create a JS date object of the same time
					   timeElements = data.split("&");
					   serverYear = timeElements[2].slice( (timeElements[2].indexOf("=")+1) );
					   serverMonth = timeElements[3].slice( (timeElements[3].indexOf("=")+1) );
					   serverDay = timeElements[4].slice( (timeElements[4].indexOf("=")+1) );
					   serverHour = timeElements[5].slice( (timeElements[5].indexOf("=")+1) );
					   serverMin = timeElements[6].slice( (timeElements[6].indexOf("=")+1) );
					   serverSec = timeElements[7].slice( (timeElements[7].indexOf("=")+1) );
					  
					   	//Update time with applicable offsetTimezone
					   	time = new Date(serverYear, serverMonth, serverDay, serverHour, serverMin, serverSec);
				 		if (settings.offsetTimezone) {
				   			time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
				   		}
				   		
				   		

				},
				error: function(){

					//remove the countdownClock completely if servertime cannot be found
					$('#pageHeader #clockTitle .cdClock').remove();
			}
		});

		return time;
		}

		return this.each(function () {
			var $this = $(this);

			// If options exist, lets merge them with our default settings
			if (options) {
				$.extend(settings, options);
			}

			//call the countdown method
			$this.countdown({
				until: settings.until,
				serverSync: serverTime,
				format: 'DHMS',
				layout: settings.layout,
				timezone: settings.timezone
			});
		});

	};
})( jQuery );
