///////////////////////////////////////////////////////////////////////////////
//
// All scripts in this file must be written as plugins
//
///////////////////////////////////////////////////////////////////////////////

/* Setup pop-ups plugin */
(function ($) {
    "use strict";
    $.fn.baSetupPopups = function () {
        return this.each(function () {
            // Find all links with the relevant 'data-' attributes and setup to open their targets in new windows
            // Start with the default basic popup
            $(this).find('a[data-popupType="popup-scrolling"]').each(function () {
                var w = $(this).attr('data-popupWidth'),
                    h = $(this).attr('data-popupHeight');
                if (w && h) {
                    $(this).doPopup({width: w, height: h});
                } else {
                    $(this).doPopup();
                }
            });
            // Full Monty
            $(this).find('a[data-popupType="popup-fullnav"]').doPopup({menubar: "yes",
                directories: "yes",
                width: "800",
                height: "600",
                toolbar: "yes"
                });
            // No scroll bars
            $(this).find('a[data-popupType="popup-noscroll"]').doPopup({scrollbars: "no"});
            // Specific sized no scroll for 'remember me'
            $(this).find('a[data-popupType="popup-noscroll-info"]').doPopup({scrollbars: "no",
                width: "440",
                height: "230",
                status: "no",
                location: "no",
                menubar: "no"
                });
        });
    };
}(jQuery));

/* Setup placeholders plugin */
(function ($) {
    "use strict";
    $.fn.baSetupPlaceholders = function () {
        return this.each(function () {
            //  Only need to do work if 'placeholder' NOT supported by browser
            if (!Modernizr.input.placeholder) {
                // Only call the Watermark plugin if it exists (currently only in IE browsers)
                // N.B. this plugin must be called before applying code below
                if ($.watermark) {
                    $(this).find('.placeholderIE').each(function (index) {
                        $(this).watermark($(this).attr('placeholder'));
                    });
                }
                //Initialize all relevant items by getting each element with a
                //'placeholder' attribute and...
                $(this).find('[placeholder]').each(function () {
                    //...If it has no current value, set the value to be the same
                    //as the value of the 'placeholder' attribute and add a class of
                    //'placeholder' to the item (so it can be styled in our CSS)
                    //
                    //NOTE: We only process items that are NOT of type 'password'
                    //This is because password items are security masked in browsers
                    //that don't support 'placeholder', so text appears as a series
                    //of ****
                    if (($(this).val() === "") && ($(this).attr('type') !== "password")) {
                        $(this).val($(this).attr('placeholder'));
                        $(this).addClass('placeholder');
                    }
                });
                //Setup 'focus' event handlers.
                //When the item receives focus, remove the placeholder text
                //(unless placeholder text has already been changed) and also
                //remove the 'placeholder' class
                $(this).find('[placeholder]').focus(function () {
                    if ($(this).val() === $(this).attr('placeholder')) {
                        $(this).val('');
                        $(this).removeClass('placeholder');
                    }
                });
                //Setup 'blur' event handlers.
                //NOTE: We only process items that are NOT of type 'password'
                //This is because password items are security masked in browsers
                //that don't support 'placeholder', so text appears as a series
                //of ****
                //
                //When the item looses focus, and its value has not been
                //modified from the default 'placeholder' value...
                $(this).find('[placeholder]').blur(function () {
                    if (($(this).attr('type') !== "password") && (($(this).val() === '') || ($(this).val() === $(this).attr('placeholder')))) {
                        //...ensure the value contains the 'placeholder' text...
                        $(this).val($(this).attr('placeholder'));
                        //...and add the 'placeholder' class
                        $(this).addClass('placeholder');
                    }
                });
                //Ensure any 'placeholder' text is removed from form items prior to submittion
                $(this).find('[placeholder]').closest('form').submit(function () {
                    $(this).find('[placeholder]').each(function () {
                        if ($(this).val() === $(this).attr('placeholder')) {
                            $(this).val('');
                        }
                    });
                });
            } // End if(placeholders NOT supported by browser)
        });
    };
}(jQuery));

/* hero banner plugin */
(function ($) {
    "use strict";
    $.fn.baHeroBannerCarousel = function () {
        return this.each(function () {
            var $this = $(this),
                $heroBanners = $this.find('.heroBannerFamily'),
                selectedIndex,
                tabsLength;
            if ($heroBanners.length > 1) {
                tabsLength = $heroBanners.length;
                // next tab navigation
                $this.find(".nextTab").click(function (nEvent) {
                    //wait until the next tab has finished animating before moving onto the next.
                    if (!$heroBanners.is(":animated")) {
                        selectedIndex = $this.tabs("option", "selected");
                        if (selectedIndex !== tabsLength - 1) {
                            $this.tabs("option", "selected", selectedIndex + 1);
                        } else {
                            $this.tabs("option", "selected", selectedIndex = 0);
                        }
                    }
                    nEvent.preventDefault();
                });
                //previous tab navigation
                $this.find(".prevTab").click(function (pEvent) {
                    //wait until the previous tab has finished animating before moving onto the next.
                    if (!$heroBanners.is(":animated")) {
                        selectedIndex = $this.tabs("option", "selected");
                        if (selectedIndex !== 0) {
                            $this.tabs("option", "selected", selectedIndex - 1);
                        } else {
                            $this.tabs("option", "selected", selectedIndex + tabsLength - 1);
                        }
                    }
                    pEvent.preventDefault();
                });
                // call the jQuery UI tabs plugin
                $this.tabs({fx: { opacity: 'toggle', duration: 'fast', disable: false  }});
                // remove all jQuery UI corners classes (after the tabs plugin has been called)
                $this.removeClass("ui-corner-all");
                $this.find(".ui-tabs-nav, .ui-tabs-nav > li, .ui-tabs-panel").removeClass("ui-corner-all ui-corner-top ui-corner-bottom");
                $this.find(".ui-tabs-nav, .controlButtons").removeClass("ui-tabs-hide");
            }
        });
    };
}(jQuery));

/* Main Carousel plugin */
(function ($) {
    "use strict";
    $.fn.baMainCarousel = function () {
        var carouselCounter = 0;
        function buildPagerLink(idx, slide) {
            return '<a href="#"></a>';
        }
        function loopManager(currSlideElement, nextSlideElement, options) {
            carouselCounter += 1;
            if (options.currSlide === 0) {
                if (carouselCounter > 1) {
                    $('.ui-widget.mainCarouselContainer .carousel').cycle('pause');
                }
            }
        }
        return this.each(function () {
            $(".ui-widget.mainCarouselContainer .carousel").cycle({
                timeout: 9000,
                pause: true,
                fx: 'scrollHorz',
                easing: 'easeInOutCubic',
                height: 350,
                fit: 1,
                width: 760,
                speed: 1300,
                prev: '.mainCarouselControl.left',
                next: '.mainCarouselControl.right',
                pager: '.mainCarouselNavContainer',
                pagerAnchorBuilder: buildPagerLink,
                after: loopManager,
                autostop: true,
                end: function () {
                    $('.ui-widget.mainCarouselContainer .carousel').cycle('next').cycle('pause');
                }
            });
        });
    };
}(jQuery));

/* Climate Chart Plugin */
(function ($) {
    $.fn.baClimateChart = function () {
        return this.each(function () {
            var celsiusArray = [],
                fahrenheitArray = [],
                i,
                fahrenheitItem,
                $this = $(this);
            $(this).find(".average.temperature li").each(function () {
                celsiusArray.push($(this).find("*[data-temp]").data("temp"));
            });
            buildGraph(celsiusArray);
            $this.find(".average span.converter a").click(function (e) {
                //Prevent link default behaviours
                e.preventDefault();
                // Toggle the default class of selectedOption
                if (!$(this).hasClass('selectedOption')) {
                    $this.find(".average span.converter a").toggleClass('selectedOption');
                    if ($(this).hasClass('celsius')) {
                        $this.find(".temperature li span.data").each(function (j) {
                            $(this).text(celsiusArray[j] + decodeURI("%C2%B0"));
                        });
                    }
                    if ($(this).hasClass('fahrenheit')) {
                        // Build Fahrenheit array
                        if (fahrenheitArray.length < 12) {
                            for (i = 0; i < celsiusArray.length; i += 1) {
                                fahrenheitItem = (9/5) * (celsiusArray[i] * 1) + 32;
                                fahrenheitArray.push(Math.round(fahrenheitItem));
                            }
                        }
                        $this.find(".average.temperature li span.data").each(function (j) {
                            $(this).text(fahrenheitArray[j]+decodeURI("%C2%B0"));
                        });
                    }
                }
            });
            // add a copy of easeInOutExpo so that it can be used without dependency on jQuery UI
            $.easing.lpbmw = function (x, t, b, c, d) {
                if (t==0) return b;
                if (t==d) return b+c;
                if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
                return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
            };
            function buildGraph(dataArray) {
                var graph_content_container = $this.find(".average.temperature span.visual");
                // graph_heights
                graph_content_container.GRAPH_HEIGHTS(dataArray, {max_height: 110, min_height: 60}, function (element, height, count) {
                    if (count === 0) {
                        animate_graph(element, height, count);
                    } else {
                        setTimeout(function () {
                            animate_graph(element, height, count);
                        }, (200 * count));
                    }
                });
                function animate_graph(element, height, count) {
                    element.animate({height: height, opacity: '1'}, {queue: false, duration: 600});
                }
            }
        });
    };
}(jQuery));

/* Mini Carousel plugin */
(function ($) {
    "use strict";
    $.fn.baMiniCarousel = function () {
        return $(this).each(function () {
            var firstSlide = $(this).find(".miniCarousel li:first"),
                lastSlide = $(this).find(".miniCarousel li:last"),
                rightButton = $(this).find(".miniCarousel-nav-right"),
                leftButton = $(this).find(".miniCarousel-nav-left");
            $(this).find('.miniCarousel').jCarouselLite({
                visible: 3,
                circular: false,
                speed: 500,
                start: 0,
                scroll: 1,
                wrap: 'circular',
                btnNext: $(this).find(".miniCarousel-nav-right"),
                btnPrev: $(this).find(".miniCarousel-nav-left"),
                afterEnd: function(visible) {
                    if (visible.eq(2).is(lastSlide)) {
                        rightButton.addClass("inactive");
                    } else {
                        rightButton.removeClass("inactive");
                    }
                    if (visible.eq(0).is(firstSlide)) {
                        leftButton.addClass("inactive");
                    } else {
                        leftButton.removeClass("inactive");
                    }
                }
            });
        });
    };
}(jQuery));

/**
* hoverIntent r6 fork // 2012.07.03 // jQuery 1.7+
* (modified to remove .bind() etc)
* https://github.com/BLSully/jquery-hoverIntent
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
*
* hoverIntent is currently available for use in all personal or commercial
* projects under both MIT and GPL licenses. This means that you can choose
* the license that best suits your project, and use it accordingly.
*
* // basic usage (just like .hover) receives onMouseOver and onMouseOut functions
* $("ul li").hoverIntent( showNav , hideNav );
*
* // advanced usage receives configuration object only
* $("ul li").hoverIntent({
*    sensitivity: 7, // number = sensitivity threshold (must be 1 or higher)
*    interval: 100,   // number = milliseconds of polling interval
*    over: showNav,  // function = onMouseOver callback (required)
*    timeout: 0,   // number = milliseconds delay before onMouseOut function call
*    out: hideNav,    // function = onMouseOut callback (required)
*    selector: null // string = subSelector for use with delegated event binding. (Like jQuery.on() syntax.)
* });
*
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne brian(at)cherne(dot)net
*/
(function ($) {
    "use strict";
    $.fn.hoverIntent = function (f, g) {
        // default configuration options
        var cfg = {
            sensitivity: 7,
            interval: 100,
            timeout: 0,
            selector: null
        },
            // instantiate variables
            // cX, cY = current X and Y position of mouse, updated by mousemove event
            // pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
            cX, cY, pX, pY,
            // A private function for getting mouse position
            track = function (ev) {
                cX = ev.pageX;
                cY = ev.pageY;
            },
            compare,
            delay,
            handleHover;

        // override configuration options with user supplied object
        cfg = $.extend(cfg, (g ? {over: f, out: g} : f));

        // A private function for comparing current and previous mouse position
        compare = function (ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            // compare mouse positions to see if they've crossed the threshold
            if ((Math.abs(pX - cX) + Math.abs(pY - cY)) < cfg.sensitivity) {
                $(ob).off("mousemove.hi", track);
                // set hoverIntent state to true (so mouseOut can be called)
                ob.hoverIntent_s = 1;
                return cfg.over.apply(ob, [ev]);
            }
            // set previous coordinates for next time
            pX = cX;
            pY = cY;
            // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
            ob.hoverIntent_t = setTimeout(function () {
                compare(ev, ob);
            }, cfg.interval);
        };

        // A private function for delaying the mouseOut function
        delay = function (ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            ob.hoverIntent_s = 0;
            return cfg.out.apply(ob, [ev]);
        };

        // A private function for handling mouse 'hovering'
        handleHover = function (e) {
            // copy objects to be passed into t (required for event object to be passed in IE)
            var ev = jQuery.extend({}, e),
                ob = this;

            // cancel hoverIntent timer if it exists
            if (ob.hoverIntent_t) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            }

            // if e.type == "mouseenter"
            if (e.type === "mouseenter") {
                // set "previous" X and Y position based on initial entry point
                pX = ev.pageX;
                pY = ev.pageY;
                // update "current" X and Y position based on mousemove
                $(ob).on("mousemove.hi", track);
                // start polling interval (self-calling timeout) to compare mouse coordinates over time
                if (ob.hoverIntent_s !== 1) {
                    ob.hoverIntent_t = setTimeout(function () {
                        compare(ev, ob);
                    }, cfg.interval);
                }
            // else e.type == "mouseleave"
            } else {
                // unbind expensive mousemove event
                $(ob).off("mousemove.hi", track);
                // if hoverIntent state is true, then call the mouseOut function after the specified delay
                if (ob.hoverIntent_s === 1) {
                    ob.hoverIntent_t = setTimeout(function () {
                        delay(ev, ob);
                    }, cfg.timeout);
                }
            }
        };

        // bind the function to the two event listeners
        if (cfg.selector !== null) {
            return this.on('mouseenter.hi mouseleave.hi', cfg.selector, handleHover);
        }
        return this.on('mouseenter.hi mouseleave.hi', handleHover);
    };
}(jQuery));

/*#######
##    GLOBAL SIDE NAV PLUGIN
##    Setup accessible navigation for the global side navigation menu fly-out
##    Menu can be navigated with both the tab and arrow keys
#######*/
(function ($) {
    "use strict";
    $.fn.baSiteMapNavigation = function () {
        /*#######
        ##    Accessible navigation for the global side navigation menu fly-outs
        ##    Same as that found in main ba.com VSG pages
        #######*/
        function setupSideNavigation() {
            var menubarItems = $('ul.top-level li [role="menuitem"]'),
                firstMenubarItem = menubarItems.filter(':first'),
                lastMenubarItem = menubarItems.filter(':last'),
                timeout = 500,
                interval = 50,
                closeMenu = function (menuToClose) {
                    if (typeof menuToClose === 'undefined') {
                        $('.openSideNavTitle').removeClass('openSideNavTitle');
                    } else {
                        $(menuToClose).removeClass('openSideNavTitle');
                    }
                };
            // Mouse actions
            menubarItems.filter('.no-touch [role="menuitem"]').parent().hoverIntent({
                over: function (event) {
                    if ($(event.target).closest('ul.sub-UL').closest('li.notSelected.hasSub').length === 0) {
                        closeMenu();
                    }
                    $(this).addClass('openSideNavTitle');
                },
                out: function () {
                    closeMenu(this);
                },
                timeout: timeout,
                interval: interval,
                sensitivity: 5
            });
            // KEYBOARD AND TOUCH ACTIONS
            // Make sure that the menu is visible when menuitem's etc are focused
            menubarItems.filter('.no-touch [role="menuitem"]').focus(function () {
                closeMenu();
                $(this).closest('.sub-UL').parent().addClass('openSideNavTitle');
            });
            // Keep note of whether menu is open or not when using touch, or if input is focused
            menubarItems.each(function () {
                if ($(this).parent('.notSelected.hasSub').length === 1) {
                    $(this).attr({'data-sidemenu-open': 'false'});
                }
            });
            // Toggle menu with touch events
            menubarItems.on('touchstart', function (event) {
                if ($(this).attr('data-sidemenu-open') === 'false') {
                    event.preventDefault();
                    closeMenu();
                    $('[data-sidemenu-open=true]').attr('data-sidemenu-open', 'false');
                    $(this).attr('data-sidemenu-open', 'true');
                    $(this).parent().addClass('openSideNavTitle');
                }
            });
            // Enable keyboard navigation of main menu - navigation along menubar
            $('ul.top-level[role="menu"]').on('keydown.sidemenubar', 'li[role=presentation] > [role="menuitem"]', function (event) {
                switch (event.which) {
                // down
                case 40:
                    event.preventDefault();
                    if ($(event.target).is(lastMenubarItem)) {
                        firstMenubarItem.focus();
                    } else {
                        menubarItems.eq(menubarItems.index($(this)) + 1).focus();
                    }
                    break;
                // up
                case 38:
                    event.preventDefault();
                    if ($(event.target).is(firstMenubarItem)) {
                        lastMenubarItem.focus();
                    } else {
                        menubarItems.eq(menubarItems.index($(this)) - 1).focus();
                    }
                    break;
                // right
                case 39:
                    event.preventDefault();
                    $(event.target).parent('li.open').removeClass('openSideNavTitle');
                    $(event.target).siblings('ul').find('[role~="menuitem"]').first().focus();
                    break;
                }
            });
            // Hide menu when focus goes outside nav
            $(this).find('.no-touch :focusable').last().keydown(function (event) {
                if (event.keyCode === 9) {
                    closeMenu();
                }
            });
            $(document).on('mousedown touchstart', function (event) {
                if ($(event.target).closest('#siteMapNavContainer').length === 0) {
                    closeMenu();
                    $('[data-sidemenu-open=true]').attr('data-sidemenu-open', 'false');
                }
            });
            return this;
        }
        // Initilize navigation function + set up classes
        return this.each(function () {
            // Add roles to navigation nodes
            $(this).find('ul').attr('role', 'menu').children('li').attr('role', 'presentation').children('a').attr('role', 'menuitem');
            $(this).find('li.notSelected.hasSub').removeClass('open');
            $(this).find('li.hasSub').children('a').attr('aria-haspopup', 'true');
            $(this).find('.selected > a').attr('aria-selected', 'true');
            setupSideNavigation();
        });
    };
}(jQuery));

// To go into a page's headinsert (or similar):
$(document).ready(function () {
    "use strict";
    $('html').removeClass('not-ready');
});

           
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------

// This function sets the popUp for scrolling.
// This is done like this so that the bc() function does not take in too many values.
//this has been amended for mac enablement to make it work on netscape on OS9 mac 2dec2004
// These functions are on the cusp of deprecation and will need replacing to use
// the new skool methods.

function popUpScrolling(url,w,h){
if (typeof w=='undefined' || w==''){w='450'}
if (typeof h=='undefined' || h==''){h='350'}

/* increase width for secCharge popup Beg */
var ifSecCharge =  new RegExp("seccharge","i");
if (ifSecCharge.test(url))
{
w=620;
h=580;
}
/* increase width for secCharge popup End */

window.name = "BA_Main";
var toolbar = "toolbar=no,location=no,directories=no,menubar=no,scrollbars=yes,resizable=yes,width="+w+",height="+h;
var myPopup = window.open(url,"BA_Popup",toolbar);
myPopup.focus();
   
}

// This function sets the popUp for non scrolling.
function popUpNonScrolling(url,w,h)
{
if (typeof w=='undefined' || w==''){w='450'}
if (typeof h=='undefined' || h==''){h='350'}

/* increase width for secCharge popup Beg */
var ifSecCharge =  new RegExp("seccharge","i");
if (ifSecCharge.test(url))
{
w=620;
h=450;
}
/* increase width for secCharge popup End */


window.name = "BA_Main";
var toolbar = "toolbar=no,location=no,directories=no,status=yes,menubar=no,scrollbars=no,resizable=yes,width="+w+",height="+h;
var myPopup = window.open(url,"BA_Popup",toolbar);
myPopup.focus();

}

/*IFE plugin*/
(function( $ ) {
    $.fn.baSetupIFE = function() {
        return this.each(function() {
            $('#spafax-wrap form').not('#bahleContactForm').attr('action', window.location.href);
            correctLinksLocation();
            function correctLinksLocation(){
                // This function replaces all link targets with updated href,
                // which allows the user to open items in tabs and hover to view corrected target address
               
                // Define Vars
                var i = 0,
                query="",
                thisHref = window.location.href.split("?");
                myHref = thisHref[0];
                // For each link inside #spafax-wrap
                jQuery.each($('#spafax-wrap a').not('#banner a, #mpu a'), function(){  // .not('#banner a') added as part of fix for RN WR 131101-000002 
                    if($(this).attr("href").indexOf("?") !== -1){
                        // Split at query string off
                        query = $(this).attr("href").split("?");
                        // Then build new value for the href
                        $(this).attr("href",myHref+"?"+query[1]);
                        i++;
                    }
                });
            }
        });
    };
})( jQuery ); // End baSetupIFE() function           
/*IFE end*/

/*#######
##   VisaCentralWidget plugin
#######*/
(function ($) {
    "use strict";
    $.fn.baVisaCentral = function () {
        var maxTimeOut = 5000, currentTime = 0, $this = $(this);
        function initStyle() {
            if ($this.hasClass('visaCentral580')) {
                $('#cibtvisareqwidget > div:nth(2)').css('width', '100px');
            }
            if ($this.hasClass('visaCentral760')) {
                $('#cibtvisareqwidget > div:nth(0)').css('margin-right', '60px');
                $('#cibtvisareqwidget > div:nth(2)').css({"float": "right", "margin-top": "20px", "margin-right": "20px"});
                $('.textcolor_footer > img').css('float', 'right');
            }
            $this.find('#cibtvisareqwidget .findout').removeAttr('onmouseover');
            $this.find('#cibtvisareqwidget .findout').removeAttr('onmouseout');
            $this.find('#cibtvisareqwidget .findout').removeAttr('style');
            $this.find('.textcolor_footer > img').css('margin-top', '0');
        }
        
        setTimeout(function() {
            if ($this.find('#cibtWidgetLoaderDiv').html().length){
                initStyle();
                return;
            } 
            if (currenTime === maxTimeOut){
                return;
            }
            currentTime += 100;
        }, 100);
    };
}(jQuery));
/*VisaCentralWidget End*/

function selectctc()
{
var pageid = "CTCLIST";
var aboutcountry = "About_Country=" + window.document.nav_form.country.value.toUpperCase();
newloc(pageid,aboutcountry);
} 

function newloc(pageid)
{
var newLocation;
if (arguments.length==1)
{
newLocation=urlrewrite(pageid);
}
else if (arguments.length==2)
{
// add in content classifications and other parameters
var urlextension=arguments[1];
newLocation=urlrewrite(pageid,null,urlextension);
}
else if (arguments.length==3)
{
// add in content classifications and other parameters
var urlprotocol=arguments[1];
var urlextension=arguments[2];
newLocation=urlrewrite(pageid,urlprotocol,urlextension);
}
document.location=newLocation;
} 

function urlrewrite(idname, protocolType)
{
var protocol = document.nav_form.protocol.value;;
if(protocolType=="https") protocol = protocolType;
var lurl=protocol+"://"+document.nav_form.hostname.value;
var audience
if (document.nav_form.audience != null)
{
audience = document.nav_form.audience.value;
}
else
{
// default for all pseudo-Morph pages
audience = "travel";
}
if ( audience !=null && audience>"" ) {lurl+="/"+audience;}
if ( idname !=null && idname>"" ) {lurl+="/"+idname.toLowerCase();}
var logintype = document.nav_form.logintype.value;
if ( logintype !=null && logintype>"" ) {lurl+="/"+logintype;}
var langadded = false;
var lang = document.nav_form.language.value;
if ( lang!=null && lang>"" ){
//Test for locale code to cope with old
// pseudo-Morph pages and abbreviate
// to just country.
var underscore = lang.indexOf("_");
if (underscore != -1){
lang = lang.substring(0, underscore);
}
langadded = true;
lurl+="/"+lang +"_";
}
var country = document.nav_form.country.value;
if ( country!=null && country>"" ){
if (langadded == false){
lurl+="/";
}
lurl +=country;
}
var cv = document.nav_form.scheme.value;
if ( cv!=null && cv>"" ) lurl+="/"+cv;
// Get the extra session parameters
if (document.nav_form.urlsessparams!=null){
var sessParams=document.nav_form.urlsessparams.value.split(",");
for (var i=0;i<sessParams.length;i++){
var name=sessParams[i];
value=eval("document.nav_form."+name+".value");
lurl+="/"+name+"-"+value;
}
}
if (arguments.length > 2)
{
// we have content classifications and/or events passed into the call
// - put them on the end of the URL
var urlextension=arguments[2];
lurl+="/"+urlextension;
}
return lurl;
}

/* CookieCompliance (pop-up) plugin */
(function ($) {
    "use strict";
    $.fn.baCookieCompliance = function () {
    //----------------------------------------------------------------------------------------------
    // DEPENDANCY FUNCTIONS
    //----------------------------------------------------------------------------------------------
    // Gets parameter values from the current URL
        function getQueryValue(fieldname) {
            var i,
                querystring,
                string_arr;
            querystring = $(location).attr('href'); //get the url string
            if (querystring.indexOf('?') < 1) {
                return "notfound";
            }
            querystring = querystring.substring((querystring.indexOf('?')) + 1); //split the url so we get the query string
            string_arr = querystring.split('&'); //make an array of all the different name value pairs
            //for each pair....
            for (i = 0; i < string_arr.length; ++i) {
            //search the string for our name
                if (string_arr[i].indexOf(fieldname) > -1) {
                //split the string so we get RHS of =
                    string_arr[i] = string_arr[i].substring((string_arr[i].indexOf('=')) + 1);
                    return string_arr[i];
                }
            }
            return "notfound";
        }
        // Get and Set Cookies
        function getCookieVal(offset) {
            var endstr = document.cookie.indexOf(";", offset);
            if (endstr === -1) {
                endstr = document.cookie.length;
            }
            return decodeURIComponent(document.cookie.substring(offset, endstr));
        }
        function getCookie(name) {
            var arg = name + "=",
                i = 0,
                j;
            while (i < document.cookie.length) {
                j = i + arg.length;
                if (document.cookie.substring(i, j) === arg) {
                    return getCookieVal(j);
                }
                i = document.cookie.indexOf(" ", i) + 1;
                if (i === 0) {
                    break;
                }
            }
            return null;
        }
        function setCookie(name, value, expiry, domain) {
            var expireDate;
            if (expiry == undefined) {
                expireDate = new Date();
            } else {
                expireDate = expiry;
            }
            if (expiry !== 0) {
                expireDate.setFullYear(expireDate.getFullYear() + 1);
            }
            document.cookie = name + "=" + encodeURIComponent(value) + (expiry !== 0 ? "; expires=" + expireDate.toUTCString() : '') + "; path=/" + (typeof domain === 'undefined' ? '' : '; domain=' + domain);
        }
        var baCountryChoiceCookie = null;

        function launchCookieComplianceModal() {
            if ($('#cookieAcceptanceModalBox').length) {
            // Pop up the modal
                $.fancybox.open(
                    $('#cookieAcceptanceModalBox'),
                    {
                        modal: true, // Modal mode
                        scrolling: 'visible', // Set the overflow css property to visible - stops too much spacing appearing around the modal 
                        wrapCSS: 'cookieAcceptanceModal' // Wrap the modal with .cookieAcceptanceModal so set the .cookieAcceptanceModal .fancybox-inner class to be height: auto
                    }
                );
            }
        }
        if (getQueryValue('showCookieModal') === 'no') {
            setCookie("Allow_BA_Cookies", "accepted", 0);
            trackingInfo.cookiesAccepted = 'existpop';
            $("#t-tracking-fragment").html(vsDoTracking());
            return;
        }
        // If new customer (BA_COUNTRY_CHOICE_COOKIE not set) ----> Show Global Gateway modal
        // Else if existing customer (BA_COUNTRY_CHOICE_COOKIE set) -----> Show Allow BA cookie modal 50% of the time
        // Existing customer  50% of the time

		baCountryChoiceCookie = getCookie("BA_COUNTRY_CHOICE_COOKIE");
		if (baCountryChoiceCookie === null || baCountryChoiceCookie === "") {
              $.fn.BALanguageCountryModal();   
		} else if (Math.random() < 0.5) {
            // Launch the modal
            launchCookieComplianceModal();
	        // Initialise fancybox for the links which appear on the modal
            $('.fancybox').fancybox({
                wrapCSS: 'modalBox modalLarge',
                //maxHeight: 410,
                helpers:  {
                    title:  null
                },
                afterClose: function () {
                    // launch the modal back up again after closing the lightbox popup
                    launchCookieComplianceModal();
                    // without this return false, fancybox will remove all overlay from the page and prevent the modal being launched!
                    return false;
                }
                
            });
        } 
        else {
            setCookie("Allow_BA_Cookies", "accepted");
            trackingInfo.cookiesAccepted = 'existpop';
            $("#t-tracking-fragment").html(vsDoTracking());
            //setCookie('realreferrer', encodeURIComponent(document.referrer));
            //window.location.reload();
        }
        // On click of the continue button
        $('#accept_ba_cookies').on('click', function () {
            // cookie accepted by user clicking Continue
            setCookie("Allow_BA_Cookies", "accepted");
            // close the fancybox modal
            $.fancybox.close();
            // Record this data into the tracking fragment
            trackingInfo.cookiesAccepted = 'newvispop';
            $("#t-tracking-fragment").html(vsDoTracking());
            return false;
        });
    };
}(jQuery));

/////////////////////////////////////////////////////////////////
///// Language country pop up when the user is not cookied //////
/////////////////////////////////////////////////////////////////
(function ($) {
    "use strict";
    $.fn.BALanguageCountryModal = function () {
        var scope = {};

        /**** Define constants ****/
        scope.COUNTRY_COOKIE_NAME = "BA_COUNTRY_CHOICE_COOKIE";
        scope.LANG_COOKIE_NAME = "BA_LANGUAGE_CHOICE_COOKIE";

        /**** Define methods ****/
        //Set a cookie
        scope.setCookie = function (name, value, expiry, domain) {
            var expireDate;
            if (expiry === undefined) {
                expireDate = new Date();
            } else {
                expireDate = expiry;
            }
            if (expiry !== 0) {
                expireDate.setFullYear(expireDate.getFullYear() + 1);
            }
            document.cookie = name + "=" + encodeURIComponent(value)
                    + (expiry !== 0
                ? "; expires=" + expireDate
                : '')
                    + "; path=/"
                    + (domain === undefined
                ? ''
                : '; domain=' + domain);
        };

        //Load 'jquery.ba.countryLanguageChooser.js' through AJAX and initialize the plug-in
        scope.includeScript = function () {
            var url = '/cms/global/scripts/lib/jQuery_plugins/jquery.ba.countryLanguageChooser.js';
            $.getScript(url)
                .done(function () {
                    $('body').countryLanguageChooser({
                        defaultLocale: ["en", "gb"]
                    });
                    scope.injectStyles();
                    scope.handleFormSubmit();
					
					
		
                });

            //Handle cross-origin error to remove 'Please Wait' modal for Livesite dev and all preview environments
            //This needs to be added through a global ajax error handler since we don't want to make any change in
            //jquery.ba.countryLanguageChooser.js
            $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
                if (settings.url === '/main/ba_vsg18.jsp/gg-m-cont') {
                    $('#cookieAjaxLoadingModal').remove();
                }
            });
        };

        //Inject required styles
        scope.injectStyles = function () {
            var style = "<style>";
            style += ".countryLangModal .btn {";
            style += "overflow: visible;";
            style += "}";
            style += ".countryLangModal select:focus,";
            style += ".countryLangModal cookieModalButton:focus {";
            style += "outline: 1px solid #4b97fa;";
            style += "}";
            style += "</style>";
            $("head").append(style);
        };

        //Set country and language cookies and redirect to chosen locale
        scope.handleFormSubmit = function () {
            var currentUrl = window.location.href,
                currentLocale = currentUrl.split('/')[3],
                countryLangForm,
                evtIdInput,
                countryCode,
                langCode,
                updatedLocale,
                updatedUrl;

            // Attach submit handler to country language form
            $(document).on('submit.baCountryModal', '.countryCookieModalContainer form', function () {
                countryLangForm = $('.countryCookieModalContainer form');
                evtIdInput = $('input[name="eId"]', countryLangForm);
                countryCode = $('#countrycode', countryLangForm).val();
                langCode = $('#languagecode', countryLangForm).val();
                updatedLocale = langCode.toLowerCase() + '-' + countryCode.toLowerCase();
                updatedUrl = currentUrl.replace(currentLocale, updatedLocale);

                scope.setCookie(scope.COUNTRY_COOKIE_NAME, countryCode);
                scope.setCookie(scope.LANG_COOKIE_NAME, langCode);

                evtIdInput.remove();
                countryLangForm.attr('action', updatedUrl);
            });
        };

        //Initialize
        scope.init = function () {
            var url = '/cms/global/scripts/lib/jQuery_plugins/jquery.ba.countryLanguageChooser.js';
            $.getScript(url)
                .done(function () {
                    $('body').countryLanguageChooser({
                        defaultLocale: ["en", "gb"]
                    });
                    scope.injectStyles();
                    scope.handleFormSubmit();					
                });

            //Handle cross-origin error to remove 'Please Wait' modal for Livesite dev and all preview environments
            //This needs to be added through a global ajax error handler since we don't want to make any change in
            //jquery.ba.countryLanguageChooser.js
            $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
                if (settings.url === '/main/ba_vsg18.jsp/gg-m-cont') {
                    $('#cookieAjaxLoadingModal').remove();
                }
            });

			$(document).ajaxComplete(function() {			
				// Get Country Code and Language (Locale) from URL
				var currentUrl = window.location.href,
				currentLocale = currentUrl.split('/')[3].toUpperCase(),
				baLanguage = currentLocale.split('-')[0],
				baCountry = currentLocale.split('-')[1];
			
			//change the locale pop-up to default to the language and country in the url
			var countrySelector = $("#cookieModal").find("#countrycode"),
				languageSelector = $("#cookieModal").find("#languagecode");
			countrySelector.val(baCountry);
			languageSelector.val(baLanguage);
			
			});
        };

        scope.init();
    };
}(jQuery));