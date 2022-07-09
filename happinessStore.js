
var happinessStore = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const dailyTasksTag = "幸福小店每日任务";

const cashier = "./HappinessStore/cashier.jpg";
const signInBtn = "./HappinessStore/signInBtn.jpg";
const taskBtn = "./HappinessStore/taskBtn.jpg";
const todoBtn = "./HappinessStore/todoBtn.jpg";
const doneBtn = "./HappinessStore/doneBtn.jpg";
const dailyTasksTips = "./HappinessStore/dailyTasksTips.jpg";
const subscribeAllBtn = "./HappinessStore/subscribeAllBtn.jpg";

gotoHappinessStore = function () {
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://3.cn/1xtE4-IY?_ts=1657247796129&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI","M_sourceFrom":"mxz","msf_type":"auto"}'
    })

    var startTick = new Date().getTime();
    for (;;) {
        var cashierPt = common.findImageInRegion(cashier, device.width / 2, 0, device.width / 2, device.height / 2);
        var signInPt = common.findImageInRegion(signInBtn, 0, device.height / 4, device.width, device.height / 2);

        if (cashierPt != null) {
            break;
        }

        if (signInPt != null) {
            var clickRet = click(signInPt.x, signInPt.y - 66);
            log("点击 签到(" + signInPt.x + ", " + (signInPt.y - 66) + "): " + clickRet);
            if (clickRet) {
                break;
            } else {
                return false;
            }
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

doDailyTasks = function () {
    log("happinessStore.doDailyTasks");
    var nowDate = new Date().Format("yyyy-MM-dd");
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

    sleep(3000);
    for (;;) {
        var doneBtnPt = common.findImageInRegion(doneBtn, device.width / 2, device.height / 4, device.width / 2, device.height * 3 / 4);
        if (doneBtnPt != null) {
            clickRet = click(doneBtnPt.x, doneBtnPt.y);
            log("点击 领取(" + doneBtnPt.x + ", " + doneBtnPt.y + "): " + clickRet);
            if (clickRet == false) {
                break;
            }
            sleep(3000);
            continue;
        }

        var todoBtnPt = common.findImageInRegion(todoBtn, device.width / 2, device.height / 4, device.width / 2, device.height * 3 / 4);
        if (todoBtnPt == null) {
            break;
        }

        clickRet = click(todoBtnPt.x, todoBtnPt.y);
        log("点击 立即完成(" + todoBtnPt.x + ", " + todoBtnPt.y + "): " + clickRet);
        if (clickRet == false) {
            break;
        }

        sleep(5000);
        var subscribeAllBtnPt = common.findImageInRegion(subscribeAllBtn, 0, device.height * 3 / 4, device.width, device.height / 4);
        if (subscribeAllBtnPt != null) {
            clickRet = click(subscribeAllBtnPt.x, subscribeAllBtnPt.y);
            log("点击 一键关注(" + subscribeAllBtnPt.x + ", " + subscribeAllBtnPt.y + "): " + clickRet);
            if (clickRet == false) {
                break;
            }
        }

        backToDailyTaskList();
    }
}

happinessStore.doRoutine = function () {
    toastLog("happinessStore.doRoutine");
    if (!gotoHappinessStore()) {
        commonAction.backToAppMainPage();
        return;
    }

    doDailyTasks();
    commonAction.backToAppMainPage();
}

module.exports = happinessStore;