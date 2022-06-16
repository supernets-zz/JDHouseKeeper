var pet = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const petTag = "宠汪汪每日任务";

pet.dailyJobs = [];
pet.dailyJobs.push(petTag);

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
    //喂养: levelTips.parent().parent().parent().child(最后一个);
    return levelTips.parent().parent().parent();
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

pet.doPet = function () {
    log("pet.doPet");
    // 我的-> 宠汪汪
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + petTag);
    if (done != null) {
        log(petTag + " 已做: " + done);
        return;
    }

    toast("pet.doPet");
    var actionBar = gotoPet();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var getDogFoodBtn = actionBar.child(actionBar.childCount() - 3).child(2);
    var clickRet = click(getDogFoodBtn.bounds().centerX(), getDogFoodBtn.bounds().centerY());
    log("点击 领狗粮(" + getDogFoodBtn.bounds().centerX() + ", " + getDogFoodBtn.bounds().centerY() + "): " + clickRet + ", 并等待 做任务得狗粮 出现, 15s超时");

    var foodTaskTips = common.waitForText("textContains", "做任务得狗粮", true, 15);
    if (foodTaskTips == null) {
        commonAction.backToAppMainPage();
        return;
    }

    // 做完任务后列表会刷新，不能用旧的坐标去点击，需要重新获取一下任务列表
    for (;;) {    
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
                btn.text() != "领取" &&
                btn.text() != "去喂食" &&
                title.indexOf("京东电器") == -1) {
                var obj = {};
                obj.Title = title;
                obj.Tips = tips;
                obj.BtnName = btn.text();
                obj.Button = btn;
                if (obj.Title.indexOf("关注店铺") != -1) {
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

        var uncompleteTaskNum = oneWalkTaskList.length + subscribeShopTaskList.length + subscribeChannelTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
            common.safeSet(nowDate + ":" + petTag, "done");
            toastLog("完成 " + petTag);
            break;
        }

        oneWalkTaskList = common.filterTaskList(oneWalkTaskList, validTaskNames)
        if (commonAction.doOneWalkTasks(oneWalkTaskList)) {
            sleep(3000);
            continue;
        }

        subscribeShopTaskList = common.filterTaskList(subscribeShopTaskList, validTaskNames)
        if (commonAction.doWalkShopTasks(subscribeShopTaskList)) {
            sleep(3000);
            continue;
        }

        subscribeChannelTaskList = common.filterTaskList(subscribeChannelTaskList, validTaskNames)
        if (doSubscibeChannelTasks(subscribeChannelTaskList)) {
            sleep(3000);
            continue;
        }

        log("往上划动半个屏幕: " + swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 300));
        sleep(1000);
    }

    commonAction.backToAppMainPage();
}

pet.doRoutine = function () {
    toastLog("pet.doRoutine");
    // 领京豆-> 种豆得豆
    var actionBar = gotoBean();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var plantBeanBtn = actionBar.child(actionBar.childCount() - 1);
    var clickRet = click(plantBeanBtn.bounds().centerX(), plantBeanBtn.bounds().centerY());
    log("点击 种豆得豆: " + clickRet + ", 并等待 豆苗成长值 出现, 15s超时");

    var growthTips = common.waitForText("text", "豆苗成长值", true, 15);
    if (growthTips == null) {
        commonAction.backToAppMainPage();
        return;
    }

    // 领完营养液后会刷新，需要重新获取一下可领营养液
    // 除了去邀请以及两个去签到任务以外其他都做完了就算完成
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var newNextGetBeanCheckTimestamp = new Date(tomorrow.Format("yyyy/MM/dd") + " 09:00:00").getTime();
    var startTick = new Date().getTime();
    for (;;) {
        var nutrients = textMatches(/x\d+/).find();
        nutrients.forEach(function(tv) {
            var bubble = tv.parent().parent();
            var title = bubble.child(bubble.childCount() - 1).text();
            if (tv.text() != "x0") {
                log(title + tv.text() + ": " + click(tv.parent().bounds().centerX(), tv.parent().bounds().centerY()));
                sleep(300);
            } else {
                bubble = tv.parent().parent().parent();
                title = bubble.child(bubble.childCount() - 1).child(0).text();
                if (/剩\d+:\d+:\d+/.test(title)) {
                    var HHmmss = title.match(/\d+/g);
                    newNextGetBeanCheckTimestamp = new Date().getTime() + (parseInt(HHmmss[0]) * 3600 + parseInt(HHmmss[1]) * 60 + parseInt(HHmmss[2])) * 1000;
                }
            }
        });


        if (nutrients.length == 1 && nutrients[0].text() == "x0") {
            break;
        }

        if (new Date().getTime() - startTick > 30 * 1000) {
            break;
        }
    }

    common.safeSet(common.nextGetBeanTimestampTag, newNextGetBeanCheckTimestamp);
    log(common.nextGetBeanTimestampTag + " 设置为: " + common.timestampToTime(newNextGetBeanCheckTimestamp));

    //上划一点点露出下面的收取营养液
    startTick = new Date().getTime();
    for (;;) {
        var tips = textMatches(/喊TA回来|可能认识的人/).visibleToUser(true).findOne(1000);
        if (tips == null) {
            log("上划屏幕 " + swipe(device.width / 2, device.height * 15 / 16, device.width / 2, device.height * 13 / 16, 300));
        } else {
            break;
        }

        if (new Date().getTime() - startTick > 5 * 1000) {
            break;
        }
    }

    var nutrientTips = text("收取营养液").findOne(1000)
    if (nutrientTips == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var frame = nutrientTips.parent();
    var hScrollView = frame.child(2).child(0);
    for (var i = 0; i < 3; i++) {
        var tips = textMatches(/喊TA回来|可能认识的人/).visibleToUser(true).find();
        for (var j = 0; j < tips.length; j++) {
            var friendItem = tips[j].parent();
            var nickname = friendItem.child(friendItem.childCount() - 2).text();
            //不能收取的childCount()==3
            if (friendItem.childCount() == 5) {
                var nutrientNum = parseInt(friendItem.child(2).child(0).text());
                if (nutrientNum > 1) {
                    clickRet = click(friendItem.bounds().centerX(), friendItem.bounds().centerY());
                    log("点击 " + nickname + ": " + clickRet + ", 并等待 你收取Ta 出现, 15s超时");
                    var getTaNutrientTips = common.waitForText("text", "你收取Ta", true, 15);
                    if (getTaNutrientTips == null) {
                        commonAction.backToAppMainPage();
                        return;
                    }

                    var nutrient = textMatches(/x\d+/).visibleToUser(true).findOne(5000);
                    if (nutrient == null) {
                        commonAction.backToAppMainPage();
                        return;
                    }

                    clickRet = click(nutrient.parent().bounds().centerX(), nutrient.parent().bounds().centerY());

                    log("收取 " + nickname + " " + nutrient.text() + ": " + clickRet);
                    sleep(1000);
                    back();
                    sleep(3000);
                }
            } else {
                log("pass " + nickname);
            }
        }

        log("从右往左滑动屏幕: " + swipe(device.width * 3 / 4, hScrollView.bounds().centerY(), device.width / 4, hScrollView.bounds().centerY(), 300));
    }

    commonAction.backToAppMainPage();
}

module.exports = pet;