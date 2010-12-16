var GAMES = 1,
    PLAYERS = GAMES * 2,
    TEST;

//console.log = function () {};
function game(num) {

    var STEPS = 0,
        PAUSE = 0,
        c = require('../lib/controller.js'),
        black = { session: {} },
        white = { session: {} };

function query(route, req, res) {
    c.loadUser(req, null, function () {
        c[route](req, res);
    });
}

var black_res = {
    send: function (coords) {
        if (coords == 'wait') {
            query('wait', black, black_res);
        } else {
            setTimeout(function () {
                if (coords && coords.toString().match(/\d:\d/)) {
                    black.player.game.game.move(coords);
                    console.log(coords.toString(), 'matched');
                } else {
                    console.log(coords && coords.toString(), 'not matched');
                }
                coords = black.player.game.game.board.available_cells;
                //console.log('B-----------', ++STEPS);
                //console.log(black.player.game.game.board.position);
                coords = coords[0];
                if (coords) {
                    black.query = {coords: coords.i + ':' + coords.j};
                    query('move', black, black_res);
                } else {
                    console.log('END GAME');
                    if (--PLAYERS == 0) {
                        TEST.done();
                    }
                    console.log(black.player.game.game.board.board_stats);
                }
            }, PAUSE);
        }
    }
};

var white_res = {
    send: function (coords) {
        if (coords == 'wait') {
            query('wait', white, white_res);
        } else {
            setTimeout(function () {
                if (coords && coords.toString().match(/\d:\d/)) {
                    console.log(coords.toString(), 'matched');
                    white.player.game.game.move(coords);
                } else {
                    console.log(coords && coords.toString(), 'not matched');
                }
                coords = white.player.game.game.board.available_cells;
                //console.log('W-----------', ++STEPS);
                //console.log(white.player.game.game.board.position);
                coords = coords[0];
                if (coords) {
                    white.query = {coords: coords.i + ':' + coords.j};
                    query('move', white, white_res);
                } else {
                    console.log('END GAME');
                    if (--PLAYERS == 0) {
                        TEST.done();
                    }
                    console.log(white.player.game.game.board.board_stats);
                }
            }, PAUSE);
        }
    }
};

    query('index', black, {render: function () {
        query('wait', black, black_res);
        query('index', white, {render: function () {
            query('wait', white, white_res);
        }});
    }});

}

exports['game'] = function (test) {
    TEST = test;
    for (var k = 0; k < GAMES; ++k) setTimeout(game, 10*k);
}
