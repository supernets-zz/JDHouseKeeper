var appliance = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const signInTag = "京东电器每日签到";

appliance.dailyJobs = [];
appliance.dailyJobs.push(signInTag);

appliance.doSignIn = function () {
    log("appliance.doSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        log(signInTag + " 已做: " + done);
        return;
    }

    toast("appliance.doSignIn");
    // 京东电器-> 左上角签到-> 立即翻牌，每日一次
    var applianceBtn = text("京东电器").packageName(common.destPackageName).findOne(30000);
    if (applianceBtn == null){
        toastLog("京东电器 not exist");
        commonAction.backToAppMainPage();
        return;
    }

    var clickRet = applianceBtn.parent().click();
    log("点击 京东电器: " + clickRet + ", 并等待 搜索框 出现, 15s超时");
    if (!clickRet) {
        commonAction.backToAppMainPage();
        return;
    }

    //搜索框
    clickRet = false;
    for (var i = 0; i < 15; i++) {
        var search = packageName(common.destPackageName).className("android.widget.EditText").depth(21).drawingOrder(0).indexInParent(1).find();
        log("等待 搜索框: " + search.length);
        if (search.length == 1) {
            clickRet = search[0].parent().parent().child(0).click();
            log("点击 签到: " + clickRet + ", 并等待 我的京豆 出现, 30s超时");
            if (clickRet) {
                break;
            }
        }
        sleep(1000);
    }

    if (!clickRet) {
        commonAction.backToAppMainPage();
        return;
    }

    var myJDBeanTips = common.waitForText("textContains", "我的京豆", true, 30);
    if (myJDBeanTips == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var signFrame = myJDBeanTips.parent();
    var signBtn = signFrame.child(signFrame.childCount() - 2);

    if (signBtn.text() == "今日已签到") {
        common.safeSet(nowDate + ":" + signInTag, "done");
        toastLog("完成 " + signInTag);
    } else if (signBtn.text() == "立即翻牌") {
        clickRet = signBtn.click();
        log("点击 立即翻牌: " + clickRet + ", 并等待 今日已签到 出现, 10s超时");
        //等一下结果
        common.waitForText("text", "今日已签到", true, 10);
        common.safeSet(nowDate + ":" + signInTag, "done");
        toastLog("完成 " + signInTag);
    } else {
        log("unknown status");
    }

    commonAction.backToAppMainPage();
}

module.exports = appliance;