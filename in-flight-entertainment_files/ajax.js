/*

    AJAX functionality for the BAHLE plugin.

;(function ( $ ) {

    var fromChangeRequest = null
      , onFromChange      = null
      , load              = null

    // Custom AJAX load function for IE compatibility
    load = (function () { 
        if ( $.browser.msie && parseInt( $.browser.version, 10 ) >= 8 ) {
            return function ( url, data, callback ) {
                var xdr = new XDomainRequest();
                xdr.open( 'GET', url + '?' + $.param( data ) + '&t' + (new Date()).getTime() );
                xdr.onload( function () {
                    callback( xdr.responseText );
                });
                setTimeout( function () {
                    xdr.send()
                }, 1 );
                return xdr;
            }
        } else {
            return function ( url, data, callback ) {
                return $.get( url, data, callback, 'html' );
            }
        }
    })();

    // Called when the `from` city changes
    onFromChange = function ( e )  {
        if ( fromChangeRequest ) {
            fromChangeRequest.abort();
        }

        fromChangeRequest = load( 'http://bahle.spafax.com/wp-admin/admin-ajax.php', {
            action: 'load_destinations',
            from  : e.target.value
        }, function ( html ) {
            fromChangeRequest = null;
            $('#id-destination').replaceWith( html );
        } );
    }

    $( function () {
        $('#id-from').change( onFromChange );
    } );

})( jQuery );
*/
