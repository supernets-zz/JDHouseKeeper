var dailySignIn = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const dailySignInTag = "京东各场馆每日签到";
const motherAndBabySignInTag = "母婴馆每日签到";
const wineStoreSignInTag = "京东酒行每日签到";
const jdGoldenRankSignInTag = "京东金榜每日签到";
const goldenRankCampSignInTag = "金榜创造营每日签到";
const goldenRankCampBonusTag = "金榜创造营福利任务";
const searchContentAppreciatorSignInTag = "寻找内容鉴赏官每日签到";
const shoeStoreSignInTag = "鞋靴馆每日签到";
const bagStoreSignInTag = "箱包馆每日签到";
const campusSignInTag = "花YOUNG每日签到";
const personalCareSignInTag = "个人护理每日签到";

dailySignIn.dailyJobs = [];
dailySignIn.dailyJobs.push(dailySignInTag);

dailySignIn.signInTags = [];

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

    back();
    sleep(3000);
}

doMotherAndBabySignIn = function () {
    log("dailySignIn.doMotherAndBabySignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + motherAndBabySignInTag);
    if (done != null) {
        log(motherAndBabySignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doMotherAndBabySignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://u.jd.com/Nd9Z2zG","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    //等待搜索框出现
    for (var i = 0; i < 15; i++) {
        var search = packageName(common.destPackageName).className("android.widget.EditText").depth(24).drawingOrder(0).indexInParent(0).find();
        log("等待 搜索框: " + search.length);
        if (search.length == 1) {
            break;
        }
        sleep(1000);
    }

    if (i == 15) {
        return;
    }

    var startTick = new Date().getTime();
    for (;;) {
        var tips = text("赚京豆抵现金").visibleToUser(true).findOne(1000);
        if (tips == null) {
            swipe(device.width / 2, device.height * 7 / 8, device.width / 2, device.height * 1 / 8, 800);
            sleep(1000);
        } else {
            break;
        }

        log("pass " + parseInt((new Date().getTime() - startTick) / 1000) + "s");
        if (new Date().getTime() - startTick > 30 * 1000) {
            log("timeout");
            break;
        }
    }

    var signFrame = tips.parent().parent();
    if (signFrame.child(signFrame.childCount() - 2).childCount() == 0) {
        var signBtn = signFrame.child(signFrame.childCount() - 2);
        if (signBtn.text() == "今日已签到") {
            common.safeSet(nowDate + ":" + motherAndBabySignInTag, "done");
            toastLog("完成 " + motherAndBabySignInTag);
        }
    } else {
        var signBtn = signFrame.child(signFrame.childCount() - 2).child(0);
        clickRet = click(signBtn.bounds().centerX(), signBtn.bounds().centerY());
        log("点击 立即翻牌: " + clickRet);
        sleep(3000);
    }

    back();
    sleep(3000);
}

doWineStoreSignIn = function () {
    log("dailySignIn.doWineStoreSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + wineStoreSignInTag);
    if (done != null) {
        log(wineStoreSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doWineStoreSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://u.jd.com/Nt9pZPA","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    //等我的京豆出现
    var myJDBeanTips = common.waitForText("textContains", "我的京豆", true, 30);
    if (myJDBeanTips == null) {
        back();
        sleep(3000);
        return;
    }

    sleep(3000);
    var signFrame = myJDBeanTips.parent();
    var signCalendarListParent = null;
    log("signFrame.childCount(): " + signFrame.childCount());
    if (signFrame.childCount() == 4) {
        signCalendarListParent = signFrame.child(signFrame.childCount() - 1);
    } else if (signFrame.childCount() == 5) {
        signCalendarListParent = signFrame.child(signFrame.childCount() - 2);
    }
    var signCalendarList = signCalendarListParent.child(signCalendarListParent.childCount() - 1);

    log("签到日历子节点个数: " + signCalendarList.childCount());
    if (signCalendarList.childCount() == 15) {
        var fingerBtn = signCalendarList.child(signCalendarList.childCount() - 1);
        //点击手指左上角1/4处正好处于需要签到当日的中心处
        var clickX = fingerBtn.bounds().left + Math.floor(fingerBtn.bounds().width() / 4);
        var clickY = fingerBtn.bounds().top + Math.floor(fingerBtn.bounds().height() / 4);
        clickRet = click(clickX, clickY);
        log("点击 (" + clickX + ", " + clickY + "): " + clickRet);
        sleep(5000);
    } else {
        common.safeSet(nowDate + ":" + wineStoreSignInTag, "done");
        toastLog("完成 " + wineStoreSignInTag);
    }

    back();
    sleep(3000);
}

do618FavariteStreet = function () {
    log("dailySignIn.do618FavariteStreet");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + favariteStreetSignInTag);
    if (done != null) {
        log(favariteStreetSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.do618FavariteStreet");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://u.jd.com/Nt90tCn","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    //等我的金币出现
    var myCoinsTips = common.waitForText("text", "当前金币", true, 30);
    if (myCoinsTips == null) {
        back();
        sleep(3000);
        return;
    }

    sleep(5000);
    var welcomeBtn = text("确定").findOne(1000);
    if (welcomeBtn != null) {
        log("点击 欢迎来到种草街 对话框的确定: " + welcomeBtn.click());
    }

    var actionBar = myCoinsTips.parent();
    var coinsNum = actionBar.child(actionBar.childCount() - 1);
    log(myCoinsTips.text() + ": " + coinsNum.text());
    var collectCoinsBtn = actionBar.child(0);
    var lotteryBtn = actionBar.child(1);
}

doJDGoldenRankSignIn = function () {
    log("dailySignIn.doJDGoldenRankSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + jdGoldenRankSignInTag);
    if (done != null) {
        log(jdGoldenRankSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doJDGoldenRankSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://u.jd.com/ZCTzSMx","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var tips = common.waitForText("text", "必买京东电器金榜", true, 15);
    if (tips == null) {
        back();
        sleep(3000);
    }
    sleep(5000);
    var taskBtnParent = tips.parent().parent().parent().parent().parent().parent();
    var taskBtn = taskBtnParent.child(0).child(1).child(3);
    var clickRet = taskBtn.click();
    if (clickRet) {
        common.safeSet(nowDate + ":" + jdGoldenRankSignInTag, "done");
        toastLog("完成 " + jdGoldenRankSignInTag);
    }

    back();
    sleep(3000);
}

doGoldenRankCampSignIn = function () {
    log("dailySignIn.doGoldenRankCampSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + goldenRankCampSignInTag);
    if (done != null) {
        log(goldenRankCampSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doGoldenRankCampSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://u.jd.com/2Ir9gbQ","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var tips = common.waitForText("textContains", "每个主题限投一票", true, 15);
    if (tips == null) {
        back();
        sleep(3000);
    }

    sleep(5000);
    var startTick = new Date().getTime();
    for (;;) {
        var tips = textContains("每个主题限投一票").findOne(1000);
        var voteNum = tips.text().match(/\d+/);
        log(tips.text());
        if (parseInt(voteNum[0]) == 0) {
            common.safeSet(nowDate + ":" + goldenRankCampSignInTag, "done");
            toastLog("完成 " + goldenRankCampSignInTag);
            break;
        }

        var clickRet = click(tips.bounds().centerX(), tips.bounds().centerY() - tips.bounds().height() * 2);
        log("点击 投票赢京豆: " + clickRet);
        sleep(8000);
        back();
        sleep(5000);

        if (new Date().getTime() - startTick > 5 * 60 * 1000) {
            break;
        }
    }

    back();
    sleep(3000);
}

doGoldenRankCampBonus = function() {
    log("dailySignIn.doGoldenRankCampBonus");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + goldenRankCampBonusTag);
    if (done != null) {
        log(goldenRankCampBonusTag + " 已做: " + done);
        return;
    }

    var done2 = common.safeGet(nowDate + ":" + goldenRankCampSignInTag);
    if (done2 == null) {
        log(goldenRankCampSignInTag + " 未完成: " + done);
        return;
    }

    toast("dailySignIn.doGoldenRankCampBonus");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://u.jd.com/2Ir9gbQ","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var tips = common.waitForText("textContains", "每个主题限投一票", true, 15);
    if (tips == null) {
        back();
        sleep(3000);
    }

    sleep(5000);
    var bonusBtnX = Math.floor(device.width * 7 / 8);
    var bonusBtnY = tips.bounds().centerY() - tips.bounds().height() * 7;
    var clickRet = click(bonusBtnX, bonusBtnY);
    log("点击 福利任务领京豆(" + bonusBtnX + ", " + bonusBtnY + "): " + clickRet);
    sleep(2000);

    var startTick = new Date().getTime();
    var totalTasks = textContains("浏览").find();
    log("总任务数: " + totalTasks.length);
    var dones = [];
    while (dones.length != totalTasks.length) {
        dones = [];
        var taskList = textContains("浏览").find();
        for (var i = 0; i < taskList.length; i++) {
            var taskItem = taskList[i].parent();
            var title = taskItem.child(1);
            var progress = taskItem.child(3);
            var btn = taskItem.child(4);
            log("已完成任务数: " + dones.length + ", " + title.text() + " " + progress.text());
            var count = progress.text().match(/\d+/g);
            if (count[0] != count[1]) {
                log("点击 去完成: " + btn.click());
                sleep(5000);
                back();
                sleep(3000);
                break;
            } else {
                dones.push(true);
            }
        }

        if (new Date().getTime() - startTick > 5 * 60 * 1000) {
            break;
        }
    }

    if (dones.length == totalTasks.length) {
        common.safeSet(nowDate + ":" + goldenRankCampBonusTag, "done");
        toastLog("完成 " + goldenRankCampBonusTag);
    }
    back();
    sleep(3000);
}

doSearchContentAppreciatorSignIn = function () {
    log("dailySignIn.doSearchContentAppreciatorSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + searchContentAppreciatorSignInTag);
    if (done != null) {
        log(searchContentAppreciatorSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doSearchContentAppreciatorSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://u.jd.com/2K2rCGz","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var tips = common.waitForText("textContains", "看内容签到", true, 15);
    if (tips == null) {
        back();
        sleep(3000);
    }

    sleep(5000);
    var signBtn = tips.parent().child(tips.parent().childCount() - 1);
    if (signBtn.text() == "每日签到领京豆") {
        log("点击 每日签到领京豆: " + signBtn.click());
        sleep(2000);
        back();
        sleep(3000);
        return;
    }

    log("上划到底: " + swipe(device.width / 2, Math.floor(device.height * 15 / 16), device.width / 2, Math.floor(device.height / 16), 800));

    var startTick = new Date().getTime();
    for (;;) {
        var taskList = textContains("逛一逛").find();
        for (var i = 0; i < taskList.length; i++) {
            var taskItem = taskList[i].parent();
            var title = taskItem.child(1).text();
            var btn = taskItem.child(3);
            if (btn.text() != "已完成") {
                toastLog("点击 " + title + ": " + btn.click());
                sleep(5000);
                back();
                sleep(3000);
                break;
            }
        }

        if (i == taskList.length) {
            common.safeSet(nowDate + ":" + searchContentAppreciatorSignInTag, "done");
            toastLog("完成 " + searchContentAppreciatorSignInTag);
            break;
        }

        if (new Date().getTime() - startTick > 3 * 60 * 1000) {
            break;
        }
    }

    back();
    sleep(3000);
}

doShoeStoreSignIn = function () {
    log("dailySignIn.doShoeStoreSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + shoeStoreSignInTag);
    if (done != null) {
        log(shoeStoreSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doShoeStoreSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://3.cn/1-wQj0sj?_ts=1655545642451&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var tips = common.waitForText("text", "签到赢好礼", false, 15);
    if (tips == null) {
        back();
        sleep(3000);
    }

    log("上划屏幕: " + swipe(device.width / 2, Math.floor(device.height * 15 / 16), device.width / 2, Math.floor(device.height / 16), 800));
    sleep(1000);

    var tips = text("签到赢好礼").findOne(1000);
    if (tips == null) {
        back();
        sleep(3000);
    }

    var signFrame = tips.parent();
    var signBtn = signFrame.child(signFrame.childCount() - 1).child(1);
    log(signBtn.text());
    if (signBtn.text() != "今日已签") {
        log("点击 " + signBtn.text() + ": " + signBtn.click());
        sleep(1000);
    }

    common.safeSet(nowDate + ":" + shoeStoreSignInTag, "done");
    toastLog("完成 " + shoeStoreSignInTag);

    back();
    sleep(3000);
}

doBagStoreSignIn = function () {
    log("dailySignIn.doBagStoreSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + bagStoreSignInTag);
    if (done != null) {
        log(bagStoreSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doBagStoreSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://3.cn/1-wQmLMZ?_ts=1655546972668&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var tips = common.waitForText("text", "签到赢好礼", false, 15);
    if (tips == null) {
        back();
        sleep(3000);
    }

    log("上划屏幕: " + swipe(device.width / 2, Math.floor(device.height * 15 / 16), device.width / 2, Math.floor(device.height / 16), 800));
    sleep(1000);

    var tips = text("签到赢好礼").findOne(1000);
    if (tips == null) {
        back();
        sleep(3000);
    }

    var signFrame = tips.parent();
    var signBtn = signFrame.child(signFrame.childCount() - 1).child(1);
    log(signBtn.text());
    if (signBtn.text() != "今日已签") {
        log("点击 " + signBtn.text() + ": " + signBtn.click());
        sleep(1000);
    }

    common.safeSet(nowDate + ":" + bagStoreSignInTag, "done");
    toastLog("完成 " + bagStoreSignInTag);

    back();
    sleep(3000);
}

doCampusSignIn = function () {
    log("dailySignIn.doCampusSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + campusSignInTag);
    if (done != null) {
        log(campusSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doCampusSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://3.cn/1-wQnJ2l?_ts=1655547315333&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var tips = common.waitForText("textContains", "天天签到赚京豆", false, 15);
    if (tips == null) {
        back();
        sleep(3000);
    }

    sleep(5000);
    var signFrame = tips.parent();
    var signBtn = signFrame.child(signFrame.childCount() - 1).child(1);
    log(signBtn.text());
    if (signBtn.text() != "今日已签") {
        log("点击 " + signBtn.text() + ": " + signBtn.click());
        sleep(1000);
    }

    common.safeSet(nowDate + ":" + campusSignInTag, "done");
    toastLog("完成 " + campusSignInTag);

    back();
    sleep(3000);
}

doPersonalCareSignIn = function () {
    log("dailySignIn.doPersonalCareSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + personalCareSignInTag);
    if (done != null) {
        log(personalCareSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doPersonalCareSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://3.cn/1-wQRUxr?_ts=1655559631280&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var myJDBeanTips = common.waitForText("textContains", "我的京豆", true, 30);
    if (myJDBeanTips == null) {
        back();
        sleep(3000);
        return;
    }

    var signFrame = myJDBeanTips.parent();
    var signBtn = signFrame.child(signFrame.childCount() - 2);
    if (signBtn.text() == "今日已签到") {
        common.safeSet(nowDate + ":" + personalCareSignInTag, "done");
        toastLog("完成 " + personalCareSignInTag);
    } else {
        clickRet = click(signBtn.bounds().centerX(), signBtn.bounds().centerY());
        log("点击 立即翻牌: " + clickRet);
        sleep(3000);
    }

    back();
    sleep(3000);
}

isAllSignInComplete = function () {
    var nowDate = new Date().Format("yyyy-MM-dd");
    for (var i = 0; i < dailySignIn.signInTags.length; i++) {
        var done = common.safeGet(nowDate + ":" + dailySignIn.signInTags[i]);
        if (done == null) {
            log("isAllSignInComplete: " + nowDate + ":" + dailySignIn.signInTags[i] + " 未完成");
            return false;
        }
    }

    return true;
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

    dailySignIn.signInTags = [];
    Object.keys(signInList).forEach((tag) => {
        dailySignIn.signInTags.push(tag);
        var nowDate = new Date().Format("yyyy-MM-dd");
        var done = common.safeGet(nowDate + ":" + tag);
        if (done != null) {
            log(tag + " 已做: " + done);
            return;
        }

        doSignIn(tag, signInList[tag]);
    });

    dailySignIn.signInTags.push(motherAndBabySignInTag);
    doMotherAndBabySignIn();

    dailySignIn.signInTags.push(wineStoreSignInTag);
    doWineStoreSignIn();

    dailySignIn.signInTags.push(jdGoldenRankSignInTag);
    doJDGoldenRankSignIn();

    dailySignIn.signInTags.push(goldenRankCampSignInTag);
    doGoldenRankCampSignIn();

    dailySignIn.signInTags.push(goldenRankCampBonusTag);
    doGoldenRankCampBonus();

    dailySignIn.signInTags.push(searchContentAppreciatorSignInTag);
    doSearchContentAppreciatorSignIn();

    dailySignIn.signInTags.push(shoeStoreSignInTag);
    doShoeStoreSignIn();

    dailySignIn.signInTags.push(bagStoreSignInTag);
    doBagStoreSignIn();

    dailySignIn.signInTags.push(campusSignInTag);
    doCampusSignIn();

    dailySignIn.signInTags.push(personalCareSignInTag);
    doPersonalCareSignIn();

    if (isAllSignInComplete()) {
        common.safeSet(nowDate + ":" + dailySignInTag, "done");
        log("完成 " + dailySignInTag);
    }

    commonAction.backToAppMainPage();
}

module.exports = dailySignIn;