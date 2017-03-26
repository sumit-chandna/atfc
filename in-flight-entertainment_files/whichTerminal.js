/*jslint plusplus: true, regexp: true, white: true */
/*global $: false, jQuery: false, tableTrans: false, checkInlineValidation: false, clearAutoComplete: false, setAutoComplete: false, DWRdestsResponseParser: false, refDayNumbers: false, refMinDayOfWeek: false, refMonth: false, refSMonth: false, checkInputFields: false, setTimeout: false, vsgGlobalTranslations: false */

(function ($) {
    'use strict';

    $.fn.baWhichTerminal = function () {
        // global definitions
        var $WT                 = $(this), //current component
            $WTForm             = $WT.find('[id^="termForm-"]'), //id of this components form section
            $searchError        = $WT.find('#searchError'), //error message section
            $searchResults      = $WT.find('#searchResults'), //results section
            tableTrans = { //get the translated content from hidden elements 
                depart:         $WT.find('#labelDepart').text(),
                arrive:         $WT.find('#labelArrive').text(),
                from:           $WT.find('#labelFrom').text(),
                to:             $WT.find('#labelTo').text(),
                on:             $WT.find('#labelOn').text(),
                flight:         $WT.find('#labelFlight').text(),
                terminal:       $WT.find('#labelTerminal').text(),
                error:          $WT.find('#searchErrorMessage').text()
            },
            spinnerModalDefaults = {
                message:        $WT.find('#spinnerModalMessage').text()
            },
            // cross ref back to number from short month name
            monthXref = { //month numbers
                'JAN': 0,   'FEB': 1,   'MAR': 2,
                'APR': 3,   'MAY': 4,   'JUN': 5,
                'JUL': 6,   'AUG': 7,   'SEP': 8,
                'OCT': 9,   'NOV': 10,  'DEC': 11
            },
            enMonth = [ //shortened month names in english
                'Jan', 'Feb', 'Mar',
                'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'
            ],
            validApts           = 'LGW,LHR,LCY', //available airports to choose
            ieVersion           = $.browser.msie ? parseInt($.browser.version, 10) : false, //get ie version where used
            instanceId          = $WT.attr('id'), //component id
            refMonth            = $WT.find('#dcMonths').text().split(','),//get the translated content from hidden elements 
            refDayOfWeek        = $WT.find('#dcDays').text().split(','),
            refSMonth           = $WT.find('#dcMonthsShort').text().split(','),
            refMinDayOfWeek     = $WT.find('#dcDaysMin').text().split(','),
            theCountry          = $WT.find('#countryCode').text().toLowerCase(),
            dpFormat            = (theCountry === 'us' ? 'mm/dd/y' : 'dd/mm/y'), //adjust date format depending on US
            aptNameDecode       = [], //fetch airport name
            tableTop            = '', //string to build table
            tableBottom         = '</table>',
            xmlDocument, // build the xml document to form part of the query
            whatTerm, //terminal to arrive/depart from
            xhr; //builds ajax request

        // sets or gets 'busy' indicator of the form - used for validation purposes
        function isBusy(busy) {
            if (typeof busy === 'boolean') {
                $WTForm.data('busy', busy);
            } else {
                return $WTForm.data('busy');
            }
        }

        // get airport details by airport code
        function getDecode(apt, aptObj) {
            apt = apt.toUpperCase();
            if (aptNameDecode[apt] === undefined) {
                $.get('/dwr/exec/locationHelper.getMatchedLocations.dwr', {
                    'callCount': '1', 
                    'c0-scriptName': 'locationHelper', 
                    'c0-methodName': 'getMatchedLocations', 
                    'xml': 'true', 
                    'c0-param0': 'string:' + apt
                }, function (data) {
                    var rx = new RegExp('.*"([^,"]+,\\s[^,]+,\\s' + apt + ',\\s[^,"]+)".*'),
                    // extract aiport details - ex.: "Madrid, Spain, MAD, Madrid"
                    aptDetails = data.replace('\n', ' ').replace(rx, '$1'),
                    aptDetailsArray = aptDetails.split(','),
                    // extract airport name from airport details
                    aptName = $.trim(aptDetailsArray[3]);
                    aptNameDecode[apt] = aptName;

                    $(aptObj).html(aptName + ' (' + apt + ')');
                });
            } else {
                $(aptObj).html(aptNameDecode[apt] + ' (' + apt + ')');
            }
        }

        // decode airport codes in results table
        function setAirportDecode() {
            var apt;

            $WT.find('.tsApt').each(function () {
                apt = $(this).html();
                getDecode(apt, $(this));
            });
        }

        // create table top
        function getTableTop() {
            tableTop = '<table>';
            tableTop += '<colgroup>' +
                '<col class="col1" />' +
                '<col class="col2" />' +
                '<col class="col3" />' +
                '<col class="col4" />' +
                '<col class="col5" />' +
                '<col class="col6" />' +
                '</colgroup>';

            tableTop += '<thead><tr>';
            tableTop += '<th>' + tableTrans.depart + '</th>';
            tableTop += '<th>' + tableTrans.arrive + '</th>';
            tableTop += '<th>' + tableTrans.from + '</th>';
            tableTop += '<th>' + tableTrans.to + '</th>';
            tableTop += '<th>' + tableTrans.flight + '</th>';
            tableTop += '<th>' + tableTrans.terminal + '</th>';
            tableTop += '</tr></thead>';

            return tableTop;
        }

        // get a markup for search results introduction heading, displayed just over the results table
        function getSearchResultHeading() {
            var heading = '',
                location = { //get value of from and to. Check whether you are arriving in or departing from London
                    from: ($WTForm.find('#depFrom1').is(':visible') ? $WTForm.find('#depFrom1 option:selected').text() : $WTForm.find('#arrTo1 input:first').val()),
                    to:   ($WTForm.find('#depFrom2').is(':visible') ? $WTForm.find('#depFrom2 input:first').val() : $WTForm.find('#arrTo2 option:selected').text())
                },
                date = (function () {
                    var d = $WTForm.find('[name="departureDate"]').val(),
                        dateObject;

                    //get the date and adjust correctly for USA
                    if (theCountry === 'us') {
                        dateObject = {
                            day:    parseInt(d.substr(3, 2), 10),
                            month:  parseInt(d.substr(0, 2), 10) - 1
                        };
                    } else {
                        dateObject = {
                            day:    parseInt(d.substr(0, 2), 10),
                            month:  parseInt(d.substr(3, 2), 10) - 1
                        };
                    }

                    dateObject.year = parseInt('20' + d.substr(6, 2), 10);

                    return dateObject;
                }());

            // strip off brackets from location names, if present
            location.from = location.from.replace(/^.+,(.+)$/, '$1').replace(/\(|\)/g, '');
            location.to = location.to.replace(/^.+,(.+)$/, '$1').replace(/\(|\)/g, '');

            //build the output for the heading
            heading = '<h3>' + location.from +
                    ' ' + tableTrans.to.toLowerCase() +
                    ' ' + location.to +
                    ' ' + tableTrans.on.toLowerCase() +
                    ' ' + refDayOfWeek[(new Date(date.year, date.month, date.day)).getDay()] +
                    ' ' + date.day +
                    ' ' + refSMonth[date.month] +
                    '</h3>';

            return heading;
        }

        // show error/info message pod
        function showError() {
            $searchError.html('<p>' + tableTrans.error + '</p>').prop('hidden', false).show();
            $('html, body').animate({
                scrollTop: $searchError.offset().top - 10
            }, 'slow');
        }

        function t5CheckApt(apt1, apt2) {
            // if LON selected then check if aiport returned in XML is LHR, LGW or LCY otherwise test it as normal
            if (apt1 === 'LON') {
                if (validApts.indexOf(apt2) > -1) {
                    return true;
                }
            } else if (apt1 === apt2) {
                return true;
            }

            return false;
        }

        // build results table rows
        function buildResultRows(xml) {
            var tableContent = '',
                noError = true,
                numResults = 0,
                numFlights,
                depLON,
                checkApt,
                depApt,
                arrApt;

            tableTop = getSearchResultHeading() + getTableTop();

            // check for any returned error messages in the XML
            $(xml).find('ErrorText').each(function () {
                noError = false;
            });

            if (noError) {

                // if arriving at LON then set flag to false
                if ($WT.find('#userPrefFrom:checked').length > 0) {
                    depLON = true;
                    checkApt = $WT.find('#outFrom').val();
                } else {
                    depLON = false;
                    checkApt = $WT.find('#inTo').val();
                }

                // no errors so try and parse details out
                $(xml).find('Sector').each(function () {

                    // only get details if only one flight (i.e. direct and not connecting journey)
                    numFlights = $(this).find('FlightSegment').length;

                    if (numFlights === 1) {

                        $(this).find('FlightSegment').each(function () {

                            // get departure and arrival airports
                            depApt = $(this).find('DepartureAirport').text();
                            arrApt = $(this).find('DestinationAirport').text();

                            if ((depLON && t5CheckApt(checkApt, depApt)) || (!depLON && t5CheckApt(checkApt, arrApt))) {

                                // only pick flights where to and from match identically (avoids connecting flights)
                                var carrier = $(this).find('CarrierCode').text(),
                                    flight = $(this).find('FlightNumber').text(),

                                    depTime     = $(this).find('DepartureTime').text(),
                                    depDate     = $(this).find('DepartureDate').text(),
                                    depDateMon  = monthXref[depDate.substr(2, 3)],
                                    depDateMMM  = refSMonth[depDateMon],
                                    depTimeDate = depTime.substr(0, 2) + ':' + depTime.substr(2, 2) + ', ' + depDate.substr(0, 2) + ' ' + depDateMMM,

                                    arrTime     = $(this).find('ArrivalTime').text(),
                                    arrDate     = $(this).find('ArrivalDate').text(),
                                    arrDateMon  = monthXref[arrDate.substr(2, 3)],
                                    arrDateMMM  = refSMonth[arrDateMon],
                                    arrTimeDate = arrTime.substr(0, 2) + ':' + arrTime.substr(2, 2) + ', ' + arrDate.substr(0, 2) + ' ' + arrDateMMM;

                                if (depLON) {
                                    whatTerm = $(this).find('DepartureTerminal').text();
                                } else {
                                    whatTerm = $(this).find('DestinationTerminal').text();
                                }

                                // add result to the table only if terminal number is available
                                //make allowances for LCY having only one terminal 
                                if (whatTerm !== '' || depApt === "LCY" || arrApt === "LCY") {
                                    // now build search results
                                    tableContent += '<tr><td>' + depTimeDate + '</td><td>' + arrTimeDate + '</td><td class="tsApt">' + depApt + '</td><td class="tsApt">' + arrApt + '</td><td>' + carrier + flight + '</td><td>' + whatTerm + '</td></tr>';
                                    numResults++;
                                }
                            }
                        }); //close each
                    }
                });
            }

            // check if results > 0 then show results otherwise show error/info message
            if (numResults > 0) {
                $searchResults.html(tableTop + tableContent + tableBottom);
                setAirportDecode();

                //fixes selectivor issues with dynamiclly generated content in <= IE8
                if (ieVersion && ieVersion <= 8) {
                    $WT.find('thead tr:first-child, th:first-child, td:first-child').addClass('slvzr-first-child');
                    $WT.find('th:not(.scope)').addClass('slvzr-not4046scope41');
                    $WT.find('tr:last-child').addClass('slvzr-last-child');
                }

                $searchResults.slideDown(500);
            } else {
                showError();
            }
        }

        function convertArrival(oldArr) {
            //if the airport code is 3 letters return it
            if (oldArr.length === 3) {
                return oldArr;
            }

            var arrParams = oldArr.split(', ');
            //get the airport code from the content 
            if (arrParams[2] !== 'undefined') {
                return arrParams[2];
            }

            return oldArr;
        }

        // this function only required for calendar picker
        function getCalDate() {
            var dep = $WT.find('#' + instanceId + '-departureDate').val(),
                depDate = dep.substr(0, 2) + enMonth[parseInt(dep.substr(3, 2), 10) - 1] + '20' + dep.substr(6, 2);

            if (theCountry === 'us') {
                depDate = dep.substr(3, 2) + enMonth[parseInt(dep.substr(0, 2), 10) - 1] + '20' + dep.substr(6, 2);
            }

            return depDate.toUpperCase();
        }

        function getXmlQueryMarkup(data) {
            //build xml to be used in the ajax request - use the content that was entered into the fields
            var xml = '<FlightTimetablesRequest><BABias>true</BABias><Sector><DepartureAirport>' +
                            data.departureAirport +
                        '</DepartureAirport><DestinationAirport>' +
                            data.destinationAirport +
                        '</DestinationAirport><DepartureDate>' +
                            data.departureDate +
                        '</DepartureDate><CarrierPref1>BA</CarrierPref1><CarrierPref2></CarrierPref2><CarrierPref3></CarrierPref3></Sector></FlightTimetablesRequest>';

            $('<FlightTimetablesRequest/>', {
                html: $('<BABias/>', {
                    text: 'true'
                })
            });

            return xml;
        }

        // set autocomplete
        clearAutoComplete();
        setAutoComplete(instanceId + '-outTo', 'outToAutoComplete', '/dwr/exec/locationHelper.getMatchedLocations.dwr?callCount=1&c0-scriptName=locationHelper&c0-methodName=getMatchedLocations&xml=true&c0-param0=string:', 'DWRdests');
        setAutoComplete(instanceId + '-inFrom', 'inFromAutoComplete', '/dwr/exec/locationHelper.getMatchedLocations.dwr?callCount=1&c0-scriptName=locationHelper&c0-methodName=getMatchedLocations&xml=true&c0-param0=string:', 'DWRdests');

        // set default busy flag
        isBusy(false);

        // switch between arriving and departing
        $WTForm.find('input[name="userPref"]').on('click', function () {
            isBusy(true);

            if ($(this).val() === 'true') {
                //Reset widget styling
                $WTForm.livesiteErrorHandler('reset', $('.mfPreSubmitError'));
                //Hide unwanted fields and remove validation attributes
                $WTForm.find('#' + instanceId + '-inFrom, #inTo').attr({'aria-required': 'false', 'data-skipval': 'true'});
                $WTForm.find('#arrTo1, #arrTo2').hide();
                //Attach validation attributes and show new fields
                $WTForm.find('#' + instanceId + '-outTo, #outFrom').attr({'aria-required': 'true', 'data-skipval': 'false'});
                $WTForm.find('#depFrom1, #depFrom2').show();
                //Update validation widget to detect new fields
                $WTForm.validateForm('formUpdate');
            } else {
                $WTForm.livesiteErrorHandler('reset', $('.mfPreSubmitError'));
                $WTForm.find('#' + instanceId + '-outTo, #outFrom').attr({'aria-required': 'false', 'data-skipval': 'true'});
                $WTForm.find('#depFrom1, #depFrom2').hide();
                $WTForm.find('#' + instanceId + '-inFrom, #inTo').attr({'aria-required': 'true', 'data-skipval': 'false'});
                $WTForm.find('#arrTo1, #arrTo2').show();
                $WTForm.validateForm('formUpdate');
            }
        });

        // date picker
        $WTForm.find('#' + instanceId + '-departureDate').datepicker({
            dateFormat: dpFormat,
            altFormat: dpFormat,
            duration: 'fast',
            firstDay: 1,
            maxDate: '+356',
            minDate: 0,
            numberOfMonths: 2,
            dayNamesMin: refMinDayOfWeek,
            monthNames: refMonth,
            monthNamesShort: refSMonth,
            prevText: '',
            nextText: '',
            onRender: function (date) {
                return {
                    disabled: (date.getTime() < (new Date()).getTime())
                };
            }
        });

        // submit button actions
        $WTForm.submit(function (event) {
            event.preventDefault();

            // on submit form validation
            if (!$WTForm.validateForm('validate')) {
                return;
            }

            $searchResults.add($searchError).prop('hidden', true).hide();

            // use different combinations of fields dependant on user pref for departing/arriving
            if ($WTForm.find('#userPrefFrom:checked').length > 0) {
                // departing from LON - set hidden field with 3-letter code
                $WTForm.find('#outToActual').val(convertArrival($WTForm.find('#' + instanceId + '-outTo').val()));
                // populate XML string to be passed out
                xmlDocument = getXmlQueryMarkup({
                    departureAirport:   $WTForm.find('#outFrom').val(),
                    destinationAirport: $WTForm.find('#outToActual').val(),
                    departureDate:      getCalDate()
                });
            } else {
                // arriving to LON - set hidden field with 3-letter code
                $WTForm.find('#inFromActual').val(convertArrival($WTForm.find('#' + instanceId + '-inFrom').val()));
                // populate XML string to be passed out
                xmlDocument = getXmlQueryMarkup({
                    departureAirport:   $WTForm.find('#inFromActual').val(),
                    destinationAirport: $WTForm.find('#inTo').val(),
                    departureDate:      getCalDate()
                });
            }

            var rand = (new Date()).getTime(),
                theURL = '/flightInformation/OLTimetablesIVR2.jsp?rand=' + rand;

            // A safeguard to prevent from showing results from previous ajax call, when results from currently pending call are not displayed yet.
            // Needed in case when the user submits the form rapidly 2 or more times and ivokes call after call, when previous one is not comlpete yet.
            if (xhr !== undefined) {
                xhr.aborted = true;
                xhr.abort();
            }

            // ajax call
            xhr = $.ajax({
                url: theURL,
                processData: false,
                data: xmlDocument,
                timeout: 10000,
                beforeSend: function () {
                    // show loader
                    $WT.showAjaxActivity(spinnerModalDefaults);
                },
                success: function (xml) {
                    xml = xml.replace(/^\s+|\s+$/, '');

                    // use parseXML instead of dataType: 'xml' parameter, as sometimes $.ajax's internal xml parser fails even if returned xml is valid.
                    buildResultRows($.parseXML(xml));

                    // hide loader
                    $WT.hideAjaxActivity();
                },
                error: function (xhr) {
                    // don't show error message, if the call has been aborted
                    if (!xhr.aborted) { 
                        showError();
                    }

                    // hide loader
                    $WT.hideAjaxActivity();
                }
            });
            return false;
        });
    };
}(jQuery));