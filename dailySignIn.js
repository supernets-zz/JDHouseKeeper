var dailySignIn = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const dailySignInTag = "京东各场馆每日签到";
//翻牌类
const plusMemberSignInTag = "京东会员每日领京豆";
const applianceSignInTag = "京东电器每日签到";
//类京东图书
const bookStoreSignInTag = "京东图书每日签到";
const accompanyPlanSignInTag = "陪伴计划每日签到";
const dressStoreSignInTag = "女装馆每日签到";
const clothStoreSignInTag = "京东服饰每日签到";
const jdInternationalSignInTag = "京东国际每日签到";
const paipaiSecondHandSignInTag = "拍拍二手签到有礼";
const dailyFuliSignInTag = "每日福利";
const drugStoreSignInTag = "医药馆每日签到";
const lifePrivilegeSignInTag = "生活特权天天领京豆";
const carSignInTag = "京东汽车每日签到";

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
const favarite618TogetherSignInTag = "618和你一起种草每日签到"; //6月22日过期
const everydayRedEnvelopesSignInTag = "天天红包每日签到";
const collectCubeSignInTag = "集魔方赢大奖";
const brandShoppingSignInTag = "品牌闪购每日签到";

dailySignIn.dailyJobs = [];
dailySignIn.dailyJobs.push(dailySignInTag);

dailySignIn.signInTags = [];

needVerification = function () {
    var verificationTips = textContains("完成验证").visibleToUser(true).findOne(3000);
    if (verificationTips == null) {
        return false;
    }
    return true;
}

//类似京东图书的 签到赢好礼 签到
doSignIn = function (tag, url) {
    log("dailySignIn.doSignIn: " + tag + ", " + url);
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"' + url + '","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    // var signTips = common.waitForTextMatches(/.*签到赢好礼.*|.*签到拿京豆.*|.*签到领京豆.*/, true, 30);
    // if (signTips == null) {
    //     var nowDate = new Date().Format("yyyy-MM-dd");
    //     common.safeSet(nowDate + ":" + tag, "invalid");
    //     toastLog("无效 " + tag);
    //     back();
    //     sleep(3000);
    //     return;
    // }

    // sleep(3000);
    // var signFrame = signTips.parent().child(signTips.parent().childCount() - 1);
    // var signDays = signFrame.child(0);
    // var signBtn = signFrame.child(1);

    var signDays = common.waitForTextMatches(/已连续签到\d+天/, true, 30);
    if (signDays == null) {
        var nowDate = new Date().Format("yyyy-MM-dd");
        common.safeSet(nowDate + ":" + tag, "invalid");
        toastLog("无效 " + tag);
        back();
        sleep(3000);
        return;
    }

    sleep(3000);
    var signFrame = signDays.parent();
    var signBtn = signFrame.child(1);

    log(signDays.text() + ", " + signBtn.text());
    if (signBtn.text() == "今日已签") {
        var nowDate = new Date().Format("yyyy-MM-dd");
        common.safeSet(nowDate + ":" + tag, "done");
        toastLog("完成 " + tag);
    } else {
        log("点击 " + signBtn.text() + ": " + signBtn.click());
        sleep(2000);
        if (needVerification()) {
            common.safeSet(nowDate + ":" + tag, "verification");
            toastLog("需验证 " + tag);
        }
    }

    back();
    sleep(3000);
}

//类似天天领京豆的翻牌签到
doFlipCardSignIn = function (tag, url) {
    log("dailySignIn.doFlipCardSignIn: " + tag + ", " + url);
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"' + url + '","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var myJDBeanTips = common.waitForText("textContains", "我的京豆", true, 30);
    if (myJDBeanTips == null) {
        var nowDate = new Date().Format("yyyy-MM-dd");
        common.safeSet(nowDate + ":" + tag, "invalid");
        toastLog("无效 " + tag);
        back();
        sleep(3000);
        return;
    }

    var signFrame = myJDBeanTips.parent();
    var signBtn = signFrame.child(signFrame.childCount() - 2);

    if (signBtn.text() == "今日已签到") {
        var nowDate = new Date().Format("yyyy-MM-dd");
        common.safeSet(nowDate + ":" + tag, "done");
        toastLog("完成 " + tag);
    } else if (signBtn.text() == "立即翻牌") {
        var clickRet = signBtn.click();
        log("点击 立即翻牌: " + clickRet + ", 并等待 今日已签到 出现, 10s超时");
        sleep(5000);
        if (needVerification()) {
            common.safeSet(nowDate + ":" + tag, "verification");
            toastLog("需验证 " + tag);
        }
    } else {
        log(signBtn.text());
        var nowDate = new Date().Format("yyyy-MM-dd");
        common.safeSet(nowDate + ":" + tag, "invalid");
        toastLog("无效 " + tag);
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
    var tips = null;
    for (;;) {
        tips = textContains("我的京豆").visibleToUser(true).findOne(1000);
        if (tips == null) {
            log("上划屏幕直到 我的京豆 出现: " + swipe(device.width / 2, Math.floor(device.height * 6 / 7), device.width / 2, Math.floor(device.height * 1 / 7), 300));
            sleep(5000);
        } else {
            break;
        }

        log("pass " + parseInt((new Date().getTime() - startTick) / 1000) + "s");
        if (new Date().getTime() - startTick > 80 * 1000) {
            log("timeout");
            break;
        }
    }

    sleep(3000);
    var signFrame = tips.parent();
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
        if (needVerification()) {
            common.safeSet(nowDate + ":" + motherAndBabySignInTag, "verification");
            toastLog("需验证 " + motherAndBabySignInTag);
        }
    } else {
        common.safeSet(nowDate + ":" + motherAndBabySignInTag, "done");
        toastLog("完成 " + motherAndBabySignInTag);
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
        if (needVerification()) {
            common.safeSet(nowDate + ":" + wineStoreSignInTag, "verification");
            toastLog("需验证 " + wineStoreSignInTag);
        }
    } else {
        common.safeSet(nowDate + ":" + wineStoreSignInTag, "done");
        toastLog("完成 " + wineStoreSignInTag);
    }

    back();
    sleep(3000);
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

    var tips = common.waitForText("text", "/2022年", true, 15);
    if (tips == null) {
        back();
        sleep(3000);
    }

    sleep(5000);
    var taskBtn = tips.parent().parent().child(3);
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
    var totalTasks = textMatches(/浏览.*任务/).find();
    var dones = [];
    //todo需要关闭任务列表再打开，progress没更新
    while (dones.length != totalTasks.length) {
        dones = [];
        var taskList = textMatches(/浏览.*任务/).find();
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

        if (new Date().getTime() - startTick > 60 * 1000) {
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
        log("点击 " + signBtn.text() + ": " + signBtn.click());
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
        sleep(2000);
        if (needVerification()) {
            common.safeSet(nowDate + ":" + shoeStoreSignInTag, "verification");
            toastLog("需验证 " + shoeStoreSignInTag);
        }
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
        sleep(2000);
        if (needVerification()) {
            common.safeSet(nowDate + ":" + bagStoreSignInTag, "verification");
            toastLog("需验证 " + bagStoreSignInTag);
        }
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
        sleep(2000);
        if (needVerification()) {
            common.safeSet(nowDate + ":" + campusSignInTag, "verification");
            toastLog("需验证 " + campusSignInTag);
        }
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
        if (needVerification()) {
            common.safeSet(nowDate + ":" + personalCareSignInTag, "verification");
            toastLog("需验证 " + personalCareSignInTag);
        }
    }

    back();
    sleep(3000);
}

doFavarite618TogetherSignIn = function () {
    log("dailySignIn.doFavarite618TogetherSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + favarite618TogetherSignInTag);
    if (done != null) {
        log(favarite618TogetherSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doFavarite618TogetherSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://prodev.m.jd.com/mall/active/2AHoH4doy5uFX6ukQAo7CkZT9Fyu/index.html?babelChannel=ttt7&rid=12275&ad_od=share&hideyl=1&cu=true&PTAG=17053.1.1&utm_source=m.sxqq.com&utm_medium=jingfen&utm_campaign=t_13297_&utm_term=4c729b433a8a4327abd5922d3b96ba8c","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    // var signTips = common.waitForText("textContains", "看内容签到", true, 30);
    var signTips = common.waitForText("textContains", "连签", true, 30);
    if (signTips == null) {
        back();
        sleep(3000);
        return;
    }

    var signFrame = signTips.parent();
    var signBtn = signFrame.child(signFrame.childCount() - 1);
    log("点击 " + signBtn.text() + ": " + signBtn.click());
    sleep(2000);
    common.safeSet(nowDate + ":" + favarite618TogetherSignInTag, "done");
    toastLog("完成 " + favarite618TogetherSignInTag);

    var walkTips = text("浏览好货抽京豆").findOne(1000);
    if (walkTips != null) {
        var walkFrame = walkTips.parent();
        var walkBtn = walkFrame.child(walkFrame.childCount() - 1);
        var clickRet = walkBtn.click();
        log("点击 逛一逛: " + clickRet);
        sleep(5000);
        back();
        sleep(3000);
    }

    back();
    sleep(3000);
}

dailySignIn.doEverydayRedEnvelopesSignIn = function () {
    log("dailySignIn.doEverydayRedEnvelopesSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + everydayRedEnvelopesSignInTag);
    if (done != null) {
        log(everydayRedEnvelopesSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doEverydayRedEnvelopesSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://h5.m.jd.com/babelDiy/Zeus/CvMVbdFGXPiWFFPCc934RiJfMPu/index.html?babelChannel=ttt6&ad_od=share&cu=true&utm_source=m.sxqq.com&utm_medium=jingfen&utm_campaign=t_13297_&utm_term=35c69d6963324f049276c959a8ceedca","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var chanceNumTips = common.waitForTextMatches(/还剩\d+次机会/, true, 15);
    if (chanceNumTips == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var totalTasks = packageName(common.destPackageName).text("每日浏览活动8秒，送1次抽奖机会").find();
    var swipeHeight = totalTasks[1].bounds().top - totalTasks[0].bounds().top;
    log("上划屏幕: " + swipe(device.width / 2, Math.floor(device.height * 7 / 8), device.width / 2, Math.floor(device.height * 7 / 8) - swipeHeight * totalTasks.length, 500));
    sleep(2000);

    var periodBonusTitle = text("定时奖励").findOne(1000);
    var periodBonusTaskItem = periodBonusTitle.parent();
    var periodBonusBtn = periodBonusTaskItem.child(periodBonusTaskItem.childCount() - 1);
    var changeNum = chanceNumTips.text().match(/\d+/);
    toastLog("抽奖次数: " + changeNum[0] + ", 定时奖励 按钮: " + periodBonusBtn.text());

    if (parseInt(changeNum[0]) == 0 && (periodBonusBtn.text() == "已领取" || periodBonusBtn.text() == "明日再来")) {
        common.safeSet(nowDate + ":" + everydayRedEnvelopesSignInTag, "done");
        toastLog("完成 " + everydayRedEnvelopesSignInTag);
        commonAction.backToAppMainPage();
        return;
    }

    if (periodBonusBtn.text() == "立即领取") {
        var clickRet = click(periodBonusBtn.bounds().centerX(), periodBonusBtn.bounds().centerY());
        log("点击 " + periodBonusBtn.text() + ": " + clickRet);
        sleep(2000);
    }

    var startTick = new Date().getTime();
    for (;;) {
        var oneWalkTaskList = [];   //浏览任务列表，浏览完成后返回
        var doneTaskList = [];
        var totalTasks = packageName(common.destPackageName).text("每日浏览活动8秒，送1次抽奖机会").visibleToUser(true).find();
        toastLog("任务数: " + totalTasks.length);
    
        if (totalTasks.length == 0) {
            // captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            commonAction.backToAppMainPage();
            return;
        }
    
        totalTasks.forEach(function(tv) {
            var taskItem = tv.parent();
            var title = taskItem.child(1).text();
            var btn = taskItem.child(taskItem.childCount() - 1);
            if (/去浏览|立即领取/.test(btn.text())) {
                var obj = {};
                obj.Title = title;
                obj.BtnName = btn.text();
                obj.Button = btn;
                if (btn.text() == "去浏览") {
                    oneWalkTaskList.push(obj);
                } else if (btn.text() == "立即领取") {
                    doneTaskList.push(obj);
                }
                log("未完成任务" + (oneWalkTaskList.length + doneTaskList.length) + ": " + obj.Title + ", " + obj.BtnName + ", (" + obj.Button.bounds().centerX() + ", " + obj.Button.bounds().centerY() + "), " + obj.Button.bounds().height());
            } else {
                log("跳过任务: " + title + ", " + btn.text() + ", (" + btn.bounds().centerX() + ", " + btn.bounds().centerY() + "), " + btn.bounds().height());
            }
        });
    
        var uncompleteTaskNum = oneWalkTaskList.length + doneTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
            break;
        }
    
        for (var i = 0; i < oneWalkTaskList.length; i++) {
            var objs = [];
            objs.push(oneWalkTaskList[i]);
            if (commonAction.doOneWalkTasks(objs)) {
                sleep(2000);
                var clickRet = click(oneWalkTaskList[i].Button.bounds().centerX(), oneWalkTaskList[i].Button.bounds().centerY());
                log("点击 立即领取: " + clickRet);
                sleep(2000);
            }
        }

        for (var i = 0; i < doneTaskList.length; i++) {
            var clickRet = click(doneTaskList[i].Button.bounds().centerX(), doneTaskList[i].Button.bounds().centerY());
            log("点击 " + doneTaskList[i].BtnName + ": " + clickRet);
            sleep(2000);
        }

        if (new Date().getTime() - startTick > 2 * 60 * 1000) {
            break;
        }
    }

    log("下划到顶抽奖: " + swipe(device.width / 2, Math.floor(device.height / 8), device.width / 2, Math.floor(device.height / 8) + totalTasks.length * swipeHeight, 800));
    var chanceNumTips = textMatches(/还剩\d+次机会/).findOne(1000);
    if (chanceNumTips == null) {
        commonAction.backToAppMainPage();
        return;
    }

    toastLog(chanceNumTips.text());
    var changeNum = chanceNumTips.text().match(/\d+/);
    for (var i = 0; i < parseInt(changeNum[0]); i++) {
        var clickRet = click(chanceNumTips.parent().bounds().centerX(), chanceNumTips.parent().bounds().centerY());
        log("点击 抽奖: " + clickRet + ", 并等待 继续抽奖 出现, 15s超时");

        var bingoTips = common.waitForText("text", "继续抽奖", true, 15);
        if (bingoTips == null) {
            break;
        }
        var dlgFrame = bingoTips.parent().parent();
        var closeBtn = dlgFrame.child(dlgFrame.childCount() - 1);
        log("点击 关闭按钮: " + closeBtn.click());
        sleep(1000);
    }

    commonAction.backToAppMainPage();
}

doCollectCubeSignIn = function () {
    log("dailySignIn.doCollectCubeSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + collectCubeSignInTag);
    if (done != null) {
        log(collectCubeSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doCollectCubeSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://u.jd.com/2K2aV0M","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    click(device.width / 2, device.height / 2);
    sleep(2000);
    click(device.width / 2, device.height / 2);
    sleep(2000);
    click(device.width / 2, device.height / 2);
    sleep(2000);

    sleep(10000);
    var signBtn = text("立即签到").findOne(1000);
    if (signBtn != null) {
        log("点击 立即签到: " + signBtn.click());
        sleep(1000);
        var dlgFrame = signBtn.parent().parent();
        var closeBtn = dlgFrame.child(dlgFrame.childCount() - 1);
        log("点击 关闭: " + closeBtn.click());
        sleep(1000);
    }

    var startTick = new Date().getTime();
    for (;;) {
        var cubeNumTips = textMatches(/已有\d+个魔方/).findOne(1000);
        if (cubeNumTips == null) {
            back();
            sleep(3000);
            return;
        }

        var actionBarParent = cubeNumTips.parent().parent();
        var cubeNum = cubeNumTips.text().match(/\d+/);
        log("已有魔方数: " + cubeNum[0] + ", " + actionBarParent.child(actionBarParent.childCount() - 2).text());

        var actionBar = actionBarParent.child(actionBarParent.childCount() - 1);
        var btn1 = actionBar.child(0).child(0);
        var btn2 = actionBar.child(0).child(1);
        var btn3 = actionBar.child(0).child(2);
        log(btn1.child(btn1.childCount() - 1).text() + ": " + btn1.child(0).className());
        log(btn2.child(btn2.childCount() - 1).text() + ": " + btn2.child(0).className());
        log(btn3.child(btn3.childCount() - 1).text() + ": " + btn3.child(0).className());

        if (btn1.child(0).className() == "android.widget.Image" && 
            btn2.child(0).className() == "android.widget.Image" && 
            btn3.child(0).className() == "android.widget.Image") {
            toastLog("完成魔方碎片收集");
            break;
        }

        if (btn1.child(0).className() == "android.view.View") {
            var objs = [];
            var obj = {};
            obj.Title = btn1.child(btn1.childCount() - 1).text();
            obj.BtnName = obj.Title;
            obj.Button = btn1;
            obj.Timeout = 20;
            objs.push(obj);
            commonAction.doOneWalkTasks(objs);
            sleep(2000);
        }

        if (new Date().getTime() - startTick > 2 * 60 * 1000) {
            log("timeout");
            back();
            sleep(3000);
            return;
        }
    }

    common.safeSet(nowDate + ":" + collectCubeSignInTag, "done");
    toastLog("完成 " + collectCubeSignInTag);

    back();
    sleep(3000);
}

doBrandShoppingSignIn = function () {
    log("dailySignIn.doBrandShoppingSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + brandShoppingSignInTag);
    if (done != null) {
        log(brandShoppingSignInTag + " 已做: " + done);
        return;
    }

    toast("dailySignIn.doBrandShoppingSignIn");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://wqs.jd.com/portal/wx/seckill_m/brand.shtml?&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI","M_sourceFrom":"mxz","msf_type":"auto"}'
    });

    var todaySelectedBtn = common.waitForText("textContains", "精选", true, 15);
    if (todaySelectedBtn == null) {
        back();
        sleep(3000);
        return;
    }

    var signFrameParent = todaySelectedBtn.parent().parent().parent().parent().parent();
    var signFrame = signFrameParent.child(signFrameParent.childCount() - 2);
    var signBtn = signFrame.child(signFrame.childCount() - 1);
    if (signBtn.text() == "今日已签") {
        var nowDate = new Date().Format("yyyy-MM-dd");
        common.safeSet(nowDate + ":" + brandShoppingSignInTag, "done");
        toastLog("完成 " + brandShoppingSignInTag);
    } else if (signBtn.text() == "立即签到") {
        var clickRet = signBtn.click();
        log("点击 立即签到: " + clickRet);
        sleep(5000);
        if (needVerification()) {
            common.safeSet(nowDate + ":" + brandShoppingSignInTag, "verification");
            toastLog("需验证 " + brandShoppingSignInTag);
        }
    } else {
        log(signBtn.text());
        var nowDate = new Date().Format("yyyy-MM-dd");
        common.safeSet(nowDate + ":" + brandShoppingSignInTag, "invalid");
        toastLog("无效 " + brandShoppingSignInTag);
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

dailySignIn.isSignInDone = function () {
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + dailySignInTag);
    if (done != null) {
        return true;
    }

    return false;
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
    var flipCardSignInList = {};
    flipCardSignInList[plusMemberSignInTag] = "https://u.jd.com/cIiBwep";
    flipCardSignInList[applianceSignInTag] = "https://3.cn/-1wVVmrm?_ts=1655742390752&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI";

    dailySignIn.signInTags = [];
    Object.keys(flipCardSignInList).forEach((tag) => {
        dailySignIn.signInTags.push(tag);
        var nowDate = new Date().Format("yyyy-MM-dd");
        var done = common.safeGet(nowDate + ":" + tag);
        if (done != null) {
            log(tag + " 已做: " + done);
            return;
        }

        doFlipCardSignIn(tag, flipCardSignInList[tag]);
    });

    //来源见 http://www.sxqq.com/dazhe/5542.html
    var signInList = {};
    signInList[bookStoreSignInTag] = "https://u.jd.com/Nt9YkO7";
    signInList[accompanyPlanSignInTag] = "https://u.jd.com/NI9poJ8";
    signInList[dressStoreSignInTag] = "https://u.jd.com/NC92NR4";
    signInList[clothStoreSignInTag] = "https://u.jd.com/NK9Zbez";
    signInList[jdInternationalSignInTag] = "https://u.jd.com/ctABz2V";
    signInList[paipaiSecondHandSignInTag] = "https://3.cn/1xJaw-6U?_ts=1657942902111&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI";
    signInList[dailyFuliSignInTag] = "https://3.cn/1xJ-aZH2?_ts=1657943131146&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI";
    signInList[drugStoreSignInTag] = "https://3.cn/1x-JzuUP?_ts=1657960133935&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI";
    signInList[lifePrivilegeSignInTag] = "https://pro.m.jd.com/mall/active/3joSPpr7RgdHMbcuqoRQ8HbcPo9U/index.html?babelChannel=ttt1&channel=aIcon&PTAG=17053.1.1&hideyl=1&cu=true&utm_source=www.linkstars.com&utm_medium=tuiguang&utm_campaign=t_1000089893_156_0_184__85411432c7f0f631&utm_term=40a05c449e5546949dac0abbe53a833a";
    signInList[carSignInTag] = "https://3.cn/-1yhWGRm?_ts=1659598984010&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL&ad_od=share&utm_user=plusmember&gx=RnEwkTMIYWLZwtRW6sQiH03yqEI";

    Object.keys(signInList).forEach((tag) => {
        dailySignIn.signInTags.push(tag);
        var nowDate = new Date().Format("yyyy-MM-dd");
        var done = common.safeGet(nowDate + ":" + tag);
        if (done != null) {
            log(tag + " 已做: " + done);
            return;
        }

        doSignIn(tag, signInList[tag]);
        if (tag == clothStoreSignInTag) {
            var nowDate = new Date().Format("yyyy-MM-dd");
            common.safeSet(nowDate + ":" + clothStoreSignInTag, "done");
            toastLog("完成 " + clothStoreSignInTag);
        }
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

    // dailySignIn.signInTags.push(shoeStoreSignInTag);
    // doShoeStoreSignIn();

    // dailySignIn.signInTags.push(bagStoreSignInTag);
    // doBagStoreSignIn();

    dailySignIn.signInTags.push(campusSignInTag);
    doCampusSignIn();

    dailySignIn.signInTags.push(personalCareSignInTag);
    doPersonalCareSignIn();

    dailySignIn.signInTags.push(favarite618TogetherSignInTag);
    doFavarite618TogetherSignIn();

    // dailySignIn.signInTags.push(everydayRedEnvelopesSignInTag);
    // doEverydayRedEnvelopesSignIn();

    dailySignIn.signInTags.push(collectCubeSignInTag);
    doCollectCubeSignIn();

    dailySignIn.signInTags.push(brandShoppingSignInTag);
    doBrandShoppingSignIn();

    if (isAllSignInComplete()) {
        common.safeSet(nowDate + ":" + dailySignInTag, "done");
        toastLog("完成 " + dailySignInTag);
    }

    commonAction.backToAppMainPage();
}

module.exports = dailySignIn;