"ui";
const appName = "jdHouseKeeper";
const destAppName = "京东"
const jdPackageName="com.jingdong.app.mall"
const execInterval = 15 * 60; //检查间隔时间，单位：秒

var shutdownFlag = threads.atomic();
var storagelock = threads.lock();
var localStorages=storages.create(appName+":global");
var background = threads.disposable();

Date.prototype.Format = function (fmt) {
    var o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'H+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'S+': this.getMilliseconds()
    };
    //因为date.getFullYear()出来的结果是number类型的,所以为了让结果变成字符串型，下面有两种方法：
    if (/(y+)/.test(fmt)) {
        //第一种：利用字符串连接符“+”给date.getFullYear()+''，加一个空字符串便可以将number类型转换成字符串。
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            //第二种：使用String()类型进行强制数据类型转换String(date.getFullYear())，这种更容易理解。
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(String(o[k]).length)));
        }
    }
    return fmt;
};
  
function safeGet(key) {
    var flag = false;
    try{
        flag = storagelock.tryLock();
        var data = null;
        if (flag) {
            var exist = localStorages.contains(key);
            if (exist) {
                data = localStorages.get(key);
            }
        }
        return data;
    } finally {
        if (flag) {
            storagelock.unlock();
        }
    }
}
function safeSet(key,stringValue) {
    var flag = false;
    try {
        flag = storagelock.tryLock();
        if (flag) {
            localStorages.put(key,stringValue);
        }
    } finally {
        if (flag) {
            storagelock.unlock();
        }
    }
}

// 从存储中获取phone
console.setGlobalLogConfig({
    "file": "/sdcard/Download/jdhousekeeper-log.txt"
});
setScreenMetrics(720, 1440);

ui.statusBarColor("#FF4FB3FF")
function main_page(){
    toastLog("start main page");
    ui.layout(
        <drawer id="drawer">
            <vertical>
                <appbar>
                    <toolbar id="toolbar" bg="#ff4fb3ff" title="{{appName}}"/>
                </appbar>
                <vertical gravity="center" layout_weight="1">
                    <vertical padding="10 6 0 6" bg="#ffffff" w="*" h="auto" margin="0 5" elevation="1dp">
                        <Switch id="autoService" w="*" checked="{{auto.service != null}}" textColor="#666666" text="ACCESSIBILITY SETTINGS"/>
                    </vertical>
                </vertical>
                <button id="ctrl" text="START" tag="ScriptTag" color="#ffffff" bg="#FF4FB3FF" foreground="?selectableItemBackground"/>
            </vertical>
    </drawer>
    );
}
// 监听线程
threads.start(function(){
    //在子线程中调用observeKey()从而使按键事件处理在子线程执行
    toastLog("监听按键启动");
    events.observeKey();
    events.on("key_down", function(keyCode, events){
        //音量键关闭脚本
        if(keyCode == keys.volume_up){
            toastLog("通知结束脚本");
            shutdownFlag.getAndIncrement();
        }
    });
});
main_page();

events.on("exit", function(){
    log("STOP");
    device.cancelKeepingAwake();
});

//无障碍开关监控
ui.autoService.setOnCheckedChangeListener(function(widget,checked) {
    if(checked&&!auto.service) {     
        app.startActivity({
            action: "android.settings.ACCESSIBILITY_SETTINGS"
        });
    }
    if(!checked&&auto.service)auto.service.disableSelf()
    ui.autoService.setChecked(auto.service!=null) 
});

//回到本界面时，resume事件会被触发
ui.emitter.on("resume",()=>{
    // 此时根据无障碍服务的开启情况，同步开关的状态
    ui.autoService.checked = auto.service != null;
});

ui.ctrl.click(()=>{
    if(!auto.service){
        toastLog("Please check accessibility");
        return;
    }

    toastLog("Start workMain");
    background.setAndNotify(1);
});

// 后台运行主线程
threads.start(function(){
    // 阻塞,等待连接条件
    var flag = background.blockedGet();
	log("启动京东管家主线程:");
    requestScreenCapture();
    while (flag > 0) {
        var ret = false;
        try {
            var shutdown = shutdownFlag.get();
            if (shutdown > 0) {
                toastLog("Exit script now...");
                break;
            }
            var isScreenOn = device.isScreenOn();
            log("Start now, isScreenOn: " + isScreenOn);
            if (!isScreenOn) {
                device.wakeUp();
                sleep(2000);
                log("swipe to unlock: " + swipe(device.width / 2, device.height * 7 / 8, device.width / 2, device.height * 3 / 8, 300));
            }
            device.keepScreenOn();
            ret = mainWorker();
            device.cancelKeepingAwake();
        } catch(e) {
            console.error("main err ",e);
            device.cancelKeepingAwake();
        }
        var allComplete = isAllDailyTaskComplete();
        log("isAllDailyTaskComplete: " + allComplete + ", mainWorker: " + ret);
        if (allComplete && ret) {
            log(execInterval + "s后进行下一次执行");
            sleep(execInterval*1000);
        }
    }
});

function queryList(json,arr) {
    for (var i = 0; i < json.childCount(); i++) {
        var sonList = json.child(i);
        if (sonList.childCount() == 0) {
            arr.push(json.child(i));
        } else {
            queryList(sonList, arr);
        }
    }
    return arr;
}

function listAll(){
    sleep(3000);
    //var list = className("ListView").findOne();
    var list = className("FrameLayout").findOne();
    var arr=[]
    queryList(list,arr);
    for(var k=0;k<arr.length;k++){
        log("第"+k+"个子控件"+arr[k]);
    }
}

function findRootJDUi() {
    var root = packageName(jdPackageName).className("FrameLayout").findOne(1000);
    if (root == null) {
        toastLog("JD FrameLayout is not exist");
        return null;
    }
    return root;
}
/*
function stopApp(pname){
    var sh = new Shell(false);
    var cmd = "am force-stop "+pname;
    sh.exec(cmd);
    sh.exit();
}
*/
// 判断是否主界面
function JudgeJDMainPage(){
    var root = findRootJDUi();
    if (root == null) {
        return false;
    }

    var tabNames = ["京东电器", "领京豆", "京东到家", "PLUS会员"];
    for (var i = 0; i < tabNames.length; i++) {
        var entry = root.findOne(className("TextView").text(tabNames[i]));
        if (entry == null) {
            log("JudgeJDMainPage: " + tabNames[i] + " not exist");
            return false;
        }
    }
    toastLog("JD main page");
    return true;
}

function WaitForText(method, txt, sec) {
    var obj = null;
    for (var i = 0; i < sec && obj == null; i++) {
        obj = eval(method + "(\"" + txt + "\").visibleToUser(true).findOne(1000)");
        if (obj == null) {
            log("等待 " + txt + " 出现");
        }
    }
    return obj;
}

function WaitForTextMatches(regex, sec) {
    var obj = null;
    for (var i = 0; i < sec && obj == null; i++) {
        obj = eval("textMatches(" + regex + ").visibleToUser(true).findOne(1000)");
        if (obj == null) {
            log("等待 " + regex + " 出现");
        }
    }
    return obj;
}

//返回是否超时
function WaitDismiss(method, txt, sec) {
    // 等待离开"进入并关注"任务列表页面
    var obj = null;
    for (var i = 0; i < sec; i++) {
        obj = eval(method + "(\"" + txt + "\").findOne(1000)");
        if (obj == null) {
            log("等待 " + txt + " 消失");
            return false;
        }
    }
    return true;
}

//Plus会员店每日签到领京豆
function getPlusDailyBean() {
    // 我的-> 会员店-> 天天领京豆-> 立即翻牌，每日一次
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = safeGet(nowDate + ":京东会员每日领京豆");
    if (done != null) {
        log("京东会员每日领京豆 已做: " + done);
        return;
    }

    var mineTab = text("我的").packageName(jdPackageName).findOne(30000);
    if (mineTab == null){
        toastLog("我的 tab not exist");
        backJDMainPage();
        return;
    }

    var clickRet = click(mineTab.bounds().centerX(), mineTab.bounds().centerY() - mineTab.bounds().height());
    log("点击 我的: " + clickRet + ", 并等待30s超时");
    if (!clickRet) {
        backJDMainPage();
        return;
    }

    var memberShop = WaitForText("text", "会员店", 30);
    if (memberShop == null) {
        backJDMainPage();
        return;
    }

    var bound = memberShop.parent().parent().parent().bounds();
    clickRet = click(bound.centerX(), bound.centerY());
    log("点击 会员店: " + clickRet + ", 并等待30s超时");

    memberShop = WaitForText("text", "立即抢购", 30);
    if (memberShop == null) {
        backJDMainPage();
        return;
    }

    //等待天天领京豆banner加载
    sleep(1000);
//     var getBeanBtn = packageName(jdPackageName).className("android.view.View").depth(13).drawingOrder(0).indexInParent(1).find();
//     if (getBeanBtn.length != 1){
//         toastLog("天天领京豆 not exist");
//         return false;
//     }

// //    clickRet = click(getBeanBtn[0].bounds().centerX(), getBeanBtn[0].bounds().centerY());
//     log("点击 天天领京豆: " + getBeanBtn[0].click() + ", 并等待30s超时");
    clickRet = click(device.width - memberShop.bounds().left, memberShop.bounds().top - memberShop.bounds().height() * 6);
    if (!clickRet) {
        backJDMainPage();
        return;
    }

    memberShop = WaitForText("text", "连续签到，赢大额京豆", 30);
    if (memberShop == null) {
        backJDMainPage();
        return;
    }

    log("等待 立即翻牌 或 今日已签到 出现");
    var i = 0;
    var recordDone = null;
    for (; i < 10; i++) {
        var sign = text("立即翻牌").findOne(1000);
        var done = text("今日已签到").findOne(1000);
        if (sign != null) {
            clickRet = sign.click();
            log("点击 立即翻牌: " + clickRet);
            //等一下结果
            sleep(5000);
            recordDone = "done";
            break;
        }

        if (done != null) {
            log("今日已签到");
            recordDone = "done";
            break;
        }
        sleep(1000);
    }

    safeSet(nowDate + ":京东会员每日领京豆", recordDone);
    toastLog("完成 京东会员每日领京豆");
    backJDMainPage();
}

//种豆得豆去逛逛任务
function doOneWalkTasks(tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        // 等待离开任务列表页面
        if (!WaitDismiss("text", tasklist[i].BtnName, 10)) {
            log("等待 " + tasklist[i].Title + " 浏览完成");
            for (var j = 0; j < 10; j++) {
                var curPkg = currentPackage();
                if (curPkg != jdPackageName) {
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
            ret = true;
            break;
        }
    }
    return ret;
}

//种豆得豆去去关注任务
function doSubscribeTasks(tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        var taskList = WaitForText("text", "进入并关注", 10);
        if (taskList == null) {
            break;
        }

        log("往上划动半个屏幕: " + swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 300));
        var subscribeBtn = text("进入并关注").visibleToUser(true).findOne(1000);
        if (subscribeBtn != null) {
            log("点击 进入并关注: " + subscribeBtn.click());
            // 等待离开"进入并关注"任务列表页面
            WaitDismiss("text", "进入并关注", 10);
            sleep(5000);
            //从关注的页面返回
            back();
            sleep(3000);
            //离开"进入并关注"任务列表页面
            back();
            sleep(3000);
            // 等待离开"进入并关注"任务列表页面回到"更多任务"
            WaitDismiss("text", "进入并关注", 10);
            ret = true;
            break;
        }
    }
    return ret;
}

//种豆得豆浏览店铺任务
function doWalkShopTasks(tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        var taskList = WaitForText("text", "进店并关注", 10);
        if (taskList == null) {
            break;
        }

        var subscribeBtn = text("进店并关注").findOne(1000);
        if (subscribeBtn != null) {
            toastLog("点击 进店并关注: " + click(subscribeBtn.bounds().centerX(), subscribeBtn.bounds().centerY()));
            // 等待离开"进店任务"任务列表页面
            WaitDismiss("text", "进店并关注", 10);
            sleep(5000);
            //取消关注
            var btnSubscribe = id("com.jd.lib.jshop.feature:id/sb").findOne(3000);
            if (btnSubscribe != null) {
                log("点击 已关注: " + btnSubscribe.click());
                sleep(1000);
                var btnConfrimUnsub = id("com.jingdong.app.mall:id/bq").findOne(1000);
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
            WaitDismiss("text", "进店并关注", 10);
            ret = true;
            break;
        }
    }
    return ret;
}

//种豆得豆挑选商品任务
function doPickupMerchantTasks(tasklist) {
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));

        //等到商品列表出现
        var merchantList = WaitForText("text", "已获得", 5);
        if (merchantList == null) {
            backJDMainPage();
            return;
        }
        
        merchantList = packageName(jdPackageName).className("android.widget.TextView").depth(16).drawingOrder(3).indexInParent(3).find();

        //选择左侧的商品点击
        log("商品数: " + merchantList.length);
        var validMerchant = packageName(jdPackageName).className("android.widget.TextView").depth(16).drawingOrder(3).indexInParent(3).visibleToUser(true).find();
        //记录在屏幕内第一个商品的坐标
        var clickx = validMerchant[0].bounds().centerX();
        var clicky = validMerchant[0].bounds().centerY() + validMerchant[0].bounds().height() * 2;
        for (var ll = 0; ll < 6; ll++) {
            toastLog("点击左侧商品: " + click(clickx, clicky));
            sleep(1000);
            for (var l = 0; l < 10; l++) {
                var btnLike = text("收藏").visibleToUser(true).findOne(1000);
                if (btnLike == null) {
                    log("上划屏幕找 收藏: " + swipe(device.width / 2, device.height / 2, device.width / 2, device.height / 3, 500));
                    sleep(1000);
                    continue;
                }
                log("取消收藏: " + click(btnLike.bounds().centerX(), btnLike.bounds().centerY()));
                back();
                sleep(3000);
                break;
            }

            //可能上的不是一般商品了
            if (l == 10) {
                throw "doPickupMerchantTasks: 非正常商品"
            }
            WaitDismiss("text", "收藏", 10);
            //从右向左滑动
            swipe(device.width * 3 / 4, device.height / 2, device.width / 4, device.height / 2, 500);
            sleep(1000);
        }
    }
    //回到"更多任务"列表
    back();
}

//种豆得豆每日任务
function doBeanDailyTasks() {
    log("doBeanDailyTasks");
    // 领京豆-> 种豆得豆
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = safeGet(nowDate + ":种豆得豆每日任务");
    if (done != null) {
        log("种豆得豆每日任务 已做: " + done);
        return;
    }

    toast("doBeanDailyTasks");
    var getJDBean = text("领京豆").packageName(jdPackageName).findOne(30000);
    if (getJDBean == null){
        toastLog("领京豆 not exist");
        backJDMainPage();
        return;
    }

    var clickRet = click(getJDBean.bounds().centerX(), getJDBean.bounds().centerY() - getJDBean.bounds().height());
    log("点击 领京豆: " + clickRet + ", 并等待5s超时");
    if (!clickRet) {
        backJDMainPage();
        return;
    }

    getJDBean = WaitForText("text", "规则", 5);
    if (getJDBean == null) {
        backJDMainPage();
        return;
    }

    // 定位 升级赚京豆 红色按钮
    // packageName(jdPackageName).className("android.view.ViewGroup").depth(16).drawingOrder(12).indexInParent(12).waitFor();
    // var upgradeEarnBean = packageName(jdPackageName).className("android.view.ViewGroup").depth(16).drawingOrder(12).indexInParent(12).find();
    // log("点击 种豆得豆: " + click(upgradeEarnBean[0].bounds().centerX() + device.width / 2 - 30, upgradeEarnBean[0].bounds().centerY()));
    log("点击 种豆得豆: " + click(getJDBean.bounds().left, getJDBean.bounds().centerY() + getJDBean.bounds().height() * 16));
    var moreTasks = WaitForText("textContains", "更多任务", 5);
    if (moreTasks == null) {
        backJDMainPage();
        return;
    }

    var clickRet = click(moreTasks.bounds().centerX(), moreTasks.bounds().centerY() - moreTasks.bounds().height());
    log("点击 更多任务: " + clickRet);
    WaitForText("textContains", "已获得", 5);

    // 做完任务后列表会刷新，不能用旧的坐标去点击，需要重新获取一下任务列表
    // 除了去邀请以及两个去签到任务以外其他都做完了就算完成
    for (;;) {    
        var oneWalkTaskList = [];  //去逛逛任务列表，待够时间回来
        var subscribeTaskList = []; //去关注任务列表，需要多次折返
        var walkShopTaskList = [];  //浏览店铺，需要多次折返
        var pickupMerchantTaskList = [];  //挑选商品
        var tips = textMatches(/已获得\d+\/\d+瓶/).find();
        log("总任务数: " + tips.length);
        if (tips.length == 0) {
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            break;
        }
        tips.forEach(function(tv) {
            var objs = [];
            queryList(tv.parent().parent(), objs);
            if (objs[6].text() != "去邀请" && 
                objs[6].text() != "去签到" && 
                objs[6].text() != "已完成") {
                var obj = {};
                obj.Title = objs[1].text();
                obj.Progress = objs[3].text();
                obj.Tips = objs[5].text();
                obj.BtnName = objs[6].text();
                obj.Button = objs[6];
                if (obj.BtnName == "去关注") {
                    subscribeTaskList.push(obj);
                } else if (obj.Title == "浏览店铺") {
                    walkShopTaskList.push(obj);
                } else if (obj.Title == "挑选商品") {
                    pickupMerchantTaskList.push(obj);
                } else if (obj.Title != "免费水果") {
                    oneWalkTaskList.push(obj);
                }
                log("未完成任务" + (oneWalkTaskList.length + subscribeTaskList.length + walkShopTaskList.length + pickupMerchantTaskList.length) + ": " + obj.Title + ", " + obj.Progress + ", " + obj.BtnName + ", (" + obj.Button.bounds().centerX() + ", " + obj.Button.bounds().centerY() + ")");
            } else {
                log("跳过任务: " + objs[1].text() + ", " + objs[3].text() + ", " + objs[6].text());
            }
        });
    
        if (oneWalkTaskList.length + subscribeTaskList.length + walkShopTaskList.length + pickupMerchantTaskList.length == 0 && tips.length != 0) {
            safeSet(nowDate + ":种豆得豆每日任务", "done");
            toastLog("完成 种豆得豆每日任务");
            break;
        }

        if (doOneWalkTasks(oneWalkTaskList)) {
            sleep(2000);
            continue;
        }
        if (doSubscribeTasks(subscribeTaskList)) {
            sleep(2000);
            continue;
        }
        if (doWalkShopTasks(walkShopTaskList)) {
            sleep(2000);
            continue;
        }
        doPickupMerchantTasks(pickupMerchantTaskList);
        // 任务列表关闭按钮坐标
        // var bound = textContains("当前通过任务获得").findOne(1000).bounds();
        // log("关闭任务列表: " + click(device.width - 60, bound.centerY() - 88));
        //break;
    }

    backJDMainPage();
}

function doBeanRoutineTasks() {
    toastLog("doBeanRoutineTasks");
    // 领京豆-> 种豆得豆
    var getJDBean = text("领京豆").packageName(jdPackageName).findOne(30000);
    if (getJDBean == null){
        toastLog("领京豆 not exist");
        backJDMainPage();
        return;
    }

    var clickRet = click(getJDBean.bounds().centerX(), getJDBean.bounds().centerY() - getJDBean.bounds().height());
    log("点击 领京豆: " + clickRet + ", 并等待5s超时");
    if (!clickRet) {
        backJDMainPage();
        return;
    }

    getJDBean = WaitForText("text", "规则", 5);
    if (getJDBean == null) {
        backJDMainPage();
        return;
    }

    // 定位 升级赚京豆 红色按钮
    // packageName(jdPackageName).className("android.view.ViewGroup").depth(16).drawingOrder(12).indexInParent(12).waitFor();
    // var upgradeEarnBean = packageName(jdPackageName).className("android.view.ViewGroup").depth(16).drawingOrder(12).indexInParent(12).find();
    // log("点击 种豆得豆: " + click(upgradeEarnBean[0].bounds().centerX() + device.width / 2 - 30, upgradeEarnBean[0].bounds().centerY()));
    log("点击 种豆得豆: " + click(getJDBean.bounds().left, getJDBean.bounds().centerY() + getJDBean.bounds().height() * 16));
    var moreTasks = WaitForText("textContains", "更多任务", 5);
    if (moreTasks == null) {
        backJDMainPage();
        return;
    }

    //上划一点点露出下面的收取营养液
    swipe(device.width / 2, device.height * 7 / 8, device.width / 2, device.height * 5 / 8, 300);
    // 领完营养液后会刷新，需要重新获取一下可领营养液
    // 除了去邀请以及两个去签到任务以外其他都做完了就算完成
    for (;;) {
        var beans = textMatches(/x\d+/).find();
        beans.forEach(function(tv) {
            if (tv.text() != "x0") {
                log(tv.text() + ": " + click(tv.bounds().left, tv.bounds().centerY()));
                sleep(300);
            }
        });
        if (beans.length == 1 && beans[0].text() == "x0") {
            break;
        }
    }

    backJDMainPage();
}

//升级赚京豆每日任务
function doUpgradeEarnBeanDailyTasks() {
    log("doUpgradeEarnBeanDailyTasks");
    // 领京豆-> 升级赚京豆
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = safeGet(nowDate + ":升级赚京豆每日任务");
    if (done != null) {
        log("升级赚京豆每日任务 已做: " + done);
        return;
    }

    toast("doUpgradeEarnBeanDailyTasks");
    var getJDBean = text("领京豆").packageName(jdPackageName).findOne(30000);
    if (getJDBean == null){
        toastLog("领京豆 not exist");
        backJDMainPage();
        return;
    }

    var clickRet = click(getJDBean.bounds().centerX(), getJDBean.bounds().centerY() - getJDBean.bounds().height());
    log("点击 领京豆: " + clickRet + ", 并等待5s超时");
    if (!clickRet) {
        backJDMainPage();
        return;
    }

    getJDBean = WaitForText("text", "规则", 5);
    if (getJDBean == null) {
        backJDMainPage();
        return;
    }

    // 做完任务后列表会刷新，不能用旧的坐标去点击，需要重新获取一下任务列表
    // 除了双签领豆任务以外其他都做完了就算完成
    for (;;) {
        // 定位 升级赚京豆 红色按钮
        packageName(jdPackageName).className("android.view.ViewGroup").depth(16).drawingOrder(12).indexInParent(12).waitFor();
        var upgradeEarnBean = packageName(jdPackageName).className("android.view.ViewGroup").depth(16).drawingOrder(12).indexInParent(12).find();
        log("点击 升级赚京豆: " + click(upgradeEarnBean[0].bounds().centerX(), upgradeEarnBean[0].bounds().centerY()));
        sleep(2000);
        var upgradeTasks = WaitForTextMatches(/做任务再升一级.*/, 5);
        if (upgradeTasks == null) {
            backJDMainPage();
            return;
        }

        var oneWalkTaskList = [];  //去逛逛任务列表，待够时间回来
        var tips = textMatches(/.*\(\d\/\d\).*/).find();
        log("总任务数: " + tips.length);
        if (tips.length == 0) {
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            break;
        }
        tips.forEach(function(tv) {
            var objs = [];
            queryList(tv.parent().parent(), objs);
            if (/*objs[1].text().indexOf("双签领豆") == -1 && */objs[5].text() != "已完成" && /升级.*会员.*/.test(objs[1].text()) == false) {
                var obj = {};
                obj.Title = objs[1].text();
                obj.Tips = objs[2].text();
                obj.BtnName = objs[5].text();
                obj.Button = objs[5];
                oneWalkTaskList.push(obj);
                log("未完成任务" + oneWalkTaskList.length + ": " + obj.Title + ", " + obj.BtnName + ", (" + obj.Button.bounds().centerX() + ", " + obj.Button.bounds().centerY() + ")");
            } else {
                log("跳过任务: " + objs[1].text() + ", " + objs[2].text() + ", " + objs[5].text());
            }
        });

        if (oneWalkTaskList.length == 0) {
            safeSet(nowDate + ":升级赚京豆每日任务", "done");
            toastLog("完成 升级赚京豆每日任务");
            break;
        }

        if (doOneWalkTasks(oneWalkTaskList)) {
            sleep(2000);
            continue;
        }

        // 任务列表关闭按钮坐标
        log("关闭升级赚京豆任务列表: " + click(device.width - 60, upgradeTasks[0].bounds().top - upgradeTasks[0].bounds().height() * 7));
    }

    backJDMainPage();
}

//宠汪汪关注频道任务
function doSubscibeChannelTasks(tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        var taskList = WaitForText("text", "进入并关注", 10);
        if (taskList == null) {
            break;
        }

        for (;;) {
            var totalSubscribeBtns = text("进入并关注").find();
            var validSubscribeBtns = text("进入并关注").visibleToUser(true).find();

            log("进入并关注: " + totalSubscribeBtns.length + ", 可视: " + validSubscribeBtns.length);
            if (totalSubscribeBtns.length == validSubscribeBtns.length && totalSubscribeBtns.length == 0) {
                back();
                ret = true;
                return;
            }

            if (validSubscribeBtns.length > 0) {
                var subscribeBtn = validSubscribeBtns[0];
                toastLog("点击 进入并关注: " + click(subscribeBtn.bounds().centerX(), subscribeBtn.bounds().centerY()));
                // 等待离开"关注频道"任务列表页面
                WaitDismiss("text", "进入并关注", 10);
                sleep(10000);
                //从关注的页面返回
                back();
                sleep(3000);
                WaitForText("text", "关注频道任务", 10);
            } else {
                log("往上划动半个屏幕: " + swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 300));
                sleep(1000);
            }
        }
    }
    return ret;
}

function filterTaskList(todoTasks, validTaskNames) {
    var ret = [];
    for (var i = 0; i < todoTasks.length; i++) {
        if (validTaskNames.indexOf(todoTasks[i].Title) != -1) {
            ret.push(todoTasks[i]);
        }
    }
    return ret;
}

//宠汪汪每日任务
function doPetDailyTasks() {
    log("doPetDailyTasks");
    // 我的-> 宠汪汪
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = safeGet(nowDate + ":宠汪汪每日任务");
    if (done != null) {
        log("宠汪汪每日任务 已做: " + done);
        return;
    }

    toast("doPetDailyTasks");
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://h5.m.jd.com/babelDiy/Zeus/2wuqXrZrhygTQzYA7VufBEpj4amH/index.html","M_sourceFrom":"mxz","msf_type":"auto"}'
    })

    var clickRet = false;
    var petBtn = WaitForText("text", "积分超值兑换", 10);
    if (petBtn == null) {
        backJDMainPage();
        return;
    }

    // 帮忙喂养：click(device.width / 6, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 汪汪大比拼：click(device.width / 5, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 领狗粮：click(device.width / 2, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 喂养：click(device.width * 5 / 6, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 帮忙喂养-> 回家：click(100, device.height - 250)
    // 帮忙喂养-> 帮ta喂养：click(device.width - 100, device.height - 250)
    clickRet = click(device.width / 2, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5));
    log("点击 领狗粮: " + clickRet + ", 并等待10s超时");

    // 做完任务后列表会刷新，不能用旧的坐标去点击，需要重新获取一下任务列表
    // 除了去邀请以及两个去签到任务以外其他都做完了就算完成
    for (;;) {    
        petBtn = WaitForText("textContains", "做任务得狗粮", 10);
        if (petBtn == null) {
            backJDMainPage();
            return;
        }

        sleep(3000);
        var oneWalkTaskList = [];  //逛逛会场、关注商品任务列表，待够时间回来
        var subscribeShopTaskList = []; //关注店铺任务列表
        var subscribeChannelTaskList = []; //关注频道任务列表
        var totalTasks = textMatches(/.*[奖励|得]\d+g狗粮|.*可领\d+g狗粮.*|.*奖励狗粮\d+g/).find();
        var validTasks = textMatches(/.*[奖励|得]\d+g狗粮|.*可领\d+g狗粮.*|.*奖励狗粮\d+g/).visibleToUser(true).find();

        var validTaskNames = [];
        for (var i = 0; i < validTasks.length; i++) {
            var objs = [];
            queryList(validTasks[i].parent(), objs);
            validTaskNames.push(objs[1].text());
        }
        toastLog("任务数: " + totalTasks.length + ", 可见: " + validTasks.length + ", " + validTaskNames);

        for (var i = 0; i < totalTasks.length; i++) {
            var objs = [];
            queryList(totalTasks[i].parent(), objs);
            if (objs[3].text() != "去邀请" && 
                objs[3].text() != "去参与" && 
                objs[3].text() != "明天再来" &&
                objs[3].text() != "领取" &&
                objs[3].text() != "已完成" &&
                objs[3].text() != "去喂食") {
                var obj = {};
                obj.Title = objs[1].text();
                obj.Tips = objs[2].text();
                obj.BtnName = objs[3].text();
                obj.Button = objs[3];
                if (obj.Title.indexOf("关注店铺") != -1) {
                    subscribeShopTaskList.push(obj);
                } else if (obj.Title.indexOf("关注频道") != -1) {
                    subscribeChannelTaskList.push(obj);
                // } else if (obj.Title.indexOf("帮好友") != -1) {
                //     feedTaskList.push(obj);
                } else if (obj.Title.indexOf("逛逛会场") != -1 || obj.Title.indexOf("关注商品") != -1 || obj.Title.indexOf("幸运任务") != -1) {
                    oneWalkTaskList.push(obj);
                }
                log("未完成任务" + (oneWalkTaskList.length + subscribeShopTaskList.length + subscribeChannelTaskList.length) + ": " + obj.Title + ", " + obj.BtnName + ", (" + obj.Button.bounds().centerX() + ", " + obj.Button.bounds().centerY() + ")");
            } else {
                log("跳过任务: " + objs[1].text() + ", " + objs[3].text());
            }
        }

        if (oneWalkTaskList.length + subscribeShopTaskList.length + subscribeChannelTaskList.length == 0) {
            safeSet(nowDate + ":宠汪汪每日任务", "done");
            toastLog("完成 宠汪汪每日任务");
            break;
        }

        oneWalkTaskList = filterTaskList(oneWalkTaskList, validTaskNames)
        if (doOneWalkTasks(oneWalkTaskList)) {
            sleep(5000);
            continue;
        }

        subscribeShopTaskList = filterTaskList(subscribeShopTaskList, validTaskNames)
        if (doWalkShopTasks(subscribeShopTaskList)) {
            sleep(5000);
            continue;
        }

        subscribeChannelTaskList = filterTaskList(subscribeChannelTaskList, validTaskNames)
        if (doSubscibeChannelTasks(subscribeChannelTaskList)) {
            sleep(5000);
            continue;
        }

        log("往上划动半个屏幕: " + swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 300));
        sleep(1000);

        // doPickupMerchantTasks(pickupMerchantTaskList);
        // 任务列表关闭按钮坐标
        // var bound = textContains("当前通过任务获得").findOne(1000).bounds();
        // log("关闭任务列表: " + click(device.width - 60, bound.centerY() - 88));
        //break;
    }

    backJDMainPage();
}

function doPetRoutineTasks() {
    toastLog("doPetRoutineTasks");
    // 我的-> 宠汪汪
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://h5.m.jd.com/babelDiy/Zeus/2wuqXrZrhygTQzYA7VufBEpj4amH/index.html","M_sourceFrom":"mxz","msf_type":"auto"}'
    })

    var clickRet = false;
    var petBtn = WaitForText("text", "积分超值兑换", 10);
    if (petBtn == null) {
        backJDMainPage();
        return;
    }

    sleep(5000);
    //狗粮吃完了自动喂狗粮
    var dogFood = textMatches(/\d+小时\d+分\d+秒/).find()
    if (dogFood.length == 0) {
        clickRet = click(device.width * 5 / 6, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5));
        log("点击 喂养: " + clickRet);
        textContains("消耗").waitFor();
        //每次20g
        var grams = textContains("消耗").find();
        var feed = grams[1];
        clickRet = click(feed.bounds().right, feed.bounds().top - feed.bounds().height() * 2);
        log("点击 消耗20g: " + clickRet);
        feed = text("喂养").findOne(1000);
        if (feed == null) {
            backJDMainPage();
            return;
        }

        clickRet = click(feed.bounds().centerX(), feed.bounds().centerY());
        log("点击 确定喂养: " + clickRet);
        sleep(1000);

        backJDMainPage();
        return;
    } else {
        log("狗粮剩余时间: " + dogFood[0].text());
    }
    // 帮忙喂养：click(device.width / 6, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 汪汪大比拼：click(device.width / 5, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 领狗粮：click(device.width / 2, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 喂养：click(device.width * 5 / 6, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5))
    // 帮忙喂养-> 回家：click(100, device.height - 250)
    // 帮忙喂养-> 帮ta喂养：click(device.width - 100, device.height - 250)

    //领取任务达标获得的狗粮，例如三餐、帮朋友喂狗粮
    clickRet = click(device.width / 2, petBtn.bounds().centerY() - parseInt(petBtn.bounds().height() * 1.5));
    log("点击 领狗粮: " + clickRet + ", 并等待10s超时");
    sleep(2000);

    petBtn = WaitForTextMatches(/做任务得狗粮.*/, 10);
    if (petBtn == null) {
        backJDMainPage();
        return;
    }

    sleep(3000);

    for (;;) {
        var totalGetBtns = text("领取").find();
        var validGetBtns = text("领取").visibleToUser(true).find();

        log("领取: " + totalGetBtns.length + ", 可视: " + validGetBtns.length);
        if (totalGetBtns.length == validGetBtns.length && totalGetBtns.length == 0) {
            break;
        }

        if (validGetBtns.length > 0) {
            var getBtn = validGetBtns[0];
            toastLog("点击 领取: " + click(getBtn.bounds().centerX(), getBtn.bounds().centerY()));
            sleep(1000);
            break;
        } else {
            log("往上划动半个屏幕: " + swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 300));
            sleep(1000);
        }
    }

    backJDMainPage();
}

//东东农场每日浇水
function doWateringTasks(tasklist) {
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击 " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        sleep(1000);
        //点鸭子
        var btn1 = textContains("包邮送到家").findOne(1000);
        if (btn1 != null) {
            for (var i = 0; i < 5; i++) {
                log("点鸭子: " + click(btn1.bounds().centerX(), btn1.bounds().centerY() - btn1.bounds().height() * 4));
                sleep(50);
            }
        }
        sleep(8000);
        var btn = textContains("鸭").findOne(1000);
        if (btn != null) {
            log("点关闭: " + click(btn.bounds().centerX(), btn.bounds().centerY() + btn.bounds().height() * 14));
        } else {
            log("close btn not found");
        }
    }

}

//东东农场每日签到任务
function doFarmDailySignTask() {
    log("doFarmDailySignTask");
    // 免费水果-> 连续签到
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = safeGet(nowDate + ":东东农场连续签到");
    if (done != null) {
        log("东东农场连续签到 已做: " + done);
        return;
    }

    toast("doFarmDailySignTask");
    var freeFruit = textMatches(/.*水果.*/).packageName(jdPackageName).findOne(30000);
    if (freeFruit == null){
        toastLog("免费水果 not exist");
        backJDMainPage();
        return;
    }

    var clickRet = click(freeFruit.bounds().centerX(), freeFruit.bounds().centerY() - freeFruit.bounds().height());
    log("点击 " + freeFruit.text() + ": " + clickRet + ", 并等待10s超时");
    if (!clickRet) {
        backJDMainPage();
        return;
    }

    freeFruit = WaitForTextMatches(/.*包邮送到家/, 10);
    if (freeFruit == null) {
        backJDMainPage();
        return;
    }

    clickRet = click(device.width / 5, freeFruit.bounds().bottom + freeFruit.bounds().height() * 3);
    log("点击 连续签到: " + clickRet + ", 并等待10s超时");
    sleep(2000);
    var signBtn = WaitForTextMatches(/签到领/, 5);
    if (signBtn == null) {
        backJDMainPage();
        return;
    }

    log("点击 签到领: " + click(signBtn.bounds().right, signBtn.bounds().centerY()));
    sleep(2000);

    signBtn = WaitForTextMatches(/明日再来/, 5);
    if (signBtn == null) {
        backJDMainPage();
        return;
    }

    log("点击 明日再来: " + signBtn.click());
    safeSet(nowDate + ":东东农场连续签到", "done");
    toastLog("完成 东东农场连续签到");

    backJDMainPage();
}

//东东农场每日任务
function doFarmDailyTasks() {
    log("doFarmDailyTasks");
    // 免费水果-> 领水滴
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = safeGet(nowDate + ":东东农场每日任务");
    if (done != null) {
        log("东东农场每日任务 已做: " + done);
        return;
    }

    toast("doFarmDailyTasks");
    var freeFruit = textMatches(/.*水果.*/).packageName(jdPackageName).findOne(30000);
    if (freeFruit == null){
        toastLog("免费水果 not exist");
        backJDMainPage();
        return;
    }

    var clickRet = click(freeFruit.bounds().centerX(), freeFruit.bounds().centerY() - freeFruit.bounds().height());
    log("点击 " + freeFruit.text() + ": " + clickRet + ", 并等待10s超时");
    if (!clickRet) {
        backJDMainPage();
        return;
    }

    freeFruit = WaitForTextMatches(/.*包邮送到家/, 10);
    if (freeFruit == null) {
        backJDMainPage();
        return;
    }

    // 做完任务后列表会刷新，不能用旧的坐标去点击，需要重新获取一下任务列表
    // 除了双签领豆任务以外其他都做完了就算完成
    for (;;) {
        clickRet = click(device.width / 4, freeFruit.bounds().bottom + freeFruit.bounds().height() * 3);
        log("点击 领水滴: " + clickRet + ", 并等待10s超时");
        sleep(2000);
        var shuidiTasks = WaitForTextMatches(/领水滴/, 5);
        if (shuidiTasks == null) {
            break;
        }

        var dones = textMatches(/去领取|领取/).visibleToUser(true).find();
        log("可领取: " + dones.length);
        if (dones.length != 0) {
            // var objs = [];
            // queryList(dones[0].parent(), objs);
            // log("领取水滴: " + dones.length + ", " + click(objs[3].bounds().centerX(), objs[3].bounds().centerY()));
            log("领取水滴: " + dones.length + ", " + click(dones[0].bounds().centerX(), dones[0].bounds().centerY()));
            sleep(1000);
            var recvDrops = textMatches(/去领取|收下水滴/).findOne(1000);
            if (recvDrops != null) {
                log("定时领水: " + recvDrops.click());
                sleep(1000);
            }

            // 领取后任务列表有变不能点击旧的坐标
            // 任务列表关闭按钮坐标
            log("关闭领水滴任务列表: " + click(device.width - 30, shuidiTasks.bounds().centerY()));
            sleep(1000);
            continue;
        }

        var oneWalkTaskList = [];  //去逛逛任务列表，待够时间回来
        var wateringTaskList = [];  //每日浇水10次任务列表
        var tips = textMatches(/.*奖励\d+g水滴.*/).find();
        log("总任务数: " + tips.length);
        if (tips.length == 0) {
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            break;
        }

        tips.forEach(function(tv) {
            var objs = [];
            queryList(tv.parent(), objs);
            if (objs[4].text() != "已完成" &&
                objs[4].text() != "再逛逛" &&
                objs[4].text() != "已收集" &&
                objs[4].text() != "已领取" &&
                objs[4].text() != "明日再来" &&
                objs[1].text() != "帮2位好友浇水" &&
                objs[1].text().indexOf("专属特惠") == -1) {
                var obj = {};
                obj.Title = objs[1].text();
                obj.Tips = objs[2].text();
                obj.BtnName = objs[4].text();
                obj.Button = objs[4];
                if (obj.Title != "每日累计浇水10次") {
                    oneWalkTaskList.push(obj);
                } else {
                    wateringTaskList.push(obj);
                }
                log("未完成任务" + (oneWalkTaskList.length + wateringTaskList.length) + ": " + obj.Title + ", " + obj.BtnName + ", (" + obj.Button.bounds().centerX() + ", " + obj.Button.bounds().centerY() + ")");
            } else {
                log("跳过任务: " + objs[1].text() + ", " + objs[2].text() + ", " + objs[4].text());
            }
        });

        if (oneWalkTaskList.length + wateringTaskList.length == 0) {
            safeSet(nowDate + ":东东农场每日任务", "done");
            toastLog("完成 东东农场每日任务");
            break;
        }

        if (doOneWalkTasks(oneWalkTaskList)) {
            log("关闭领水滴任务列表: " + click(device.width - 30, shuidiTasks.bounds().centerY()));
            sleep(1000);
            continue;
        }

        if (doWateringTasks(wateringTaskList)) {
            //浇水任务不需要关闭任务列表，它自己会关闭
            continue;
        }

        // 任务列表关闭按钮坐标
        log("关闭领水滴任务列表: " + click(device.width - 30, shuidiTasks.bounds().centerY()));
        sleep(2000);
    }

    backJDMainPage();
}

function doFarmRoutineTasks() {
    toastLog("doFarmRoutineTasks");
    // 免费水果-> 领水滴
    var freeFruit = textMatches(/.*水果.*/).packageName(jdPackageName).findOne(30000);
    if (freeFruit == null){
        toastLog("免费水果 not exist");
        backJDMainPage();
        return;
    }

    var clickRet = click(freeFruit.bounds().centerX(), freeFruit.bounds().centerY() - freeFruit.bounds().height());
    log("点击 " + freeFruit.text() + ": " + clickRet + ", 并等待10s超时");
    if (!clickRet) {
        backJDMainPage();
        return;
    }

    freeFruit = WaitForTextMatches(/.*包邮送到家/, 10);
    if (freeFruit == null) {
        freeFruit = textMatches(/去领取|收下水滴/).findOne(1000);
        if (freeFruit == null) {
            backJDMainPage();
            return;
        }

        log("定时领水: " + freeFruit.click());
        sleep(1000);

        freeFruit = WaitForTextMatches(/.*包邮送到家/, 10);
        if (freeFruit == null) {
            backJDMainPage();
            return;
        }
    }

    for (;;) {
        clickRet = click(device.width / 4, freeFruit.bounds().bottom + freeFruit.bounds().height() * 3);
        log("点击 领水滴: " + clickRet + ", 并等待10s超时");
        sleep(2000);
        var shuidiTasks = WaitForTextMatches(/领水滴/, 5);
        if (shuidiTasks == null) {
            break;
        }

        var dones = textMatches(/去领取|领取/).visibleToUser(true).find();
        log("可领取: " + dones.length);
        if (dones.length != 0) {
            // var objs = [];
            // queryList(dones[0].parent(), objs);
            // log("领取水滴: " + dones.length + ", " + click(objs[3].bounds().centerX(), objs[3].bounds().centerY()));
            log("领取水滴: " + dones.length + ", " + click(dones[0].bounds().centerX(), dones[0].bounds().centerY()));
            sleep(1000);
            // 领取后任务列表有变不能点击旧的坐标
            // 任务列表关闭按钮坐标
            log("关闭领水滴任务列表: " + click(device.width - 30, shuidiTasks.bounds().centerY()));
            sleep(1000);
            continue;
        } else {
            break;
        }
    }

    backJDMainPage();
}

function doubleClick(ctext,index){
    var trytimes=0
    var result = false;
    while(trytimes<2){
        result = click(ctext,index);
        log("click "+ctext+",result="+result);
        trytimes=trytimes+1;
        sleep(1000);
    }
    return result;
}

// 多次判断是否进入主页，避免网络延时导致问题
function loopJudgeJDMainPage(sleepTime) {
    var trytimes = 0;
    while (trytimes < 10) {
        var isLoged = JudgeJDMainPage();
        if (isLoged) {
            return true;
        }
        trytimes = trytimes + 1;
        sleep(sleepTime);
    }
    return false;
}

function backJDMainPage(){
    log("backJDMainPage");
    try{
        var curPkg = currentPackage();
        log("currentPackage(): " + curPkg);
        if (curPkg != jdPackageName) {
            app.startActivity({
                action: "VIEW",
                data: 'openApp.jdMobile://virtual'
            })
        }
        var trytimes = 0;
        while (trytimes < 10)
        {
            result = JudgeJDMainPage()
            if (result){
                return true;
            }
            var result = back();
            if (!result) {
                toastLog("JD back fail");
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

function isAllDailyTaskComplete() {
    var nowDate = new Date().Format("yyyy-MM-dd");
    var taskList = [":京东会员每日领京豆", ":种豆得豆每日任务", ":升级赚京豆每日任务", ":宠汪汪每日任务", ":东东农场连续签到", ":东东农场每日任务"];
    for (var i = 0; i < taskList.length; i++) {
        var done = safeGet(nowDate + taskList[i]);
        if (done == null) {
            log("isAllDailyTaskComplete: " + nowDate + taskList[i] + " 未完成");
            return false;
        }
    }
    return true;
}

function mainWorker() {
    var ret = false;
    try{
        log("launchApp " + destAppName + ": " + app.launchApp(destAppName));
        log("recents: " + recents());
        sleep(1000);
        var btn = text("京东").findOne(3000);
        if (btn != null) {
            log("switch to JD: " + click(btn.bounds().centerX(), btn.bounds().centerY()));
            sleep(1000);
        } else {
            log("no 京东 process");
        }
        var isLoged = loopJudgeJDMainPage(6000);
        if (!isLoged) {
            toastLog("JD is unknown status");
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
        } else {
            // 我的-> 会员店-> 天天领京豆-> 立即翻牌，每日一次
            getPlusDailyBean();
            // 领京豆-> 种豆得豆-> 更多任务，每日一次
            doBeanDailyTasks();
            // 领京豆-> 升级赚京豆，每日一次
            doUpgradeEarnBeanDailyTasks();
            // 免费水果-> 连续签到，每日一次
            doFarmDailySignTask();
            // 免费水果-> 领水滴，每日一次
            doFarmDailyTasks();
            // 我的-> 宠汪汪
            doPetDailyTasks();

            doBeanRoutineTasks();
            doFarmRoutineTasks();
            doPetRoutineTasks();
            ret = true;
            // result = loopGoMemberShop(3);
            // if (!result) {
            // 	toastLog("goto 会员店 fail");
            // 	return false;
            // }
/*
			var flag = true;
			var latestTime = 0;
			var now = new Date();
			var execTime = now.getTime();
			var filterTime = 0;
			if (first){
				filterTime = execTime-firstInterval*1000;
			} else {
				filterTime = execTime-interval*1000;
			}
			var scrollTime = 0;
			while(flag) 
			{
				var dataArray = readAllPayment();
				log("readAllPayment dataArray="+dataArray);
				if (dataArray!=null && dataArray.length >0 ) {
					var records = loopReadTransactionDetail(dataArray);
					if (records!=null && records.length > 0 ) {
						// 过滤记录
						var newRecords = fliterRecords(records,filterTime);
						if (newRecords!=null && newRecords.length > 0){
							remoteImportRecord(newRecords);
						}
						latestTime=getMinTimeRecord(records);
					} else {
						toastLog("Read receive record fail.");
					}
				}
				if(!back()){
					toastLog("Back fail.");
					break;
				}
				if (!loopJudgeJDMainPage(3000)){
					toastLog("back to history.");
					break;
				}
				var diffSeconds = Math.ceil((execTime - latestTime)/1000);
				log("diffSeconds="+diffSeconds+",interval="+interval);
				if (diffSeconds>interval || scrollTime>3){
					flag = false;
					break;
				} else {
					// 滑动
					var result1 = swipe(360, 750, 360, 150, 500)
					//var result1 = scrollDown(0);
					if (!result1){
						log("scrollDown fail...");
					} else {
						log("scrollDown success...");
					}
					scrollTime = scrollTime+1;
					continue;
				}
			}
*/
        }
	} catch(e) {
		console.error("mainWorker",e);
    } finally {
		backJDMainPage();
		home();
		toastLog("Back home success");
		sleep(3000);
		//stopApp(jdPackageName);
		toastLog("finish mainWorker loop");
    }
    return ret;
}

