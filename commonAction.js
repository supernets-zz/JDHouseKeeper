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

    var tabNames = ["京东电器", "领京豆", "PLUS会员"];
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

module.exports = commonAction;