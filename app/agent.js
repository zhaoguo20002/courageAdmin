/**
 * Created by lvw on 2017/4/28 0028.
 *
 * 代理服务器， 连接master服务器
 *
 * 前端的请求通知代理服务器向master服务器发送事件
 *
 */


var AdminClient = require('pomelo-admin').adminClient;
var config = require('../config/admin.json');


var io = null;
var init = function ($io) {
    io = $io;
    //监听连接
    io.on('connection', function(socket){
        console.log('test '+socket.id);
        //注册信息
        socket.on('register',function (event) {
            //{"type":"client","id":"browser-1493706728889","username":"monitor","password":"monitor","md5":false}
            console.log('register %j'+JSON.stringify(event));

            var id = event.id;
            // var username = event.username;
            // var password = event.password;
            //从配置文件中读取
            var username = config.adminusername;
            var password = config.adminpassword;
            var host = config.adminhost;
            var port = config.adminport;

            var client = new AdminClient({
                username: username,
                password: password,
                md5: true
            });

            client.connect(id, host, port, function(err) {
                if (err) {
                    console.log('login fail ! err=' + err + '\n');
                    socket.emit('register',{code:-1,msg:err});  // code 1:标示成功  -1:标示失败  失败是需要设置下错误信息 msg:'error'
                } else {
                    socket.adminConnected = true;
                    console.log('login success!')
                    socket.emit('register',{code:1});  // code 1:标示成功  -1:标示失败  失败是需要设置下错误信息 msg:'error'
                }
            });

            client.on('close', function() {
                socket.adminClient = null;
                console.log('\ndisconnect from master');
            });

            client.on('error', function(err) {
                console.error('socket is error');
            });

            //设置下admin客服端信息
            socket.adminClient = client;
        });

        socket.on('client',function (event) {
            //console.log('client %j'+event);

            // ["client","{"reqId":15,"moduleId":"systemInfo","body":{"clientId":"browser-1493704162298","username":"monitor"}}"]
            //转换成json对象
            event = JSON.parse(event);
            var moduleId = event.moduleId;
            var body = event.body;
            var reqId = event.reqId;

            //是否连接了admin
            if(isConnected(socket)){
                var client = socket.adminClient;
                if (!!reqId) {
                    //发送请求
                    client.request(moduleId, body,function (err,result) {
                        //console.log('eeeee+++++++++++++++++' + err + ' result:=' + JSON.stringify(result));
                        var finalResult = {respId:reqId};
                        if(!!err){ //有错误
                            finalResult.error = err;
                        } else {
                            finalResult.body = result;
                        }
                        socket.emit('client',finalResult);  //
                    });
                } else {
                    client.notify(moduleId,body);
                }
            } else {
                console.warn('admin is not Connected ,please wait!');
                if (!!reqId) {
                    var finalResult = {respId:reqId};
                    finalResult.error = 'admin no connected by agent.';
                    socket.emit('client',finalResult);  //
                }
            }
        });

        socket.on('close',function (event) {
            console.log('close event = '+JSON.stringify(event));
        });
    });
}

/**
 * 是否在连接中
 * @param socket
 * @returns {boolean}
 */
var isConnected = function (socket) {
    var client = socket.adminClient;
    if(client && client.socket.connected){
        return true;
    }
    return false;
}
module.exports = {
    init:init
};

