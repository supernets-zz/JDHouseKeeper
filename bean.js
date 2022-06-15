var bean = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const plantBeanTag = "种豆得豆每日任务";
const upgradeEarnBeanTag = "升级赚京豆每日任务";

bean.dailyJobs = [];
bean.dailyJobs.push(plantBeanTag);
bean.dailyJobs.push(upgradeEarnBeanTag);

gotoBean = function () {
    var beanBtn = text("领京豆").packageName(common.destPackageName).findOne(30000);
    if (beanBtn == null) {
        toastLog("领京豆 not exist");
        return null;
    }

    var clickRet = beanBtn.parent().click();
    log("点击 领京豆: " + clickRet + ", 并等待 规则 出现, 15s超时");
    if (!clickRet) {
        return null;
    }

    var ruleTips = common.waitForText("text", "规则", true, 15);
    if (ruleTips == null) {
        return null;
    }

    //升级赚京豆ruleTips.parent().parent().parent().child(倒数第二个);
    //种豆得豆ruleTips.parent().parent().parent().child(最后一个);
    return ruleTips.parent().parent().parent();
}

//种豆得豆去去关注任务
doSubscribeTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        var taskList = common.waitForText("text", "进入并关注", true, 10);
        if (taskList == null) {
            break;
        }

        log("往上划动半个屏幕: " + swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 300));
        var subscribeBtn = text("进入并关注").visibleToUser(true).findOne(1000);
        if (subscribeBtn != null) {
            log("点击 进入并关注: " + subscribeBtn.click());
            // 等待离开"进入并关注"任务列表页面
            common.waitDismiss("text", "进入并关注", 10);
            sleep(5000);
            //从关注的页面返回
            back();
            sleep(3000);
            //离开"进入并关注"任务列表页面
            back();
            sleep(3000);
            // 等待离开"进入并关注"任务列表页面回到"更多任务"
            common.waitDismiss("text", "进入并关注", 10);
            ret = true;
            break;
        }
    }
    return ret;
}

//种豆得豆浏览店铺任务
doWalkShopTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        var taskList = common.waitForText("text", "进店并关注", true, 10);
        if (taskList == null) {
            break;
        }

        var subscribeBtn = text("进店并关注").findOne(1000);
        if (subscribeBtn != null) {
            toastLog("点击 进店并关注: " + click(subscribeBtn.bounds().centerX(), subscribeBtn.bounds().centerY()));
            // 等待离开"进店任务"任务列表页面
            common.waitDismiss("text", "进店并关注", 10);
            sleep(5000);
            //取消关注
            var btnSubscribe = packageName(common.destPackageName).className("android.widget.ImageView").desc("已关注按钮").findOne(3000);
            if (btnSubscribe != null) {
                log("点击 已关注: " + click(btnSubscribe.bounds().centerX(), btnSubscribe.bounds().centerY()));
                sleep(1000);
                var btnConfrimUnsub = text("取消关注").findOne(1000);
                if (btnConfrimUnsub != null) {
                    log("点击 取消关注: " + btnConfrimUnsub.click());
                }
            } else {
                log("已关注 not found");
            }
            //从关注的页面返回
            back();
            sleep(3000);
            //离开"进店任务"任务列表页面
            back();
            sleep(3000);
            // 等待离开"进店任务"任务列表页面回到"更多任务"
            common.waitDismiss("text", "进店并关注", 10);
            ret = true;
            break;
        }
    }
    return ret;
}

//种豆得豆挑选商品任务
doPickupMerchantTasks = function (tasklist) {
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));

        //等到商品列表出现
        var merchantList = common.waitForText("text", "已获得", true, 5);
        if (merchantList == null) {
            backToAppMainPage();
            return;
        }
        
        merchantList = packageName(common.destPackageName).className("android.widget.TextView").depth(16).drawingOrder(3).indexInParent(3).find();

        //选择左侧的商品点击
        log("商品数: " + merchantList.length);
        var validMerchant = packageName(common.destPackageName).className("android.widget.TextView").depth(16).drawingOrder(3).indexInParent(3).visibleToUser(true).find();
        //记录在屏幕内第一个商品的坐标
        var clickx = validMerchant[0].bounds().centerX();
        var clicky = validMerchant[0].bounds().centerY() + validMerchant[0].bounds().height() * 2;
        for (var ll = 0; ll < 6; ll++) {
            toastLog("点击左侧商品: " + click(clickx, clicky));
            sleep(1000);
            for (var l = 0; l < 10; l++) {
                var btnLike = text("收藏").visibleToUser(true).findOne(1000);
                if (btnLike == null) {
                    log("上划屏幕找 收藏: " + swipe(device.width / 2, device.height / 2, device.width / 2, device.height / 3, 500));
                    sleep(1000);
                    continue;
                }
                log("取消收藏: " + click(btnLike.bounds().centerX(), btnLike.bounds().centerY()));
                back();
                sleep(3000);
                break;
            }

            //可能上的不是一般商品了
            if (l == 10) {
                throw "doPickupMerchantTasks: 非正常商品"
            }
            common.waitDismiss("text", "收藏", 10);
            //从右向左滑动
            swipe(device.width * 3 / 4, device.height / 2, device.width / 4, device.height / 2, 500);
            sleep(1000);
        }
    }
    //回到"更多任务"列表
    back();
}

bean.doGetBeans = function () {
    log("bean.doGetBeans");
    // 领京豆-> 种豆得豆
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + plantBeanTag);
    if (done != null) {
        log(plantBeanTag + " 已做: " + done);
        return;
    }

    toast("bean.doGetBeans");
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

    var moreTaskFrame = growthTips.parent().parent().parent().parent();
    var moreTasksBtn = moreTaskFrame.child(moreTaskFrame.childCount() - 2);

    clickRet = click(moreTasksBtn.bounds().centerX(), moreTasksBtn.bounds().centerY());
    log("点击 更多任务: " + clickRet + ", 并等待 /已获得\d+\/\d+瓶 出现, 15s超时");

    common.waitForTextMatches(/已获得\d+\/\d+瓶/, true, 15);

    // 做完任务后列表会刷新，不能用旧的坐标去点击，需要重新获取一下任务列表
    // 除了去邀请以及两个去签到任务以外其他都做完了就算完成
    for (;;) {    
        var oneWalkTaskList = [];  //去逛逛任务列表，待够时间回来
        var subscribeTaskList = []; //去关注任务列表，需要多次折返
        var walkShopTaskList = [];  //浏览店铺，需要多次折返
        var pickupMerchantTaskList = [];  //挑选商品

        var totalTasks = [];
        var validTaskNames = [];
        for (var j = 0; j < 10 && validTaskNames.length == 0; j++) {
            totalTasks = packageName(common.destPackageName).textMatches(/已获得\d+\/\d+瓶/).find();
            for (var i = 0; i < totalTasks.length; i++) {
                var taskItem = totalTasks[i].parent().parent();
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
            var taskItem = tv.parent().parent();
            var title = taskItem.child(1).text();
            var progress = taskItem.child(2).child(taskItem.child(2).childCount() - 1).text();
            var tips = taskItem.child(taskItem.childCount() - 2).text();
            var btn = taskItem.child(taskItem.childCount() - 1).child(0);
            if (btn.text() != "去邀请" && 
                btn.text() != "去签到" && 
                btn.text() != "已完成" &&
                title != "免费水果") {
                var obj = {};
                obj.Title = title;
                obj.Progress = progress;
                obj.Tips = tips;
                obj.BtnName = btn.text();
                obj.Button = btn;
                if (obj.BtnName == "去关注") {
                    subscribeTaskList.push(obj);
                } else if (obj.Title == "浏览店铺") {
                    walkShopTaskList.push(obj);
                } else if (obj.Title == "挑选商品") {
                    pickupMerchantTaskList.push(obj);
                } else {
                    oneWalkTaskList.push(obj);
                }
                log("未完成任务" + (oneWalkTaskList.length + subscribeTaskList.length + walkShopTaskList.length + pickupMerchantTaskList.length) + ": " + obj.Title + ", " + obj.Progress + ", " + obj.BtnName + ", (" + obj.Button.bounds().centerX() + ", " + obj.Button.bounds().centerY() + "), " + tips);
            } else {
                log("跳过任务: " + title + ", " + progress + ", " + btn.text() + ", (" + btn.bounds().centerX() + ", " + btn.bounds().centerY() + "), " + tips);
            }
        });

        var uncompleteTaskNum = oneWalkTaskList.length + subscribeTaskList.length + walkShopTaskList.length + pickupMerchantTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
            common.safeSet(nowDate + ":" + plantBeanTag, "done");
            toastLog("完成 " + plantBeanTag);
            break;
        }

        oneWalkTaskList = common.filterTaskList(oneWalkTaskList, validTaskNames);
        if (commonAction.doOneWalkTasks(oneWalkTaskList)) {
            sleep(2000);
            continue;
        }

        subscribeTaskList = common.filterTaskList(subscribeTaskList, validTaskNames);
        if (doSubscribeTasks(subscribeTaskList)) {
            sleep(2000);
            continue;
        }

        walkShopTaskList = common.filterTaskList(walkShopTaskList, validTaskNames);
        if (doWalkShopTasks(walkShopTaskList)) {
            sleep(2000);
            continue;
        }

        pickupMerchantTaskList = common.filterTaskList(pickupMerchantTaskList, validTaskNames);
        doPickupMerchantTasks(pickupMerchantTaskList);
    }

    commonAction.backToAppMainPage();
}

//升级赚京豆每日任务
bean.doUpgradeBeans = function () {
    log("bean.doUpgradeBeans");
    // 领京豆-> 升级赚京豆
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + upgradeEarnBeanTag);
    if (done != null) {
        log(upgradeEarnBeanTag + " 已做: " + done);
        return;
    }

    toast("bean.doUpgradeBeans");
    var actionBar = gotoBean();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var upgradeEarnBean = actionBar.child(actionBar.childCount() - 2);
    var clickRet = click(upgradeEarnBean.bounds().centerX(), upgradeEarnBean.bounds().centerY());
    log("点击 升级赚京豆: " + clickRet + ", 并等待 /做任务再升一级.*/ 出现, 15s超时");

    common.waitForTextMatches(/做任务再升一级.*/, true, 15);
    // 做完任务后列表会刷新，不能用旧的坐标去点击，需要重新获取一下任务列表
    // 除了双签领豆任务以外其他都做完了就算完成
    for (;;) {
        var oneWalkTaskList = [];  //去逛逛任务列表，待够时间回来

        var totalTasks = [];
        var validTaskNames = [];
        for (var j = 0; j < 10 && validTaskNames.length == 0; j++) {
            totalTasks = packageName(common.destPackageName).textMatches(/.*\(\d\/\d\).*/).find();
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
            var btn = taskItem.child(taskItem.childCount() - 1).child(1);
            if (btn.text() != "已完成" &&
                title.indexOf("双签领豆") == -1 &&
                !/升级.*会员.*/.test(title)) {
                var obj = {};
                obj.Title = title;
                obj.Tips = tips;
                obj.BtnName = btn.text();
                obj.Button = btn;
                oneWalkTaskList.push(obj);
                log("未完成任务" + oneWalkTaskList.length + ": " + obj.Title + ", " + obj.BtnName + ", (" + obj.Button.bounds().centerX() + ", " + obj.Button.bounds().centerY() + "), " + tips);
            } else {
                log("跳过任务: " + title + ", " + btn.text() + ", (" + btn.bounds().centerX() + ", " + btn.bounds().centerY() + "), " + tips);
            }
        });

        var uncompleteTaskNum = oneWalkTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
            common.safeSet(nowDate + ":" + upgradeEarnBeanTag, "done");
            toastLog("完成 " + upgradeEarnBeanTag);
            break;
        }

        oneWalkTaskList = common.filterTaskList(oneWalkTaskList, validTaskNames);
        if (commonAction.doOneWalkTasks(oneWalkTaskList)) {
            sleep(2000);
            continue;
        }

        // // 任务列表关闭按钮坐标
        // log("关闭升级赚京豆任务列表: " + click(device.width - 60, upgradeTasks[0].bounds().top - upgradeTasks[0].bounds().height() * 7));
    }

    commonAction.backToAppMainPage();
}

bean.doGetDrops = function () {
    log("bean.doGetDrops");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + getDropsTag);
    if (done != null) {
        log(getDropsTag + " 已做: " + done);
        return;
    }

    toast("bean.doGetDrops");
    // 免费水果-> 左上角签到-> 立即翻牌，每日一次
    var actionBar = gotoBean();
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
            if (btn.text() != "已完成" &&
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
        if (doOneWalkTasks(oneWalkTaskList)) {
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

bean.doPeriodGetDrops = function () {
    log("bean.doPeriodGetDrops");
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
    var doneNoon = common.safeGet(nowDate + ":" + morningGetDropsTag);
    var doneNight = common.safeGet(nowDate + ":" + morningGetDropsTag);
    
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

    toast("bean.doPeriodGetDrops");
    var actionBar = gotoBean();
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
        } else {
            break;
        }
    }

    commonAction.backToAppMainPage();
}

module.exports = bean;