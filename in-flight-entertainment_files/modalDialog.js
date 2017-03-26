/**
 * Modal dialog (lightbox effect) display script
 */
// keeps modal dialogs/lightboxes/etc centered in the middle of the viewport
$.fn.centerModal = function () {
    "use strict";
    var that = $(this),
        windowHeight = $(window).height(),
        windowWidth = $(window).width(),
        thisHeight = that.outerHeight(),
        thisWidth = that.outerWidth(),
        top = Math.max(windowHeight - thisHeight, 0) / 2,
        left = Math.max(windowWidth - thisWidth, 0) / 2,
        // allow modal to be seen if viewport is smaller
        modalVerticallyBigger = windowHeight < thisHeight ? true : false,
        modalHorizontallyBigger = windowWidth < thisWidth ? true : false,
        position = modalVerticallyBigger || modalHorizontallyBigger ? 'absolute' : 'fixed';

    if (vsgGlobals.touch) {
        // set margin-top as negated 50% of the modal's height
        // helps mitigate issues with on-screen keyboard moving modal
        if (position === 'fixed') { // Large window
            that.css({
                marginTop: -(thisHeight / 2) + 'px',
                marginLeft: -(thisWidth / 2) + 'px',
                position: position,
                top: '50%',
                left: '50%'
            });
        } else { // Small window
            that.css({
                marginTop: modalVerticallyBigger ? 0 : -(thisHeight / 2) + 'px',
                marginLeft: modalHorizontallyBigger ? 0 : -(thisWidth / 2) + 'px',
                position: position,
                top: modalVerticallyBigger ? 0 : '50%',
                left: modalHorizontallyBigger ? 0 : '50%'
            });
        }
    } else {
        if (position === 'fixed') { // Large window
            // center the lightbox x & y on viewport
            that.css({
                position: position,
                top: top,
                left: left
            });
        } else { // Small window
            that.css({
                position: position,
                top: modalVerticallyBigger ? 0 : top,
                left: modalHorizontallyBigger ? 0 : left
            });
        }
    }
    // reset #modal dimensions so it doesn't affect document height when calculating
    $('#modal').css({height: 0, width: 0}).css({
        height: (windowHeight > $(document).height() ? windowHeight : $(document).height()) + 'px',
        width: '100%'
    });
    if (position === 'absolute') {
        window.scrollTo(0, 0);
    }
    return this;
};
// hides the background overlay for the modal
$.fn.hideModalOverlay = function () {
    "use strict";
    if ($('.modalBox:visible').length === 0) {
        $('#modal').attr('hidden', 'hidden').css('display', 'none');
    }
    return this;
};
// shows the modal dialog
// @param object opts object literal containing overrides for the default options
$.fn.initModalDialog = function (opts) {
    "use strict";
    var that,
        defaults = {
            allowReturn:        true,
            elementToFocus:     '.exitModalDialog',
            createBackground:   true
        },
        options = $.extend({}, defaults, opts),
        tabbables,
        first,
        last,
        windowHeight = $(window).height(),
        modalBackground = $('#modal');
    // if div has already been created, don't create again (causes a bug on the mac where the modal background will not disappear if loaded more than once)
    if (!modalBackground.length && options.createBackground) {
        // create modal div in js as access to the "body" element is controlled by the layout template
        modalBackground = $('<div></div>').attr('id', 'modal').insertBefore($('body > :first-child'));
    }
    // allow scrollbar for ajax'd content (pulled into article element), and set max-height to 75%
    this.children('article').css('max-height', ((windowHeight > $(document).height() ? $(document).height() : windowHeight) * 0.75) + 'px');
    // set height of Overlay to take up whole page and show
    modalBackground.removeAttr('hidden').css('display', 'block');
    this.removeAttr('hidden').css('display', 'block');
    this.find(options.elementToFocus).focus();
    that = this;
    if (options.allowReturn === true) {
        // Esc key will cancel dialog
        $(document).on('keypress.modal', function (event) {
            if (event.keyCode === 27 && !(event.ctrlKey || event.AltKey)) {
                $(that).find('.modalReturn').click();
            }
        });
        // Clicking outside dialog will cancel dialog
        modalBackground.on('click touchstart', function () {
            $(that).find('.modalReturn').click();
        });
    }
    // prevent tabbing out of the dialog
    tabbables = this.find(':tabbable');
    first = tabbables.filter(':first');
    last = tabbables.filter(':last');
    this.on('keypress.modal', function (event) {
        if (event.keyCode !== $.ui.keyCode.TAB) {
            return;
        }
        if (event.target === last[0] && !event.shiftKey) {
            first.focus();
            return false;
        }
        if (event.target === first[0] && event.shiftKey) {
            last.focus();
            return false;
        }
    });
    this.centerModal();
    // bind in case window size changes
    $(window).on('resize.modal', function () {
        $(that).centerModal();
    });
    return this;
};
// closes the modal dialog
// @param object returnFocusTo jQuery obj for the element to return focus to when closed (required)
$.fn.hideModalDialog = function (returnFocusTo) {
    "use strict";
    return this.each(function () {
        var that = $(this);
        that.attr('hidden', 'hidden').css('display', 'none').hideModalOverlay();
        $(document).off('keypress.modal');
        that.off('keypress.modal');
        $(window).off('resize.modal');
        returnFocusTo.focus();
    });
};

// shows ajax activity on the element, & displays the indicator image
// uses global/scripts/lib/jQuery_plugins/jquery.spin-1.2.6.min.js
// @param object opts object literal containing overrides for the default options
$.fn.showAjaxActivity = function (opts) {
    "use strict";
    var spinOpts = {
            lines:      14,
            length:     8,
            width:      4,
            radius:     14,
            rotate:     13,
            color:      '#2e5c99',
            speed:      1.0,
            corners:    0.5,
            trail:      80,
            shadow:     false,
            hwaccel:    true,
            className:  'spinner',
            zIndex:     2e9,
            opacity:    0,
            top:        0,
            left:        0
        },
        defaults = {
            message:            'Updating details',
            cssClass:           'modalSmall',
            createBackground:   true
        },
        options = $.extend({}, defaults, opts),
        cssDisplay = $('html').hasClass('display-table') ? 'table' : 'block',
        modalBackground = $('#modal'),
        ajaxActivity = $('#ajaxActivity');
    this.attr('aria-busy', 'true');
    // if modal div has already been created, don't create again (causes a bug on the mac where the modal background will not disappear if loaded more than once)
    if (!modalBackground.length && options.createBackground) {
        // create modal div in js as access to the "body" element is controlled by the layout template
        modalBackground = $('<div></div>').attr('id', 'modal').insertBefore($('body > :first-child'));
    }
    // set height of Overlay to take up whole page and show
    modalBackground.removeAttr('hidden').css({
        height: ($(window).height() > $(document).height() ? $(window).height() : $(document).height()) + 'px',
        display: 'block'
    });
    if (!ajaxActivity.length) {
        ajaxActivity = $('<div></div>').attr('id', 'ajaxActivity').insertAfter('body > :first-child');
    }
    ajaxActivity.html('<p>' + options.message + '</p>').addClass(options.cssClass).removeAttr('hidden').css('display', cssDisplay).spin(spinOpts).centerModal();
    return this;
};
// hides the indicator image, and indicates activity has finished on the element
$.fn.hideAjaxActivity = function () {
    "use strict";
    $('#ajaxActivity').spin(false).attr('hidden', 'hidden').css('display', 'none').hideModalOverlay();
    this.attr('aria-busy', 'false');
    return this;
};