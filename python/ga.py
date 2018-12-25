#encoding=utf-8
import random
import math
import heapq


class GA(object):
    def __init__(self):
        self.tasks = []  # 任务集合, tasks[i]表示第i个任务的长度
        self.taskNum = 100 #任务数量
        self.nodes = [] # 处理节点集合, node[i]表示第i个处理节点的处理速度
        self.nodeNum = 10 #节点数量
        self.taskLengthRange = [10, 100]  # 任务长度取值范围
        self.nodeSpeedRange = [10, 100]  # 节点处理速度取值范围
        self.timeMatrix = [] #任务处理时间二维矩阵, 记录单个任务在不同节点上的处理时间
        self.iteratorNum = 100  # 迭代次数
        self.chromosomeNum = 10 # 染色体数量
        self.cp = 0.2 # 染色体复制比例(每代中保留适应度较高的染色体直接成为下一代)
        self.crossoverMutationNum = self.chromosomeNum - int(self.chromosomeNum * self.cp)  # 参与交叉变异的染色体数量
        self.result = [] # 最终结果, 任务处理总时间结果集合([迭代次数][染色体编号])


    def ga(self):
        # 任务
        tasks = self.initRandomArray(self.taskNum, self.taskLengthRange)
        # 处理节点
        nodes = self.initRandomArray(self.nodeNum, self.nodeSpeedRange)
        # 初始化任务处理时间矩阵
        self.initTimeMatrix()
        # 初始化第一代染色体
        chromosomeMatrix = self.createGeneration()
        # 迭代繁衍
        for i in range(self.iteratorNum):
            adaptability = self.calAdaptability(chromosomeMatrix)  # 计算上一代各染色体的适应度
            chromosomeMatrix = self.createGeneration(chromosomeMatrix, adaptability)  # 生成新一代染色体


    def initRandomArray(self, l, r):
        '''
        创建随机数组
        :param l: 数组长度
        :param r: 数组值取值范围, 整数
        :return:
        '''
        return [random.randint(r[0], r[1]) for i in range(l)]


    def initTimeMatrix(self):
        '''
        初始化任务处理时间矩阵
        '''
        for i in range(len(self.tasks)):
            timeMatrix_i = []
            for j in range(len(self.nodes)):
                timeMatrix_i.append(self.tasks[i] / self.nodes[j])
            self.timeMatrix.append(timeMatrix_i)


    def createGeneration(self, oldChromosomeMatrix=None, adaptability=None):
        '''
        繁衍新一代染色体(染色体长度就是任务的数量), 并计算任务处理时间
        :return: 新一代染色体二维矩阵
        '''
        chromosomeMatrix = []
        if not oldChromosomeMatrix:  # 第一代染色体, 随机生成
            for i in range(self.chromosomeNum):
                chromosome = [] # 一条染色体
                for j in range(self.taskNum):  # 每个任务随机指定处理节点
                    chromosome.append(random.randint(0, self.nodeNum-1))
                chromosomeMatrix.append(chromosome)
            # 保存当前迭代染色体的任务处理时间
            self.result.append(self.calTaskLengthOfEachChromosome(chromosomeMatrix))
        else:
            selectionProbability = self.calSelectionProbability(adaptability)  # 计算自然选择概率
            # 交叉生成 self.crossoverMutationNum 条染色体
            chromosomeMatrix = self.crossover(oldChromosomeMatrix, selectionProbability)
            self.mutation(chromosomeMatrix)  # 变异
            self.copy(oldChromosomeMatrix, chromosomeMatrix, adaptability) # 复制
            # 保存当前迭代染色体的任务处理时间
            self.result.append(self.calTaskLengthOfEachChromosome(chromosomeMatrix))
        return chromosomeMatrix


    def calAdaptability(self, chromosomeMatrix):
        '''
        计算染色体适应度
        :param chromosomeMatrix: 染色体矩阵
        :return: 染色体适应度一维矩阵(下标: 染色体, 值:染色体适应度)
        '''
        adaptabilitity = []  # 适应度一维矩阵(下标: 染色体, 值:染色体适应度)
        # 计算每条染色体的任务长度
        chromosomeTaskLengths = self.calTaskLengthOfEachChromosome(chromosomeMatrix)
        # 计算染色体适应度
        for i in range(len(chromosomeTaskLengths)):
            adaptabilitity.append(1/chromosomeTaskLengths[i])
        return adaptabilitity


    def calSelectionProbability(self, adaptabilitity):
        '''
        计算自然选择的概率
        :param adaptabilitity: 染色体适应度
        :return: 一维矩阵(下标: 染色体编号, 值:该染色体被选择的概率)
        '''
        sumAdaptability = sum(adaptabilitity) # 计算适应度总和
        return [adaptabilitity[i]/sumAdaptability for i in range(len(adaptabilitity))] # 计算每条染色体被选择的概率


    def crossover(self, oldChromosomeMatrix, selectionProbability):
        '''
        交叉生成{self.crossoverMutationNum}条染色体
        :param oldChromosomeMatrix:  上一代染色体矩阵
        :param selectionProbability:  自然选择概率
        :return: 交叉后生成的新染色体矩阵
        '''
        newChromosomeMatrix = []
        for i in range(self.crossoverMutationNum):
            # 采用轮盘赌选择父母染色体
            fatherChromosome = oldChromosomeMatrix[self.rws(selectionProbability)][:] # [:]表示复制
            motherChromosome = oldChromosomeMatrix[self.rws(selectionProbability)][:]
            crossIndex = random.randint(0, self.taskNum-1)
            sonChromosome = fatherChromosome[0:crossIndex]+motherChromosome[crossIndex:]
            newChromosomeMatrix.append(sonChromosome)
        return newChromosomeMatrix


    def mutation(self, chromosomeMatrix):
        '''
        对染色体矩阵进行变异(直接操作染色体矩阵)
        :param chromosomeMatrix: 染色体矩阵
        :return: 变异后的染色体矩阵
        '''
        # 随机找一条染色体
        chromosomeIndex = random.randint(0, self.crossoverMutationNum-1)
        # 随机找一个任务
        taskIndex = random.randint(0, self.taskNum-1)
        # 随机找一个处理节点
        nodeIndex = random.randint(0, self.nodeNum-1)
        chromosomeMatrix[chromosomeIndex][taskIndex] = nodeIndex
        return chromosomeMatrix


    def calTaskLengthOfEachChromosome(self, chromosomeMatrix):
        '''
        计算每条染色体处理任务的总时间长度
        :param chromosomeMatrix: 染色体矩阵
        :return: 染色体处理时间长度一维矩阵
        '''
        chromosomeTaskLengths = []
        for i in range(self.chromosomeNum):
            maxLength = float('-inf')
            for nodeIndex in range(self.nodeNum):
                chromosomeTaskLength = sum(
                    [self.timeMatrix[taskIndex][nodeIndex] for taskIndex in range(self.taskNum) if
                     chromosomeMatrix[i][taskIndex] == nodeIndex])
                maxLength = max(maxLength, chromosomeTaskLength)
            chromosomeTaskLengths.append(maxLength)
        return chromosomeTaskLengths


    def rws(self, selectionProbability):
        '''
        轮盘赌方法选择染色体
        :param selectionProbability: 自然选择概率
        :return: 被选中染色体编号
        '''
        rand = random.random() #生产0-1之间的随机数
        sum = 0
        for chromosomeIndex in range(len(selectionProbability)):
            sum += selectionProbability[chromosomeIndex]
            if(sum >= rand):
                return chromosomeIndex


    def copy(self, oldChromosomeMatrix, newChromosomeMatrix, adaptability):
        '''
        从上一代复制适应度最高的N个染色体到下一代
        :param oldChromosomeMatrix: 上一代染色体矩阵
        :param newChromosomeMatrix: 新一代染色体矩阵
        :param adaptability: 适应度矩阵
        :return: None
        '''
        N = int(self.chromosomeNum * self.cp) #需要复制的染色体数量N=染色体数量*复制比例, 向下取整
        if N <= 0:
            return
        # 选出适应度最高的的N条染色体(N=染色体数量*复制比例, 向下取整)
        chromosomeIndexes = map(adaptability.index, heapq.nlargest(N, adaptability))
        # 进行复制
        for i in range(len(chromosomeIndexes)):
            chromosome = oldChromosomeMatrix[chromosomeIndexes[i]]
            newChromosomeMatrix.append(chromosome)



if __name__ == '__main__':
    ga = GA()
    ga.ga()
    print ga.result