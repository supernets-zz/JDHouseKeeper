var common = {};

common.appName = "JDHouseKeeper";
common.destAppName = "京东";
common.destPackageName = "com.jingdong.app.mall";

//Min(下一次收取营养液检查时间戳, 下一次领取狗粮检查时间戳, 下一个整点检查时间戳)
common.nextGetNutrientTimestampTag = "下一次收取营养液检查时间戳";  //带毫秒
common.nextFeedDogFoodTimestampTag = "下一次领喂养狗粮检查时间戳";  //带毫秒

var storagelock = threads.lock();
var localStorages = storages.create(common.appName+":global");

common.checkAuditTime = function (beginTime, endTime) {
    var nowDate = new Date();
    var beginDate = new Date(nowDate);
    var endDate = new Date(nowDate);

    var beginIndex = beginTime.lastIndexOf("\:");
    var beginHour = beginTime.substring(0, beginIndex);
    var beginMinue = beginTime.substring(beginIndex + 1, beginTime.length);
    beginDate.setHours(beginHour, beginMinue, 0, 0);

    var endIndex = endTime.lastIndexOf("\:");
    var endHour = endTime.substring(0, endIndex);
    var endMinue = endTime.substring(endIndex + 1, endTime.length);
    endDate.setHours(endHour, endMinue, 0, 0);
    return nowDate.getTime() - beginDate.getTime() >= 0 && nowDate.getTime() <= endDate.getTime();
}

common.timestampToTime = function (timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y+M+D+h+m+s;
}

common.safeGet = function (key) {
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

common.safeSet = function (key, stringValue) {
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

//depth遍历深度，0为json的子一层
common.queryList = function (json, depth, arr) {
    for (var i = 0; i < json.childCount(); i++) {
        var sonList = json.child(i);
        if (sonList.childCount() == 0) {
            arr.push(json.child(i));
        } else {
            if (depth > 0) {
                this.queryList(sonList, depth - 1, arr);
            } else {
                arr.push(json.child(i));
            }
        }
    }
    return arr;
}

common.listAll = function () {
    sleep(3000);
    //var list = className("ListView").findOne();
    var list = className("FrameLayout").findOne();
    var arr=[]
    common.queryList(list, 255, arr);
    for(var k=0;k<arr.length;k++){
        log("第"+k+"个子控件"+arr[k]);
    }
}

common.waitForText = function (method, txt, visible, sec) {
    var obj = null;
    var startTick = new Date().getTime();
    for (;obj == null;) {
        if (visible) {
            obj = eval(method + "(\"" + txt + "\").visibleToUser(true).findOne(1000)");
        } else {
            obj = eval(method + "(\"" + txt + "\").findOne(1000)");
        }
        if (obj == null) {
            var curPkg = currentPackage();
            if (curPkg != common.destPackageName) {
                //跳其他app了要跳回来
                log("currentPackage(): " + curPkg);
                sleep(15000);
                log("recents: " + recents());
                sleep(1000);
                var btn = text(common.destAppName).findOne(3000);
                if (btn != null) {
                    log("switch to " + common.destAppName + ": " + btn.parent().parent().click());
                    sleep(1000);
                } else {
                    log("no " + common.destAppName + " process");
                }
            }

            log("等待 " + txt + " 出现");
        } else {
            if (visible) {
                if (obj.bounds().height() < 10) {
                    log("等待 " + txt + " 出现, height: " + obj.bounds().height());
                    obj = null;
                    sleep(1000);
                }
            }
        }

        if (new Date().getTime() - startTick > sec * 1000) {
            break;
        }
    }
    //log(txt + " 出现" + obj);
    return obj;
}

common.waitForTextMatches = function (regex, visible, sec) {
    var obj = null;
    for (var i = 0; i < sec && obj == null; i++) {
        if (visible) {
            obj = eval("textMatches(" + regex + ").visibleToUser(true).findOne(1000)");
        } else {
            obj = eval("textMatches(" + regex + ").findOne(1000)");
        }
        if (obj == null) {
            var curPkg = currentPackage();
            if (curPkg != common.destPackageName) {
                //跳其他app了要跳回来
                log("currentPackage(): " + curPkg);
                log("recents: " + recents());
                sleep(1000);
                var btn = text(common.destAppName).findOne(3000);
                if (btn != null) {
                    log("switch to " + common.destAppName + ": " + btn.parent().parent().click());
                    sleep(1000);
                } else {
                    log("no " + common.destAppName + " process");
                }
            }

            log("等待 " + regex + " 出现");
        } else {
            if (visible) {
                if (obj.bounds().height() < 10) {
                    log("等待 " + regex + " 出现, height: " + obj.bounds().height());
                    obj = null;
                    sleep(1000);
                }
            }
        }
    }
    //log(regex + " 出现" + obj);
    return obj;
}

common.findImage = function (tmpl) {
    var templ = images.read(tmpl);
    point = findImage(captureScreen(), templ);
    if (point != null) {
        point.x = point.x + Math.floor(templ.getWidth() / 2);
        point.y = point.y + Math.floor(templ.getHeight() / 2);
    }
    templ.recycle();
    return point;
}

common.findImageInRegion = function (tmpl, x, y, w, h) {
    var templ = images.read(tmpl);
    point = findImageInRegion(captureScreen(), templ, x, y, w, h);
    if (point != null) {
        point.x = point.x + Math.floor(templ.getWidth() / 2);
        point.y = point.y + Math.floor(templ.getHeight() / 2);
    }
    templ.recycle();
    return point;
}

common.waitForImage = function (tmpl, sec) {
    var point = null;
    var startTick = new Date().getTime();
    for (;;) {
        point = common.findImage(tmpl);
        if (point) {
            log(tmpl + " 出现 (" + point.x + ", " + point.y + ")");
            break;
        } else {
            log("等待 " + tmpl + " 出现");
        }

        sleep(1000);
        if (new Date().getTime() - startTick > sec * 1000) {
            break;
        }
    }
    //log(tmpl + " 出现" + point);
    return point;
}

common.waitForImageInRegion = function (tmpl, x, y, w, h, sec) {
    var point = null;
    var startTick = new Date().getTime();
    for (;;) {
        point = common.findImageInRegion(tmpl, x, y, w, h);
        if (point) {
            log(tmpl + " 出现 (" + point.x + ", " + point.y + ")");
            break;
        } else {
            log("等待 " + tmpl + " 出现");
        }

        sleep(1000);
        if (new Date().getTime() - startTick > sec * 1000) {
            break;
        }
    }
    //log(tmpl + " 出现" + point);
    return point;
}

//返回false代表超时
common.waitDismiss = function (method, txt, sec) {
    // 等待离开"进入并关注"任务列表页面
    var obj = null;
    var startTick = new Date().getTime();
    for (;;) {
        obj = eval(method + "(\"" + txt + "\").findOne(1000)");
        if (obj != null) {
            log("等待 " + txt + " 消失");
            sleep(1000);
        } else {
            return true;
        }

        if (new Date().getTime() - startTick > sec * 1000) {
            break;
        }
    }
    return false;
}

common.filterTaskList = function (todoTasks, validTaskNames) {
    var ret = [];
    for (var i = 0; i < todoTasks.length; i++) {
        if (validTaskNames.indexOf(todoTasks[i].Title) != -1) {
            ret.push(todoTasks[i]);
        }
    }
    return ret;
}

module.exports = common;