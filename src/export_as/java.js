getNodeById = function(id) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeId === id)
            return nodes[i];
    }
    return null;
}

// draw using this instead of a canvas and call toJava() afterward
function ExportAsJava() {
    this._points = [];
    this._texData = '';
    this._scale = 0.1; // to convert pixels to document space (TikZ breaks if the numbers get too big, above 500?)
    this.strokeStyle = "black";
    this.toJava = function () {

        var posponedNodes = [];
        var objLinks = [];

        let nodeOutLinks = new Map();
        let nodeInLinks = new Map();
        //init with empty arrays for simplier logic further
        for (let i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            nodeOutLinks.set(node.nodeId, []);
            nodeInLinks.set(node.nodeId, []);
        }

        for (let i = 0; i < links.length; i++) {
            const storedLink = links[i];
            let link = null;

            if (storedLink.nodeA == null && storedLink.nodeB == null) {
                posponedNodes.push(storedLink.node.nodeId);
            } else if (storedLink.nodeA.nodeId !== storedLink.nodeB.nodeId) {
                let linkNodeA = null
                let linkNodeB = null
                for (let j = 0; j < nodes.length; j++) {
                    if (nodes[j].nodeId === storedLink.nodeA.nodeId) {
                        linkNodeA = nodes[j];
                        break;
                    }
                }
                for (let j = 0; j < nodes.length; j++) {
                    if (nodes[j].nodeId === storedLink.nodeB.nodeId) {
                        linkNodeB = nodes[j];
                        break;
                    }
                }

                link = new Link(linkNodeA, linkNodeB);
                link.text = storedLink.text;
                objLinks.push(link);

                var outLinks = nodeOutLinks.get(storedLink.nodeA.nodeId);
                    outLinks.push(storedLink);
                    nodeOutLinks.set(storedLink.nodeA.nodeId, outLinks);

                var inLinks = nodeInLinks.get(storedLink.nodeB.nodeId);
                    inLinks.push(storedLink);
                    nodeInLinks.set(storedLink.nodeB.nodeId, inLinks);
            }

        }

        var initNodeIndex = 0;
        //now find first node. ==0 in and >0 out links;
        for (let i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if ((nodeInLinks.get(node.nodeId).length==0) &&
                (nodeOutLinks.get(node.nodeId).length>0)) {
                initNodeIndex = i;
                break;
            }
        }

        var successNodeIndex = 0;

        //now find some last node. >0 in and ==0 out links;
        for (let i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if ((nodeInLinks.get(node.nodeId).length>=0) &&
                (nodeOutLinks.get(node.nodeId).length==0)) {
                successNodeIndex = i;
                break;
            }
        }

        var statesString = ' ';
        for (let i = 0; i < nodes.length; i++) {
            statesString = statesString + 'STATE_'+nodes[i].text + '('+(i+1)+','+
                (i==successNodeIndex ? 'SUCCESS': 'ROLL')
                +')'+
                (i==nodes.length-1 ? ';': ',')
                +'\n';
        }

        var initStateName = 'STATE_'+nodes[initNodeIndex].text;
        var finalStateName = 'STATE_'+nodes[successNodeIndex].text;

        //generate fsm build
        var fsmBuild = '';
        var fsmActions = '';

        for (let i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (nodeOutLinks.get(node.nodeId).length == 1) {
                var link = nodeOutLinks.get(node.nodeId)[0];
                var fromNode = getNodeById(link.nodeA.nodeId);
                var toNode = getNodeById(link.nodeB.nodeId);
                fsmBuild = fsmBuild + '.stage(State.STATE_' + fromNode.text + ', ' +
                    'new ' + fromNode.text + 'Action()).nextStage(State.STATE_' + toNode.text + ')\n';

                fsmActions = fsmActions +
                    '    static class '+fromNode.text+'Action implements StageAction<GeneratedProcess, VoidEnum>{\n' +
                    '@Override\n' +
                    'public StageActionResult<VoidEnum> execute(GeneratedProcess process) {\n' +
                    '          return StageActionResult.success(ProcessContextModifier.UpdateContext.YES);\n' +
                    '}\n' +
                    '}\n\n';
            }

        }


        return 'import com.fasterxml.jackson.annotation.JsonCreator;\n' +
            'import com.fasterxml.jackson.annotation.JsonProperty;\n' +
            'import com.fasterxml.jackson.annotation.JsonValue;\n' +
            'import jakarta.annotation.Nonnull;\n' +
            'import ru.yandex.money.common.json.JsonObject;\n' +
            'import ru.yandex.money.domain.unilabel.UniLabel;\n' +
            'import ru.yandex.money.fsm.context.*;\n' +
            'import ru.yandex.money.fsm.dao.ProcessCreateData;\n' +
            'import ru.yandex.money.fsm.machine.StageAction;\n' +
            'import ru.yandex.money.fsm.machine.StageActionResult;\n' +
            'import ru.yandex.money.fsm.machine.StateMachine;\n' +
            'import ru.yandex.money.fsm.machine.VoidEnum;\n' +
            'import ru.yandex.money.fsm.machine.graph.GraphPrinter;\n' +
            'import ru.yandex.money.fsm.monitoring.ProcessContextModifier;\n' +
            'import ru.yandex.money.fsm.process.Process;\n' +
            'import ru.yandex.money.fsm.process.ProcessExecutor;\n' +
            'import ru.yandex.money.fsm.process.ProcessType;\n' +
            'import ru.yandex.money.fsm.queue.ContinueState;\n' +
            '\n' +
            'import java.util.Objects;\n' +
            'import java.util.Optional;\n' +
            'import java.util.UUID;\n' +
            '\n' +
            'import static java.util.Objects.requireNonNull;\n' +
            'import static ru.yandex.money.fsm.queue.ContinueState.ROLL;\n' +
            'import static ru.yandex.money.fsm.queue.ContinueState.SUCCESS;\n' +
            '\n' +
            'public class GeneratedProcessExecutor implements\n' +
            '        ProcessExecutor<GeneratedProcessExecutor.GeneratedProcess, GeneratedProcessExecutor.GeneratedProcessId> {\n' +
            '    private final StateMachine stateMachine;\n' +
            '\n' +
            '    public GeneratedProcessExecutor(\n' +
            '            @Nonnull ProcessContextModifier<GeneratedProcess> contextModifier) {\n' +
            '        this.stateMachine = StateMachine.builder(State.class, contextModifier)\n' +
            '           ' + fsmBuild +
            '                .finalStage(State.'+finalStateName+')\n' +
            '                .build();\n' +
            '    }\n' +
            '\n' + fsmActions +
            '\n' +
            '    @Nonnull\n' +
            '    @Override\n' +
            '    public ProcessType getProcessType() {\n' +
            '        return ComponentProcessType.GENERATED_PROCESS;\n' +
            '    }\n' +
            '\n' +
            '    @Override\n' +
            '    public void execute(Optional<JsonObject> request, GeneratedProcess context) {\n' +
            '        stateMachine.execute(context);\n' +
            '    }\n' +
            '\n' +
            '    @Nonnull\n' +
            '    @Override\n' +
            '    public GraphPrinter getGraphPrinter() {\n' +
            '        return stateMachine.graphPrinter(getClass(), getProcessType());\n' +
            '    }\n' +
            '\n' +
            '    enum State implements ProcessStage {\n' +
            ' ' + statesString +
            '\n' +
            '        private final Integer code;\n' +
            '        private final ContinueState continueState;\n' +
            '\n' +
            '        State(Integer code, ContinueState continueState) {\n' +
            '            this.code = code;\n' +
            '            this.continueState = continueState;\n' +
            '        }\n' +
            '\n' +
            '        @Override\n' +
            '        public Integer getCode() {\n' +
            '            return code;\n' +
            '        }\n' +
            '\n' +
            '        @Override\n' +
            '        public ContinueState getContinueState() {\n' +
            '            return continueState;\n' +
            '        }\n' +
            '    }\n' +
            '\n' +
            '\n' +
            '    public class GeneratedProcess extends Process<GeneratedProcessContext, GeneratedProcessId> {\n' +
            '\n' +
            '        public GeneratedProcess(\n' +
            '                @Nonnull ProcessCreateData<GeneratedProcessId, GeneratedProcessContext> processData) {\n' +
            '            super(processData);\n' +
            '        }\n' +
            '    }\n' +
            '\n' +
            '\n' +
            '    public static class GeneratedProcessId implements ProcessId {\n' +
            '        private final UniLabel processId;\n' +
            '\n' +
            '        /**\n' +
            '         * Проверяет формат идентификатора процессе\n' +
            '         *\n' +
            '         * @param processId идентификатор процесса\n' +
            '         * @return true, если формат идентификатора процесса корректен, иначе - false\n' +
            '         */\n' +
            '        public static boolean isValid(@Nonnull String processId) {\n' +
            '            requireNonNull(processId, "processId");\n' +
            '            return UniLabel.isValid(processId);\n' +
            '        }\n' +
            '\n' +
            '        @JsonCreator\n' +
            '        public GeneratedProcessId(@Nonnull UniLabel processId) {\n' +
            '            this.processId = requireNonNull(processId, "processId");\n' +
            '        }\n' +
            '\n' +
            '        /**\n' +
            '         * Возвращает инстанс {@link GeneratedProcessId} на основании строкового представления\n' +
            '         */\n' +
            '        @Nonnull\n' +
            '        public static GeneratedProcessId of(@Nonnull String processId) {\n' +
            '            requireNonNull(processId, "processId");\n' +
            '            return new GeneratedProcessId(UniLabel.fromString(processId));\n' +
            '        }\n' +
            '\n' +
            '        /**\n' +
            '         * Создает идентификатор процесса на основании UniLabel.\n' +
            '         *\n' +
            '         * @param processId идентификатор процесса в виде UniLabel\n' +
            '         * @return идентификатор процесса\n' +
            '         */\n' +
            '        public static GeneratedProcessId of(@Nonnull UniLabel processId) {\n' +
            '            requireNonNull(processId, "processId");\n' +
            '            return new GeneratedProcessId(processId);\n' +
            '        }\n' +
            '\n' +
            '        @Override\n' +
            '        @JsonValue\n' +
            '        public String asString() {\n' +
            '            return processId.asString();\n' +
            '        }\n' +
            '\n' +
            '        @Nonnull\n' +
            '        public UniLabel asUniLabel() {\n' +
            '            return processId;\n' +
            '        }\n' +
            '\n' +
            '        @Nonnull\n' +
            '        public UUID asUuid() {\n' +
            '            return processId.asUuid();\n' +
            '        }\n' +
            '\n' +
            '        @Override\n' +
            '        public String toString() {\n' +
            '            return processId.asString();\n' +
            '        }\n' +
            '\n' +
            '        @Override\n' +
            '        public boolean equals(Object obj) {\n' +
            '            if (this == obj) {\n' +
            '                return true;\n' +
            '            }\n' +
            '            if (obj == null || getClass() != obj.getClass()) {\n' +
            '                return false;\n' +
            '            }\n' +
            '            GeneratedProcessId that = (GeneratedProcessId) obj;\n' +
            '            return Objects.equals(processId, that.processId);\n' +
            '        }\n' +
            '\n' +
            '        @Override\n' +
            '        public int hashCode() {\n' +
            '            return Objects.hash(processId);\n' +
            '        }\n' +
            '    }\n' +
            '\n' +
            '    public class GeneratedProcessContext extends\n' +
            '            DefaultProcessContext<State, GeneratedProcessError> {\n' +
            '\n' +
            '        /**\n' +
            '         * Идентификатор данных\n' +
            '         */\n' +
            '        @Nonnull\n' +
            '        @JsonProperty("someId")\n' +
            '        private String someId;\n' +
            '\n' +
            '        GeneratedProcessContext() {\n' +
            '            super(State.'+initStateName+');\n' +
            '        }\n' +
            '\n' +
            '        @Override\n' +
            '        public String toString() {\n' +
            '            return "GeneratedProcessContext{" +\n' +
            '                    "someId=\'" + someId + \'"\' +\n' +
        '                    \'}\';\n' +
        '        }\n' +
        '\n' +
        '        @Nonnull\n' +
        '        public Optional<String> getSomeId() {\n' +
        '            return Optional.ofNullable(someId);\n' +
        '        }\n' +
        '\n' +
        '        public void setSomeId(@Nonnull String someId) {\n' +
        '            this.someId = someId;\n' +
        '        }\n' +
        '\n' +
        '        @Override\n' +
        '        public ProcessType getType() {\n' +
        '            return ComponentProcessType.GENERATED_PROCESS;\n' +
        '        }\n' +
        '\n' +
        '    }\n' +
        '\n' +
        '    public enum GeneratedProcessError implements ProcessStageError {\n' +
        '\n' +
        '        /**\n' +
        '         * Данные не найдены\n' +
        '         */\n' +
        '        DATA_NOT_FOUND(1, RepairType.NONE),\n' +
        '\n' +
        '        /**\n' +
        '         * Техническая ошибка\n' +
        '         */\n' +
        '        TECHNICAL_ERROR(100, RepairType.NONE);\n' +
        '\n' +
        '        private final int code;\n' +
        '        private final RepairType repairType;\n' +
        '\n' +
        '        GeneratedProcessError(int code, RepairType repairType) {\n' +
        '            this.code = code;\n' +
        '            this.repairType = repairType;\n' +
        '        }\n' +
        '\n' +
        '        @Nonnull\n' +
        '        @Override\n' +
        '        public Integer getCode() {\n' +
        '            return code;\n' +
        '        }\n' +
        '\n' +
        '        @Nonnull\n' +
        '        @Override\n' +
        '        public RepairType getRepairType() {\n' +
        '            return repairType;\n' +
        '        }\n' +
        '    }\n' +
        '\n' +
        '    public enum ComponentProcessType implements ProcessType {\n' +
        '        /**\n' +
        '         * Сгенерированный процесс\n' +
        '         */\n' +
        '        GENERATED_PROCESS(1, "generatedProcess");\n' +
        '\n' +
        '        private final Integer code;\n' +
        '        private final String humanName;\n' +
        '\n' +
        '        ComponentProcessType(Integer code, String humanName) {\n' +
        '            this.code = code;\n' +
        '            this.humanName = humanName;\n' +
        '        }\n' +
        '\n' +
        '        @Nonnull\n' +
        '        @Override\n' +
        '        public String getHumanName() {\n' +
        '            return humanName;\n' +
        '        }\n' +
        '\n' +
        '        @Nonnull\n' +
        '        @Override\n' +
        '        public Integer getCode() {\n' +
        '            return code;\n' +
        '        }\n' +
        '    }\n' +
        '}';
    };

    this.beginPath = function () {
        this._points = [];
    };


    this.arc = function (x, y, radius, startAngle, endAngle, isReversed) {
        x *= this._scale;
        y *= this._scale;
        radius *= this._scale;
        if (endAngle - startAngle === Math.PI * 2) {
            this._texData += '\\draw [' + this.strokeStyle + '] (' + fixed(x, 3) + ',' + fixed(-y, 3) + ') circle (' + fixed(radius, 3) + ');\n';
        } else {
            if (isReversed) {
                const temp = startAngle;
                startAngle = endAngle;
                endAngle = temp;
            }
            if (endAngle < startAngle) {
                endAngle += Math.PI * 2;
            }
            // TikZ needs the angles to be in between -2pi and 2pi or it breaks
            if (Math.min(startAngle, endAngle) < -2 * Math.PI) {
                startAngle += 2 * Math.PI;
                endAngle += 2 * Math.PI;
            } else if (Math.max(startAngle, endAngle) > 2 * Math.PI) {
                startAngle -= 2 * Math.PI;
                endAngle -= 2 * Math.PI;
            }
            startAngle = -startAngle;
            endAngle = -endAngle;
            this._texData += '\\draw [' + this.strokeStyle + '] (' + fixed(x + radius * Math.cos(startAngle), 3) + ',' + fixed(-y + radius * Math.sin(startAngle), 3) + ') arc (' + fixed(startAngle * 180 / Math.PI, 5) + ':' + fixed(endAngle * 180 / Math.PI, 5) + ':' + fixed(radius, 3) + ');\n';
        }
    };


    this.moveTo = this.lineTo = function (x, y) {
        x *= this._scale;
        y *= this._scale;
        this._points.push({'x': x, 'y': y});
    };


    this.stroke = function () {
        if (this._points.length === 0) return;
        this._texData += '\\draw [' + this.strokeStyle + ']';
        for (let i = 0; i < this._points.length; i++) {
            const p = this._points[i];
            this._texData += (i > 0 ? ' --' : '') + ' (' + fixed(p.x, 2) + ',' + fixed(-p.y, 2) + ')';
        }
        this._texData += ';\n';
    };


    this.fill = function () {
        if (this._points.length === 0) return;
        this._texData += '\\fill [' + this.strokeStyle + ']';
        for (let i = 0; i < this._points.length; i++) {
            const p = this._points[i];
            this._texData += (i > 0 ? ' --' : '') + ' (' + fixed(p.x, 2) + ',' + fixed(-p.y, 2) + ')';
        }
        this._texData += ';\n';
    };


    this.measureText = function (text) {
        const c = canvas.getContext('2d');
        c.font = '20px "Times New Romain", serif';
        return c.measureText(text);
    };


    this.advancedFillText = function (text, originalText, x, y, angleOrNull) {
        if (text.replace(' ', '').length > 0) {
            let nodeParams = '';
            // x and y start off as the center of the text, but will be moved to one side of the box when angleOrNull != null
            if (angleOrNull != null) {
                const width = this.measureText(text).width;
                const dx = Math.cos(angleOrNull);
                const dy = Math.sin(angleOrNull);
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) nodeParams = '[right] ', x -= width / 2;
                    else nodeParams = '[left] ', x += width / 2;
                } else {
                    if (dy > 0) nodeParams = '[below] ', y -= 10;
                    else nodeParams = '[above] ', y += 10;
                }
            }
            x *= this._scale;
            y *= this._scale;
            this._texData += '\\draw (' + fixed(x, 2) + ',' + fixed(-y, 2) + ') node ' + nodeParams + '{$' + originalText.replace(/ /g, '\\mbox{ }') + '$};\n';
        }
    };

    this.translate = this.save = this.restore = this.clearRect = function () {
    };
}
