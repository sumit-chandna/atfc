/*jslint browser: true, nomen: true */
/*global document: false, jQuery: false, trackingInfo: false, vsDoTracking: false */

// This jQuery plugin is built using the jQuery UI Widget Factory (http://jqueryui.com/widget/) and is dependent upon both the jQuery liberty and the jQuery UI library.
// Version 1.0
// Built by Neil Tomlin of the Retail Web Dev Component Factory Team
// Feb 2014
// Revisions:
// Dec 2014 - Include ability to validate dynamically changing forms with form update function

(function ($) {
    'use strict';
    //separate widget for fields
    $.widget('ba.validateField', {

        _create: function () {

            var field = this.element,
                i;
            this.fieldRules = [];

            for (i in this.options.rules) {
                if (this.options.rules.hasOwnProperty(i)) {
                    //check to see if any rules apply to this field
                    if (this.options.rules[i].init(field)) {
                        //if they do, add them
                        this.fieldRules.push(this.options.rules[i]);
                    }
                }
            }
        },

        validate: function () {

            var field = this.element,
                ruleType,
                rule,
                errorBox = $('.mfPreSubmitError');

            //don't validate input on checkboxes unless this is the terms checkbox
            //(fieldsets are validated for checkbox rows)
            if ((field.attr('type') !== 'checkbox') || field.attr('data-extvaltype') === 'terms') {
                //get the rules that we already found apply to this field
                for (rule in this.fieldRules) {
                    if (this.fieldRules.hasOwnProperty(rule)) {
                        ruleType = this.fieldRules[rule];
                        //check if rule is broken
                        if (!ruleType.validate(field, this)) {
                            //trigger an event and pass which rule was broken and where
                            field.trigger('newError', [ruleType.name(), field, errorBox]);
                            return false;
                        }
                    }
                }
                //if not already returned false, field must be valid
                field.trigger('isValid', [field, errorBox]);
                return true;
            }
        }
    });


    $.widget('ba.validateForm', {

        options : {
            whenValid : function () {
                return true;
            },
            country : null
        },

        rules: {

            required: {

                name : function () {
                    return 'required';
                },

                init : function (ele) {
                    return $(ele).attr('aria-required') === 'true';
                },

                validate : function (ele) {
                    var element = $(ele),
                        dob = element.find('select'),
                        count = 0,
                        errors = 0,
                        isValid = false;
                    //check something exists in radio
                    if (element.attr('data-extvaltype') === 'radio') {
                        //check buttons in fieldset to see if any are checked
                        isValid = $('input:radio[name=' + element.attr('data-extvalname') + ']:checked').length ? true : false;
                    //check something exists for checkboxes
                    } else if ((element.attr('data-extvaltype') === 'checkbox') || (element.attr('data-extvaltype') === 'multicheck')) {
                        //check boxes in fieldset to see if any are checked
                        isValid = $('input:checkbox[name=' + element.attr('data-extvalname') + ']:checked').length ? true : false;
                    } else if (element.attr('data-extvaltype') === 'terms') {
                        //terms is always required
                        isValid = element.is(':checked');
                    } else if (element.attr('data-extvaltype') === 'dob') {
                        //check all of days, months and years are complete, years is not always included
                        for (count; count < dob.length; count = count + 1) {
                            if ($(dob[count]).val() === '') {
                                errors = errors + 1;
                            }
                        }
                        if (errors === 0) {
                            isValid = true;
                        }
                    } else {
                        //check if there is any content at all
                        if (element.val() !== '') {
                            isValid = true;
                        }
                    }
                    //return whether or not required rule is met
                    return isValid;
                }
            },

            alpha : {

                name : function () {
                    return 'alpha';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvaltype') === 'alpha';
                },

                validate : function (ele) {
                    //only letters and spaces
                    var check = /^[a-zA-Z ]+$/,
                        //remove leading and trailing spaces
                        content = $.trim($(ele).val()),
                        isValid = false;

                    //if a field is not required and is blank, valid can be returned
                    //if this were required, an error event would already be created by required rule
                    if (content === '') {
                        isValid = true;
                    } else if (content.match(check)) { //Check that only alpha chars have been used
                        isValid = true;
                    }

                    return isValid;
                }
            },

            digit : {

                name : function () {
                    return 'digit';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvaltype') === 'digit';
                },

                validate : function (ele) {
                    //whole numbers only
                    var check = /^\d+$/,
                    //remove leading and trailing spaces
                        contentAsString = $.trim($(ele).val()),
                        isValid = false;

                    //if a field is not required and is blank, valid can be returned
                    //if this were required, an error event would already be created by required rule
                    if (contentAsString === '') {
                        isValid = true;
                    } else if (contentAsString.match(check)) { //Check that valid characters have been used
                        isValid = true;
                    }

                    return isValid;
                }
            },

            alphanum : {

                name : function () {
                    return 'alphanum';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvaltype') === 'alphanum';
                },

                validate : function (ele) {

                    var check = /^[\w ]+$/,
                    //remove leading and trailing spaces
                        content = $.trim($(ele).val()),
                        isValid = false;

                    //if a field is not required and is blank, valid can be returned
                    //if this were required, an error event would already be created by required rule
                    if (content === '') {
                        isValid = true;
                    } else if (content.match(check)) {//Check that only alpha chars have been used
                        isValid = true;
                    }

                    //no rules have been applied so field is valid
                    return isValid;
                }
            },

            sentence : {

                name : function () {
                    return 'sentence';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvaltype') === 'sentence';
                },

                validate : function (ele) {

                    var check = /^[\w ,.?!()''@&$£%+=\r\n\t]+$/,
                    //remove leading and trailing spaces
                        content = $.trim($(ele).val()),
                        isValid = false;

                    //if a field is not required and is blank, valid can be returned
                    //if this were required, an error event would already be created by required rule
                    if (content === '') {
                        isValid = true;
                    } else if (content.match(check)) { //Check that only alpha chars have been used
                        isValid = true;
                    }

                    return isValid;
                }
            },

            number : {

                name : function () {
                    return 'number';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvaltype') === 'number';
                },

                validate : function (ele) {

                    var check = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/,
                    //remove leading and trailing spaces
                        contentAsString = $.trim($(ele).val()),
                        isValid = false;

                    //if a field is not required and is blank, valid can be returned
                    //if this were required, an error event would already be created by required rule
                    if (contentAsString === '') {
                        isValid = true;
                    } else if (contentAsString.match(check)) { //Check that valid characters have been used
                        isValid = true;
                    }

                    return isValid;
                }
            },

            email : {

                name : function () {
                    return 'email';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvaltype') === 'email';
                },

                validate : function (ele) {

                    var content = ele.val(),
                        check = /^[a-zA-Z0-9]+(?:\.[_a-zA-Z0-9-]+)*[_a-zA-Z0-9-]+(?:\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9]+[_a-zA-Z0-9-]*(?:\.[_a-zA-Z0-9-]+)+[a-zA-Z0-9]$/i,
                        isValid = false;
                    if (content.match(check) || content === '') {
                        isValid = true;
                    }
                    return isValid;
                }
            },

            phone : {

                name : function () {
                    return 'phone';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvaltype') === 'phone';
                },

                validate : function (ele) {

                    var content = ele.val(),
                        check = /^[\*\+\(\)\- 0-9]*$/;
                    if (content.match(check)) {
                        return true;
                    }
                    return false;
                }
            },

            checkbox : {

                name : function () {
                    return 'checkbox';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvaltype') === 'checkbox';
                },

                validate : function (ele) {

                    var min = this.minChecked(ele),
                        max = this.maxChecked(ele),
                        options = $('input', ele),
                        numChecked = 0,
                        isValid = false;

                    //check if any are checked
                    options.each(function () {
                        if ($(this).is(':checked')) {
                            numChecked = numChecked + 1;
                        }
                    });
                    //check if no rules apply
                    if (max === undefined && min === undefined) {
                        isValid = true;
                    }
                    //check that number of checked boxes is within the range
                    //is a min value set?
                    if (min !== undefined) {
                        if (max !== undefined && (numChecked <= max) && (numChecked >= min)) {
                            isValid = true;
                        //there is a min but no max, check min is met
                        } else if (max === undefined && numChecked >= min) {
                            isValid = true;
                        }
                    //check not too many boxes have been checked
                    } else if (max !== undefined && numChecked <= max) {
                        isValid = true;
                    }

                    return isValid;
                },

                minChecked : function (ele) {
                    var min = ele.attr('data-extvalmin'),
                        minParsed = parseInt(min, 10);
                    //make sure a number or undefined is being passed to validate
                    if (isNaN(minParsed)) {
                        minParsed = undefined;
                    }
                    return minParsed;
                },

                maxChecked : function (ele) {
                    var max = ele.attr('data-extvalmax'),
                        maxParsed = parseInt(max, 10);
                    //make sure a number or undefined is being passed to validate
                    if (isNaN(maxParsed)) {
                        maxParsed = undefined;
                    }
                    return maxParsed;
                }
            },

            date : {

                name : function () {
                    return 'date';
                },

                init : function (ele) {
                    //container is selected for terms so find it's child
                    return $(ele).attr('data-extvaltype') === 'date';
                },

                validate : function (ele, widget) {
                    //check for valid date
                    var content = ele.val(),
                        check = /^[0-9]{2}\/[0-9]{2}\/[0-9]{2}$/,
                        days,
                        months,
                        years,
                        isValid = false;

                    //if a field is not required and is blank, valid can be returned
                    //if this were required, an error event would already be created by required rule
                    if (content === '') {
                        isValid = true;
                    } else if (content.match(check)) {
                        //get days months years
                        content = content.split('/');
                        years = parseInt(content[2], 10);
                        //split correctly where USA
                        if (widget.options.country.toLowerCase() === 'us') {
                            days = parseInt(content[1], 10);
                            months = parseInt(content[0], 10);
                        } else {
                            days = parseInt(content[0], 10);
                            months = parseInt(content[1], 10);
                        }
                        //check that valid dates have been entered
                        if ((months === 4 || months === 6 || months === 9 || months === 11) && days <= 30) {
                            isValid = true;
                        } else if (months === 2) {
                            if (((years % 4 === 0) && days === 29) || days <= 28) {
                                isValid = true;
                            }
                        } else if ((months === 1 || months === 3 || months === 5 || months === 7 || months === 8 || months === 10 || months === 12) && days <= 31) {
                            isValid = true;
                        }
                    }

                    return isValid;
                }
            },

            maxDate : {

                name : function () {
                    return 'maxDate';
                },

                init : function (ele) {
                    //container is selected for terms so find it's child
                    return $(ele).attr('data-upperdate') !== undefined;
                },

                validate : function (ele, widget) {

                    var maxDate = $(ele).attr('data-upperdate'),
                        content = $(ele).val(),
                        adate = content.split('/'),
                        theDate = maxDate.split('/'),
                        date,
                        isValid = false;

                    //if a field is not required and is blank, valid can be returned
                    //if this were required, an error event would already be created by required rule
                    if (content === '') {
                        isValid = true;
                    } else if (widget.options.country.toLowerCase() === 'us') {
                        date = new Date('20' + adate[2], adate[0] - 1, adate[1]);
                    } else {
                        date = new Date('20' + adate[2], adate[1] - 1, adate[0]);
                    }
                    //rearrange string so the date casting works correctly
                    maxDate = new Date(theDate[2], theDate[1] - 1, theDate[0]);
                    //date is valid if smaller than the upper boundary
                    if (date <= maxDate) {
                        isValid = true;
                    }
                    return isValid;
                }
            },

            minDate : {

                name : function () {
                    return 'minDate';
                },

                init : function (ele) {
                    //container is selected for terms so find it's child
                    return $(ele).attr('data-lowerdate') !== undefined;
                },

                validate : function (ele, widget) {

                    var minDate = $(ele).attr('data-lowerdate'),
                        content = $(ele).val(),
                        adate = content.split('/'),
                        theDate = minDate.split('/'),
                        date,
                        isValid = false;

                    //if a field is not required and is blank, valid can be returned
                    //if this were required, an error event would already be created by required rule
                    if (content === '') {
                        isValid = true;
                    } else if (widget.options.country.toLowerCase() === 'us') {
                        date = new Date('20' + adate[2], adate[0] - 1, adate[1]);
                    } else {
                        date = new Date('20' + adate[2], adate[1] - 1, adate[0]);
                    }

                    //rearrange string so the date casting works correctly
                    minDate = new Date(theDate[2], theDate[1] - 1, theDate[0]);
                    //date is valid if larger than the lower boundary
                    if (date >= minDate) {
                        isValid = true;
                    }
                    return isValid;
                }
            },

            multicheck : {

                name : function () {
                    return 'multicheck';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvaltype') === 'multicheck';
                },

                validate : function (ele) {

                    if ($(':checked', ele).length) {
                        return true;
                    }

                    return false;
                }
            },

            minLength : {

                name : function () {
                    return 'minLength';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvalminlen') !== undefined;
                },

                validate : function (ele) {
                    var minLength = $(ele).attr('data-extvalminlen'),
                        content = $.trim($(ele).val());

                    if (content.length >= minLength || content === '') {
                        return true;
                    }

                    return false;
                }
            },

            maxLength : {

                name : function () {
                    return 'maxLength';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvalmaxlen') !== undefined;
                },

                validate : function (ele) {
                    var maxLength = $(ele).attr('data-extvalmaxlen'),
                        content = $.trim($(ele).val());

                    if (content.length <= maxLength) {
                        return true;
                    }

                    return false;
                }
            },

            minValue : {

                name : function () {
                    return 'minValue';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvalminval') !== undefined;
                },

                validate : function (ele) {
                    var minVal = $(ele).attr('data-extvalminval'),
                        contentAsString = $.trim($(ele).val()),
                        content = parseFloat(contentAsString);

                    if (content >= minVal || contentAsString === '') {
                        return true;
                    }

                    return false;
                }
            },

            maxValue : {

                name : function () {
                    return 'maxValue';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvalmaxval') !== undefined;
                },

                validate : function (ele) {
                    var maxVal = $(ele).attr('data-extvalmaxval'),
                        contentAsString = $.trim($(ele).val()),
                        content = parseFloat(contentAsString);

                    if (content <= maxVal  || contentAsString === '') {
                        return true;
                    }

                    return false;
                }
            },

            equals : {

                name : function () {
                    return 'equals';
                },

                init : function (ele) {
                    return $(ele).attr('data-extvalequals') !== undefined;
                },

                validate : function (ele) {
                    var equals = $(ele).attr('data-extvalequals'),
                        content = $.trim($(ele).val());

                    if (content === equals) {
                        return true;
                    }

                    return false;
                }
            }
        },

        _create: function () {
            // Create collection of fields
            this.fields = $(this.element)
                .find('input, select, textarea, fieldset[data-extvaltype="checkbox"], fieldset[data-extvaltype="dob"], fieldset[data-extvaltype="radio"], fieldset[data-extvaltype="multicheck"]')
                .not('input[type=button], input[type=submit], input[type=reset], input[type=radio], [data-skipval="true"]');

            //create rules var with all webform rule to pass to field validation
            var rules = this.rules,
                country = this.options.country;
            //tell jsLint to ignore fact that i is not used
            /*jslint unparam: true*/
            this.fields.each(function (i, ele) {
                //Create validate field widget for each field and pass 
                //set of  rules that apply to webforms
                $(ele).validateField({
                    rules: rules,
                    country: country
                }); //is being called on the individual fields
            });
            /*jslint unparam: false*/
            // Add handlers, eager validation and submit listener
            this.addHandlers(this.fields);
            this.element.on('submit', this, this.onSubmit);
        },

        validate: function () {
            var isValid = true;
            //tell jsLint to ignore fact that i is not used
            /*jslint unparam: true*/
            this.fields.each(function (i, ele) {
                //where one field is not valid, set isValid to false
                if (!$(ele).validateField('validate')) {
                    isValid = false;
                }
            });
            /*jslint unparam: false*/
            return isValid;
        },

        addEager: function (fields) {
            //adds a validation handler every time something is changed or blurred
            // uses timeout to stop validation happening twice when both blur and change occur
            var timeout;
            //tell jsLint to ignore fact that i is not used
            /*jslint unparam: true*/
            fields.each(function (i, ele) {
                //use '.validation' namespace to distinguish events
                $(ele).on('blur.validation change.validation', function () {
                    clearTimeout(timeout);
                    timeout = setTimeout(function () { 
                        $(ele).validateField('validate'); 
                    }, 100);
                });
            });
            /*jslint unparam: false*/
        },

        addFocus: function (fields) {
            //adds field highlighting when field comes into focus and remove when blurred
            //tell jsLint to ignore fact that i is not used
            /*jslint unparam: true*/
            fields.each(function (i, ele) {
                var field = $(ele);
                field.on('focus.validation', function () {
                    $(this).trigger('focusField', this);
                });
                field.on('blur.validation', function () {
                    //wait for a selection on the datepicker if this is a date field
                    $(this).trigger('blurField', this); 
                    if (field.hasClass('hasDatepicker') && $('#ui-datepicker-div').is(':visible')) {
                        setTimeout(function () { 
                            $(this).trigger('blurField', this); 
                        }, 100);
                         
                    } else {
                        $(this).trigger('blurField', this);
                    }
                });
            });
            /*jslint unparam: false*/
        },

        addHandlers: function (fields) {

            var form = this;

            form.addEager(fields);
            form.addFocus(fields);
        },

        removeHandlers: function () {
            //remove the listeners with the .validation namespace
            //tell jsLint to ignore fact that i is not used
            /*jslint unparam: true*/
            this.fields.each(function (i, ele) {
                $(ele).off('.validation');
            });
            /*jslint unparam: false*/
        },

        formUpdate: function () {
            //remove the event calls associated with validation
            this.removeHandlers();
            // update collection of fields
            this.fields = $(this.element)
                .find('input, select, textarea, fieldset[data-extvaltype="checkbox"], fieldset[data-extvaltype="dob"], fieldset[data-extvaltype="radio"], fieldset[data-extvaltype="multicheck"]')
                .not('input[type=button], input[type=submit], input[type=reset], input[type=radio], [data-skipval="true"]');

            //create rules var with all webform rule to pass to field validation
            var rules = this.rules,
                country = this.options.country;

            //create the widgets that dont already exist
            //tell jsLint to ignore fact that i is not used
            /*jslint unparam: true*/
            this.fields.each(function (i, ele) {
                //Create validate field widget for each field and pass 
                //set of  rules that apply to webforms
                $(ele).validateField({
                    rules: rules,
                    country: country
                });
            });

            //add event listeners
            this.addHandlers(this.fields);
        },

        onSubmit: function (e) {

            var form = e.data,
                isValid = true;

            /*jslint unparam: true*/
            form.fields.each(function (i, ele) {
                if (!$(ele).validateField('validate')) {
                    isValid = false;
                }
            });
            /*jslint unparam: false*/

            //once valid, use the default whenValid option to submit form, or use other defined function
            return isValid && e.data.options.whenValid.call(e.data) ? true : false;
        }


    });

}(jQuery));
