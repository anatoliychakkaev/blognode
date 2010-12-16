$(function () {
    $('a[data-method]').live('click', function () {
        var method = $(this).attr('data-method').toLowerCase();
        var params = {};
        if (method == 'delete' || method == 'put') {
            params._method = method;
        }
        $.post(this.href, params, function (response) {
            try {
                eval(response);
            } catch (e) {
                if (console) console.log(e);
            }
        });
        return false;
    });
});
