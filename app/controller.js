var m = require('../lib/models.js');

module.exports = {
    index: function index (req, res) {
        console.log(req.just_connected ? 'just connected' : 'not just connected');
        console.log(req.leaderboard);
        if (req.player.game) {
            res.render('game.jade', { locals:
                {   title: 'Reversi game'
                ,   player: req.player
                ,   user: req.session.fb.user
                ,   opponent: req.player.game.cached_opponent
                ,   starter: req.player.game.cached_starter
                ,   secret: req.cookies['connect.sidw']
                ,   leaderboard: req.leaderboard
                }
            });
        } else {
            req.player.load_random_game('reversi', function (game) {
                req.player.game = game;
                index(req, res);
            });
            return;
            res.render('index.jade', { locals:
                {   leaderboard: req.leaderboard
                }
            });
        }
    },
    request: function (req, res) {
        // TODO: add dashboard counter
        var me = req.user;
        m.GameRequest.create(function () {
            this.sender = me;
            this.receiver = req.query.user_id;
            this.save(function () {
                res.send('OK');
            });
        });
    },
    leave_game: function (req, res) {
        req.player.leave_game(function () {
            res.redirect('/');
        });
    }
};
