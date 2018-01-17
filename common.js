/**
 * 获取指定范围内的随机数
 * @param start 起点
 * @param end 终点
 * @returns {number}
 */
function random(start, end){
    var length = end-start+1;
    return Math.floor(Math.random() * length + start);
}

/**
 * 创建随机数组
 * @param length 数组长度
 * @param range 数组取值范围
 */
function initRandomArray(length, range) {
    var randomArray = [];
    for (var i=0; i<length; i++) {
        randomArray.push(random(range[0], range[1]));
    }
    return randomArray;
}

/**
 * 初始化任务处理时间矩阵
 * @param tasks 任务(长度)列表
 * @param nodes 节点(处理速度)列表
 */
function initTimeMatrix(tasks, nodes, timeMatrix) {
    for (var i=0; i<tasks.length; i++) {
        // 分别计算任务i分配给所有节点的处理时间
        var timeMatrix_i = [];
        for (var j=0; j<nodes.length; j++) {
            timeMatrix_i.push(tasks[i] / nodes[j]);
        }
        timeMatrix.push(timeMatrix_i);
    }
}