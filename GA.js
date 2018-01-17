
/** 任务集合(tasks[i]表示第i个任务的长度) */
var tasks = [];
// 任务数量
var taskNum = 100;

/** 处理节点集合(nodes[i]表示第i个处理节点的处理速度) */
var nodes = [];
// 处理节点数量
var nodeNum = 10;

/** 任务长度取值范围 */
var taskLengthRange = [10,100];
/** 节点处理速度取值范围 */
var nodeSpeendRange = [10,100];

/** 任务处理时间矩阵(记录单个任务在不同节点上的处理时间) */
var timeMatrix = [];

/** 迭代次数 */
var iteratorNum = 100;

/** 染色体数量 */
var chromosomeNum = 10;

/** 适应度矩阵(下标：染色体编号、值：该染色体的适应度) */
var adaptability = [];
/** 自然选择的概率矩阵(下标：染色体编号、值：该染色体被选择的概率) */
var selectionProbability = [];

/** 染色体复制的比例(每代中保留适应度较高的染色体直接成为下一代) */
var cp = 0.2;
/** 参与交叉变异的染色体数量 */
var crossoverMutationNum;

/** 任务处理时间结果集([迭代次数][染色体编号]) */
var resultData = [];

/**
 * 初始化遗传算法
 * @param _taskNum 任务数量
 * @param _nodeNum 节点数量
 * @param _iteratorNum 迭代次数
 * @param _chromosomeNum 染色体数量
 * @param _cp 染色体复制的比例
 */
(function initGA(_taskNum, _nodeNum, _iteratorNum, _chromosomeNum, _cp) {
    // 参数校验
    if (!checkParam(_taskNum, _nodeNum, _iteratorNum, _chromosomeNum, _cp)) {
        return;
    }

    // 初始化任务集合
    tasks = initRandomArray(_taskNum, taskLengthRange);

    // 初始化节点集合
    nodes = initRandomArray(_nodeNum, nodeSpeendRange);
    debugger;

    // 执行遗传算法
    ga();

    // 渲染视图
    draw(resultData);
    // console.log(resultData);
})(100, 10, 100, 100, 0.2);


/**
 * 遗传算法
 */
function ga() {

    // 初始化任务执行时间矩阵
    initTimeMatrix(tasks, nodes, timeMatrix);

    // 迭代搜索
    gaSearch(iteratorNum, chromosomeNum);
}


/**
 * 参数校验
 * @param _taskNum 任务数量
 * @param _nodeNum 节点数量
 * @param _iteratorNum 迭代次数
 * @param _chromosomeNum 染色体数量
 * @param _cp 染色体复制的比例
 */
function checkParam(_taskNum, _nodeNum, _iteratorNum, _chromosomeNum, _cp) {
    if (isNaN(_taskNum)) {
        alert("任务数量必须是数字！");
        return false;
    }
    if (isNaN(_nodeNum)) {
        alert("节点数量必须是数字！");
        return false;
    }
    if (isNaN(_iteratorNum)) {
        alert("迭代次数必须是数字！");
        return false;
    }
    if (isNaN(_chromosomeNum)) {
        alert("染色体数量必须是数字！");
        return false;
    }
    if (isNaN(_cp) || _cp<0 || _cp>1) {
        alert("cp值必须为数字！并且在0～1之间！");
        return false;
    }

    taskNum = _taskNum;
    nodeNum = _nodeNum;
    iteratorNum = _iteratorNum;
    chromosomeNum = _chromosomeNum;
    cp = _cp;
    crossoverMutationNum = chromosomeNum - chromosomeNum*_cp;

    return true;
}


/**
 * 计算 染色体适应度
 * @param chromosomeMatrix
 */
function calAdaptability(chromosomeMatrix) {
    adaptability = [];

    // 计算每条染色体的任务长度
    for (var chromosomeIndex=0; chromosomeIndex<chromosomeNum; chromosomeIndex++) {
        var maxLength = Number.MIN_VALUE;
        for (var nodeIndex=0; nodeIndex<nodeNum; nodeIndex++) {
            var sumLength = 0;
            for (var taskIndex=0; taskIndex<taskNum; taskIndex++) {
                if (chromosomeMatrix[chromosomeIndex][taskIndex] == nodeIndex) {
                    sumLength += timeMatrix[taskIndex][nodeIndex];
                }
            }

            if (sumLength > maxLength) {
                maxLength = sumLength;
            }
        }

        // 适应度 = 1/任务长度
        adaptability.push(1/maxLength);
    }
}

/**
 * 计算自然选择概率
 * @param adaptability
 */
function calSelectionProbability(adaptability) {
    selectionProbability = [];

    // 计算适应度总和
    var sumAdaptability = 0;
    for (var i=0; i<chromosomeNum; i++) {
        sumAdaptability += adaptability[i];
    }

    // 计算每条染色体的选择概率
    for (var i=0; i<chromosomeNum; i++) {
        selectionProbability.push(adaptability[i] / sumAdaptability);
    }
}

/**
 * 迭代搜索
 * @param iteratorNum 迭代次数
 * @param chromosomeNum 染色体数量
 */
function gaSearch(iteratorNum, chromosomeNum) {
    // 初始化第一代染色体
    var chromosomeMatrix = createGeneration();

    // 迭代繁衍
    for (var itIndex=1; itIndex<iteratorNum; itIndex++) {
        // 计算上一代各条染色体的适应度
        calAdaptability(chromosomeMatrix);

        // 计算自然选择概率
        calSelectionProbability(adaptability);

        // 生成新一代染色体
        chromosomeMatrix = createGeneration(chromosomeMatrix);

    }
}


/**
 * 交叉生成{crossoverMutationNum}条染色体
 * @param chromosomeMatrix 上一代染色体矩阵
 */
function cross(chromosomeMatrix) {
    var newChromosomeMatrix = [];
    for (var chromosomeIndex=0; chromosomeIndex<crossoverMutationNum; chromosomeIndex++) {

        // 采用轮盘赌选择父母染色体
        var chromosomeBaba = chromosomeMatrix[RWS(selectionProbability)].slice(0);
        var chromosomeMama = chromosomeMatrix[RWS(selectionProbability)].slice(0);
        // 交叉
        var crossIndex = random(0, taskNum-1);
        chromosomeBaba.splice(crossIndex);
        chromosomeBaba = chromosomeBaba.concat(chromosomeMama.slice(crossIndex));
        // debugger;
        newChromosomeMatrix.push(chromosomeBaba);
    }
    return newChromosomeMatrix;
}


/**
 * 从数组中寻找最大的n个元素
 * @param array
 * @param n
 */
function maxN(array, n) {
    // 将一切数组升级成二维数组，二维数组的每一行都有两个元素构成[原一位数组的下标,值]
    var matrix = [];
    for (var i=0; i<array.length; i++) {
        matrix.push([i, array[i]]);
    }

    // 对二维数组排序
    for (var i=0; i<n; i++) {
        for (var j=1; j<matrix.length; j++) {
            if (matrix[j-1][1] > matrix[j][1]) {
                var temp = matrix[j-1];
                matrix[j-1] = matrix[j];
                matrix[j] = temp;
            }
        }
    }

    // 取最大的n个元素
    var maxIndexArray = [];
    for (var i=matrix.length-1; i>matrix.length-n-1; i--) {
        maxIndexArray.push(matrix[i][0]);
    }

    return maxIndexArray;
}

/**
 * 复制(复制上一代中优良的染色体)
 * @param chromosomeMatrix 上一代染色体矩阵
 * @param newChromosomeMatrix 新一代染色体矩阵
 */
function copy(chromosomeMatrix, newChromosomeMatrix) {
    // 寻找适应度最高的N条染色体的下标(N=染色体数量*复制比例)
    var chromosomeIndexArr = maxN(adaptability, chromosomeNum*cp);

    // 复制
    for (var i=0; i<chromosomeIndexArr.length; i++) {
        var chromosome = chromosomeMatrix[chromosomeIndexArr[i]];
        newChromosomeMatrix.push(chromosome);
    }

    return newChromosomeMatrix;
}

/**
 * 计算所有染色体的任务处理时间
 * @param chromosomeMatrix
 */
function calTime_oneIt(chromosomeMatrix) {
    // 计算每条染色体的任务长度
    var timeArray_oneIt = [];
    for (var chromosomeIndex=0; chromosomeIndex<chromosomeNum; chromosomeIndex++) {
        var maxLength = Number.MIN_VALUE;
        for (var nodeIndex=0; nodeIndex<nodeNum; nodeIndex++) {
            var sumLength = 0;
            for (var taskIndex=0; taskIndex<taskNum; taskIndex++) {
                if (chromosomeMatrix[chromosomeIndex][taskIndex] == nodeIndex) {
                    sumLength += timeMatrix[taskIndex][nodeIndex];
                }
            }

            if (sumLength > maxLength) {
                maxLength = sumLength;
            }
        }

        timeArray_oneIt.push(maxLength);
    }
    resultData.push(timeArray_oneIt);
}

/**
 * 繁衍新一代染色体
 * @param chromosomeMatrix 上一代染色体
 */
function createGeneration(chromosomeMatrix) {

    // 第一代染色体，随机生成
    if (chromosomeMatrix == null || chromosomeMatrix == undefined) {
        var newChromosomeMatrix = [];
        for (var chromosomeIndex=0; chromosomeIndex<chromosomeNum; chromosomeIndex++) {
            var chromosomeMatrix_i = [];
            for (var taskIndex=0; taskIndex<taskNum; taskIndex++) {
                chromosomeMatrix_i.push(random(0, nodeNum-1));
            }
            newChromosomeMatrix.push(chromosomeMatrix_i);
        }

        // 计算当前染色体的任务处理时间
        calTime_oneIt(newChromosomeMatrix);
        return newChromosomeMatrix;
    }

    // 交叉生成{crossoverMutationNum}条染色体
    var newChromosomeMatrix = cross(chromosomeMatrix);

    // 变异
    newChromosomeMatrix = mutation(newChromosomeMatrix);

    // 复制
    newChromosomeMatrix = copy(chromosomeMatrix, newChromosomeMatrix);

    // 计算当前染色体的任务处理时间
    calTime_oneIt(newChromosomeMatrix);

    return newChromosomeMatrix;
}

/**
 * 轮盘赌算法
 * @param selectionProbability 概率数组(下标：元素编号、值：该元素对应的概率)
 * @returns {number} 返回概率数组中某一元素的下标
 */
function RWS(selectionProbability) {
    var sum = 0;
    var rand = Math.random();
    for (var i=0; i<selectionProbability.length; i++) {
        sum += selectionProbability[i];
        if (sum >= rand) {
            return i;
        }
    }
}


/**
 * 变异
 * @param newChromosomeMatrix 新一代染色体矩阵
 */
function mutation(newChromosomeMatrix) {
    // 随机找一条染色体
    var chromosomeIndex = random(0, crossoverMutationNum-1);

    // 随机找一个任务
    var taskIndex = random(0, taskNum-1);

    // 随机找一个节点
    var nodeIndex = random(0, nodeNum-1);

    newChromosomeMatrix[chromosomeIndex][taskIndex] = nodeIndex;

    return newChromosomeMatrix;
}

/**
 * 渲染视图
 * @param resultData
 */
function draw(resultData) {
// 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));

    // 指定图表的配置项和数据
    var option = {
        title: {
            text: '基于遗传算法的负载均衡调度策略'
        },
        tooltip : {
            trigger: 'axis',
            showDelay : 0,
            axisPointer:{
                show: true,
                type : 'cross',
                lineStyle: {
                    type : 'dashed',
                    width : 1
                }
            },
            zlevel: 1
        },
        legend: {
            data:['遗传算法']
        },
        toolbox: {
            show : true,
            feature : {
                mark : {show: true},
                dataZoom : {show: true},
                dataView : {show: true, readOnly: false},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        xAxis : [
            {
                type : 'value',
                scale:true,
                name: '迭代次数'
            }
        ],
        yAxis : [
            {
                type : 'value',
                scale:true,
                name: '任务处理时间'
            }
        ],
        series : [
            {
                name:'遗传算法',
                type:'scatter',
                large: true,
                symbolSize: 3,
                data: (function () {
                    var d = [];
                    for (var itIndex=0; itIndex<iteratorNum; itIndex++) {
                        for (var chromosomeIndex=0; chromosomeIndex<chromosomeNum; chromosomeIndex++) {
                            d.push([itIndex, resultData[itIndex][chromosomeIndex]]);
                        }
                    }
                    return d;
                })()
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}