function Node(x, y) {
    this.x = x;
    this.y = y;
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;
    this.isAcceptState = false;
    this.text = '';
    this.outputs = {}
    this.radius = nodeRadius
    this.fontSize = fontSize

    this.json_model = {};

}

Node.prototype.getJson = function () {


    if (!this.isAcceptState) {
        if (this.json_model["outputs"]) {
            return {...this.json_model, "name": this.text, "isAcceptState": false}
        } else {
            return {...this.json_model, "name": this.text, "outputs": this.outputs, "isAcceptState": false}
        }
    } else {
        if (this.json_model["outputs"]) {
            return {...this.json_model, "name": this.text, "isAcceptState": true}
        } else {
            return {...this.json_model, "name": this.text, "outputs": this.outputs, "isAcceptState": true}
        }
    }
}


Node.prototype.setJsonModel = function (json) {
    if (json.hasOwnProperty('outputs')) {
        this.outputs = json.outputs;
    }
    if (json.hasOwnProperty('name')) {
        this.text = json.name
    }
    if (json.hasOwnProperty('isAcceptState')) {
        this.isAcceptState = json.isAcceptState
    }

    this.json_model = json
}


Node.prototype.setMouseStart = function (x, y) {
    this.mouseOffsetX = this.x - x;
    this.mouseOffsetY = this.y - y;
};

Node.prototype.setAnchorPoint = function (x, y) {
    this.x = x + this.mouseOffsetX;
    this.y = y + this.mouseOffsetY;
};

Node.prototype.draw = function (c, mode) {
    // draw the circle
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    stroke_theme_based(c, mode)

    // draw the text
    drawText(c, this.text, this.x, this.y, null, this.fontSize, false, selectedObject === this);

    // draw a double circle for an accept state
    if (this.isAcceptState) {
        c.beginPath();
        c.arc(this.x, this.y, this.radius - 6, 0, 2 * Math.PI, false);
        stroke_theme_based(c, mode)
    }
};

Node.prototype.closestPointOnCircle = function (x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    const scale = Math.sqrt(dx * dx + dy * dy);
    return {
        'x': this.x + dx * this.radius / scale,
        'y': this.y + dy * this.radius / scale,
    };
};

Node.prototype.containsPoint = function (x, y) {
    return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < this.radius * this.radius;
};
