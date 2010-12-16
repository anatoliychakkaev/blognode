$.fn.reversi = function (player, current_color, board, drawer) {
    return new window.exports.ReversiGame(player, current_color, board, drawer, this);
};
$(function () {
    var undef;
    var cell_size = 40;
    var padding = 10;
    var board_size = cell_size * 8 + padding * 2;
    var board = $('#board canvas')[0];
    var info = $('#board .info');
    var game;
    var CURRENT_POSITION;

    board.width = board_size;
    board.height = board_size;

    function clear(r) {
        context.fillStyle = '#ccb';
        context.fillRect(-cell_size/2, -cell_size/2, cell_size, cell_size);
    }

    function circle(r, style) {
        if (!style) {
            style = '#bbb,#ddd';
        }
        style = style.split(',');
        var relief = style[2] ? 1 : -1;
        var grad = style[0].split('-');
        if (grad.length > 1) {
            style[0] = context.createRadialGradient(
                relief * cell_size*.25, relief * cell_size*.25, cell_size*.05,
                0, 0, cell_size*.5
            );
            style[0].addColorStop(0, grad[0]);
            style[0].addColorStop(.6, grad[1]);
            style[0].addColorStop(1, grad[2]);
        }

        context.beginPath();
        context.arc(0, 0, r, 0, Math.PI * 2, true);
        context.closePath();
        context.fillStyle = style[0];
        context.fill();

        context.strokeWeight = 1;
        context.beginPath();
        context.arc(0, 0, r, 0, Math.PI * 2, true);
        context.globalAlpha = 0.5;
        context.strokeStyle = style[1];
        context.stroke();
    }

    var s = {
        b: '#666-#222-#000,#000',
        w: '#fff-#e3e3e3-#afafaf,#aaa',
        0: '#c2c2b4-#c2c2b0-#b0b0a0,#bbb,-',
        // 0: '#b4b4b4-#b0b0b0-#999,#bbb,-',
        W: '#ccc-#ccc-#aaa,#ccc,-',
        B: '#888-#888-#666,#888,-' };

        function place_chip(i, j, c) {
            context.save();
            context.translate((j + 0.5) * cell_size, (i + 0.5) * cell_size);
            clear();
            circle(cell_size / 2 - 2, s[c]);
            context.restore();
        }

        function initial_draw(position) {
            if (OVER_CHIP) {
                place_chip(OVER_CHIP.i, OVER_CHIP.j, '0');
                OVER_CHIP = false;
            }
            CURRENT_POSITION = position;
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    place_chip(i, j, position[i][j]);
                }
            }
        }

        function animate_revert(diff, callback, step, what) {
            var steps = [.8, .5, .3, .1, 'r', .1, .3, .5, .8, 1];
            if (step === undef) {
                step = 0;
            }
            if (what === undef) {
                what = 'from';
            }
            if (!steps[step]) {
                callback();
                return;
            }
            if (steps[step] === 'r') {
                what = 'to';
                step++;
            }
            for (var p in diff) {
                context.save();
                context.translate((diff[p].j + 0.5) * cell_size, (diff[p].i + 0.5) * cell_size);
                circle(cell_size / 2 - 0, s['0']);
                context.rotate(Math.PI*.25);
                context.scale(steps[step], 1);
                circle(cell_size / 2 - 2, s[diff[p][what]]);
                context.restore();
            }
            setTimeout(function () {
                animate_revert(diff, callback, step + 1, what);
            }, 1000/25);
        }

        function clicked(x, y) {
            if (!game.can_player_move()) return;
            var i = Math.ceil((y - padding) / cell_size) - 1;
            var j = Math.ceil((x - padding) / cell_size) - 1;

            if (i < 0 || j < 0 || i > 7 || j > 7) {
                return;
            }

            context.fillStyle = '#FFF';
            OVER_CHIP.p = CURRENT_POSITION[i][j];
            game.move(i + ':' + j);
        }

        var $board = $(board);
        $(board).click(function (e) {
            var offset = $board.offset();
            clicked(e.clientX - offset.left + window.scrollX, e.clientY - offset.top + window.scrollY);
        });

        var OVER_CHIP = null;
        function moved(x, y) {
            if (!game.can_player_move()) return;
            var i = Math.ceil((y - padding) / cell_size) - 1;
            var j = Math.ceil((x - padding) / cell_size) - 1;
            if (i < 0 || j < 0 || i > 7 || j > 7) {
                return;
            }

            var p = CURRENT_POSITION[i][j];
            if (OVER_CHIP && (OVER_CHIP.j != i || OVER_CHIP.i != j)) {
                place_chip(OVER_CHIP.i, OVER_CHIP.j, OVER_CHIP.p);
                OVER_CHIP = false;
            }
            if ((p == 'W' || p == 'B') && (!OVER_CHIP || (OVER_CHIP.i != i && OVER_CHIP.j != j))) {
                OVER_CHIP = {i: i, j: j, p: p};
                context.globalAlpha = 0.5;
                place_chip(i, j, p.toLowerCase());
                context.globalAlpha = 1;
            }
        }

        $(board).mousemove(function (e) {
            var offset = $board.offset();
            moved(e.clientX - offset.left + window.scrollX, e.clientY - offset.top + window.scrollY);
        });

        var context = board.getContext('2d');
        context.fillStyle = "#c4c4b3";
        context.fillRect(0, 0, board_size, board_size);
        context.translate(padding, padding);

        function update_board(data) {
            if (data.prev_position) {
                var diff = [], from, to;
                for (var i = 0; i < 8; i++) {
                    for (var j = 0; j < 8; j++) {
                        from = data.prev_position[i][j];
                        to = data.position[i][j];
                        if ((from == 'w' || from == 'b') && from != to) {
                            diff.push({i:i,j:j,from:from,to:to});
                        }
                        if (from == 'W' || from == 'B') {
                            if (to == 'b' || to == 'w') {
                                place_chip(i, j, to);
                            }
                        }
                    }
                }
                animate_revert(diff, function () {
                    initial_draw(data.position);
                });
            } else {
                initial_draw(data.position);
            }
        }

        var res = BOARD;

        s[res.player == 'w' ? 'B' : 'W'] = s['0'];
        game = $('#board').reversi(res.player, res.color == 'b', res.position, update_board);
        game.join();
        var send_to_socket = true;

        function update_counter(s) {
            $('#counter .black').html(s.b);
            $('#counter .white').html(s.w);
        }

        function auto_move() {
            console.log('automove', window.autoplay);
            var len, move, p;
            if (window.autoplay) {
                len = game.board.available_cells.length;
                if (len == 0) return;
                switch (window.autoplay) {
                    case 'up':
                    move = 0;
                    break;
                    case 'down':
                    move = len - 1;
                    break;
                    default:
                    case 'random':
                    move = Math.round(Math.random() * (len - 1));
                    break;
                }
                p = game.board.available_cells[move];
                game.move(p.i + ':' + p.j);
            }
        }
        window.auto_move = auto_move;

        game.after_move = function (coords) {
            console.log('after move ' + coords);
            console.log(send_to_socket);
            update_counter(game.board.board_stats);
            if (!game.pwned_by(res.player)) {
                info.html('Opponent\'s turn.');
            } else {
                info.html('Your turn.');
            }
            if (send_to_socket) {
                SOCKET.send({action: "move", coords: coords});
            } else {
            }
            send_to_socket = true;
        };
        var SOCKET = new io.Socket(document.location.hostname);
        SOCKET.connect();
        SOCKET.send({action: 'authorize', secret: BOARD.secret});

        if (res.state == 'move') {
            game.join();
            game.board.color = res.color == 'b';
            info.html('Your turn');
        } else if (res.action == 'end') {
            info.html('Game finished');
        } else if (res.action == 'wait') {
            info.html('Opponents turn');
        } else {
            info.html('Awaiting for opponent connection');
        }
        update_counter(game.board.board_stats);

        SOCKET.on('disconnect', function () {
            info.html('You are offline');
            setTimeout(function () {
                SOCKET.disconnect();
                info.html('Reconnecting');
                try {
                    SOCKET.connect();
                    //SOCKET.send({action: 'authorize', secret: BOARD.secret});
                } catch (e) {
                    alert(e.message);
                }
            }, 1000);
        });
        SOCKET.on('message', function (msg) {
            console.log(msg);
            if (typeof msg == 'string') {
                msg = JSON.parse(msg);
            }
            switch (msg.action) {
                case 'restart_session':
                    location.href = location.href;
                break;
                case 'opponent_connected':
                    game.join();
                    info.html('Opponent joined. You can move.');
                    var $opp = $('#opponent_info');
                    $opp.find('.avatar img').attr('src', 'http://graph.facebook.com/' + msg.user.id + '/picture');
                    $opp.find('.username').html(msg.user.name);
                    $opp.show();
                break;
                case 'opponent_disconnected':
                    info.html('Opponent disconnected');
                break;
                case 'opponent_reconnected':
                    info.html('Opponent reconnected');
                break;
                case 'move':
                    game.join();
                    send_to_socket = false;
                    game.move(msg.coords);
                    if (typeof window.autoplay !== 'undefined') {
                        setTimeout(function () {
                            auto_move(window.autoplay);
                        }, 1000);
                    }
                break;
                case 'end':
                info.html('End game. You ' + (
                    msg.info.b > msg.info.w && res.player == 'b' ||
                    msg.info.b < msg.info.w && res.player == 'w' ?
                    'win' : 'lose'
                ) + '.');
                break;
            }
        });
});
$(function () {
    // bind cheets
    // $('#autoplay_random').click(function () {
        // window.autoplay = !window.autoplay;
        // if (window.autoplay) {
            // //window.auto_move();
        // }
        // $(this).html(window.autoplay ? 'Switch autoplay off' : 'Switch autoplay on');
    // });
    
    function autoplay_strategy (str) {
        return function () {
            console.log('autoplay ' + str);
            if (window.autoplay) {
                $('#autoplay_' + window.autoplay).html('Autoplay ' + window.autoplay);
                window.autoplay = false;
            } else {
                $(this).html('Stop autoplay');
                window.autoplay = str;
                //window.auto_move();
            }
        }
    };
    var strategies = ['up', 'down', 'random'];
    $(strategies).each(function (i, val) {
        console.log(val);
        $('#autoplay_' + val).click(autoplay_strategy(val));
    });
});


