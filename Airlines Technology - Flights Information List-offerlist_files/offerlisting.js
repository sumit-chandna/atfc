var rootApp = angular.module('rootApp');


rootApp.controller('offerDataController', function($scope, $window, $http,
		$timeout) {
	//$scope.$emit('LOAD');
	

	/*$http.get('fetchOffers').then(function(res) {
		$scope.airshoppingrs = res.data;
		$scope.$emit('UNLOAD');
		// loadservicefunc();
	});

	$scope.hiddenDiv = false;
	$scope.showDiv = function() {
		$scope.hiddenDiv = !$scope.hiddenDiv;
	};
	var triptype=document.getElementById("tripType").value;

	$scope.show = true;
	if(triptype=="One-way"){
		$scope.show = false;	
		
	}

	/*
	 * $scope.compareOffers = function(item, event) { console.log("-->
	 * Submitting form"); console.log($scope.offers); var checked = []
	 * $("input[name='selectAirlines']:checked").each(function() {
	 * checked.push($(this).val()); }); console.log(checked); blIds =
	 * encodeURIComponent(checked); window.open(location.pathname + 'compare' +
	 * blIds); }
	 */

});

rootApp.controller('offertableWrapperContainer', function($scope) {
	$scope.$on('LOAD', function(event, args) {
		$scope.loading = true
	});
	$scope.$on('UNLOAD', function(event, args) {
		$scope.loading = false
	});

});


$(document)
		.ready(
				function() {
					$("#compareError").text("");
					$("#compareError").hide();
					// loadservicefunc = function(){
					$(document)
							.on(
									'change',
									'input:checkbox[class*=service]',
									function(event) {

										var row = $(this).parents('tr').first();
										var rowid = $(row).attr('id')
												.split("-")[1];
										var flightoffer = $(row).attr('id')
												.split("-")[0];
										var basefare = parseFloat($(
												'#' + flightoffer + 'baseprice'
														+ rowid).val());
										var taxamount = parseFloat($(
												'#' + flightoffer + 'taxamount'
														+ rowid).val());
										var offerprice = basefare + taxamount;

										var sprice = 0.0;
										var servicboxid = 'input:checkbox[class*='
												+ flightoffer
												+ 'service]:checked';
										$(this)
												.parents('tr')
												.first()
												.find(servicboxid)
												.each(
														function(e) {
															sprice = sprice
																	+ parseFloat($(
																			this)
																			.val());
														});
										$('#' + flightoffer + 'pstotal' + rowid)
												.val(sprice);

										offerprice = offerprice + sprice;
										$('#' + flightoffer + 'total' + rowid)
												.val(offerprice);

										var alltotalprice = 0.0;
										var totalelemids = 'input:text[id*='
												+ flightoffer + 'total]';
										$(this)
												.parents('table')
												.first()
												.find(totalelemids)
												.each(
														function(e) {
															alltotalprice = alltotalprice
																	+ parseFloat($(
																			this)
																			.val());
														});

										$('#' + flightoffer + 'alltotalprice')
												.val(alltotalprice);
									});
					$("#compareFlights")
							.on(
									'click',
									function(event) {
										console.log("--> Submitting form");
										var checked = []
										$(
												"input[name='selectAirlines']:checked")
												.each(
														function() {
															checked
																	.push($(
																			this)
																			.val());
														});
										console.log(checked.length);
										if (checked.length < 2) {
											$("#compareError").text(
													"Select at least 2 Offers");
											$("#compareError").show();
											event.preventDefault();
										} else if (checked.length > 3) {
											$("#compareError").text(
													"Select maximum 3 Offers");
											$("#compareError").show();
											event.preventDefault();
										} else {
											var offersObj = {
												offers : checked
											};
											var _href = $(this).attr("href")
													.split("?")[0];
											$(this).attr(
													"href",
													_href
															+ "?"
															+ $.param(
																	offersObj,
																	true));
										}
									});
				});
