// fetch online friends
$(function () {
    var update_leaderboard = function () {
        FB.api({
            method: 'fql.query',
            query: "SELECT uid, online_presence FROM user WHERE online_presence IN ('active', 'idle') AND uid IN ( SELECT uid2 FROM friend WHERE uid1 = 1643427443)"
        }, function (data) {
            var $lb = $('ul.leaderboard');
            $lb.find('li button').attr('disabled', true);
            $(data).each(function (i, user) {
                console.log(user);
                $lb.find('li[data-id=' + user.uid + '] button').attr('disabled', false);;
            });
        });
    };
    setTimeout(update_leaderboard, 1000);
    setInterval(update_leaderboard, 2 * 60000);
});
