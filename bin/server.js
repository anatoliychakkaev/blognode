var models = require('../lib/models.js');
models.useCache = true;
user = new models.Player();
user.id = 21;
user.game_id(function (err, val) {
    console.log(val);
});

setTimeout(function () {
    user2 = new models.Player();
    user2.id = 20;
    user2.game_id(function (err, val) {
        console.log(user2.game_id);
        console.log(user.game_id);
        console.log(user.game_id == user2.game_id);
    });
}, 1000);
