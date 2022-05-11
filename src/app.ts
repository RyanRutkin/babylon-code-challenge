import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Vector3, HemisphericLight, Mesh, MeshBuilder, FreeCamera, PointerDragBehavior, Animation } from "@babylonjs/core";

class App {
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    private _camera: FreeCamera;

    private _sphere: Mesh;
    private _box: Mesh;
    private _arrow: Mesh;

    constructor() {
        this._createCanvas();
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        this._camera = new FreeCamera("camera1", new Vector3(0, 8, 0), this._scene);
        this._camera.attachControl(this._canvas, true);
        new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);
        this._addSceneObjects();

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === "I") {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    }

    private _createCanvas() {
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);
    }

    private _addSceneObjects() {
        this._box = MeshBuilder.CreateBox("box", {
            width: 1,
            height: 1
        }, this._scene);
        this._box.position = new Vector3(0, 0, 0);
        this._camera.setTarget(this._box.position);

        this._sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this._scene);
        this._sphere.position = new Vector3(2, 0, 2);

        this._arrow = this._createArrow();
        this._arrow.position = new Vector3(-2, 0, 2);

        const pointerDragBehavior = new PointerDragBehavior({
            dragPlaneNormal: new Vector3(0,1,0)
        });
        pointerDragBehavior.useObjectOrientationForDragging = false;
        pointerDragBehavior.updateDragPlane = false;

        let dragStartPosition: Vector3 | undefined = undefined;
        let dragEndPosition: Vector3 | undefined = undefined;
        pointerDragBehavior.onDragStartObservable.add((event)=>{
            console.log("dragStart", event);
            dragStartPosition = this._sphere.position.clone();
        });
        pointerDragBehavior.onDragObservable.add((event)=>{
            //console.log("drag", event);
        });
        pointerDragBehavior.onDragEndObservable.add((event)=>{
            console.log("dragEnd", event);
            dragEndPosition = this._sphere.position.clone();
            const direction = dragEndPosition.subtract(dragStartPosition);
            const distance = 2;
            const newArrowPosition = dragEndPosition.add(new Vector3(
                (direction.x / direction.length()) * distance,
                this._arrow.position.y, 
                (direction.z / direction.length()) * distance,
            )); 
            console.log('New arrow position', {
                x: newArrowPosition.x,
                y: newArrowPosition.y,
                z: newArrowPosition.z
            });
            Animation.CreateAndStartAnimation(
                "move-arrow",
                this._arrow,
                "position", 
                30,
                100,
                this._arrow.position.clone(), 
                newArrowPosition,
                Animation.ANIMATIONLOOPMODE_CONSTANT
            );
        });
        this._sphere.addBehavior(pointerDragBehavior);

    }

    private _createArrow() {
        const arrowHead = MeshBuilder.CreateCylinder("arrow-head", {
            height: 0.5,
            diameter: 1,
            tessellation: 3
        }, this._scene);
        const arrowBody = MeshBuilder.CreateBox("arrow-body", {
            width: 1,
            height: 0.5,
            depth: 0.5
        }, this._scene);
        arrowHead.position = new Vector3(0,0.25,0);
        arrowBody.position = new Vector3(-0.75,0.25,0);
        return Mesh.MergeMeshes([arrowHead, arrowBody], true);
    }
}
new App();