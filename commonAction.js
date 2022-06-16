var commonAction = {};

var common = require("./common.js");

findRootAppUI = function () {
    var root = packageName(common.destPackageName).className("FrameLayout").findOne(1000);
    if (root == null) {
        toastLog(common.destAppName + " FrameLayout is not exist");
        return null;
    }
    return root;
}

// 判断是否主界面
judgeAppMainPage = function () {
    var root = findRootAppUI();
    if (root == null) {
        return false;
    }

    var tabNames = ["京东电器", "领京豆", "京东到家", "PLUS会员"];
    for (var i = 0; i < tabNames.length; i++) {
        var entry = root.findOne(className("TextView").text(tabNames[i]));
        if (entry == null) {
            log("judgeAppMainPage: " + tabNames[i] + " not exist");
            return false;
        }
    }

    return true;
}

// 多次判断是否进入主页，避免网络延时导致问题
commonAction.loopJudgeAppMainPage = function (sleepTime) {
    var trytimes = 0;
    while (trytimes < 10) {
        var isLoged = judgeAppMainPage();
        if (isLoged) {
            return true;
        }
        trytimes = trytimes + 1;
        sleep(sleepTime);
    }
    return false;
}

commonAction.backToAppMainPage = function () {
    log("backToAppMainPage");
    try{
        var curPkg = currentPackage();
        log("currentPackage(): " + curPkg);
        if (curPkg != common.destPackageName) {
            log("recents: " + recents());
            sleep(1000);
            var btn = text(common.destAppName).findOne(3000);
            if (btn != null) {
                log("switch to " + common.destAppName + ": " + click(btn.bounds().centerX(), btn.bounds().centerY()));
                sleep(1000);
            } else {
                log("no " + common.destAppName + " process");
            }
        }

        var trytimes = 0;
        while (trytimes < 10)
        {
            result = judgeAppMainPage()
            if (result){
                return true;
            }
            var result = back();
            if (!result) {
                toastLog(common.destAppName + " back fail");
                return false;
            }
            trytimes = trytimes + 1;
            sleep(3000);
        }
        return false;
    } catch(e) {
        console.error("mainWorker",e);
    }
}

//在页面停留10秒后返回
commonAction.doOneWalkTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        sleep(1000);
        // 等待离开任务列表页面
        log("等待 " + tasklist[i].Title + " 浏览完成");
        for (var j = 0; j < 10; j++) {
            var curPkg = currentPackage();
            if (curPkg != common.destPackageName) {
                //跳其他app了要跳回来
                log("currentPackage(): " + curPkg);
                app.startActivity({
                    action: "VIEW",
                    data: 'openApp.jdMobile://virtual'
                })
            }
            sleep(1000);
        }
        //回到"更多任务"列表
        back();
        sleep(3000);
        ret = true;
        break;
    }
    return ret;
}

//浏览店铺任务
commonAction.doWalkShopTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        var taskList = common.waitForText("text", "进店并关注", true, 10);
        if (taskList == null) {
            break;
        }

        var subscribeBtn = text("进店并关注").findOne(1000);
        if (subscribeBtn != null) {
            toastLog("点击 进店并关注: " + click(subscribeBtn.bounds().centerX(), subscribeBtn.bounds().centerY()));
            // 等待离开"进店任务"任务列表页面
            common.waitDismiss("text", "进店并关注", 10);
            sleep(5000);
            //取消关注
            var btnSubscribe = packageName(common.destPackageName).className("android.widget.ImageView").desc("已关注按钮").findOne(3000);
            if (btnSubscribe != null) {
                log("点击 已关注: " + click(btnSubscribe.bounds().centerX(), btnSubscribe.bounds().centerY()));
                sleep(1000);
                var btnConfrimUnsub = text("取消关注").findOne(1000);
                if (btnConfrimUnsub != null) {
                    log("点击 取消关注: " + btnConfrimUnsub.click());
                }
            } else {
                log("已关注 not found");
            }
            //从关注的页面返回
            back();
            sleep(3000);
            //离开"进店任务"任务列表页面
            back();
            sleep(3000);
            // 等待离开"进店任务"任务列表页面回到"更多任务"
            common.waitDismiss("text", "进店并关注", 10);
            ret = true;
            break;
        }
    }
    return ret;
}

//进入元宝中心
commonAction.gotoCoinCenter = function () {
    log("gotoCoinCenter");
    var ret = false;
    var tabList = packageName(common.destPackageName).id("hp3_tab_img").find();
    if (tabList.length != 4) {
        commonAction.backToAppMainPage();
        return ret;
    }

    var mineTab = tabList[3];
    var clickRet = click(mineTab.bounds().centerX(), mineTab.bounds().centerY());
    log("点击 我的: " + clickRet);
    if (clickRet == false) {
        commonAction.backToAppMainPage();
        return ret;
    }
    sleep(1000);

    var coinCenter = common.waitForText("text", "元宝中心", true, 10);
    if (coinCenter == null) {
        commonAction.backToAppMainPage();
        return ret;
    }

    clickRet = click(coinCenter.bounds().centerX(), coinCenter.bounds().centerY() - coinCenter.bounds().height());
    log("点击 元宝中心: " + clickRet);
    if (clickRet == false) {
        commonAction.backToAppMainPage();
        return ret;
    }

    sleep(1000);
    coinCenter = common.waitForText("text", "我的元宝，今日已赚", true, 10);
    if (coinCenter == null) {
        commonAction.backToAppMainPage();
        return ret;
    }

    log("我的元宝: " + coinCenter.parent().child(0).text() + ", 今日已赚: " + coinCenter.parent().child(3).text());

    //如果弹提示框了，点关闭
    var getBtn = textMatches(/去领步数/).findOne(1000);
    if (getBtn != null) {
        var dlgCloseBtn = getBtn.parent().parent().child(1);
        log(getBtn.text() + " 关闭: " + click(dlgCloseBtn.bounds().centerX(), dlgCloseBtn.bounds().centerY()));
    }

    // 元宝中心右上角金蛋
    var childNum = coinCenter.parent().parent().parent().parent().childCount();
    if (childNum == 6) {
        var goldEggBtn = coinCenter.parent().parent().parent().parent().child(5);
        //连击三次有惊喜哦
        for (var i = 0; i < 3; i++) {
            log(goldEggBtn.click());
            sleep(200);
        }
        sleep(1000);
        var tips = textMatches(/看直播\d+秒得\d+元宝|我知道了/).findOne(1000);
        if (tips != null) {
            var closeBtn = tips.parent().parent().child(2);
            log(closeBtn.click());
            sleep(1000);
        }
    } else {
        log("没有金蛋");
    }

    ret = true;
    return ret;
}

commonAction.scrollThrough = function (txt, timeout) {
    //超时返回false
    var startTime = parseInt(new Date().getTime() / 1000);
    var nowTime = parseInt(new Date().getTime() / 1000);
    for (;;) {
        var slide = textContains(txt).visibleToUser(true).findOne(1000);
        nowTime = parseInt(new Date().getTime() / 1000);
        log("slide tips: " + (slide != null) + ", " + (nowTime - startTime) + "s");
        if (slide != null) {
            log("slide.bounds().height(): " + slide.bounds().height());
        }
        if (slide == null || nowTime - startTime > timeout || slide != null && slide.bounds().height() < 10) {
            break;
        }
        swipe(device.width / 5, device.height * 13 / 16, device.width / 5, device.height * 11 / 16, Math.floor(Math.random() * 200) + 200);
        sleep(1000);
    }

    if (nowTime - startTime >= timeout) {
        return false;
    }

    return true;
}

//成功返回true，超时或异常返回false，最后会返回上一个页面
commonAction.doShortBrowseTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        sleep(10000);
        //回到任务列表
        back();
        ret = true;
        break;
    }
    return ret;
}

//成功返回true，超时或异常返回false，最后会返回上一个页面
commonAction.doBrowseTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        // 等待离开任务列表页面
        if (common.waitForText("textContains", "浏览", true, 10)) {
            log("等待 " + tasklist[i].Title + " 浏览完成，60s超时");
            sleep(5000);
            var browseRet = commonAction.scrollThrough("浏览", 60);
            //回到任务列表
            back();
            if (browseRet) {
                log("浏览 " + tasklist[i].Title + " 完成");
                ret = true;
            } else {
                log("60s timeout");
            }
            break;
        } else {
            break;
        }
    }
    return ret;
}

//成功返回true，超时或异常返回false，最后会返回上一个页面
commonAction.doSearchTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        // 等待离开任务列表页面
        var searchBtn = common.waitForText("text", "搜索", true, 10)
        if (searchBtn != null) {
            sleep(1000);
            var inputRet = setText("李佳琦");
            if (inputRet) {
                log("点击 搜索: " + click(searchBtn.bounds().centerX(), searchBtn.bounds().centerY()));
                sleep(3000);
                //回到任务列表
                back();
                sleep(1000);
                back();
                ret = true;
                break;
            }
        } else {
            break;
        }
    }
    return ret;
}

//成功返回true，超时或异常返回false，最后会返回上一个页面
commonAction.doWatchTasks = function (tasklist) {
    var ret = false;
    var swipeChoice = [
        [device.height * 7 / 8, device.height / 8],
        [device.height * 5 / 6, device.height / 8],
        [device.height * 3 / 4, device.height / 8]
    ];
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        // 等待离开任务列表页面
        var countdown = common.waitForText("text", "后完成", true, 10)
        if (countdown != null) {
            var lastLeftTime = parseInt(countdown.parent().child(1).text().match(/\d+/));
            var interval = 3000;    //interval加上红包雨弹窗提示检测2秒正好5秒一个周期
            var startTime = parseInt(new Date().getTime() / 1000);
            var nowTime = parseInt(new Date().getTime() / 1000);
            var closeBtn = id("taolive_close_btn").findOne(1000);
            var startTick = new Date().getTime();
            for (;;) {
                var prog = text("6/6").findOne(1000);
                var countdown = text("后完成").findOne(1000);
                log("pass" + (nowTime - startTime) + "s, countdown: " + (countdown != null) + ", 6/6 exists: " + (prog != null) + ", live: " + (closeBtn != null));
                if (countdown == null) {
                    if (new Date().getTime() - startTick > 10 * 1000) {
                        break;
                    }
                    captureScreen("/sdcard/Download/watch" + (new Date().Format("yyyy-MM-dd_HH:mm:ss")) + ".png");
                }

                nowTime = parseInt(new Date().getTime() / 1000);
                //十五分钟超时，最长的任务是8分钟
                if (nowTime - startTime > 15 * 60) {
                    break;
                }
                if (prog != null && closeBtn != null) {
                    sleep(20000);   //等进度条走完，直播才需要点击领取
                    log("click golden egg " + id("gold_countdown_container").findOne().click());
                    sleep(2000);
                } else {
                    if (closeBtn == null) {
                        var swipeXY = swipeChoice[Math.floor(Math.random() * swipeChoice.length)];
                        var leftTime = parseInt(countdown.parent().child(1).text().match(/\d+/));
                        if (leftTime == lastLeftTime) {
                            log("swipe " + swipe(device.width / 2, swipeXY[0], device.width / 2, swipeXY[1], 1000));
                            lastLeftTime = leftTime;
                        } else {
                            lastLeftTime = leftTime;
                        }
                    }
                    sleep(interval);
                }

                //红包雨弹窗提示
                var rule = text("活动规则").findOne(1000);
                if (rule != null) {
                    var dlgCloseBtn = rule.parent().parent().parent().child(0);
                    log("红包雨弹窗 关闭: " + dlgCloseBtn.click());
                }

                var tryAgainBtn = text("再来一次").findOne(1000);
                if (tryAgainBtn != null) {
                    var dlgCloseBtn = tryAgainBtn.parent().parent().parent().child(1);
                    log("啊哦，这次没抢到红包 关闭: " + click(dlgCloseBtn.bounds().centerX(), dlgCloseBtn.bounds().centerY()));
                }
            }

            if (closeBtn != null) {
                log("click close " + id("taolive_close_btn").findOne().click());
            } else {
                back();
            }
            if (nowTime - startTime < 15 * 60) {
                ret = true;
            }
            break;
        } else {
            break;
        }
    }
    return ret;
}

module.exports = commonAction;