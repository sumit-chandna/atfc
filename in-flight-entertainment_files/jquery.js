(function ($) {
    'use strict';
    
    $.widget('ba.hiddenDataSetup', {

        _create: function () {

            this.urlParamFields = $(this.element).find('.hiddenParamElement');
            this.cookieFields = $(this.element).find('.hiddenCookieElement');
            this.userAgentField = $(this.element).find('.hiddenUAElement');
        },

        populate: function () {

            var paramName,
                param,
                cookieName,
                cookie,
                windowParams = decodeURIComponent(window.location.search.substring(1)),
                queryList = windowParams.split('&'),
                queryKeyValue,
                cookieList = document.cookie.split(';'),
                cookieKeyValue,
                count;

            //populate url param fields
            $.each(this.urlParamFields, function(){

                //get desired param name from field label
                paramName = $(this).find("label").text();
                //search for this param in query list 
                for (count = 0; count < queryList.length; count++) {
                    queryKeyValue = queryList[count].split('=');

                    if (queryKeyValue[0] === paramName) {
                        $(this).find("input").val(queryKeyValue[1]);
                    };
                };
            });

            //populate cookie fields
            $.each(this.cookieFields, function(){

                cookieName = $(this).find("label").text();

                //search for this param in query list 
                for (count = 0; count < cookieList.length; count++) {
                    cookieKeyValue = cookieList[count].split('=');

                    if (cookieKeyValue[0] === cookieName) {
                        $(this).find("input").val(cookieKeyValue[1]);
                    };
                };
            });

            //populate user agent field
            this.userAgentField.find("input").val(navigator.userAgent);
        }
    });

}(jQuery));