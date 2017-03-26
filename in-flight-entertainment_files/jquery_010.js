/*jslint browser: true, nomen: true */
/*global document: false, jQuery: false, trackingInfo: false, vsDoTracking: false */

// This jQuery plugin is built using the jQuery UI Widget Factory (http://jqueryui.com/widget/) and is dependent upon both the jQuery liberty and the jQuery UI library.
// Version 1.0
// Built by Neil Tomlin of the Web Dev Retail CMS team
// June 2014
// Revised:
// December 2014 - allow functionality to reset styling on the form


(function ($) {
    'use strict';

    //removes any error styling from a field, updates html attribute aria-invalid and hides any error messages
    function makeValid(field) {
        var errorMessage;
        //update styling on the valid element
        field.attr('aria-invalid', 'false');
        //check if multi field row
        if (field.parent().hasClass('multiInput')) {
            //check that the other field in row is not invalid (include each type in selector)
            if (($('input, fieldset, select', field.parent().siblings()).attr('aria-invalid')) === 'false') {
                field.closest('.formRow').removeClass('mfHighlightError');
            }
        } else {
            field.closest('.formRow').removeClass('mfHighlightError');
            //also remove styling to acceptance text
            if (field.data('extvaltype') === 'terms') {
                field.parent().removeClass('mfHighlightError');
            }
            if ((field.data('extvaltype') === 'checkbox') || (field.data('extvaltype') === 'radio') || (field.data('extvaltype') === 'dob')) {
                errorMessage = $('div[aria-describedby="' + field.data('extvalname') + '-label"]');
            } else {
                errorMessage = $('div[aria-describedby="' + field.attr('id') + '-label"]');
            }
            errorMessage.hide();
        }
    }

    //separate widget for fields if we don't want to validate whole form each time
    $.widget('ba.livesiteErrorHandler', {
        _create : function () {
            // listen for newMessage event
            var form = this.element,
                errorMessage;

            // newMessage event handler
            function newErrorHandler(errorEvent, rule, field, errorBox) {
                //add error styles to the element
                field.attr('aria-invalid', 'true');
                //check if multi field row
                if (field.parent().hasClass('multiInput')) {
                    field.closest('.formRow').addClass('mfHighlightError');
                } else {
                    field.closest('.formRow').addClass('mfHighlightError');
                    //also add styling to acceptance text
                    if (field.data('extvaltype') === 'terms') {
                        field.parent().addClass('mfHighlightError');
                    }
                    //fieldsets without id are passed by checkbox and radio buttons
                    if ((field.data('extvaltype') === 'checkbox') || (field.data('extvaltype') === 'radio') || (field.data('extvaltype') === 'dob')) {
                        errorMessage = $('div[aria-describedby="' + field.data('extvalname') + '-label"]');
                    } else {
                        errorMessage = $('div[aria-describedby="' + field.attr('id') + '-label"]');
                    }
                    //set the feedback message, grab from hidden div using properties file
                    errorMessage.html($('#' + rule + 'Error').html()).show();
                }

                //show error box
                errorBox.removeAttr('hidden').show().parent('div.actionRow').addClass('mfHighlightError');
            }

            //this function is only called when the field is valid. makeValid has updated the styling so now we
            //need to check whole form for erros to see if we need to remove the error message at the foot of the form
            function validHandler(validEvent, field, errorBox) {
                var errors = 0;

                makeValid(field);

                //check if no errors exist in the form then remove error row
                // (don't count presubmit error box)
                errors = $(this).find('.mfHighlightError').length;
                if (errors === 0) {
                    errorBox.hide().closest('.actionRow').removeClass('mfHighlightError');
                } else if (errors === 1 && $(this).find('.mfHighlightError').children().hasClass('mfPreSubmitError')) {
                    errorBox.hide().parent('div.actionRow').removeClass('mfHighlightError');
                }
            }

            function focusField(focusEvent, field) {
                //update styling on the selected element
                $(field).closest('.formRow').addClass('highlightFocus');
            }

            function blurField(blurEvent, field) {
                //update styling on the selected element
                $(field).closest('.formRow').removeClass('highlightFocus');
            }

            //attach error listeners
            form.on('newError', newErrorHandler);
            form.on('isValid', validHandler);
            form.on('focusField', focusField);
            form.on('blurField', blurField);

        },

        reset : function (errorBox) {
            var form = this.element,
                fields = form
                    .find('input, select, textarea, fieldset[data-extvaltype="checkbox"], fieldset[data-extvaltype="dob"], fieldset[data-extvaltype="radio"], fieldset[data-extvaltype="multicheck"]')
                    .not('input[type=button], input[type=submit], input[type=reset], input[type=radio], [data-skipval="true"]');

            //Update all visible fields to a valid status - essentially resetting the form
            $.each(fields, function () {
                makeValid($(this));
            });

            //Hide the error messsage at the foot of the form
            errorBox.hide().closest('.actionRow').removeClass('mfHighlightError');
        }
    });

}(jQuery));