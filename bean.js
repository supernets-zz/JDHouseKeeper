var bean = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const upgradeEarnBeanTag = "升级赚京豆每日任务";

bean.dailyJobs = [];
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
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
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

//种豆得豆挑选商品任务
doPickupMerchantTasks = function (tasklist) {
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));

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

doGetNutrientTasks = function (growthTips) {
    var moreTaskFrame = growthTips.parent().parent().parent().parent();
    var moreTasksBtn = moreTaskFrame.child(moreTaskFrame.childCount() - 2);

    var clickRet = click(moreTasksBtn.bounds().centerX(), moreTasksBtn.bounds().centerY());
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
        if (commonAction.doWalkShopTasks(walkShopTaskList)) {
            sleep(2000);
            continue;
        }

        pickupMerchantTaskList = common.filterTaskList(pickupMerchantTaskList, validTaskNames);
        doPickupMerchantTasks(pickupMerchantTaskList);
    }

    log("关闭营养液任务列表: " + click(growthTips.bounds().centerX(), growthTips.bounds().centerY()));
}

getMyNutrients = function () {
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var newNextGetNutrientCheckTimestamp = new Date(tomorrow.Format("yyyy/MM/dd") + " 07:00:00").getTime();
    var startTick = new Date().getTime();
    for (;;) {
        var nutrients = textMatches(/x\d+/).find();
        log("营养液泡泡个数: " + nutrients.length);
        nutrients.forEach(function(tv) {
            var bubble = tv.parent().parent();
            var title = bubble.child(bubble.childCount() - 1).text();
            log(title + tv.text());
            if (tv.text() != "x0") {
                log("点击 " + title + tv.text() + ": " + click(tv.parent().bounds().centerX(), tv.parent().bounds().centerY()));
                sleep(300);
            } else {
                bubble = tv.parent().parent().parent();
                title = bubble.child(bubble.childCount() - 1).child(0).text();
                if (/剩\d+:\d+:\d+/.test(title)) {
                    var HHmmss = title.match(/\d+/g);
                    newNextGetNutrientCheckTimestamp = new Date().getTime() + (parseInt(HHmmss[0]) * 3600 + parseInt(HHmmss[1]) * 60 + parseInt(HHmmss[2])) * 1000;
                }
            }
        });

        if (nutrients.length == 1 && nutrients[0].text() == "x0" || nutrients.length == 0) {
            break;
        }

        if (new Date().getTime() - startTick > 30 * 1000) {
            break;
        }
    }

    common.safeSet(common.nextGetNutrientTimestampTag, newNextGetNutrientCheckTimestamp);
    log(common.nextGetNutrientTimestampTag + " 设置为: " + common.timestampToTime(newNextGetNutrientCheckTimestamp));
}

getFriendsNutrients = function () {
    //上划一点点露出下面的收取营养液
    var startTick = new Date().getTime();
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
                    var clickRet = click(friendItem.bounds().centerX(), friendItem.bounds().centerY());
                    log("点击 " + nickname + ": " + clickRet + ", 并等待 你收取Ta 出现, 15s超时");
                    var getTaNutrientTips = common.waitForText("text", "你收取Ta", true, 15);
                    if (getTaNutrientTips == null) {
                        return;
                    }

                    var nutrient = textMatches(/x\d+/).visibleToUser(true).findOne(5000);
                    if (nutrient == null) {
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
}

bean.doRoutine = function () {
    toastLog("bean.doRoutine");
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

    doGetNutrientTasks(growthTips);

    getMyNutrients();

    getFriendsNutrients();

    commonAction.backToAppMainPage();
}

module.exports = bean;