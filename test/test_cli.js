/**
 * Created by lvw on 2017/4/28 0028.
 */


var adminClient = require('pomelo-admin').adminClient;


var username = 'monitor';
var password = 'monitor';
var host =  '192.168.86.139';
var port =  3005;

var client = new adminClient({
    username: username,
    password: password,
    md5: true
});


var id = 'pomelo_cli_' + Date.now();
client.connect(id, host, port, function(err) {
    if (err) {
        console.log('login fail ! err=' + err + '\n');
        process.exit(0);
    } else {
        console.log('login success!')
        var reqId = 1;
        var moduleId = 'systemInfo';
        // var moduleId = 'monitorLog';
        var body = {
            clientId:id,
            username:username,
            serverId:'hall-server-1'
        };
        // var req = JSON.stringify({
        //     reqId: id,
        //     moduleId: moduleId,
        //     body: body
        // });
        // client.request('client', req,function (err,result) {
        //     console.log('eeeee+++++++++++++++++' + err + ' result:=' + JSON.stringify(result));
        // });

        client.request(moduleId, {},function (err,result) {
            console.log('eeeee+++++++++++++++++' + err + ' result:=' + JSON.stringify(result));
        });
    }
});
client.on('close', function() {
    client.socket.disconnect();
    console.log('\ndisconnect from master');
    process.exit(0);
});