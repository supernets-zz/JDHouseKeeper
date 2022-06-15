var coupon99 = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const signInTag = "券后9.9每日签到";

coupon99.dailyJobs = [];
coupon99.dailyJobs.push(signInTag);

coupon99.doSignIn = function () {
    log("coupon99.doSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        log(signInTag + " 已做: " + done);
        return;
    }

    toast("coupon99.doSignIn");

    // 券后9.9-> 领券-> 立即签到，每日一次
    var coupon99Btn = text("券后9.9").packageName(common.destPackageName).findOne(30000);
    if (coupon99Btn == null){
        toastLog("券后9.9 tab not exist");
        commonAction.backToAppMainPage();
        return;
    }

    var clickRet = coupon99Btn.parent().click();
    log("点击 券后9.9: " + clickRet + ", 并等待 天天领奖 出现, 15s超时");
    if (!clickRet) {
        commonAction.backToAppMainPage();
        return;
    }

    var getAwardTips = common.waitForText("text", "天天领奖", true, 15);
    if (getAwardTips == null) {
        commonAction.backToAppMainPage();
        return;
    }

    //领券按钮
    var getCouponBtn = packageName(common.destPackageName).className("android.view.View").desc("领券").findOne(1000);
    if (getCouponBtn == null) {
        commonAction.backToAppMainPage();
        return;
    }

    clickRet = getCouponBtn.parent().parent().click();
    log("点击 领券: " + clickRet + ", 并等待 可兑 出现, 15s超时");

    var canExchangeTips = common.waitForTextMatches("/可兑.*|签到领奖励/", true, 15);
    if (canExchangeTips == null) {
        commonAction.backToAppMainPage();
        return;
    }

    if (canExchangeTips.text() == "签到领奖励") {
        clickRet = canExchangeTips.parent().click();
        log("点击 签到领奖励: " + clickRet);
        common.safeSet(nowDate + ":" + signInTag, "done");
        toastLog("完成 " + signInTag);
    } else {
        var signBtn = canExchangeTips.parent().parent().parent().child(1).child(0);
        if (/\d+点点券待领取/.test(signBtn.text())) {
            common.safeSet(nowDate + ":" + signInTag, "done");
            toastLog("完成 " + signInTag);
        } else if (signBtn.text() == "立即翻牌") {
            clickRet = signBtn.parent().click();
            log("点击 立即翻牌: " + clickRet);
            common.safeSet(nowDate + ":" + signInTag, "done");
            toastLog("完成 " + signInTag);
        } else {
            log("unknown status");
        }    
    }

    commonAction.backToAppMainPage();
}

module.exports = coupon99;