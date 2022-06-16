var book = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const signInTag = "京东图书每日签到";

book.dailyJobs = [];
book.dailyJobs.push(signInTag);

book.doSignIn = function () {
    log("book.doSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        log(signInTag + " 已做: " + done);
        return;
    }

    toast("book.doSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://prodev.m.jd.com/mall/active/3SC6rw5iBg66qrXPGmZMqFDwcyXi/index.html?_ts=1655340758811&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=Wxfriends&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var signTips = common.waitForText("text", "签到赢好礼", true, 15);
    if (signTips == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var signFrame = signTips.parent().child(signTips.parent().childCount() - 1);
    var signDays = signFrame.child(0);
    var signBtn = signFrame.child(1);

    log(signDays.text() + ", " + signBtn.text());
    if (signBtn.text() == "今日已签") {
        common.safeSet(nowDate + ":" + signInTag, "done");
        toastLog("完成 " + signInTag);
    } else {
        var clickRet = signBtn.click();
        log("点击 签到: " + clickRet);
        sleep(1000);
    }

    commonAction.backToAppMainPage();
}

module.exports = book;