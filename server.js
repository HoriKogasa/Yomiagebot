const Eris = require("eris");
const { VoiceText } = require('voice-text');
const { writeFileSync } = require('fs');
const twemojiRegex = require('twemoji-parser/dist/lib/regex').default;

const voiceText = new VoiceText("x5ggmauo9qvdh4m2");
const bot = new Eris("トークンをここに貼る");

var connection = null;
var textBuffer = [];
const ChannelName ="5月雑談枠🍃";
const ChannelName2 ="美少女とはなそう"
const ChannelName3 ="特設-雑談外_チャットメインのゲームしてるときご利用ください"
const Channels = ["5月雑談枠🍃","美少女とはなそう","特設-雑談外_チャットメインのゲームしてるときご利用ください","abcde","ogg-text"]
var userVoice = {};
const VoiceTable = ['hikari', 'haruka', 'takeru', 'santa', 'bear', 'show']
var cmds = ["!yomu","!yomi","!yome","!koi","!yonde","!oide"]

bot.on("messageCreate", (msg) => { //メッセージが来たら
  if (msg.author.id == bot.user.id || msg.author.bot){
    return;
  }

    if (cmds.includes(msg.content) /*msg.content=="!yomi" || msg.content=="!yomu" || msg.content=="!yome"*/ || msg.mentions.some((user) => {
            return user.id === bot.user.id
        })) {
        if(cmds.includes(msg.content))
        {
          msg.content="<@!886913261667242015>  join 通話"
          
        }  
      
        var text = msg.content;
        console.log("mention_message: "+ msg.content);
        var arr = text.split(' ')
        var commands = [];
        commands.push({
            alias: 'join',
            fn: (name) => {
                var channel = msg.channel.guild.channels.find((channel) => {
                    return channel.name === name && channel.type === 2
                })
                if (!channel) {
                    return false;
                }
                bot.joinVoiceChannel(channel.id).then((con) => {
                    connection = con;
                    connection.on('end', () => {
                        if (textBuffer.length) {
                            connection.play(getYomiageStream(textBuffer.shift()))
                        }
                    })
                });
                return true
            }
        })
        commands.push({
            alias: 'stop',
            fn: () => {
                if (connection) {
                    bot.leaveVoiceChannel(connection.id)
                    textBuffer = []
                    return true;
                }
                return false;
            }
        })
        commands.push({
            alias: 'voice',
            fn: (num) => {
                if (!(num in VoiceTable)) { return false; }
                userVoice[msg.author.id] = VoiceTable[num]
                return true;
            }
        })
        var command;
        if (!arr.some((word, i) => {
                var com = commands.find((command) => {
                    return word === command.alias
                })
                if (!com) {
                    return
                }
                if (!com.fn(...arr.splice(i + 1)))
                    msg.addReaction('😥');
                return true;
            })) {
            msg.addReaction('😥')
        } else {
            return
        }
    }

    if (!Channels.includes(msg.channel.name)) { return; }  //他チャンネル干渉しない
    if (!connection) { return }  //接続してないなら切る
  
    //msg.contentの実態を知るテスタ//////////
    if(msg.content.length == 0){
      console.log("画像");
    }else if(msg.content == null){
      console.log("null");
    }else{
      console.log("message: "+ msg.content);
    }
    /////////////////////////////////////////
  
    if(msg.content.length == 0){  //画像処理
      msg.content = "画像"
    }
  
    if(msg.content.match(/<:/) && msg.content.match(/:/) && msg.content.match(/>/)){  //カスタム絵文字処理
      console.log("カスタム絵文字");//カスタム絵文字処理になっているか
          let emojiArray = msg.content.split('');//数字消す処理    
          let doubleColon=0;let colonLimit;
          var i;var onceColon=0;
          for(i=0;i<emojiArray.length;i++)
            {
              if(emojiArray[i]==":")
                {
                  doubleColon++;
                }
              if(doubleColon==2 && onceColon==0)
                {
                  colonLimit=i;
                  onceColon=1;
                }
              if(onceColon==1 && emojiArray[i]==">")
                {
                  var dainariEnd=i;
                  onceColon=2;
                }
            }
          msg.content = msg.content.slice(0,colonLimit)　+　msg.content.slice(dainariEnd,emojiArray.length)//2回目のコロン以降スライス+>の後をつける
    }
  
    if(msg.content.match(twemojiRegex))//普通の絵文字処理
    {
      msg.content="絵文字";
    }   
  
    msg.content=msg.content+"。"
      
    if(msg.content.length >= 60){
      msg.content = msg.content.slice(0,59) + "以下略";
    }
  
    if(msg.content.match(/^http:\/\//) || msg.content.match(/^https:\/\//))
      {
        msg.content="URL省略"
      }
  
    if (connection.playing) {
    var voice = getVoiceByUser(msg.author.id)
        textBuffer.push({
            voice: voice,
            msg: msg.content
        })
    } else {
        var voice = getVoiceByUser(msg.author.id)
        var stream = getYomiageStream({
            voice: voice,
            msg: msg.content
        })
        connection.play(stream)
    }
})

function getVoiceByUser(id) {
    if (id in userVoice) {
        return userVoice[id];
    }
    var voice = VoiceTable[5];//Math.floor(Math.random() * VoiceTable.length)
    userVoice[id] = voice;
    return voice;
}

function getYomiageStream(obj) {
    return voiceText.stream(obj.msg, {
        speaker: obj.voice
    })
}
bot.connect(); //接続させる
