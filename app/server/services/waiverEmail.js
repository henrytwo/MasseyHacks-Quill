var Imap = require('imap'),
    inspect = require('util').inspect;
var Users = require('../models/User');
var Settings = require('../models/Settings');

var imap = new Imap({
    user: process.env.waiverEmail,
    password: process.env.waiverPassword,
    host: process.env.waiverAddress,
    port: process.env.waiverPort,
    tls: true
});

var addToLog = function (message, callback) {

    var marked_message = "[" + Date() + "] " + message;

    console.log(marked_message);

    Settings.findOneAndUpdate({}, {
        $push: {
            log : marked_message
        }
    }, {
        new: true
    }, function () {

    }, callback);
};

function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
}

imap.once('ready', function() {
    fetch_email()

    imap.on('mail', function (message) {
        fetch_email()
    })
});

imap.once('error', function(err) {
    console.log(err);
});

imap.once('end', function() {
    console.log('Connection ended');
});

var fetch_email = function() {
    openInbox(function(err, box) {
        imap.search([ 'UNSEEN'], function(err, results) {
            if (!err && results.length !== 0) {

                var f = imap.fetch(results, {
                    bodies: 'HEADER.FIELDS (FROM SUBJECT)',
                    markSeen: true,
                    struct: true
                });
                f.on('message', function (msg, seqno) {
                    var prefix = '(#' + seqno + ') ';
                    msg.on('body', function (stream, info) {
                        var buffer;
                        stream.on('data', function (chunk) {
                            buffer = chunk.toString('utf8');
                        });
                        stream.once('end', function () {
                            buffer = buffer.split("\r\n")
                            if (buffer[0] === "From: HelloSign <noreply@mail.hellosign.com>") {
                                console.log(buffer[1]);
                                var process = buffer[1].split(" ");
                                if (process[process.length-1] === "by") {
                                    process = [buffer[2].slice(1)];
                                }

                                Users.findOneAndUpdate({
                                        'email': process[process.length-1]
                                    },
                                    {
                                        $set: {
                                            'status.waiver': true
                                        }
                                    }, {
                                        new: true
                                    },
                                    function(err, user) {
                                        if (user) {
                                            console.log(user.email + "'s waiver has been received");
                                            addToLog(user.email + "'s waiver has been received", null);
                                        } else {
                                            addToLog('broooo da sheit? dis bois (' + process[process.length-1] + ') has da non existianting email bro')
                                        }
                                    });
                            }
                        });
                    });

                });
                f.once('error', function (err) {
                    console.log("imap error " + err);
                });
            }
        });
    });
};

imap.connect();