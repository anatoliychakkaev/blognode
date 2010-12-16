// var crypto = require('crypto');

exports.base64_url_decode = function (input) {
    input = input.replace(/-/g, '+').replace(/_/g, '/');
    var decoded = (new Buffer(input, 'base64')).toString('binary');
    console.log(decoded);
    return decoded;
}

exports.parse_signed_request = function (signed_request, secret) {
    // signed_request is "#{encoded_sig}.#{payload}"
    var sr = signed_request.split('.'),
        encoded_sig = sr[0],
        payload = sr[1];

    // decode the data
    var sig = exports.base64_url_decode(encoded_sig);
    var data = JSON.parse(exports.base64_url_decode(payload), true);

    if (data['algorithm'] !== 'HMAC-SHA256') {
        console.log('Unknown algorithm. Expected HMAC-SHA256');
        return false;
    }

    // check sig
    var hmac = require('crypto').createHmac('sha256', secret);
    hmac.update(payload);
    var expected_sig = hmac.digest();

    console.log(sig);
    console.log(expected_sig);
    if (sig !== expected_sig) {
        console.log('Bad Signed JSON signature!');
        return false;
    }

    return data;
}

exports.top_redirect_to = function (url, res) {
    res.send('<html><head><script type="text/javascript">window.top.location.href = "' + url + '";</script><noscript><meta http-equiv="refresh" content="0;url=' + url + '" /><meta http-equiv="window-target" content="_top" /></noscript></head></html>');
}

exports.serialize = function (hash, join_with) {
    join_with = join_with || '&';
    var s = [];
    for (var i in hash) {
        s.push(i + '=' + hash[i]);
    }
    return s.join(join_with);
}
