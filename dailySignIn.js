var dailySignIn = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const dailySignInTag = "京东各场馆每日签到";

dailySignIn.dailyJobs = [];
dailySignIn.dailyJobs.push(dailySignInTag);

//类似京东图书的 签到赢好礼 签到
doSignIn = function (tag, url) {
    log("dailySignIn.doSignIn: " + tag + ", " + url);
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"' + url + '","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var signTips = common.waitForText("textContains", "签到赢好礼", true, 15);
    if (signTips == null) {
        return;
    }

    var signFrame = signTips.parent().child(signTips.parent().childCount() - 1);
    var signDays = signFrame.child(0);
    var signBtn = signFrame.child(1);

    log(signDays.text() + ", " + signBtn.text());
    if (signBtn.text() == "今日已签") {
        var nowDate = new Date().Format("yyyy-MM-dd");
        common.safeSet(nowDate + ":" + tag, "done");
        toastLog("完成 " + tag);
    } else {
        var clickRet = signBtn.click();
        log("点击 签到: " + clickRet);
        sleep(1000);
    }
}

dailySignIn.doDailySignIn = function () {
    log("dailySignIn.doDailySignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + dailySignInTag);
    if (done != null) {
        log(dailySignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doDailySignIn");
    //来源见 http://www.sxqq.com/dazhe/5542.html
    var signInList = {
        "京东图书每日签到": "https://u.jd.com/Nt9YkO7",
        "陪伴计划每日签到": "https://u.jd.com/NI9poJ8",
        "女装馆每日签到": "https://u.jd.com/NC92NR4",
        "京东服饰每日签到": "https://u.jd.com/NK9Zbez",
    }

    Object.keys(signInList).forEach((tag) => {
        var nowDate = new Date().Format("yyyy-MM-dd");
        var done = common.safeGet(nowDate + ":" + tag);
        if (done != null) {
            log(tag + " 已做: " + done);
            return;
        }

        doSignIn(tag, signInList[tag]);
    });

    common.safeSet(nowDate + ":" + dailySignInTag, "done");
    log("完成 " + dailySignInTag);

    commonAction.backToAppMainPage();
}

module.exports = dailySignIn;