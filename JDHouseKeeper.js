"ui";
const execInterval = 15 * 60; //检查间隔时间，单位：秒，周期任务每15分钟整点做一次

var common = require("./common.js");
var commonAction = require("./commonAction.js");

var plusMember = require("./plusMember.js");
var book = require("./book.js");
var coupon99 = require("./coupon99.js");
var appliance = require("./appliance.js");
var farm = require("./farm.js");
var bean = require("./bean.js");
var pet = require("./pet.js");

var shutdownFlag = threads.atomic();
var background = threads.disposable();

Date.prototype.Format = function (fmt) {
    var o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'H+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'S+': this.getMilliseconds()
    };
    //因为date.getFullYear()出来的结果是number类型的,所以为了让结果变成字符串型，下面有两种方法：
    if (/(y+)/.test(fmt)) {
        //第一种：利用字符串连接符“+”给date.getFullYear()+''，加一个空字符串便可以将number类型转换成字符串。
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            //第二种：使用String()类型进行强制数据类型转换String(date.getFullYear())，这种更容易理解。
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(String(o[k]).length)));
        }
    }
    return fmt;
};

// 从存储中获取phone
console.setGlobalLogConfig({
    "file": "/sdcard/Download/jdhousekeeper-log.txt"
});
//setScreenMetrics(720, 1440);

ui.statusBarColor("#FF4FB3FF")
function main_page(){
    toastLog("start main page");
    ui.layout(
        <drawer id="drawer">
            <vertical>
                <appbar>
                    <toolbar id="toolbar" bg="#ff4fb3ff" title="{{common.appName}}"/>
                </appbar>
                <vertical gravity="center" layout_weight="1">
                    <vertical padding="10 6 0 6" bg="#ffffff" w="*" h="auto" margin="0 5" elevation="1dp">
                        <Switch id="autoService" w="*" checked="{{auto.service != null}}" textColor="#666666" text="ACCESSIBILITY SETTINGS"/>
                    </vertical>
                </vertical>
                <button id="ctrl" text="START" tag="ScriptTag" color="#ffffff" bg="#FF4FB3FF" foreground="?selectableItemBackground"/>
            </vertical>
    </drawer>
    );
}
// 监听线程
threads.start(function(){
    //在子线程中调用observeKey()从而使按键事件处理在子线程执行
    toastLog("监听按键启动");
    events.observeKey();
    events.on("key_down", function(keyCode, events){
        //音量键关闭脚本
        if(keyCode == keys.volume_up){
            toastLog("通知结束脚本");
            shutdownFlag.getAndIncrement();
        }
    });
});
main_page();

events.on("exit", function(){
    log("STOP");
    device.cancelKeepingAwake();
});

//无障碍开关监控
ui.autoService.setOnCheckedChangeListener(function(widget,checked) {
    if(checked&&!auto.service) {     
        app.startActivity({
            action: "android.settings.ACCESSIBILITY_SETTINGS"
        });
    }
    if(!checked&&auto.service)auto.service.disableSelf()
    ui.autoService.setChecked(auto.service!=null) 
});

//回到本界面时，resume事件会被触发
ui.emitter.on("resume",()=>{
    // 此时根据无障碍服务的开启情况，同步开关的状态
    ui.autoService.checked = auto.service != null;
});

ui.ctrl.click(()=>{
    if(!auto.service){
        toastLog("Please check accessibility");
        return;
    }

    toastLog("Start workMain");
    background.setAndNotify(1);
});

// 后台运行主线程
threads.start(function(){
    // 阻塞,等待连接条件
    var flag = background.blockedGet();
	log("启动京东管家主线程:");
    requestScreenCapture();
    while (flag > 0) {
        var ret = false;
        try {
            var shutdown = shutdownFlag.get();
            if (shutdown > 0) {
                toastLog("Exit script now...");
                break;
            }
            var isScreenOn = device.isScreenOn();
            log("Start now, isScreenOn: " + isScreenOn);
            if (!isScreenOn) {
                device.wakeUp();
                sleep(2000);
                log("swipe to unlock: " + swipe(device.width / 2, device.height * 7 / 8, device.width / 2, device.height * 3 / 8, 300));
            }
            device.keepScreenOn();
            ret = mainWorker();
            device.cancelKeepingAwake();
        } catch(e) {
            console.error("main err ",e);
            device.cancelKeepingAwake();
        }
        var allComplete = isAllDailyTaskComplete();
        log("isAllDailyTaskComplete: " + allComplete + ", mainWorker return: " + ret);
        if (allComplete && ret) {
            var now = new Date().getTime();
            var nextGetBeanCheckTS = parseInt(common.safeGet(common.nextGetBeanTimestampTag));
            var nextGetDogFoodCheckTS = parseInt(common.safeGet(common.nextGetDogFoodTimestampTag));
            var nextPeriodCheckTS = parseInt((now + execInterval * 1000) / (execInterval * 1000)) * (execInterval * 1000);
            log(common.nextGetBeanTimestampTag + ": " + common.timestampToTime(nextGetBeanCheckTS) + ", " +
                common.nextGetDogFoodTimestampTag + ": " + common.timestampToTime(nextGetDogFoodCheckTS) + ", " +
                "下周期检查时间戳: " + common.timestampToTime(nextPeriodCheckTS));

            var finalNextCheckTS = nextPeriodCheckTS;
            if (!isNaN(nextGetBeanCheckTS) && now < nextGetBeanCheckTS) {
                finalNextCheckTS = Math.min(finalNextCheckTS, nextGetBeanCheckTS);
            }
            if (!isNaN(nextGetDogFoodCheckTS) && now < nextGetDogFoodCheckTS) {
                finalNextCheckTS = Math.min(finalNextCheckTS, nextGetDogFoodCheckTS);
            }

            toastLog(Math.floor((finalNextCheckTS - now) / 1000) + "s 后的 " + common.timestampToTime(finalNextCheckTS) + " 进行下一次检查");
            sleep(finalNextCheckTS - now);
        }
    }
});

//宠汪汪每日任务
function doPetDailyTasks() {
    log("doPetDailyTasks");
    // 我的-> 宠汪汪
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = safeGet(nowDate + ":宠汪汪每日任务");
    if (done != null) {
        log("宠汪汪每日任务 已做: " + done);
        return;
    }

    toast("doPetDailyTasks");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://h5.m.jd.com/babelDiy/Zeus/2wuqXrZrhygTQzYA7VufBEpj4amH/index.html","M_sourceFrom":"mxz","msf_type":"auto"}'
    })

    var clickRet = false;
    var petBtn = WaitForText("text", "积分超值兑换", true, 10);
    if (petBtn == null) {
        backToAppMainPage();
        return;
    }

    // 帮忙喂养：click(device.width / 6, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 汪汪大比拼：click(device.width / 5, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 领狗粮：click(device.width / 2, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 喂养：click(device.width * 5 / 6, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 帮忙喂养-> 回家：click(100, device.height - 250)
    // 帮忙喂养-> 帮ta喂养：click(device.width - 100, device.height - 250)
    clickRet = click(device.width / 2, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5));
    log("点击 领狗粮: " + clickRet + ", 并等待10s超时");

    // 做完任务后列表会刷新，不能用旧的坐标去点击，需要重新获取一下任务列表
    // 除了去邀请以及两个去签到任务以外其他都做完了就算完成
    for (;;) {    
        petBtn = WaitForText("textContains", "做任务得狗粮", true, 10);
        if (petBtn == null) {
            backToAppMainPage();
            return;
        }

        sleep(3000);
        var oneWalkTaskList = [];  //逛逛会场、关注商品任务列表，待够时间回来
        var subscribeShopTaskList = []; //关注店铺任务列表
        var subscribeChannelTaskList = []; //关注频道任务列表
        var totalTasks = textMatches(/.*[奖励|得]\d+g狗粮|.*可领\d+g狗粮.*|.*奖励狗粮\d+g/).find();
        var validTasks = textMatches(/.*[奖励|得]\d+g狗粮|.*可领\d+g狗粮.*|.*奖励狗粮\d+g/).visibleToUser(true).find();

        var validTaskNames = [];
        for (var i = 0; i < validTasks.length; i++) {
            var objs = [];
            queryList(validTasks[i].parent(), objs);
            validTaskNames.push(objs[1].text());
        }
        toastLog("任务数: " + totalTasks.length + ", 可见: " + validTasks.length + ", " + validTaskNames);

        for (var i = 0; i < totalTasks.length; i++) {
            var objs = [];
            queryList(totalTasks[i].parent(), objs);
            if (objs[3].text() != "去邀请" && 
                objs[3].text() != "去参与" && 
                objs[3].text() != "明天再来" &&
                objs[3].text() != "领取" &&
                objs[3].text() != "已完成" &&
                objs[3].text() != "去喂食") {
                var obj = {};
                obj.Title = objs[1].text();
                obj.Tips = objs[2].text();
                obj.BtnName = objs[3].text();
                obj.Button = objs[3];
                if (obj.Title.indexOf("关注店铺") != -1) {
                    subscribeShopTaskList.push(obj);
                } else if (obj.Title.indexOf("关注频道") != -1) {
                    subscribeChannelTaskList.push(obj);
                // } else if (obj.Title.indexOf("帮好友") != -1) {
                //     feedTaskList.push(obj);
                } else if (obj.Title.indexOf("逛逛会场") != -1 || obj.Title.indexOf("关注商品") != -1 || obj.Title.indexOf("幸运任务") != -1) {
                    oneWalkTaskList.push(obj);
                }
                log("未完成任务" + (oneWalkTaskList.length + subscribeShopTaskList.length + subscribeChannelTaskList.length) + ": " + obj.Title + ", " + obj.BtnName + ", (" + obj.Button.bounds().centerX() + ", " + obj.Button.bounds().centerY() + ")");
            } else {
                log("跳过任务: " + objs[1].text() + ", " + objs[3].text());
            }
        }

        if (oneWalkTaskList.length + subscribeShopTaskList.length + subscribeChannelTaskList.length == 0) {
            safeSet(nowDate + ":宠汪汪每日任务", "done");
            toastLog("完成 宠汪汪每日任务");
            break;
        }

        oneWalkTaskList = filterTaskList(oneWalkTaskList, validTaskNames)
        if (doOneWalkTasks(oneWalkTaskList)) {
            sleep(5000);
            continue;
        }

        subscribeShopTaskList = filterTaskList(subscribeShopTaskList, validTaskNames)
        if (doWalkShopTasks(subscribeShopTaskList)) {
            sleep(5000);
            continue;
        }

        subscribeChannelTaskList = filterTaskList(subscribeChannelTaskList, validTaskNames)
        if (doSubscibeChannelTasks(subscribeChannelTaskList)) {
            sleep(5000);
            continue;
        }

        log("往上划动半个屏幕: " + swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 300));
        sleep(1000);

        // doPickupMerchantTasks(pickupMerchantTaskList);
        // 任务列表关闭按钮坐标
        // var bound = textContains("当前通过任务获得").findOne(1000).bounds();
        // log("关闭任务列表: " + click(device.width - 60, bound.centerY() - 88));
        //break;
    }

    backToAppMainPage();
}

function doPetRoutineTasks() {
    toastLog("doPetRoutineTasks");
    // 我的-> 宠汪汪
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://h5.m.jd.com/babelDiy/Zeus/2wuqXrZrhygTQzYA7VufBEpj4amH/index.html","M_sourceFrom":"mxz","msf_type":"auto"}'
    })

    var clickRet = false;
    var petBtn = WaitForText("text", "积分超值兑换", true, 10);
    if (petBtn == null) {
        backToAppMainPage();
        return;
    }

    sleep(5000);
    //狗粮吃完了自动喂狗粮
    var dogFood = textMatches(/\d+小时\d+分\d+秒/).find()
    if (dogFood.length == 0) {
        clickRet = click(device.width * 5 / 6, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5));
        log("点击 喂养: " + clickRet);
        textContains("消耗").waitFor();
        //每次20g
        var grams = textContains("消耗").find();
        var feed = grams[1];
        clickRet = click(feed.bounds().right, feed.bounds().top - feed.bounds().height() * 2);
        log("点击 消耗20g: " + clickRet);
        feed = text("喂养").findOne(1000);
        if (feed == null) {
            backToAppMainPage();
            return;
        }

        clickRet = click(feed.bounds().centerX(), feed.bounds().centerY());
        log("点击 确定喂养: " + clickRet);
        sleep(1000);

        backToAppMainPage();
        return;
    } else {
        log("狗粮剩余时间: " + dogFood[0].text());
    }
    // 帮忙喂养：click(device.width / 6, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 汪汪大比拼：click(device.width / 5, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 领狗粮：click(device.width / 2, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 喂养：click(device.width * 5 / 6, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 帮忙喂养-> 回家：click(100, device.height - 250)
    // 帮忙喂养-> 帮ta喂养：click(device.width - 100, device.height - 250)

    //领取任务达标获得的狗粮，例如三餐、帮朋友喂狗粮
    clickRet = click(device.width / 2, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5));
    log("点击 领狗粮: " + clickRet + ", 并等待10s超时");
    sleep(2000);

    petBtn = WaitForTextMatches(/做任务得狗粮.*/, true, 10);
    if (petBtn == null) {
        backToAppMainPage();
        return;
    }

    sleep(3000);

    for (;;) {
        var totalGetBtns = text("领取").find();
        var validGetBtns = text("领取").visibleToUser(true).find();

        log("领取: " + totalGetBtns.length + ", 可视: " + validGetBtns.length);
        if (totalGetBtns.length == validGetBtns.length && totalGetBtns.length == 0) {
            break;
        }

        if (validGetBtns.length > 0) {
            var getBtn = validGetBtns[0];
            toastLog("点击 领取: " + click(getBtn.bounds().centerX(), getBtn.bounds().centerY()));
            sleep(1000);
            break;
        } else {
            log("往上划动半个屏幕: " + swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 300));
            sleep(1000);
        }
    }

    backToAppMainPage();
}

function doubleClick(ctext,index){
    var trytimes=0
    var result = false;
    while(trytimes<2){
        result = click(ctext,index);
        log("click "+ctext+",result="+result);
        trytimes=trytimes+1;
        sleep(1000);
    }
    return result;
}

function isAllDailyTaskComplete() {
    var nowDate = new Date().Format("yyyy-MM-dd");
//    var taskList = [":京东会员每日领京豆", ":种豆得豆每日任务", ":升级赚京豆每日任务", ":宠汪汪每日任务", ":东东农场连续签到", ":东东农场每日任务"];
    var taskList = [];
    taskList.push.apply(taskList, plusMember.dailyJobs);
    taskList.push.apply(taskList, book.dailyJobs);
    taskList.push.apply(taskList, coupon99.dailyJobs);
    taskList.push.apply(taskList, appliance.dailyJobs);
    taskList.push.apply(taskList, farm.dailyJobs);
    taskList.push.apply(taskList, bean.dailyJobs);
    taskList.push.apply(taskList, pet.dailyJobs);
    for (var i = 0; i < taskList.length; i++) {
        var done = common.safeGet(nowDate + ":" + taskList[i]);
        if (done == null) {
            log("isAllDailyTaskComplete: " + nowDate + ":" + taskList[i] + " 未完成");
            return false;
        }
    }
    return true;
}

function mainWorker() {
    var ret = false;
    try{
        log("launchApp " + common.destAppName + ": " + app.launchApp(common.destAppName));
        log("recents: " + recents());
        sleep(1000);
        var btn = text(common.destAppName).findOne(3000);
        if (btn != null) {
            log("switch to " + common.destAppName + ": " + click(btn.bounds().centerX(), btn.bounds().centerY()));
            sleep(1000);
        } else {
            log("no " + common.destAppName + " process");
        }
        var isLoged = commonAction.loopJudgeAppMainPage(6000);
        if (!isLoged) {
            toastLog(common.destAppName + " is unknown status");
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
        } else {
            // 我的-> 会员店-> 天天领京豆-> 立即翻牌，每日一次
            plusMember.doSignIn();

            // 京东图书每日签到
            book.doSignIn();

            // 券后9.9-> 领券-> 立即签到，每日一次
            coupon99.doSignIn();

            // 京东电器-> 左上角签到-> 立即翻牌，每日一次
            appliance.doSignIn();

            // 免费水果-> 领水滴，定时领水
            farm.doPeriodGetDrops();

            // 免费水果-> 连续签到，每日一次
            farm.doSignIn();

            // 免费水果-> 连续签到，每日一次
            farm.doSubscribeGetDrops();

            // 免费水果-> 领水滴，每日一次
            farm.doGetDrops();

            // 领京豆-> 升级赚京豆
            bean.doUpgradeBeans();

            // 领京豆-> 种豆得豆，周期去做
            bean.doRoutine();

            // 我的-> 宠汪汪-> 领狗粮，每日一次
            pet.doPet();
            // // 领京豆-> 种豆得豆-> 更多任务，每日一次
            // doBeanDailyTasks();
            // // 领京豆-> 升级赚京豆，每日一次
            // doUpgradeEarnBeanDailyTasks();
            // // 免费水果-> 连续签到，每日一次
            // doFarmDailySignTask();
            // // 免费水果-> 领水滴，每日一次
            // doFarmDailyTasks();
            // // 我的-> 宠汪汪
            // doPetDailyTasks();

            // doBeanRoutineTasks();
            // doFarmRoutineTasks();
            // doPetRoutineTasks();
            ret = true;
        }
	} catch(e) {
		console.error("mainWorker",e);
    } finally {
		commonAction.backToAppMainPage();
		home();
		toastLog("Back home success");
		sleep(3000);
		//stopApp(jdPackageName);
		toastLog("finish mainWorker loop");
    }
    return ret;
}

