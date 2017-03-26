<!-- this is the stuff we will farm out to a core jquery utils file of some sort-->
jQuery.fn.doPopup = function(options) {
	//These are the default values that will be used unless specified in the function call
	var defaults = {width: 450,
					height: 350,
					toolbar: "no",
					name: "BA_Popup",
					location: "no",
					directories: "no",
					status: "yes",
					menubar: "no",
					scrollbars: "yes",
					resizable: "yes"
	}

	// get the default options overlaid with any supplied by calling functionality
	var options = jQuery.extend(defaults, options);
	
	// loop through each selected element in the jQuery selector
	return this.each(function() {
		// add click function to each link
		jQuery(this).click(function(event) {
			// Prevent event being passed on to default handler
			event.preventDefault();

			// Define the attributes of the new window (NOTE: any features that
			// are missing from this list are assumed to be off)
			var toolbar = "toolbar=" + options.toolbar + 
						  ",location=" + options.location + 
						  ",directories=" + options.directories + 
						  ",menubar=" + options.menubar + 
						  ",status=" + options.status + 
						  ",scrollbars=" + options.scrollbars + 
						  ",resizable=" + options.resizable + 
						  ",width=" + options.width + 
						  ",height=" + options.height;

			var newPopup = window.open(this.href, options.name, toolbar);
			
			newPopup.focus();
		});
	});
}
