var plusMember = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const signInTag = "京东会员每日领京豆";

plusMember.dailyJobs = [];
plusMember.dailyJobs.push(signInTag);

plusMember.isSignInDone = function () {
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        return true;
    }

    return false;
}

plusMember.doSignIn = function () {
    log("plusMember.doSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        log(signInTag + " 已做: " + done);
        return;
    }

    toast("plusMember.doSignIn");
    //下面的TabBar
    //FrameLayout-> LinearLayout(0)-> FrameLayout(0)-> 
    //RelativeLayout(0)-> FrameLayout(2)-> RelativeLayout(0)-> 
    //LinearLayout(0)-> 有五个FrameLayout child(3)的View可点击

    // 我的-> 会员店-> 天天领京豆-> 立即翻牌，每日一次
    var mineTab = text("我的").packageName(common.destPackageName).findOne(30000);
    if (mineTab == null){
        toastLog("我的 tab not exist");
        commonAction.backToAppMainPage();
        return;
    }

    var clickRet = mineTab.parent().child(2).click();
    log("点击 我的: " + clickRet + ", 并等待 会员店 出现, 15s超时");
    if (!clickRet) {
        commonAction.backToAppMainPage();
        return;
    }

    var memberShop = common.waitForText("text", "会员店", true, 15);
    if (memberShop == null) {
        commonAction.backToAppMainPage();
        return;
    }

    clickRet = memberShop.parent().parent().parent().click();
    log("点击 会员店: " + clickRet + ", 并等待 天天领京豆 出现, 15s超时");

    //天天领京豆
    clickRet = false;
    for (var i = 0; i < 15; i++) {
        var btns = packageName(common.destPackageName).className("android.view.View").depth(12).drawingOrder(0).indexInParent(0).find();
        log("等待 天天领京豆: " + btns.length);
        if (btns.length == 1 && btns[0].childCount() == 7) {
            clickRet = btns[0].child(2).click();
            log("点击 天天领京豆: " + clickRet + ", 并等待 我的京豆 出现, 30s超时");
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

module.exports = plusMember;