(function ($) {
    $.fn.fadeOnHover = function (start, step) {
        start = start || .5;
        step = step || 0.07;

        var timer,
            limit = start,
            $f = $(this);


        if ($.browser.msie) {
            $f.css('filter', 'alpha(opacity=50)');
        } else {
            $f.css('opacity', start);
        }

        $f.hover(function () {
            if (timer) clearInterval(timer);
            timer = setInterval(function () {
                if ($.browser.msie) {
                    $f.css('filter', 'alpha(opacity=' + (start += step) * 100 + ')');
                } else {
                    $f.css('opacity', start += step);
                }
                if (start + 0.001 > 1) clearInterval(timer);
            }, 50);
        }, function () {
            if (timer) clearInterval(timer);
            timer = setInterval(function () {
                if ($.browser.msie) {
                    $f.css('filter', 'alpha(opacity=' + (start -= step) * 100 + ')');
                } else {
                    $f.css('opacity', start -= step);
                }
                if (start - 0.0001 < limit) clearInterval(timer);
            }, 50);
        });
    };
})(jQuery);

$(function () {
    $('.footer').fadeOnHover();
    $('.donate').fadeOnHover(.3);
});
