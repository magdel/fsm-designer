// draw using this instead of a canvas and call toJava() afterward
function ExportAsJava() {
    this._points = [];
    this._texData = '';
    this._scale = 0.1; // to convert pixels to document space (TikZ breaks if the numbers get too big, above 500?)
    this.strokeStyle = "black";

    this.toJava = function () {
        return 'import com.fasterxml.jackson.annotation.JsonCreator;\n' +
            'import com.fasterxml.jackson.annotation.JsonProperty;\n' +
            'import com.fasterxml.jackson.annotation.JsonValue;\n' +
            'import jakarta.annotation.Nonnull;\n' +
            'import ru.yandex.money.common.json.JsonObject;\n' +
            'import ru.yandex.money.domain.unilabel.UniLabel;\n' +
            'import ru.yandex.money.fsm.context.*;\n' +
            'import ru.yandex.money.fsm.dao.ProcessCreateData;\n' +
            'import ru.yandex.money.fsm.machine.StateMachine;\n' +
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
            '                .noAction(State.INITIAL, State.STATE_A, State.STATE_B, State.FINISHED)\n' +
            '                .finalStage(State.FINISHED)\n' +
            '                .build();\n' +
            '    }\n' +
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
            '        INITIAL(0, ROLL),\n' +
            '        STATE_A(1, ROLL),\n' +
            '        STATE_B(2, ROLL),\n' +
            '        FINISHED(3, SUCCESS);\n' +
            '\n' +
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
            '            super(State.INITIAL);\n' +
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
        '}' +
            this._texData +
            '\\end{tikzpicture}\n' +
            '\\end{center}\n' +
            '\n' +
            '\\end{document}\n';
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
