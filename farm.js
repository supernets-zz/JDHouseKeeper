var farm = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const signInTag = "东东农场连续签到";
const subscribeGetDropsTag = "东东农场关注领水滴任务";
const getDropsTag = "东东农场领水滴任务";
const morningGetDropsTag = "东东农场早上定时领水任务";
const noonGetDropsTag = "东东农场中午定时领水任务";
const nightGetDropsTag = "东东农场晚上定时领水任务";

farm.dailyJobs = [];
farm.dailyJobs.push(signInTag);
farm.dailyJobs.push(subscribeGetDropsTag);
farm.dailyJobs.push(getDropsTag);

gotoFarm = function () {
    var farmBtn = textMatches(/.*水果.*/).packageName(common.destPackageName).findOne(30000);
    if (farmBtn == null){
        toastLog("免费水果 not exist");
        return null;
    }

    var clickRet = farmBtn.parent().click();
    log("点击 免费水果: " + clickRet + ", 并等待 包邮送到家 出现, 15s超时");
    if (!clickRet) {
        return null;
    }

    var freeShipTips = common.waitForTextMatches(/.*包邮送到家/, true, 15);
    if (freeShipTips == null) {
        return null;
    }

    for (var i = 0; i < 10; i++) {
        //弹出每日签到提示、三餐领水滴提示
        var tips = textMatches(/打卡领水|定时领水/).packageName(common.destPackageName).findOne(1000);
        if (tips != null) {
            var dlgCloseBtn = tips.parent().child(tips.parent().childCount() - 1);
            log(tips.text() + " 关闭(" + dlgCloseBtn.bounds().centerX() + ", " + dlgCloseBtn.bounds().centerY() + "): " + click(dlgCloseBtn.bounds().centerX(), dlgCloseBtn.bounds().centerY()));
            sleep(1000);
        } else {
            break;
        }
    }

    if (i >= 10) {
        return null;
    }

    //弹出继续去逛农场提示
    var getBtn = textMatches(/立即领取/).packageName(common.destPackageName).findOne(1000);
    if (getBtn != null) {
        log("点击 立即领取: " + click(getBtn.bounds().centerX(), getBtn.bounds().centerY()));
        sleep(1000);
        //然后会跳转微信
        for (var j = 0; j < 10; j++) {
            var curPkg = currentPackage();
            if (curPkg != common.destPackageName) {
                //跳其他app了要跳回来
                log("currentPackage(): " + curPkg);
                app.startActivity({
                    action: "VIEW",
                    data: 'openApp.jdMobile://virtual'
                })
            } else {
                break;
            }
            sleep(1000);
        }
        if (j >= 10) {
            return null;
        }
    }
    //连续签到freeShipTips.parent().parent().child(倒数第二个).child(第一个);
    //领水滴freeShipTips.parent().parent().child(倒数第二个).child(第二个);
    //浇水freeShipTips.parent().parent().child(最后一个).child(第一个);
    //鸭子freeShipTips.parent().parent().child(第5个).child(第一个);
    return freeShipTips.parent().parent();
}

doWateringTasks = function (tasklist, duckBtn) {
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        sleep(1000);
        //点鸭子
        for (var i = 0; i < 5; i++) {
            log("点鸭子: " + click(duckBtn.bounds().centerX(), duckBtn.bounds().centerY()));
            sleep(50);
        }
        var duckTips = common.waitForTextMatches(/.*鸭.*/, true, 8);
        if (duckTips != null) {
            sleep(2000);
            var dlgFrame = duckTips.parent().parent();
            var dlgCloseBtn = dlgFrame.child(dlgFrame.childCount() - 1);
            log("点关闭: " + click(dlgCloseBtn.bounds().centerX(), dlgCloseBtn.bounds().centerY()));
            sleep(1000);
        } else {
            log("close btn not found");
        }
    }
}

farm.doSignIn = function () {
    log("farm.doSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        log(signInTag + " 已做: " + done);
        return;
    }

    toast("farm.doSignIn");
    // 免费水果-> 连续签到，每日一次
    var actionBar = gotoFarm();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var continuousSignInBtn = actionBar.child(actionBar.childCount() - 2).child(0);
    clickRet = click(continuousSignInBtn.bounds().centerX(), continuousSignInBtn.bounds().centerY());
    log("点击 连续签到(" + continuousSignInBtn.bounds().centerX() + ", " + continuousSignInBtn.bounds().centerY() + "): " + clickRet + ", 并等待 连续7天签到可得大额京豆或水滴礼包 出现, 15s超时");

    var signTips = common.waitForTextMatches(/.*连续7天签到可得大额京豆或水滴礼包/, true, 15);
    if (signTips == null) {
        commonAction.backToAppMainPage();
        return;
    }

    for (var i = 0; i < 3; i++) {
        var signFrame = signTips.parent();
        var signBtn = signFrame.child(signFrame.childCount() - 2);
    
        var signBtnText = "";
        if (signBtn.childCount() == 0) {
            signBtnText = signBtn.text();
        } else {
            var objs = [];
            common.queryList(signBtn, 255, objs);
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].className() == "android.widget.TextView") {
                    signBtnText = signBtnText + objs[i].text();
                }
            }
        }
        log("签到按钮: " + signBtnText);
    
        if (/签到领.*|领取惊喜礼包/.test(signBtnText)) {
            clickRet = click(signBtn.bounds().centerX(), signBtn.bounds().centerY());
            log("点击 签到领: " + clickRet);
            sleep(1000);
        } else if (/已连续签到.*/.test(signBtnText)) {
            common.safeSet(nowDate + ":" + signInTag, "done");
            toastLog("完成 " + signInTag);
            break;
        } else {
            log("unknown status");
            break;
        }    
    }

    commonAction.backToAppMainPage();
}

farm.doSubscribeGetDrops = function () {
    log("farm.doSubscribeGetDrops");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + subscribeGetDropsTag);
    if (done != null) {
        log(subscribeGetDropsTag + " 已做: " + done);
        return;
    }

    toast("farm.doSubscribeGetDrops");
    // 免费水果-> 连续签到，每日一次
    var actionBar = gotoFarm();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var continuousSignInBtn = actionBar.child(actionBar.childCount() - 2).child(0);
    clickRet = click(continuousSignInBtn.bounds().centerX(), continuousSignInBtn.bounds().centerY());
    log("点击 连续签到(" + continuousSignInBtn.bounds().centerX() + ", " + continuousSignInBtn.bounds().centerY() + "): " + clickRet + ", 并等待 连续7天签到可得大额京豆或水滴礼包 出现, 15s超时");

    for (;;) {
        var subscribeTips = common.waitForText("text", "浏览并关注频道", true, 15);
        if (subscribeTips == null) {
            commonAction.backToAppMainPage();
            return;
        }
    
        //关注得水滴三个TextView在这个节点的同一层
        var subscribeFrame = subscribeTips.parent().child(subscribeTips.parent().childCount() - 1);
        var objs = [];
        var subscribeBtns = [];
        var getBtns = [];
        var startTick = new Date().getTime();
        if (new Date().getTime() - startTick > 120 * 1000) {
            log("疑似卡在循环中");
            break;
        }

        common.queryList(subscribeFrame, 0, objs);
        for (var i = 0; i < objs.length; i++) {
            if (objs[i].className() == "android.widget.TextView") {
                log(objs[i].text());
                if (objs[i].text() == "关注得水滴") {
                    subscribeBtns.push(objs[i]);
                } else if (objs[i].text() == "去领取") {
                    getBtns.push(objs[i]);
                }
            }
        }
    
        log("subscribeBtns.length: " + subscribeBtns.length + ", getBtns.length: " + getBtns.length);
        if (subscribeBtns.length + getBtns.length == 0) {
            common.safeSet(nowDate + ":" + subscribeGetDropsTag, "done");
            toastLog("完成 " + subscribeGetDropsTag);
            break;
        }

        if (getBtns.length > 0) {
            clickRet = click(getBtns[0].bounds().centerX(), getBtns[0].bounds().centerY());
            log("点击 去领取: " + clickRet);
            sleep(1000);
            continue;
        }

        clickRet = click(subscribeBtns[0].bounds().centerX(), subscribeBtns[0].bounds().centerY());
        log("点击 关注得水滴: " + clickRet + ", 并等待10s后返回");
        sleep(10000);
        back();
        sleep(3000);
    }

    commonAction.backToAppMainPage();
}

farm.doGetDrops = function () {
    log("farm.doGetDrops");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + getDropsTag);
    if (done != null) {
        log(getDropsTag + " 已做: " + done);
        return;
    }

    toast("farm.doGetDrops");
    // 免费水果-> 左上角签到-> 立即翻牌，每日一次
    var actionBar = gotoFarm();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var getDropsBtn = actionBar.child(actionBar.childCount() - 2).child(1);
    var duckBtn = actionBar.child(4).child(0);
    // 做完任务后列表会刷新，不能用旧的坐标去点击，需要重新获取一下任务列表
    // 除了双签领豆任务以外其他都做完了就算完成
    for (;;) {
        var clickRet = click(getDropsBtn.bounds().centerX(), getDropsBtn.bounds().centerY());
        log("点击 领水滴(" + getDropsBtn.bounds().centerX() + ", " + getDropsBtn.bounds().centerY() + "): " + clickRet + ", 并等待 领水滴 出现, 5s超时");
        sleep(2000);
        var taskListTips = common.waitForTextMatches(/领水滴/, true, 5);
        if (taskListTips == null) {
            break;
        }

        var taskListCloseBtn = taskListTips.parent().parent().child(taskListTips.parent().parent().childCount() - 1);
        var oneWalkTaskList = [];   //去逛逛任务列表，待够时间回来
        var wateringTaskList = [];  //每日浇水10次任务列表
        var totalTasks = [];
        var validTaskNames = [];
        for (var j = 0; j < 10 && validTaskNames.length == 0; j++) {
            totalTasks = packageName(common.destPackageName).textMatches(/.*奖励\d+g水滴.*/).find();
            var validTasks = packageName(common.destPackageName).textMatches(/.*奖励\d+g水滴.*/).visibleToUser(true).find();
            for (var i = 0; i < validTasks.length; i++) {
                var taskItem = validTasks[i].parent();
                var btnParent = taskItem.child(taskItem.childCount() - 1);
                var btn = btnParent.child(btnParent.childCount() - 1);
                if (btn.bounds().height() > 50) {
                    validTaskNames.push(taskItem.child(1).text());
                }
            }
            toastLog("任务数: " + totalTasks.length + ", 可见: " + validTaskNames.length + ", " + validTaskNames);
            if (validTaskNames.length == 0) {
                sleep(1000);
            }
        }

        if (validTaskNames.length == 0) {
            commonAction.backToAppMainPage();
            return;
        }

        if (totalTasks.length == 0) {
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            commonAction.backToAppMainPage();
            return;
        }

        var dones = textMatches(/去领取|领取/).visibleToUser(true).find();
        log("可领取: " + dones.length);
        if (dones.length != 0) {
            log("领取水滴: " + click(dones[0].bounds().centerX(), dones[0].bounds().centerY()));
            sleep(1000);

            // 领取后任务列表有变不能点击旧的坐标
            // 任务列表关闭按钮坐标
            log("关闭领水滴任务列表: " + click(taskListCloseBtn.bounds().centerX(), taskListCloseBtn.bounds().centerY()));
            sleep(1000);
            continue;
        }

        totalTasks.forEach(function(tv) {
            var taskItem = tv.parent();
            var title = taskItem.child(1).text();   //是其父节点的第二个子节点
            var tips = "";
            for (var i = 2; i < taskItem.childCount() - 1; i++) {
                if (taskItem.child(i).className() == "android.widget.TextView") {
                    tips = tips + taskItem.child(i).text();
                }
            }
            var btnParent = taskItem.child(taskItem.childCount() - 1);  //是其父节点的最后一个子节点
            var btn = btnParent.child(btnParent.childCount() - 1);
            if (btn.text() != "" &&
                btn.text() != "已完成" &&
                btn.text() != "再逛逛" &&
                btn.text() != "已收集" &&
                btn.text() != "已领取" &&
                btn.text() != "明日再来" &&
                title != "帮2位好友浇水" &&
                title.indexOf("专属特惠") == -1) {
                var obj = {};
                obj.Title = title;
                obj.Tips = tips;
                obj.BtnName = btn.text();
                obj.Button = btn;
                if (obj.Title != "每日累计浇水10次") {
                    oneWalkTaskList.push(obj);
                } else {
                    wateringTaskList.push(obj);
                }
                log("未完成任务" + (oneWalkTaskList.length + wateringTaskList.length) + ": " + obj.Title + ", " + obj.Tips + ", " + obj.BtnName + ", (" + obj.Button.bounds().centerX() + ", " + obj.Button.bounds().centerY() + "), " + obj.Button.bounds().height());
            } else {
                log("跳过任务: " + title + ", " + tips + ", " + btn.text() + ", (" + btn.bounds().centerX() + ", " + btn.bounds().centerY() + "), " + btn.bounds().height());
            }
        });

        var uncompleteTaskNum = oneWalkTaskList.length + wateringTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
            common.safeSet(nowDate + ":" + getDropsTag, "done");
            toastLog("完成 " + getDropsTag);
            break;
        }

        oneWalkTaskList = common.filterTaskList(oneWalkTaskList, validTaskNames);
        if (commonAction.doOneWalkTasks(oneWalkTaskList)) {
            log("关闭领水滴任务列表: " + click(taskListCloseBtn.bounds().centerX(), taskListCloseBtn.bounds().centerY()));
            sleep(1000);
            continue;
        }

        wateringTaskList = common.filterTaskList(wateringTaskList, validTaskNames)
        if (doWateringTasks(wateringTaskList, duckBtn)) {
            //浇水任务不需要关闭任务列表，它自己会关闭
            continue;
        }

        // 任务列表关闭按钮坐标
        log("关闭领水滴任务列表: " + click(taskListCloseBtn.bounds().centerX(), taskListCloseBtn.bounds().centerY()));
        sleep(1000);
    }

    commonAction.backToAppMainPage();
}

farm.doPeriodGetDrops = function () {
    log("farm.doPeriodGetDrops");
    //不在时间范围内不判断定时领水任务做没做
    var inTheMorning = common.checkAuditTime("00:00", "09:00");
    var atNoon = common.checkAuditTime("11:00", "14:00");
    var atNight = common.checkAuditTime("17:00", "21:00");
    if (!inTheMorning && !atNoon && !atNight) {
        log("不在定时领水时间段内");
        return;
    }

    var nowDate = new Date().Format("yyyy-MM-dd");
    var doneMorning = common.safeGet(nowDate + ":" + morningGetDropsTag);
    var doneNoon = common.safeGet(nowDate + ":" + noonGetDropsTag);
    var doneNight = common.safeGet(nowDate + ":" + nightGetDropsTag);
    
    // 定时领水时间段[00:00~09:00]、[11:00~14:00]、[17:00~21:00]
    var now = new Date().getTime();
    var curDate = new Date().Format("yyyy/MM/dd");
    var morningBeginTime = new Date(curDate + " 00:00:00").getTime();
    var morningEndTime = new Date(curDate + " 09:00:00").getTime();
    var noonBeginTime = new Date(curDate + " 11:00:00").getTime();
    var noonEndTime = new Date(curDate + " 14:00:00").getTime();
    var nightBeginTime = new Date(curDate + " 17:00:00").getTime();
    var nightEndTime = new Date(curDate + " 21:00:00").getTime();
    log("定时领水有效时间段: [" + common.timestampToTime(morningBeginTime) + ", " + common.timestampToTime(morningEndTime) + "]: " + doneMorning);
    log("定时领水有效时间段: [" + common.timestampToTime(noonBeginTime) + ", " + common.timestampToTime(noonEndTime) + "]: " + doneNoon);
    log("定时领水有效时间段: [" + common.timestampToTime(nightBeginTime) + ", " + common.timestampToTime(nightEndTime) + "]: " + doneNight);

    if (now > morningEndTime && doneMorning == null) {
        common.safeSet(nowDate + ":" + morningGetDropsTag, "expired");
        toastLog("过期 " + morningGetDropsTag);
    }

    if (now > noonEndTime && doneNoon == null) {
        common.safeSet(nowDate + ":" + noonGetDropsTag, "expired");
        toastLog("过期 " + noonGetDropsTag);
    }

    if (now > nightEndTime && doneNight == null) {
        common.safeSet(nowDate + ":" + nightGetDropsTag, "expired");
        toastLog("过期 " + nightGetDropsTag);
    }

    if (inTheMorning && doneMorning != null || atNoon && doneNoon != null || atNight && doneNight != null) {
        return;
    }

    toast("farm.doPeriodGetDrops");
    var actionBar = gotoFarm();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var getDropsBtn = actionBar.child(actionBar.childCount() - 2).child(1);
    for (;;) {
        var clickRet = click(getDropsBtn.bounds().centerX(), getDropsBtn.bounds().centerY());
        log("点击 领水滴(" + getDropsBtn.bounds().centerX() + ", " + getDropsBtn.bounds().centerY() + "): " + clickRet + ", 并等待 领水滴 出现, 5s超时");
        sleep(2000);
        var taskListTips = common.waitForTextMatches(/领水滴/, true, 5);
        if (taskListTips == null) {
            break;
        }

        var taskListCloseBtn = taskListTips.parent().parent().child(taskListTips.parent().parent().childCount() - 1);
        var dones = textMatches(/去领取|领取/).visibleToUser(true).find();
        log("可领取: " + dones.length);
        if (dones.length != 0) {
            log("领取水滴: " + click(dones[0].bounds().centerX(), dones[0].bounds().centerY()));
            sleep(1000);

            if (inTheMorning) {
                common.safeSet(nowDate + ":" + morningGetDropsTag, "done");
                toastLog("完成 " + morningGetDropsTag);
            } else if (atNoon) {
                common.safeSet(nowDate + ":" + noonGetDropsTag, "done");
                toastLog("完成 " + noonGetDropsTag);
            } else if (atNight) {
                common.safeSet(nowDate + ":" + nightGetDropsTag, "done");
                toastLog("完成 " + nightGetDropsTag);
            }

            //弹出每日签到提示、三餐领水滴提示
            var tips = textMatches(/打卡领水|定时领水/).packageName(common.destPackageName).findOne(1000);
            if (tips != null) {
                var dlgCloseBtn = tips.parent().child(tips.parent().childCount() - 1);
                log(tips.text() + " 关闭(" + dlgCloseBtn.bounds().centerX() + ", " + dlgCloseBtn.bounds().centerY() + "): " + click(dlgCloseBtn.bounds().centerX(), dlgCloseBtn.bounds().centerY()));
                sleep(1000);
            }

            // 领取后任务列表有变不能点击旧的坐标
            // 任务列表关闭按钮坐标
            log("关闭领水滴任务列表: " + click(taskListCloseBtn.bounds().centerX(), taskListCloseBtn.bounds().centerY()));
            sleep(1000);
            continue;
        } else {
            break;
        }
    }

    commonAction.backToAppMainPage();
}

module.exports = farm;