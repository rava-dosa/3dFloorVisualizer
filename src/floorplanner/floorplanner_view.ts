import {Wall} from "../model/wall";
import {Floorplan as Model_Floorplan} from "../model/floorplan";
import {HalfEdge} from "../model/half_edge";
import {Corner} from "../model/corner";
import {Room} from "../model/room";
import {Floorplanner} from "./floorplanner";
import {Dimensioning} from "../core/dimensioning";
import {Utils} from "../core/utils";
import {PubSub} from "../core/pubsub"
import $ from "cash-dom";
// export const floorplannerModes = {
//     MOVE: 0,
//     DRAW: 1,
//     DELETE: 2
// };
export const floorplannerModes = {
    DRAW: 1,
    DELETE: 2
};
// grid parameters
const gridSpacing = 20; // pixels
const gridWidth = 1;
const gridColor = "#f1f1f1";

// room config
const roomColor = "#f9f9f9";

// wall config
const wallWidth = 5;
const wallWidthHover = 7;
const wallColor = "#dddddd"
const wallColorHover = "#008cba"
const edgeColor = "#888888"
const edgeColorHover = "#008cba"
const edgeWidth = 1

const deleteColor = "#ff0000";

// corner config
const cornerRadius = 0
const cornerRadiusHover = 7
const cornerColor = "#cccccc"
const cornerColorHover = "#008cba"

/**
 * The View to be used by a Floorplanner to render in/interact with.
 */
export class FloorplannerView {

/** The canvas element. */
private canvasElement: HTMLCanvasElement;

/** The 2D context. */
private context;
private pubSub:PubSub;
/** */
constructor(private floorplan: Model_Floorplan, private viewmodel: Floorplanner, private canvas: string) {
    this.canvasElement = <HTMLCanvasElement>document.getElementById(canvas);
    this.context = this.canvasElement.getContext('2d');
    var scope = this;
    $(document).on("resize",() => {
        scope.handleWindowResize();
        });
    this.handleWindowResize();
    this.pubSub=PubSub.getInstance();
    this.pubSub.fine_subscribe("2d","DELETE Wall",this.draw.bind(this));
    this.pubSub.fine_subscribe("2d","INSERT Wall",this.draw.bind(this));
}

/** */
public handleWindowResize() {
    console.log("handle window resize called");
    var canvasSel = $("#" + this.canvas);
    var parent = canvasSel.parent();
    canvasSel.height(parent.innerHeight());
    canvasSel.width(parent.innerWidth());
    this.canvasElement.height = canvasSel.innerHeight();
    this.canvasElement.width = canvasSel.innerWidth();
    this.draw();
}

/** */
public draw() {
    this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    this.drawGrid();

    this.floorplan.getRooms().forEach((room) => {
        this.drawRoom(room);
    })

    this.floorplan.getWalls().forEach((wall) => {
        this.drawWall(wall);
    });

    this.floorplan.getCorners().forEach((corner) => {
        this.drawCorner(corner);
    });

    if (this.viewmodel.mode == floorplannerModes.DRAW) {
        this.drawTarget(this.viewmodel.targetX, this.viewmodel.targetY, this.viewmodel.lastNode);
    }

    this.floorplan.getWalls().forEach((wall) => {
        this.drawWallLabels(wall);
    });
}

/** */
private drawWallLabels(wall: Wall) {
    // we'll just draw the shorter label... idk
    // console.trace()
    if (wall.backEdge && wall.frontEdge) {
    if (wall.backEdge.interiorDistance < wall.frontEdge.interiorDistance) {
        this.drawEdgeLabel(wall.backEdge);
    } else {
        this.drawEdgeLabel(wall.frontEdge);
    }
    } else if (wall.backEdge) {
    this.drawEdgeLabel(wall.backEdge);
    } else if (wall.frontEdge) {
    this.drawEdgeLabel(wall.frontEdge);
    }
}

/** */
private drawWall(wall: Wall) {
    var hover = (wall === this.viewmodel.activeWall);
    var color = wallColor;
    if (hover && this.viewmodel.mode == floorplannerModes.DELETE) {
    color = deleteColor;
    } else if (hover) {
    color = wallColorHover;
    }
    this.drawLine(
        this.viewmodel.convertX(wall.getStartX()),
        this.viewmodel.convertY(wall.getStartY()),
        this.viewmodel.convertX(wall.getEndX()),
        this.viewmodel.convertY(wall.getEndY()),
        hover ? wallWidthHover : wallWidth,
        color
    );
    if (!hover && wall.frontEdge) {
    this.drawEdge(wall.frontEdge, hover);
    }
    if (!hover && wall.backEdge) {
    this.drawEdge(wall.backEdge, hover);
    }
}

/** */
private drawEdgeLabel(edge: HalfEdge) {
    var pos = edge.interiorCenter();
    var length = edge.interiorDistance();
    if (length < 60) {
    // dont draw labels on walls this short
    return;
    }
    this.context.font = "normal 12px Arial";
    this.context.fillStyle = "#000000";
    this.context.textBaseline = "middle";
    this.context.textAlign = "center";
    this.context.strokeStyle = "#ffffff";
    this.context.lineWidth = 4;

    this.context.strokeText(Dimensioning.cmToMeasure(length),
    this.viewmodel.convertX(pos.x),
    this.viewmodel.convertY(pos.y));
    this.context.fillText(Dimensioning.cmToMeasure(length),
    this.viewmodel.convertX(pos.x),
    this.viewmodel.convertY(pos.y));
}

/** */
private drawEdge(edge: HalfEdge, hover) {
    var color = edgeColor;
    if (hover && this.viewmodel.mode == floorplannerModes.DELETE) {
    color = deleteColor;
    } else if (hover) {
    color = edgeColorHover;
    }
    var corners = edge.corners();

    var scope = this;
    this.drawPolygon(
    Utils.map(corners, function (corner) {
        return scope.viewmodel.convertX(corner.x);
    }),
    Utils.map(corners, function (corner) {
        return scope.viewmodel.convertY(corner.y);
    }),
    false,
    null,
    true,
    color,
    edgeWidth
    );
}

/** */
private drawRoom(room: Room) {
    var scope = this;
    this.drawPolygon(
    Utils.map(room.corners, (corner: Corner) => {
        return scope.viewmodel.convertX(corner.x);
    }),
    Utils.map(room.corners, (corner: Corner) =>  {
        return scope.viewmodel.convertY(corner.y);
    }),
    true,
    roomColor
    );
}

/** */
private drawCorner(corner: Corner) {
    var hover = (corner === this.viewmodel.activeCorner);
    var color = cornerColor;
    if (hover && this.viewmodel.mode == floorplannerModes.DELETE) {
    color = deleteColor;
    } else if (hover) {
    color = cornerColorHover;
    }
    this.drawCircle(
    this.viewmodel.convertX(corner.x),
    this.viewmodel.convertY(corner.y),
    hover ? cornerRadiusHover : cornerRadius,
    color
    );
}

/** */
private drawTarget(x: number, y: number, lastNode) {
    this.drawCircle(
    this.viewmodel.convertX(x),
    this.viewmodel.convertY(y),
    cornerRadiusHover,
    cornerColorHover
    );
    if (this.viewmodel.lastNode) {
    this.drawLine(
        this.viewmodel.convertX(lastNode.x),
        this.viewmodel.convertY(lastNode.y),
        this.viewmodel.convertX(x),
        this.viewmodel.convertY(y),
        wallWidthHover,
        wallColorHover
    );
    }
}

/** */
private drawLine(startX: number, startY: number, endX: number, endY: number, width: number, color) {
    // width is an integer
    // color is a hex string, i.e. #ff0000
    this.context.beginPath();
    this.context.moveTo(startX, startY);
    this.context.lineTo(endX, endY);
    this.context.lineWidth = width;
    this.context.strokeStyle = color;
    this.context.stroke();
}

/** */
private drawPolygon(xArr, yArr, fill, fillColor, stroke?, strokeColor?, strokeWidth?) {
    // fillColor is a hex string, i.e. #ff0000
    fill = fill || false;
    stroke = stroke || false;
    this.context.beginPath();
    this.context.moveTo(xArr[0], yArr[0]);
    for (var i = 1; i < xArr.length; i++) {
    this.context.lineTo(xArr[i], yArr[i]);
    }
    this.context.closePath();
    if (fill) {
    this.context.fillStyle = fillColor;
    this.context.fill();
    }
    if (stroke) {
    this.context.lineWidth = strokeWidth;
    this.context.strokeStyle = strokeColor;
    this.context.stroke();
    }
}

/** */
private drawCircle(centerX, centerY, radius, fillColor) {
    this.context.beginPath();
    this.context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    this.context.fillStyle = fillColor;
    this.context.fill();
}

/** returns n where -gridSize/2 < n <= gridSize/2  */
private calculateGridOffset(n) {
    if (n >= 0) {
    return (n + gridSpacing / 2.0) % gridSpacing - gridSpacing / 2.0;
    } else {
    return (n - gridSpacing / 2.0) % gridSpacing + gridSpacing / 2.0;
    }
}

/** */
private drawGrid() {
    var offsetX = this.calculateGridOffset(-this.viewmodel.originX);
    var offsetY = this.calculateGridOffset(-this.viewmodel.originY);
    var width = this.canvasElement.width;
    var height = this.canvasElement.height;
    for (var x = 0; x <= (width / gridSpacing); x++) {
    this.drawLine(gridSpacing * x + offsetX, 0, gridSpacing * x + offsetX, height, gridWidth, gridColor);
    }
    for (var y = 0; y <= (height / gridSpacing); y++) {
    this.drawLine(0, gridSpacing * y + offsetY, width, gridSpacing * y + offsetY, gridWidth, gridColor);
    }
}
}