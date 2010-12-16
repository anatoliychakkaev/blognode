models = require('../lib/models.js');

// helper methods
var GN = false;
function it(s, t) {
    if (GN) { exports[GN][s] = t; } else { exports[s] = t; }
}
function context(n, t) {
    exports[n] = {}; GN = n; t(); GN = false;
}

context('game', function (test) {
    it('should correctly update game state', function (test) {

        var black, white;

        function create_first_player(callback) {
            models.Player.create(function () {
                black = this;
                black.loadGame('reversi', function () {
                    test.equals(black.game.state(black), 'wait_opponent', 'game status when only one user joins is "wait_opponent"');
                    test.equals(black.color, 'b');
                    test.equals(black.game.color, 'b');
                    callback();
                });
            });
        }

        function create_second_player(callback) {
            models.Player.create(function () {
                white = this;
                white.loadGame('reversi', function () {
                    test.equals(white.game.state(black), 'move', 'when second player join to game, status for first player is "move"');
                    test.equals(white.game.state(white), 'wait', 'second player should wait for first player move, game status is "wait"');
                    test.equals(white.color, 'w', 'second player is white');
                    test.equals(white.game.color, 'b', 'game board owned by black');
                    test.equals(white.game.id, black.game.id, 'players plays the same game');
                    test.done();
                });
            });
        }

        create_first_player(create_second_player);
    });

    it('should play random game', function (test) {
        models.Player.create(function () {
            var black = this;
            black.loadGame('reversi', function () {

            });
        });
    });
});
