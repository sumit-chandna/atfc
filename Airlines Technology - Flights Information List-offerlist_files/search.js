$(document).ready(function () {
            // NDCFramework 
            $('#NDCUC').change(function (event) {  //on click 
                debugger;
                var data = ["DBX", "CMB", "2015-06-19", "2015-06-30", "2", "1", "1", "JKF", "FRA", "2015-04-03", "2015-04-23", "2", "0", "0", "DBX", "CMB", "2015-06-19", "2015-06-30", "2", "1", "1", "JKF", "FRA", "2015-04-03", "2015-04-23", "2", "0", "0"];
                if (this.value == "U1") {

                    updAdult
                    $("#txtDepartureCity").val(data[0]);
                    $("#txtOriginAirport").val(data[1]);
                    $("#datepickerDeparture").val(data[2]);
                    $("#datepickerReturn").val(data[3]);
                    $("#updAdult").val(data[4]);
                    $("#updChild").val(data[5]);
                    $("#updInfant").val(data[6]);

                }
                else if (this.value == "U2") {
                    $("#txtDepartureCity").val(data[7]);
                    $("#txtOriginAirport").val(data[8]);
                    $("#datepickerDeparture").val(data[9]);
                    $("#datepickerReturn").val(data[10]);
                    $("#updAdult").val(data[11]);
                    $("#updChild").val(data[12]);
                    $("#updInfant").val(data[13]);

                }

                else if (this.value == "U3") {
                    $("#txtDepartureCity").val(data[14]);
                    $("#txtOriginAirport").val(data[15]);
                    $("#datepickerDeparture").val(data[16]);
                    $("#datepickerReturn").val(data[17]);
                    $("#updAdult").val(data[18]);
                    $("#updChild").val(data[19]);
                    $("#updInfant").val(data[20]);

                }

                else if (this.value == "U4") {
                    $("#txtDepartureCity").val(data[21]);
                    $("#txtOriginAirport").val(data[22]);
                    $("#datepickerDeparture").val(data[23]);
                    $("#datepickerReturn").val(data[24]);
                    $("#updAdult").val(data[25]);
                    $("#updChild").val(data[26]);
                    $("#updInfant").val(data[27]);

                }
            });
            
            
            $('#roundTrip').click(function(){
            	$('#returndatediv').show(); 
            });
            
            $('#onewayTrip').click(function(){
            	$('#datepickerReturn').val('');
            	$('#returndatediv').hide();
            })
            
            

            
            
            
            
            $('#searchFlightbtn1').click(function(e){
            	
            	e.preventDefault();
            	
            	var errorMessage;
            	
            	var valid=true;
            	
            	if( !($('#roundTrip').is(':checked') )){
            		errorMessage='Please select the type of trip';
            		valid=false;
            	}
            	if($('#DepartureCity').val().length == 0){
            		errorMessage='Departure City can not be empty';
            		valid=false;
            	}
            	if($('#destinationCity').val().length == 0){
            		errorMessage='Destination City can not be empty';
            		valid=false;
            	}
            	if($('#datepickerDeparture').val().length==0){
            		errorMessage='Departur Date can not be empty';
            		valid=false;
            	}
            	if($('#roundTrip').is(':checked') 
            			&& $('#datepickerReturn').val().length==0){
            		errorMessage='Return Date can not be empty for a Round Trip';
            		valid=false;
            	}
            	if($('#adultCount').val()==0 ){
            		errorMessage='Please select atleast on Adult count';
            		valid=false;
            	}
            	
            	if(valid){
            		$('#searchflightform').submit();
            	}else{
            		alert(errorMessage);
            	}
            	return false;
            	
            })
        });




$(window).load(function(){
	 
		 if(document.getElementById("onewayTrip").checked) {
			 
			 $('#datepickerReturn').val('');
         	$('#returndatediv').hide();
		    } 
		 else {
			 $('#returndatediv').show(); 
		    }
     
	
	});


     $(function () {

          $("#datepickerDeparture").datepicker({
              showOn: "button",
              buttonImage: "resources/static/img/calendar.gif",
              buttonImageOnly: true,
              buttonText: "Select date",
              showOn: "both",
              dateFormat: 'yy-mm-dd'
          });

          $("#datepickerReturn").datepicker({
              showOn: "button",
              buttonImage: "resources/static/img/calendar.gif",
              buttonImageOnly: true,
              buttonText: "Select date",
              showOn: "both",
              dateFormat: 'yy-mm-dd'
          });

      });
    

        function fnValidate() {
            if (document.getElementById("txtDepartureCity").value == '')
            {
                alert('Please enter depature city');
                document.getElementById("txtDepartureCity").focus();
                return false;
            }
            if (document.getElementById("txtOriginAirport").value == '')
            {
                alert('Please enter arrival city');
                document.getElementById("txtOriginAirport").focus();
                return false;
            }

            if (document.getElementById("datepickerDeparture").value == '')
            {
                alert('Please enter arrival city');
                document.getElementById("datepickerDeparture").focus();
                return false;
            }
            if (!document.getElementById("optOneWay").checked) {

                if (document.getElementById("datepickerReturn").value == '') {
                    alert('Please enter arrival city');
                    document.getElementById("datepickerReturn").focus();
                    return false;
                }
            }
            return true;
        }