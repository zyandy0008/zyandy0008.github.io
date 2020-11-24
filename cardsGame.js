var starButton = document.getElementById('startButton');
var cardShow = document.getElementById('cardShow');
var Li = document.getElementById('countArea').getElementsByTagName('li');
var countAready = 0;//定义抽卡次数
var countChange = 0;//定义机会卡
var evilIndex = 0;//定义恶魔值
var meeting = true;//定义一个阀值，遇到淘汰卡为假，没遇到为真，为后面裁决玩家是否被淘汰的判断代码提供信息

starButton.onclick = function () {
    // 随机数决定抽卡的卡号和恶魔值，恶魔值=卡号=i
    i = Math.floor(Math.random() * 10);
    cardShow.style.backgroundImage = 'url(./img/evil' + i + '.jpg)';
    countAready++;//每点击一次就记录一次抽卡次数
    // 更据随机数i和是否遇见淘汰卡meeting来决定玩家数据
    if (i == 1) {
        meeting = false;
    }
    else if (i == 5 && meeting != false) {
        countChange++;
        evilIndex += i;
        alert('恭喜获得机会卡牌');
    } else if (countChange > 0 && meeting == false) {
        countChange--;
        evilIndex -= i;
        meeting = true;
        alert('遗憾的是，这是张淘汰卡;幸运的是因为机会卡的庇佑，你只是失去的恶魔值为' + evilIndex + '，而不会被淘汰');
    } else if (countChange <= 0 && meeting == false) {
        meeting = true;
        alert('很抱歉，你是个悲哀的恶魔，不幸抽中淘汰卡，孤独的你将面对关闭的地狱大门!最后你获得的恶魔值为' + evilIndex);
        for (var z = 0; z < Li.length; z++) {
            Li[z].style.visibility = 'hidden';
            starButton.style.visibility = 'hidden';
            cardShow.style.backgroundImage = 'url(./img/gameover.jpg)';
            document.body.style.backgroundColor = 'red';
        }
    } else {
        evilIndex += i;
    }

    //改变玩家数据
    Li[0].innerHTML = '已抽卡次数：' + countAready;
    Li[1].innerHTML = '机会卡：' + countChange;
    Li[2].innerHTML = '恶魔值：' + evilIndex;
}