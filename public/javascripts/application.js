$(function () {
    var timer,
        start = 0.5,
        step = 0.07,
        $f = $('.footer');

    if ($.browser.msie) {
        $f.css('filter', 'alpha(opacity=50)');
    } else {
        $f.css('opacity', .5);
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
            if (start - 0.001 < .5) clearInterval(timer);
        }, 50);
    });
});
