var pet = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const helpToFeedTag = "宠汪汪帮人喂狗粮";

gotoPet = function () {
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://h5.m.jd.com/babelDiy/Zeus/2wuqXrZrhygTQzYA7VufBEpj4amH/index.html","M_sourceFrom":"mxz","msf_type":"auto"}'
    })

    var levelTips = common.waitForTextMatches(/LV\.\d+\/\d+/, true, 15);
    if (levelTips == null) {
        return null;
    }

    //帮忙喂养: levelTips.parent().parent().parent().child(倒数第三个).child(第一个);
    //领狗粮: levelTips.parent().parent().parent().child(倒数第三个).child(第三个);
    //食盆: levelTips.parent().parent().parent().child(第二个);
    //喂养: levelTips.parent().parent().parent().child(最后一个);
    return levelTips.parent().parent().parent();
}

checkDogBowl = function () {
    var levelTips = textMatches(/LV\.\d+\/\d+/).visibleToUser(true).findOne(1000);
    if (levelTips == null) {
        return;
    }
    var dogBowl = levelTips.parent().parent().parent().child(1);
    log("dogBowl.childCount(): " + dogBowl.childCount());
    //子节点个数为2需要喂养
    if (dogBowl.childCount() == 2) {
        var feedBtn = actionBar.child(actionBar.childCount() - 1);
        var clickRet = click(feedBtn.bounds().centerX(), feedBtn.bounds().centerY());
        log("点击 喂养: " + clickRet + ", 并等待 喂养 出现，15s超时");
        sleep(2000);
        var doFeedBtn = common.waitForText("text", "喂养", true, 15);
        if (doFeedBtn == null) {
            return;
        }

        var closeBtn = doFeedBtn.parent().parent().child(0);
        var feed10gBtn = doFeedBtn.parent().child(doFeedBtn.parent().childCount() - 5);
        var feed20gBtn = doFeedBtn.parent().child(doFeedBtn.parent().childCount() - 4);
        var feed40gBtn = doFeedBtn.parent().child(doFeedBtn.parent().childCount() - 3);
        var feed80gBtn = doFeedBtn.parent().child(doFeedBtn.parent().childCount() - 2);
        var feedChoice = [feed10gBtn, feed20gBtn, feed40gBtn, feed80gBtn];
        var choice = Math.floor(Math.random() * feedChoice.length);
        var todayFeedCount = doFeedBtn.parent().child(1);

        clickRet = click(feedChoice[choice].bounds().centerX(), feedChoice[choice].bounds().centerY());
        log(todayFeedCount.text() + ", 选择 消耗" + feedChoice[choice].child(2).text() + "g: " + clickRet);
        sleep(1000);

        clickRet = click(doFeedBtn.bounds().centerX(), doFeedBtn.bounds().centerY());
        log("点击 喂养: " + clickRet);
        sleep(2000);

        //喂一次狗粮管3个小时
        var newNextFeedDogFoodCheckTimestamp = new Date().getTime() + 3 * 3600 * 1000;
        common.safeSet(common.nextFeedDogFoodTimestampTag, newNextFeedDogFoodCheckTimestamp);
        log(common.nextFeedDogFoodTimestampTag + " 设置为: " + common.timestampToTime(newNextFeedDogFoodCheckTimestamp));
        //todo确定一下是否需要关闭
        // clickRet = click(closeBtn.bounds().centerX(), closeBtn.bounds().centerY());
        // log("点击 关闭: " + clickRet);
        // sleep(2000);
    } else if (dogBowl.childCount() == 3) {
        var leftTimeNode = dogBowl.child(dogBowl.childCount() - 1);
        var leftTimeTips = leftTimeNode.child(leftTimeNode.childCount() - 1).text();
        if (/\d+小时\d+分\d+秒/.test(leftTimeTips)) {
            var HHmmss = leftTimeTips.match(/\d+/g);
            var newNextFeedDogFoodCheckTimestamp = new Date().getTime() + (parseInt(HHmmss[0]) * 3600 + parseInt(HHmmss[1]) * 60 + parseInt(HHmmss[2])) * 1000;
            common.safeSet(common.nextFeedDogFoodTimestampTag, newNextFeedDogFoodCheckTimestamp);
            log(common.nextFeedDogFoodTimestampTag + " 设置为: " + common.timestampToTime(newNextFeedDogFoodCheckTimestamp));
        }
    }

    var feedDialogTips = text("请选择狗粮克数").findOne(1000);
    if (feedDialogTips != null) {
        var closeBtn = feedDialogTips.parent().parent().child(0);
        var clickRet = click(closeBtn.bounds().centerX(), closeBtn.bounds().centerY());
        log("点击 关闭: " + clickRet);
        sleep(2000);
    }
}

//宠汪汪关注频道任务
doSubscibeChannelTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        var taskList = common.waitForText("text", "进入并关注", true, 10);
        if (taskList == null) {
            break;
        }

        for (;;) {
            var totalSubscribeBtns = text("进入并关注").find();
            var validSubscribeBtns = text("进入并关注").visibleToUser(true).find();

            log("进入并关注: " + totalSubscribeBtns.length + ", 可视: " + validSubscribeBtns.length);
            if (totalSubscribeBtns.length == validSubscribeBtns.length && totalSubscribeBtns.length == 0) {
                back();
                ret = true;
                return;
            }

            if (validSubscribeBtns.length > 0) {
                var subscribeBtn = validSubscribeBtns[0];
                toastLog("点击 进入并关注: " + click(subscribeBtn.bounds().centerX(), subscribeBtn.bounds().centerY()));
                // 等待离开"关注频道"任务列表页面
                common.waitDismiss("text", "进入并关注", 10);
                sleep(10000);
                //从关注的页面返回
                back();
                sleep(3000);
                common.waitForText("text", "关注频道任务", true, 10);
            } else {
                log("往上划动半个屏幕: " + swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 300));
                sleep(1000);
            }
        }
    }
    return ret;
}

doGetDogFoodTasks = function (actionBar) {
    // 做完任务后列表会刷新，不能用旧的坐标去点击，需要重新获取一下任务列表
    for (;;) {
        var getDogFoodBtn = actionBar.child(actionBar.childCount() - 3).child(2);
        var clickRet = click(getDogFoodBtn.bounds().centerX(), getDogFoodBtn.bounds().centerY());
        log("点击 领狗粮(" + getDogFoodBtn.bounds().centerX() + ", " + getDogFoodBtn.bounds().centerY() + "): " + clickRet + ", 并等待 做任务得狗粮 出现, 15s超时");
        sleep(2000);

        var foodTaskTips = common.waitForText("textContains", "做任务得狗粮", true, 15);
        if (foodTaskTips == null) {
            return;
        }

        var closeBtn = foodTaskTips.parent().child(foodTaskTips.parent().childCount() - 2);
        var doneTaskList = [];  //已完成的任务，领取就行
        var oneWalkTaskList = [];  //逛逛会场、关注商品任务列表，待够时间回来
        var subscribeShopTaskList = []; //关注店铺任务列表
        var subscribeChannelTaskList = []; //关注频道任务列表

        var totalTasks = [];
        var validTaskNames = [];
        for (var j = 0; j < 30 && validTaskNames.length == 0; j++) {
            totalTasks = packageName(common.destPackageName).textMatches(/.*[奖励|得]\d+g狗粮|.*可领\d+g狗粮.*|.*奖励狗粮\d+g/).find();
            for (var i = 0; i < totalTasks.length; i++) {
                var taskItem = totalTasks[i].parent();
                var btn = taskItem.child(taskItem.childCount() - 1);
                if (btn.bounds().height() > 50) {
                    validTaskNames.push(taskItem.child(1).text());
                }
            }
            toastLog("任务数: " + totalTasks.length + ", 可见: " + validTaskNames.length + ", " + validTaskNames);
            if (validTaskNames.length == 0) {
                sleep(1000);
            }
        }

        if (totalTasks.length == 0) {
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            break;
        }

        totalTasks.forEach(function (tv) {
            var taskItem = tv.parent();
            var title = taskItem.child(1).text();
            var tips = taskItem.child(2).text();
            var btn = taskItem.child(taskItem.childCount() - 1);
            if (btn.text() != "去邀请" && 
                btn.text() != "去参与" && 
                btn.text() != "明天再来" &&
                btn.text() != "已完成" &&
                btn.text() != "去喂食" &&
                title.indexOf("京东电器") == -1) {
                var obj = {};
                obj.Title = title;
                obj.Tips = tips;
                obj.BtnName = btn.text();
                obj.Button = btn;
                if (obj.BtnName == "领取") {
                    doneTaskList.push(obj);
                } else if (obj.Title.indexOf("关注店铺") != -1) {
                    subscribeShopTaskList.push(obj);
                } else if (obj.Title.indexOf("关注频道") != -1) {
                    subscribeChannelTaskList.push(obj);
                // } else if (obj.Title.indexOf("帮好友") != -1) {
                //     feedTaskList.push(obj);
                } else if (obj.Title.indexOf("逛逛会场") != -1 || obj.Title.indexOf("关注商品") != -1 || obj.Title.indexOf("幸运任务") != -1) {
                    oneWalkTaskList.push(obj);
                }
                log("未完成任务" + (oneWalkTaskList.length + subscribeShopTaskList.length + subscribeChannelTaskList.length) + ": " + obj.Title + ", " + obj.BtnName + ", (" + obj.Button.bounds().centerX() + ", " + obj.Button.bounds().centerY() + "), " + tips);
            } else {
                log("跳过任务: " + title + ", " + btn.text() + ", (" + btn.bounds().centerX() + ", " + btn.bounds().centerY() + "), " + tips);
            }
        });

        var uncompleteTaskNum = doneTaskList.length + oneWalkTaskList.length + subscribeShopTaskList.length + subscribeChannelTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
            log("关闭领狗粮任务列表: " + click(closeBtn.bounds().centerX(), closeBtn.bounds().centerY()));
            break;
        }

        doneTaskList = common.filterTaskList(doneTaskList, validTaskNames);
        if (doneTaskList.length != 0) {
            clickRet = click(doneTaskList[0].Button.bounds().centerX(), doneTaskList[0].Button.bounds().centerY());
            log("点击 " + doneTaskList[0].BtnName + ": " + clickRet);
            sleep(1000);
            log("关闭领狗粮任务列表: " + click(closeBtn.bounds().centerX(), closeBtn.bounds().centerY()));
            sleep(2000);
            continue;
        }

        oneWalkTaskList = common.filterTaskList(oneWalkTaskList, validTaskNames)
        if (commonAction.doOneWalkTasks(oneWalkTaskList)) {
            log("关闭领狗粮任务列表: " + click(closeBtn.bounds().centerX(), closeBtn.bounds().centerY()));
            sleep(2000);
            continue;
        }

        subscribeShopTaskList = common.filterTaskList(subscribeShopTaskList, validTaskNames)
        if (commonAction.doWalkShopTasks(subscribeShopTaskList)) {
            log("关闭领狗粮任务列表: " + click(closeBtn.bounds().centerX(), closeBtn.bounds().centerY()));
            sleep(2000);
            continue;
        }

        subscribeChannelTaskList = common.filterTaskList(subscribeChannelTaskList, validTaskNames)
        if (doSubscibeChannelTasks(subscribeChannelTaskList)) {
            log("关闭领狗粮任务列表: " + click(closeBtn.bounds().centerX(), closeBtn.bounds().centerY()));
            sleep(2000);
            continue;
        }

        log("往上划动半个屏幕: " + swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 300));
        sleep(1000);
    }
}

pet.doRoutine = function () {
    toastLog("pet.doRoutine");
    // 我的-> 宠汪汪
    var actionBar = gotoPet();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    doGetDogFoodTasks(actionBar);

    checkDogBowl();

    commonAction.backToAppMainPage();
}

module.exports = pet;