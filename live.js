var live = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const liveSignInTag = "京东直播每日签到";

const liveEntryBtn = "./Live/liveEntryBtn.jpg"
const getBeanEntryBtn = "./Live/getBeanEntryBtn.jpg"
const getBeanBtn = "./Live/getBeanBtn.jpg";

live.dailyJobs = [];
live.dailyJobs.push(liveSignInTag);

gotoLive = function () {
    var liveEntryBtnPt = common.findImageInRegion(liveEntryBtn, device.width / 2, 0, device.width / 2, device.height / 2);
    if (liveEntryBtnPt == null) {
        toastLog("no 京东直播");
        return null;
    }

    var clickRet = click(liveEntryBtnPt.x, liveEntryBtnPt.y);
    log("点击 京东直播: " + clickRet);
    if (clickRet == false) {
        return null;
    }

    var getBeanEntryBtnPt = common.waitForImageInRegion(getBeanEntryBtn, device.width * 3 / 4, 0, device.width / 4, device.height / 8, 15);
    if (getBeanEntryBtnPt == null) {
        toastLog("no 领京豆");
        return null;
    }

    clickRet = click(getBeanEntryBtnPt.x, getBeanEntryBtnPt.y);
    log("点击 领京豆: " + clickRet);
    if (clickRet == false) {
        return null;
    }

    var signTips = common.waitForText("text", "连续签到7天得奖励", true, 15);
    if (signTips == null) {
        toastLog("no 连续签到7天得奖励");
        return null;
    }

    var signFrame = signTips.parent();
    var signInBtn = signFrame.child(signFrame.childCount() - 1);
    return signInBtn;
}

live.doSignIn = function () {
    log("live.doSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    // common.safeSet(nowDate + ":" + liveSignInTag, null);
    // common.safeSet(nowDate + ":" + liveSignInTag, "done");
    var done = common.safeGet(nowDate + ":" + liveSignInTag);
    if (done != null) {
        log(liveSignInTag + " 已做: " + done);
        return;
    }

    toast("live.doSignIn");
    var signInBtn = gotoLive();
    if (signInBtn == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var clickRet = false;
    if (signInBtn.text() != "已签到") {
        clickRet = signInBtn.click();
        log("点击 " + signInBtn.text() + ": " + clickRet);
    }

    for (;;) {
        var watchBtn = text("去看看").findOne(1000);
        if (watchBtn == null) {
            break;
        }

        clickRet = watchBtn.click();
        log("点击 去看看: " + clickRet);
        if (clickRet == false) {
            break;
        }

        var getBeanBtnPt = common.waitForImageInRegion(getBeanBtn, device.width / 2, 0, device.width / 2, device.height, 90);
        if (getBeanBtnPt == null) {
            break;
        }

        clickRet = click(getBeanBtnPt.x, getBeanBtnPt.y);
        log("点击 领京豆: " + clickRet);

        var getBean = common.waitForText("text", "抽取京豆", false, 15);
        if (getBean == null) {
            break;
        }

        clickRet = getBean.click();
        log("点击 抽取京豆: " + clickRet);
        if (clickRet == false) {
            break;
        }

        sleep(3000);
        var confirmBtn = text("确认").findOne(1000);
        if (confirmBtn == null) {
            break;
        }

        clickRet = confirmBtn.click();
        log("点击 确认: " + clickRet);
        if (clickRet == false) {
            break;
        }

        sleep(5000);
    }

    common.safeSet(nowDate + ":" + liveSignInTag, "done");
    toastLog("完成 " + liveSignInTag);

    commonAction.backToAppMainPage();
}

module.exports = live;