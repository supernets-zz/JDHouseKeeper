
var happinessStore = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const dailySignInTag = "幸福小店每日签到";
const dailyTasksTag = "幸福小店每日任务";

const cashier = "./HappinessStore/cashier.jpg";
const signInCalendarBtn = "./HappinessStore/signInCalendarBtn.jpg";
const signInCalendarTips = "./HappinessStore/signInCalendarTips.jpg";
const taskBtn = "./HappinessStore/taskBtn.jpg";
const todoBtn = "./HappinessStore/todoBtn.jpg";
const dailyPresentBtn = "./HappinessStore/dailyPresentBtn.jpg";
const dailyPresentTips = "./HappinessStore/dailyPresentTips.jpg";
const dailyTasksTips = "./HappinessStore/dailyTasksTips.jpg";
const dailyTasksCloseBtn = "./HappinessStore/dailyTasksCloseBtn.jpg";
const subscribeAllBtn = "./HappinessStore/subscribeAllBtn.jpg";
const addAllToCartBtn = "./HappinessStore/addAllToCartBtn.jpg";
const activePresentBtn = "./HappinessStore/activePresentBtn.jpg";
const beanCouponBtn = "./HappinessStore/beanCouponBtn.jpg";
const dailyTasksDoneBtn = "./HappinessStore/dailyTasksDoneBtn.jpg";

const blessingBagPt = [
    [60, 385], [275, 355], [565, 355],
    [150, 555], [125, 900], [575, 920], 
    [120, 1085], [570, 1085]
];

gotoHappinessStore = function () {
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://3.cn/1xtE4-IY?_ts=1657247796129&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI","M_sourceFrom":"mxz","msf_type":"auto"}'
    })

    var startTick = new Date().getTime();
    for (;;) {
        var cashierPt = common.findImageInRegion(cashier, device.width / 2, 0, device.width / 2, device.height / 2);
        var signInCalendarTipsPt = common.findImageInRegion(signInCalendarTips, 0, device.height / 4, device.width, device.height / 2);

        if (cashierPt != null) {
            break;
        }

        if (signInCalendarTipsPt != null) {
            var signDayPts = [];
            signDayPts.push([signInCalendarTipsPt.x - 168 * 2, signInCalendarTipsPt.y - 174 * 2]);
            signDayPts.push([signInCalendarTipsPt.x - 168 * 1, signInCalendarTipsPt.y - 174 * 2]);
            signDayPts.push([signInCalendarTipsPt.x - 168 * 0, signInCalendarTipsPt.y - 174 * 2]);
            signDayPts.push([signInCalendarTipsPt.x - 168 * 2, signInCalendarTipsPt.y - 174 * 1]);
            signDayPts.push([signInCalendarTipsPt.x - 168 * 1, signInCalendarTipsPt.y - 174 * 1]);
            signDayPts.push([signInCalendarTipsPt.x - 168 * 0, signInCalendarTipsPt.y - 174 * 1]);
            signDayPts.push([signInCalendarTipsPt.x - 168 * 1.5, signInCalendarTipsPt.y - 174 * 0]);
            for (var i = 0; i < signDayPts.length; i++) {
                var clickRet = click(signDayPts[i][0], signDayPts[i][1]);
                log("点击 签到(" + signDayPts[i][0] + ", " + signDayPts[i][1] + "): " + clickRet);
                if (clickRet == false) {
                    return false;
                }
            }

            common.safeSet(nowDate + ":" + dailySignInTag, "done");
            toastLog("完成 " + dailySignInTag);
        }

        sleep(2000);
        if (new Date().getTime() - startTick > 30 * 1000) {
            toastLog("游戏加载超时");
            return false;
        }
    }

    return true;
}

backToDailyTaskList = function () {
    var startTick = new Date().getTime();
    for (;;) {
        var dailyTaskTipsPt = common.findImageInRegion(dailyTasksTips, 0, 0, device.width / 2, device.height / 2);
        if (dailyTaskTipsPt != null) {
            break;
        }

        var ret = back();
        log("back(): " + ret);
        sleep(3000);

        if (new Date().getTime() - startTick > 15 * 1000) {
            log("backToDailyTaskList timeout");
            break;
        }
    }
}

doDailySignIn = function () {
    log("happinessStore.doDailySignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + dailySignInTag);
    if (done != null) {
        log(dailySignInTag + " 已做: " + done);
        return;
    }

    toast("happinessStore.doDailySignIn");
    var signInCalendarBtnPt = common.findImageInRegion(signInCalendarBtn, 0, device.height * 3 / 4, device.width, device.height / 4);
    if (signInCalendarBtnPt == null) {
        return;
    }

    var clickRet = click(signInCalendarBtnPt.x, signInCalendarBtnPt.y);
    log("点击 签到(" + signInCalendarBtnPt.x + ", " + signInCalendarBtnPt.y + "): " + clickRet);
    if (clickRet == false) {
        return;
    }

    sleep(3000);
    var signInCalendarTipsPt = common.findImageInRegion(signInCalendarTips, 0, device.height / 4, device.width, device.height / 2);
    if (signInCalendarTipsPt != null) {
        var signDayPts = [];
        signDayPts.push([signInCalendarTipsPt.x - 168 * 2, signInCalendarTipsPt.y - 174 * 2]);
        signDayPts.push([signInCalendarTipsPt.x - 168 * 1, signInCalendarTipsPt.y - 174 * 2]);
        signDayPts.push([signInCalendarTipsPt.x - 168 * 0, signInCalendarTipsPt.y - 174 * 2]);
        signDayPts.push([signInCalendarTipsPt.x - 168 * 2, signInCalendarTipsPt.y - 174 * 1]);
        signDayPts.push([signInCalendarTipsPt.x - 168 * 1, signInCalendarTipsPt.y - 174 * 1]);
        signDayPts.push([signInCalendarTipsPt.x - 168 * 0, signInCalendarTipsPt.y - 174 * 1]);
        signDayPts.push([signInCalendarTipsPt.x - 168 * 1.5, signInCalendarTipsPt.y - 174 * 0]);
        for (var i = 0; i < signDayPts.length; i++) {
            var clickRet = click(signDayPts[i][0], signDayPts[i][1]);
            log("点击 签到(" + signDayPts[i][0] + ", " + signDayPts[i][1] + "): " + clickRet);
            if (clickRet == false) {
                return false;
            }
        }

        sleep(3000);
        clickRet = click(device.width / 2, device.height * 3 / 4);
        log("点击 关闭(" + device.width / 2 + ", " + device.height * 3 / 4 + "): " + clickRet);
        if (clickRet == false) {
            return;
        }

        common.safeSet(nowDate + ":" + dailySignInTag, "done");
        toastLog("完成 " + dailySignInTag);
    }

    back();
    sleep(3000);
}

getDailyPresent = function () {
    var dailyPresentBtnPt = common.findImageInRegion(dailyPresentBtn, device.width / 2, device.height / 4, device.width / 2, device.height / 2);
    if (dailyPresentBtnPt == null) {
        return;
    }

    var clickRet = click(dailyPresentBtnPt.x, dailyPresentBtnPt.y);
    log("点击 每日礼(" + dailyPresentBtnPt.x + ", " + dailyPresentBtnPt.y + "): " + clickRet);
    if (clickRet == false) {
        return;
    }

    sleep(3000);
    var dailyPresentTipsPt = common.findImageInRegion(dailyPresentTips, 0, device.height / 2, device.width, device.height / 4);
    if (dailyPresentTipsPt == null) {
        return;
    }

    clickRet = click(dailyPresentTipsPt.x, dailyPresentTipsPt.y + 8.3 * 34);
    log("点击 领取(" + dailyPresentTipsPt.x + ", " + dailyPresentTipsPt.y + "): " + clickRet);
    if (clickRet == false) {
        return;
    }

    sleep(3000);
    clickRet = click(device.width / 2, device.height * 3 / 4);
    log("点击 关闭(" + device.width / 2 + ", " + device.height * 3 / 4 + "): " + clickRet);
    if (clickRet == false) {
        return;
    }

    sleep(3000);
}

doDailyTasks = function () {
    log("happinessStore.doDailyTasks");
    var nowDate = new Date().Format("yyyy-MM-dd");
    // common.safeSet(nowDate + ":" + dailyTasksTag, null);
    var done = common.safeGet(nowDate + ":" + dailyTasksTag);
    if (done != null) {
        log(dailyTasksTag + " 已做: " + done);
        return;
    }

    toast("happinessStore.doDailyTasks");
    var dailyTaskBtnPt = common.findImageInRegion(taskBtn, 0, 0, device.width, device.height / 4);
    if (dailyTaskBtnPt == null) {
        return;
    }

    var clickRet = click(dailyTaskBtnPt.x, dailyTaskBtnPt.y);
    log("点击 任务(" + dailyTaskBtnPt.x + ", " + dailyTaskBtnPt.y + "): " + clickRet);
    if (clickRet == false) {
        return;
    }

    var dailyTasksCloseBtnPt = common.waitForImageInRegion(dailyTasksCloseBtn, device.width * 3 / 4, 0, device.width / 4, device.height / 4, 5);
    if (dailyTasksCloseBtnPt == null) {
        toastLog("no 关闭按钮")
        return;
    }

    var subscribeAllCount = 0;
    for (;;) {
        var todoBtnPt = common.findImageInRegion(todoBtn, device.width / 2, device.height / 4, device.width / 2, device.height * 3 / 4);
        if (todoBtnPt == null) {
            toastLog("no 立即完成")
            break;
        }

        clickRet = click(todoBtnPt.x, todoBtnPt.y);
        if (clickRet == false) {
            break;
        }

        toastLog("点击 立即完成(" + todoBtnPt.x + ", " + todoBtnPt.y + "): " + clickRet);

        sleep(5000);
        var subscribeAllBtnPt = common.findImageInRegion(subscribeAllBtn, 0, device.height * 3 / 4, device.width, device.height / 4);
        if (subscribeAllBtnPt != null) {
            clickRet = click(subscribeAllBtnPt.x, subscribeAllBtnPt.y);
            log("点击 一键关注(" + subscribeAllBtnPt.x + ", " + subscribeAllBtnPt.y + "): " + clickRet);
            if (clickRet == false) {
                break;
            }
            subscribeAllCount++;
            sleep(2000);
        }

        var addAllToCartBtnPt = common.findImageInRegion(addAllToCartBtn, 0, device.height * 3 / 4, device.width, device.height / 4);
        if (addAllToCartBtnPt != null) {
            clickRet = click(addAllToCartBtnPt.x, addAllToCartBtnPt.y);
            log("点击 一键加入购物车(" + addAllToCartBtnPt.x + ", " + addAllToCartBtnPt.y + "): " + clickRet);
            if (clickRet == false) {
                break;
            }
            sleep(2000);
        }

        backToDailyTaskList();

        if (subscribeAllCount < 2) {
            clickRet = click(dailyTasksCloseBtnPt.x - 97, dailyTasksCloseBtnPt.y + 62 * 5);
        } else {
            clickRet = click(dailyTasksCloseBtnPt.x - 97, dailyTasksCloseBtnPt.y + 62 * 8);
        }

        toastLog("点击 领取(" + (dailyTasksCloseBtnPt.x - 97) + ", " + (dailyTasksCloseBtnPt.y + 62 * 5) + "): " + clickRet);
        if (clickRet == false) {
            break;
        }
        sleep(5000);
    }

    for (var i = 0; i < 4; i++) {
        var activePresentBtnPt = common.findImageInRegion(activePresentBtn, 0, 0, device.width, device.height / 2);
        if (activePresentBtnPt != null) {
            clickRet = click(activePresentBtnPt.x, activePresentBtnPt.y);
            toastLog("点击 活跃礼" + (i+1) + "(" + activePresentBtnPt.x + ", " + activePresentBtnPt.y + "): " + clickRet);
            sleep(3000);
            clickRet = click(device.width / 2, device.height * 3 / 4);
            toastLog("点击 关闭(" + device.width / 2 + ", " + device.height * 3 / 4 + "): " + clickRet);
            sleep(3000);
        }
        sleep(1000);
    }

    var beanCouponBtnPt = common.findImageInRegion(beanCouponBtn, 0, 0, device.width, device.height / 2);
    if (beanCouponBtnPt != null) {
        clickRet = click(beanCouponBtnPt.x, beanCouponBtnPt.y);
        toastLog("点击 兑换券(" + beanCouponBtnPt.x + ", " + beanCouponBtnPt.y + "): " + clickRet);
        sleep(3000);
        clickRet = click(device.width / 2, device.height * 3 / 4);
        toastLog("点击 关闭(" + device.width / 2 + ", " + device.height * 3 / 4 + "): " + clickRet);
        sleep(3000);
    }

    var dailyTasksDoneBtnPt = common.findImageInRegion(dailyTasksDoneBtn, 0, 0, device.width, device.height / 2);
    if (dailyTasksDoneBtnPt != null) {
        common.safeSet(nowDate + ":" + dailyTasksTag, "done");
        toastLog("完成 " + dailyTasksTag);
    }

    back();
    sleep(3000);
}

doCollectBlessingBags = function () {
    log("happinessStore.doCollectBlessingBags");

    var cashierPt = common.waitForImageInRegion(cashier, device.width / 2, 0, device.width / 2, device.height / 2);
    var clickRet = false;
    var startTick = new Date().getTime();
    for (;;) {
        for (var i = 0; i < blessingBagPt.length; i++) {
            clickRet = click(blessingBagPt[i][0], blessingBagPt[i][1]);
            log("点击 福袋" + (i+1) + "(" + blessingBagPt[i][0] + ", " + blessingBagPt[i][1] + "): " + clickRet);
            if (clickRet == false) {
                break;
            }

            clickRet = click(cashierPt.x, cashierPt.y + 65);
            toastLog("点击 收银(" + cashierPt.x + ", " + (cashierPt.y + 65) + "): " + clickRet);
            if (clickRet == false) {
                break;
            }
    
            sleep(2000);
        }

        if (new Date().getTime() - startTick > 60 * 1000) {
            break;
        }
    }
}

happinessStore.doRoutine = function () {
    toastLog("happinessStore.doRoutine");
    if (!gotoHappinessStore()) {
        commonAction.backToAppMainPage();
        return;
    }

    doDailySignIn();

    getDailyPresent();

    doDailyTasks();

    doCollectBlessingBags();

    commonAction.backToAppMainPage();
}

module.exports = happinessStore;