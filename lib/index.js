var request = require("request");

module.exports = function(keywords) {

    var qqUrl = `http://i.y.qq.com/s.plcloud/fcgi-bin/smartbox_new.fcg?key=${encodeURI(keywords)}`;
    var baiduUrl = `http://sug.music.baidu.com/info/suggestion?word=${encodeURI(keywords)}`;
    var xiamiUrl = `http://www.xiami.com/ajax/search-index?key=${encodeURI(keywords)}`;

    request.get(qqUrl, function(error, response, body) {
        var result = JSON.parse(body.toString());
        if (result.data && result.data.song && result.data.song.count) {
            var qqLink = `http://y.qq.com/#type=song&mid=${result.data.song.itemlist[0].mid}`;
            console.log('qq', qqLink);
        } else {
            request.get(baiduUrl, function(error, response, body) {
                var result = JSON.parse(body.toString());
                if (result.data && result.data.song[0]) {
                    var baiduLink = '';
                    var encrypted_songid = result.data.song[0].encrypted_songid;
                    var songid = result.data.song[0].songid;
                    if (encrypted_songid) {
                        baiduLink = `http://music.baidu.com/song/s/${encrypted_songid}`
                    } else {
                        baiduLink = `http://y.baidu.com/song/${songid}`;
                    }
                    console.log('baidu', baiduLink);
                } else {
                    request.get(xiamiUrl, function(error, response, body) {
                        // xiami response is `html`
                        var result = body.toString();

                        var jsdom = require("jsdom").jsdom;
                        var doc = jsdom(result);
                        var window = doc.defaultView;
                        var resultNodes = doc.getElementsByClassName('song_result');

                        if (resultNodes.length) {
                            var xiamiLink = resultNodes[0].getAttribute('href');
                            console.log('xiami', xiamiLink);
                        } else {
                            var neteaseApi = require('NeteaseCloudMusicApi').api
                            neteaseApi.search(keywords, function(data) {
                                var songs = JSON.parse(data).result.songs;
                                if (songs.length) {
                                    var neteaseLink = `http://music.163.com/#/song?id=${songs[0].id}`;
                                    console.log('netease', neteaseLink);
                                } else {
                                    console.log('null');
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}
