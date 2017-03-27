jQuery(document).ready(function($) {

    var headerHeight;

    function setHeight() {
        headerHeight = $('header').outerHeight();
        $('main').css({
            'padding-top': headerHeight
        });
    }

    setHeight();

    $(window).resize(function() {
        setHeight();
    });

});