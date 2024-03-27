import { fabric as iNeuOs } from 'fabric';
import productApi from '@/api/product';

export default class Canvas2d {
    private options = {
        canvasId: "",
        sizeWidth: 0,
        sizeHeight: 0,
        canvasConfig: null,
        callBack: (_this) => {

        },
    };
    private canvas;
    private windowsU;
    public canvasObject = {
        isRunMouseDown: false,
        visibleArea: null,
    };

    constructor(opt) {
        this.options = Object.assign(this.options, opt);
        this.windowsU = this.options.canvasId;
        this.canvas = new iNeuOs.Canvas(this.options.canvasId, {
            selectable: true,
        });
        window[this.windowsU] = this.canvas;
        this.canvas.setWidth(this.options.sizeWidth);
        this.canvas.setHeight(this.options.sizeHeight);
        this.visibleAreaShowOrNone(true);
        this.initGuidelines(this.canvas);
        this.initialization(this.options.canvasConfig);
    };
    initialization(json = null) {
        this.options.canvasConfig = json;
        const _this = this;
        this.canvas.getObjects().forEach((m) => {
            if (m.attribute) {
                _this.canvas.remove(m);
            }
        });
        this.canvas.renderAll();
        this.canvas.discardActiveObject();
        if (this.options.canvasId) {
            if (this.options.canvasConfig) {
                const jsonOb = JSON.parse(this.options.canvasConfig);
                this.loadFromJSON(jsonOb);
            }
        }
        this.options.callBack(_this);
    };

    visibleAreaShowOrNone(isshow) {
        return new Promise((res, rej) => {
            if (isshow) {
                this.canvasVisibleArea();
            } else {
                this.canvas.remove(this.canvasObject.visibleArea);
                this.canvas.renderAll();
                res(true);
            }
        })
    };
    private canvasVisibleArea() {
        const dis = 21;
        const lines = [];
        const gridWith = this.options.sizeWidth;
        const gridHeight = this.options.sizeHeight;
        const options = {
            distance: dis,
            width: gridWith,
            height: gridHeight,
            param: {
                stroke: '#ebebeb',
                strokeWidth: 1,
                hoverCursor: 'default',
                selectable: false,
                evented: false,
                excludeFromExport: true,
                hasControls: false,
                perPixelTargetFind: false
            },
        };
        const gridLen_h = options.width / options.distance;
        const gridLen_w = options.height / options.distance;
        let left = 0;
        let top = 0;
        for (let i = 0; i < gridLen_h; i++) {
            const distance = i * options.distance;
            const vertical = new iNeuOs.Line([distance, 0, distance, options.height], options.param)
            if (i % 5 === 0) {
                vertical.set({
                    stroke: '#cccccc'
                });
            }
            lines.push(vertical);
        }
        for (let i = 0; i < gridLen_w; i++) {
            const distance = i * options.distance;
            const horizontal = new iNeuOs.Line([0, distance, options.width, distance], options.param);
            if (i % 5 === 0) {
                horizontal.set({
                    stroke: '#cccccc'
                });
            }
            lines.push(horizontal);
        }
        if (this.canvasObject.visibleArea != null) {
            left = this.canvasObject.visibleArea.left;
            top = this.canvasObject.visibleArea.top;
            this.canvas.remove(this.canvasObject.visibleArea);
        } else {
            left = 0;
            top = 0;
        }
        this.canvasObject.visibleArea = new iNeuOs.Group(lines, {
            selectable: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            lockUniScaling: true,
            hoverCursor: 'auto',
            left: left,
            top: top,
            evented: false,
        });
        this.canvas.add(this.canvasObject.visibleArea);
        this.canvas.sendToBack(this.canvasObject.visibleArea);
        this.canvas.renderAll();
    };

    imgAddCanvas(dom, x, y, productid) {
        const imgInstance = new iNeuOs.Image(dom, {
            left: x,
            top: y,
            scaleX: $(dom).actual('width') / dom.naturalWidth,
            scaleY: $(dom).actual('height') / dom.naturalWidth,
            width: dom.naturalWidth,
            height: dom.naturalHeight,
        });
        const key = "img_item_" + myCommon.getTimeStamp();
        imgInstance.attribute = {
            imgSourceId: productid,
            key: key,
        };
        window[this.windowsU].add(imgInstance);
        this.canvas.setActiveObject(imgInstance);
        this.canvas.renderAll();
        return key;
    };

    private loadFromJSON(jsonOb) {
        if (jsonOb.objects && jsonOb.objects.length > 0) {
            jsonOb.objects.forEach((m, i) => {
                this.addCanvas(m, true);
            })
        }
    }

    private addCanvas(canvasOb, isGetImg = false) {
        const _this = this;
        const tempjson = { version: "5.3.0", objects: [canvasOb] };
        window[_this.windowsU]._enlivenObjects(tempjson.objects, function (thisjson) {
            thisjson.forEach(function (obj) {
                obj.attribute.key = "img_item_" + myCommon.getTimeStamp();
                window[_this.windowsU].add(obj);
                if (isGetImg) {
                    const imgSourceId = [];
                    _this.getCanvasImgId(obj, imgSourceId);
                    if (imgSourceId.length > 0) {
                        _this.getImgSource(imgSourceId).then((imgs) => {
                            if (imgs) {
                                const imgSourceOb = {};
                                imgs.forEach(img => {
                                    imgSourceOb[img.productid] = img.mainimgbase;
                                })
                                _this.imgCorrect(obj, imgSourceOb);
                            }
                        });
                    }
                }
            });
        });
    }

    private getCanvasImgId(_canvas, ids) {
        if (_canvas instanceof Array) {
            _canvas.forEach(m => {
                this.getCanvasImgId(m, ids);
            });
        } else if (_canvas._objects && _canvas._objects.length > 0) {
            this.getCanvasImgId(_canvas._objects, ids);
        } else {
            if (_canvas.type == "image") {
                ids.push(_canvas.attribute.imgSourceId);
            }
        }
    }

    private imgCorrect(_canvas, imgOb) {
        if (_canvas instanceof Array) {
            _canvas.forEach(m => {
                this.imgCorrect(m, imgOb);
            });
        } else if (_canvas._objects && _canvas._objects.length > 0) {
            this.imgCorrect(_canvas._objects, imgOb);
        } else {
            if (_canvas.type == "image") {
                const mainimgbase64 = imgOb[_canvas.attribute.imgSourceId];
                if (mainimgbase64) {
                    _canvas.setSrc(mainimgbase64)
                } else {
                    this.canvas.remove(_canvas);
                }
            }
        }
    }

    private getImgSource(ids) {
        return productApi.GetProductList({ ProductIds: ids });
    };

    updateCanvas(ctype) {
        if (ctype === 'before') {
            this.canvas.bringForward(this.canvas.getActiveObject());
        } else if (ctype === 'after') {
            this.canvas.sendBackwards(this.canvas.getActiveObject());
            this.canvas.sendToBack(this.canvasObject.visibleArea);
        } else if (ctype === 'top') {
            this.canvas.bringToFront(this.canvas.getActiveObject());
        } else if (ctype === 'bottom') {
            this.canvas.sendToBack(this.canvas.getActiveObject());
            this.canvas.sendToBack(this.canvasObject.visibleArea);
        } else if (ctype === 'delete') {
            this.canvas.remove(this.canvas.getActiveObject());
        }
        this.canvas.renderAll();
    };

    initGuidelines(canvas) {
        const _this = this;
        const ctx = canvas.getSelectionContext(),
            aligningLineOffset = 5,
            aligningLineMargin = 4,
            aligningLineWidth = 1,
            aligningLineColor = 'rgb(0,255,0)';
        let viewportTransform;
        let zoom = 1;

        function drawVerticalLine(coords) {
            drawLine(
                coords.x + 0.5,
                coords.y1 > coords.y2 ? coords.y2 : coords.y1,
                coords.x + 0.5,
                coords.y2 > coords.y1 ? coords.y2 : coords.y1);
        }

        function drawHorizontalLine(coords) {
            drawLine(
                coords.x1 > coords.x2 ? coords.x2 : coords.x1,
                coords.y + 0.5,
                coords.x2 > coords.x1 ? coords.x2 : coords.x1,
                coords.y + 0.5);
        }

        function drawLine(x1, y1, x2, y2) {
            ctx.save();
            ctx.lineWidth = aligningLineWidth;
            ctx.strokeStyle = aligningLineColor;
            ctx.beginPath();
            ctx.moveTo(x1 * zoom + viewportTransform[4], y1 * zoom + viewportTransform[5]);
            ctx.lineTo(x2 * zoom + viewportTransform[4], y2 * zoom + viewportTransform[5]);
            ctx.stroke();
            ctx.restore();
        }

        function isInRange(value1, value2) {
            value1 = Math.round(value1);
            value2 = Math.round(value2);
            for (let i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
                if (i === value2) {
                    return true;
                }
            }
            return false;
        }

        const verticalLines = [],
            horizontalLines = [];

        canvas.on('mouse:down', function () {
            _this.canvasObject.isRunMouseDown = true;
            viewportTransform = canvas.viewportTransform;
            zoom = canvas.getZoom();
        });

        canvas.on('object:moving', function (e) {

            const activeObject = e.target,
                canvasObjects = canvas.getObjects(),
                activeObjectCenter = activeObject.getCenterPoint(),
                activeObjectLeft = activeObjectCenter.x,
                activeObjectTop = activeObjectCenter.y,
                activeObjectBoundingRect = activeObject.getBoundingRect(),
                activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3],
                activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0],
                transform = canvas._currentTransform;
            let verticalInTheRange = false, horizontalInTheRange = false;


            if (!transform) return;

            for (let i = canvasObjects.length; i--;) {

                if (canvasObjects[i] === activeObject) continue;

                const objectCenter = canvasObjects[i].getCenterPoint(),
                    objectLeft = objectCenter.x,
                    objectTop = objectCenter.y,
                    objectBoundingRect = canvasObjects[i].getBoundingRect(),
                    objectHeight = objectBoundingRect.height / viewportTransform[3],
                    objectWidth = objectBoundingRect.width / viewportTransform[0];

                if (isInRange(objectLeft, activeObjectLeft)) {
                    verticalInTheRange = true;
                    verticalLines.push({
                        x: objectLeft,
                        y1: (objectTop < activeObjectTop)
                            ? (objectTop - objectHeight / 2 - aligningLineOffset)
                            : (objectTop + objectHeight / 2 + aligningLineOffset),
                        y2: (activeObjectTop > objectTop)
                            ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
                            : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                    });
                    activeObject.setPositionByOrigin(new iNeuOs.Point(objectLeft, activeObjectTop), 'center', 'center');
                }

                if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
                    verticalInTheRange = true;
                    verticalLines.push({
                        x: objectLeft - objectWidth / 2,
                        y1: (objectTop < activeObjectTop)
                            ? (objectTop - objectHeight / 2 - aligningLineOffset)
                            : (objectTop + objectHeight / 2 + aligningLineOffset),
                        y2: (activeObjectTop > objectTop)
                            ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
                            : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                    });
                    activeObject.setPositionByOrigin(new iNeuOs.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center');
                }

                if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
                    verticalInTheRange = true;
                    verticalLines.push({
                        x: objectLeft + objectWidth / 2,
                        y1: (objectTop < activeObjectTop)
                            ? (objectTop - objectHeight / 2 - aligningLineOffset)
                            : (objectTop + objectHeight / 2 + aligningLineOffset),
                        y2: (activeObjectTop > objectTop)
                            ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
                            : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                    });
                    activeObject.setPositionByOrigin(new iNeuOs.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
                }

                if (isInRange(objectTop, activeObjectTop)) {
                    horizontalInTheRange = true;
                    horizontalLines.push({
                        y: objectTop,
                        x1: (objectLeft < activeObjectLeft)
                            ? (objectLeft - objectWidth / 2 - aligningLineOffset)
                            : (objectLeft + objectWidth / 2 + aligningLineOffset),
                        x2: (activeObjectLeft > objectLeft)
                            ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
                            : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                    });
                    activeObject.setPositionByOrigin(new iNeuOs.Point(activeObjectLeft, objectTop), 'center', 'center');
                }

                if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
                    horizontalInTheRange = true;
                    horizontalLines.push({
                        y: objectTop - objectHeight / 2,
                        x1: (objectLeft < activeObjectLeft)
                            ? (objectLeft - objectWidth / 2 - aligningLineOffset)
                            : (objectLeft + objectWidth / 2 + aligningLineOffset),
                        x2: (activeObjectLeft > objectLeft)
                            ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
                            : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                    });
                    activeObject.setPositionByOrigin(new iNeuOs.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
                }

                if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
                    horizontalInTheRange = true;
                    horizontalLines.push({
                        y: objectTop + objectHeight / 2,
                        x1: (objectLeft < activeObjectLeft)
                            ? (objectLeft - objectWidth / 2 - aligningLineOffset)
                            : (objectLeft + objectWidth / 2 + aligningLineOffset),
                        x2: (activeObjectLeft > objectLeft)
                            ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
                            : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                    });
                    activeObject.setPositionByOrigin(new iNeuOs.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
                }
            }

            if (!horizontalInTheRange) {
                horizontalLines.length = 0;
            }

            if (!verticalInTheRange) {
                verticalLines.length = 0;
            }
        });

        canvas.on('before:render', function () {
            canvas.clearContext(canvas.contextTop);
        });

        canvas.on('after:render', function () {
            for (let i = verticalLines.length; i--;) {
                drawVerticalLine(verticalLines[i]);
            }
            for (let i = horizontalLines.length; i--;) {
                drawHorizontalLine(horizontalLines[i]);
            }

            verticalLines.length = horizontalLines.length = 0;
        });

        canvas.on('mouse:up', function () {
            _this.canvasObject.isRunMouseDown = false;
            verticalLines.length = horizontalLines.length = 0;
            canvas.renderAll();
        });
    }

}
