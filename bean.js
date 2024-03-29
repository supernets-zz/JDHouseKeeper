var bean = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const todayBeanTag = "获取当日京豆数";
const signInTag = "签到领京豆";
const plantBeanTag = "签到领京豆.种豆得豆";
const lotteryTag = "签到领京豆.抽京豆";
const shakeTag = "签到领京豆.摇京豆";

const moreTasksBtn = "./Bean/moreTasksBtn.jpg";
const pickupMetchantBtn = "./Bean/pickupMerchantBtn.jpg";
const nutrientBottle = "./Bean/nutrientBottle.jpg";

bean.dailyJobs = [];
bean.dailyJobs.push(todayBeanTag);
bean.dailyJobs.push(signInTag);

gotoBean = function () {
    var beanBtn = text("领京豆").packageName(common.destPackageName).findOne(30000);
    if (beanBtn == null) {
        toastLog("领京豆 not exist");
        return null;
    }

    var clickRet = beanBtn.parent().click();
    if (!clickRet) {
        toastLog("点击 领京豆: " + clickRet);
        return null;
    }

    log("点击 领京豆: " + clickRet + ", 并等待 规则 出现, 15s超时");
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

        sleep(5000);
        //等到商品列表出现
        var merchantList = common.waitForText("text", "已获得", true, 5);
        if (merchantList == null) {
            commonAction.backToAppMainPage();
            return;
        }
        
        merchantList = packageName(common.destPackageName).className("android.view.View").depth(26).drawingOrder(0).indexInParent(1).find();

        var pickupMerchantBtnPt = common.findImageInRegion(pickupMetchantBtn, 0, device.height / 2, device.width / 2, device.height / 2);
        if (pickupMerchantBtnPt == null) {
            commonAction.backToAppMainPage();
            return;
        }

        // //选择左侧的商品点击
        // log("商品数: " + merchantList.length);
        // var validMerchant = packageName(common.destPackageName).className("android.view.View").depth(26).drawingOrder(0).indexInParent(1).visibleToUser(true).find();
        // //记录在屏幕内第一个商品的坐标
        // var clickx = validMerchant[0].bounds().centerX();
        // var clicky = validMerchant[0].bounds().centerY() + validMerchant[0].bounds().height() * 2;
        for (var ll = 0; ll < 6; ll++) {
            // toastLog("点击左侧商品: " + click(clickx, clicky));
            toastLog("点击左侧商品: " + click(pickupMerchantBtnPt.x, pickupMerchantBtnPt.y));
            sleep(3000);
            var noProduct = text("所选地区无货").findOne(1000);
            if (noProduct != null) {
                back();
                sleep(3000);
            }
            for (var j = 0; j < 2; j++) {
                var btnLike = text("收藏").visibleToUser(true).findOne(1000);
                if (btnLike != null) {
                    log("取消收藏: " + click(btnLike.bounds().centerX(), btnLike.bounds().centerY()));
                    sleep(3000);
                } else {
                    log("上划屏幕找 收藏: " + swipe(device.width / 2, Math.floor(device.height * 7 / 8), device.width / 2, Math.floor(device.height / 8), 500));
                    sleep(3000);
                }
            }
            back();
            sleep(3000);                    

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
    var actionBar = gotoBean();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var upgradeEarnBean = actionBar.child(actionBar.childCount() - 2);
    var clickRet = click(upgradeEarnBean.bounds().centerX(), upgradeEarnBean.bounds().centerY());
    if (!clickRet) {
        toastLog("点击 升级赚京豆: " + clickRet);
        commonAction.backToAppMainPage();
        return;
    }

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
            // captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            break;
        }

        totalTasks.forEach(function (tv) {
            var taskItem = tv.parent();
            var title = taskItem.child(1).text();
            var tips = taskItem.child(2).text();
            var lastNode = taskItem.child(taskItem.childCount() - 1);
            var btn = null;
            for (var i = 0; i < lastNode.childCount(); i++) {
                if (lastNode.child(i).className() == "android.widget.TextView") {
                    btn = lastNode.child(i);
                }
            }
            if (btn != null) {
                if (btn.text() != "" && btn.text() != "已完成" && title.indexOf("双签领豆") == -1 && !/升级.*会员.*/.test(title)) {
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
            }
        });

        var uncompleteTaskNum = oneWalkTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
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
    // var moreTaskFrame = growthTips.parent().parent().parent().parent();
    // var moreTasksBtn = moreTaskFrame.child(moreTaskFrame.childCount() - 2);

    // var moreTaskTips = text("更多任务").visibleToUser(true).findOne(1000);
    // if (moreTaskTips == null) {
    //     toastLog("no 更多任务");
    //     return;
    // }
    
    // var moreTasksBtn = moreTaskTips.parent();
    // var clickRet = click(moreTasksBtn.bounds().centerX(), moreTasksBtn.bounds().centerY());
    // if (!clickRet) {
    //     toastLog("点击 更多任务: " + clickRet);
    //     return;
    // }

    var moreTasksBtnPt = common.findImageInRegion(moreTasksBtn, device.width * 3 / 4, device.height * 3 / 4, device.width / 4, device.height / 4);
    if (moreTasksBtnPt == null) {
        toastLog("no 更多任务");
        return;
    }

    var clickRet = click(moreTasksBtnPt.x, moreTasksBtnPt.y);
    if (!clickRet) {
        toastLog("点击 更多任务: " + clickRet);
        return;
    }

    sleep(5000);
    log("点击 更多任务: " + clickRet + ", 并等待 已获得 出现, 15s超时");
    var progress = common.waitForText("textContains", "已获得", true, 15);
    if (progress == null) {
        toastLog("timeout");
        return;
    }

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
            totalTasks = packageName(common.destPackageName).textContains("已获得").find();
            for (var i = 0; i < totalTasks.length; i++) {
                var taskItem = totalTasks[i].parent().parent().parent().parent().parent().parent().parent();
                var btn = taskItem.child(0).child(0).child(1);
                if (btn.bounds().height() > 50) {
                    validTaskNames.push(taskItem.child(0).child(0).child(0).child(1).child(0).text());
                }
            }
            toastLog("任务数: " + totalTasks.length + ", 可见: " + validTaskNames.length + ", " + validTaskNames);
            if (validTaskNames.length == 0) {
                sleep(1000);
            }
        }

        if (totalTasks.length == 0) {
            // captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            break;
        }

        totalTasks.forEach(function (tv) {
            var taskItem = tv.parent().parent().parent().parent().parent().parent().parent();
            var title = taskItem.child(0).child(0).child(0).child(1).child(0).text();
            var tips = taskItem.child(0).child(0).child(0).child(1).child(2).text();
            var btn = taskItem.child(0).child(0).child(1);
            if (btn.text() != "" && 
                btn.text() != "去邀请" && 
                btn.text() != "去签到" && 
                btn.text() != "已完成" &&
                title != "免费水果" &&
                title != "万人团下单") {
                var obj = {};
                obj.Title = title;
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
                log("未完成任务" + (oneWalkTaskList.length + subscribeTaskList.length + walkShopTaskList.length + pickupMerchantTaskList.length) + ": " + obj.Title + ", " + obj.BtnName + ", (" + obj.Button.bounds().centerX() + ", " + obj.Button.bounds().centerY() + "), " + tips);
            } else {
                log("跳过任务: " + title + ", " + btn.text() + ", (" + btn.bounds().centerX() + ", " + btn.bounds().centerY() + "), " + tips);
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

    toastLog("关闭营养液任务列表: " + click(growthTips.bounds().centerX(), growthTips.bounds().centerY()));
}

getMyNutrients = function () {
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var newNextGetNutrientCheckTimestamp = new Date(tomorrow.Format("yyyy/MM/dd") + " 07:00:00").getTime();
    var startTick = new Date().getTime();
    for (;;) {
        var nutrientBottlePt = common.findImageInRegion(nutrientBottle, 0, 0, device.width, device.height / 2);
        if (nutrientBottlePt == null) {
            toastLog("no 营养液");
            break;
        }

        toastLog("点击 营养液(" + nutrientBottlePt.x + ", " + nutrientBottlePt.y + "): " + click(nutrientBottlePt.x, nutrientBottlePt.y));
        sleep(1000);

        if (new Date().getTime() - startTick > 10 * 1000) {
            break;
        }
    }

    common.safeSet(common.nextGetNutrientTimestampTag, newNextGetNutrientCheckTimestamp);
    log(common.nextGetNutrientTimestampTag + " 设置为: " + common.timestampToTime(newNextGetNutrientCheckTimestamp) + ", " + newNextGetNutrientCheckTimestamp);
}

getFriendsNutrients = function () {
    var curDate = new Date().Format("yyyy/MM/dd");
    var morningBeginTime = new Date(curDate + " 07:00:00").getTime();
    if (new Date().getTime() < morningBeginTime) {
        return;
    }

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

    var frame = nutrientTips.parent().parent();
    var hScrollView = frame.child(1);
    for (var i = 0; i < 3; i++) {
        var tips = textMatches(/喊TA回来|可能认识的人/).visibleToUser(true).find();
        for (var j = 0; j < tips.length; j++) {
            var friendItem = tips[j].parent();
            var nickname = friendItem.child(friendItem.childCount() - 3).text();
            //不能收取的childCount()==3
            if (friendItem.childCount() == 4) {
                var nutrientNum = parseInt(friendItem.child(3).child(1).text());
                if (nutrientNum > 1) {
                    var clickRet = click(friendItem.bounds().centerX(), friendItem.bounds().centerY());
                    log("点击 " + nickname + "x" + nutrientNum + ": " + clickRet + ", 并等待 你收取Ta 出现, 15s超时");
                    var getTaNutrientTips = common.waitForText("textContains", "你收取Ta", true, 15);
                    if (getTaNutrientTips == null) {
                        toastLog("no 你收取Ta");
                        return;
                    }

                    var nutrientBottlePt = common.findImageInRegion(nutrientBottle, 0, 0, device.width, device.height / 2);
                    if (nutrientBottlePt == null) {
                        toastLog("no 营养液");
                        break;
                    }

                    toastLog("点击 营养液(" + nutrientBottlePt.x + ", " + nutrientBottlePt.y + "): " + click(nutrientBottlePt.x, nutrientBottlePt.y));
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
    if (!clickRet) {
        toastLog("点击 种豆得豆: " + clickRet);
        commonAction.backToAppMainPage();
        return;
    }

    log("点击 种豆得豆: " + clickRet + ", 并等待 豆苗成长值 出现, 30s超时");
    var growthTips = common.waitForText("text", "豆苗成长值", true, 30);
    if (growthTips == null) {
        commonAction.backToAppMainPage();
        return;
    }

    getMyNutrients();

    doGetNutrientTasks(growthTips);

    getFriendsNutrients();

    commonAction.backToAppMainPage();
}

bean.calcBeanIncome = function () {
    log("bean.calcBeanIncome");
    // 我的
    var nowDate = new Date().Format("yyyy-MM-dd");
    var beanNum = common.safeGet(nowDate + ":" + todayBeanTag);
    if (beanNum != null) {
        log(todayBeanTag + " " + nowDate + ": " + beanNum);
        return;
    }

    toast("bean.calcBeanIncome");
    var mineTab = text("我的").packageName(common.destPackageName).findOne(30000);
    if (mineTab == null){
        toastLog("我的 tab not exist");
        commonAction.backToAppMainPage();
        return;
    }

    var clickRet = mineTab.parent().child(2).click();
    if (!clickRet) {
        toastLog("点击 我的: " + clickRet);
        commonAction.backToAppMainPage();
        return;
    }

    log("点击 我的: " + clickRet + ", 并等待 京豆 出现, 15s超时");
    var myBeans = common.waitForText("text", "京豆", true, 15);
    if (myBeans == null) {
        commonAction.backToAppMainPage();
        return;
    }

    common.safeSet(nowDate + ":" + todayBeanTag, myBeans.parent().child(0).text());
    toastLog(nowDate + ":" + todayBeanTag + ": " + myBeans.parent().child(0).text());

    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var yesterdayBeanNum = common.safeGet(yesterday.Format("yyyy-MM-dd") + ":" + todayBeanTag);
    log(yesterday.Format("yyyy-MM-dd") + ":" + todayBeanTag + ": " + yesterdayBeanNum);
    if (yesterdayBeanNum != null) {
        log(yesterday.Format("yyyy-MM-dd") + " 京豆收益: " + (parseInt(myBeans.parent().child(0).text()) - parseInt(yesterdayBeanNum)));
    }

    commonAction.backToAppMainPage();
}

bean.isSignInDone = function () {
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        return true;
    }

    return false;
}

bean.doSignIn = function () {
    log("bean.doSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    // common.safeSet(nowDate + ":" + signInTag, null);
    // common.safeSet(nowDate + ":" + lotteryTag, null);
    // common.safeSet(nowDate + ":" + shakeTag, null);
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        log(signInTag + " 已做: " + done);
        return;
    }

    toast("bean.doSignIn");
    var actionBar = gotoBean();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    sleep(5000);
    var clickRet = false;
    var signBtn = text("签到领京豆").visibleToUser(true).findOne(1000);
    if (signBtn != null) {
        clickRet = click(signBtn.bounds().centerX(), signBtn.bounds().centerY());
        log("点击 签到领京豆: " + clickRet);
        sleep(10000);
        back();
        sleep(3000);
    }

    actionBar = packageName(common.destPackageName).className("android.widget.HorizontalScrollView").findOne(1000);
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    actionBar = actionBar.child(0);

    var isShakeDone = common.safeGet(nowDate + ":" + shakeTag);
    log(nowDate + ":" + shakeTag + ": " + isShakeDone);
    if (isShakeDone == null) {
        var shakeBtn = actionBar.child(2);
        clickRet = click(shakeBtn.bounds().centerX(), shakeBtn.bounds().centerY());
        log("点击 摇京豆: " + clickRet + ", 并等待 /立即签到 领京豆|领取摇盒子次数|点击有惊喜/ 出现，15s超时");

        var shakeBoxBtn = common.waitForTextMatches(/立即签到 领京豆|领取摇盒子次数|点击有惊喜/, true, 15);
        if (shakeBoxBtn == null) {
            commonAction.backToAppMainPage();
            return;
        }

        clickRet = click(shakeBoxBtn.bounds().centerX(), shakeBoxBtn.bounds().centerY());
        log("点击 /立即签到 领京豆|领取摇盒子次数|点击有惊喜/: " + clickRet + ", 并等待10s");

        sleep(10000);
        back();
        sleep(3000);
        common.safeSet(nowDate + ":" + shakeTag, "done");
        toastLog("完成 " + shakeTag);
    }

    var isLotteryDone = common.safeGet(nowDate + ":" + lotteryTag);
    log(nowDate + ":" + lotteryTag + ": " + isLotteryDone);
    if (isLotteryDone == null) {
        var lotteryBtn = actionBar.child(4);
        clickRet = click(lotteryBtn.bounds().centerX(), lotteryBtn.bounds().centerY());
        log("点击 抽京豆: " + clickRet + ", 并等待 查看规则 出现，15s超时");

        var ruleTips = common.waitForText("text", "查看规则", true, 15);
        if (ruleTips == null) {
            commonAction.backToAppMainPage();
            return;
        }

        // var rotary = ruleTips.parent().parent().child(0).child(0).child(0);
        // clickRet = click(rotary.bounds().centerX(), rotary.bounds().centerY());
        // log("点击 开始抽奖: " + clickRet + ", 并等待10s");
        var rotary = ruleTips.parent().parent().child(0).child(1);
        clickRet = rotary.click();
        log("点击 开始抽奖: " + clickRet + ", 并等待10s");

        sleep(10000);
        back();
        sleep(3000);
        common.safeSet(nowDate + ":" + lotteryTag, "done");
        toastLog("完成 " + lotteryTag);
    }

    common.safeSet(nowDate + ":" + signInTag, "done");
    toastLog("完成 " + signInTag);

    commonAction.backToAppMainPage();
}

module.exports = bean;