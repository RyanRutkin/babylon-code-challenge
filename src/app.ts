import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Vector3, HemisphericLight, Mesh, MeshBuilder, FreeCamera, PointerDragBehavior, Animation, EasingFunction, CircleEase, Color4, CubicEase, Color3, StandardMaterial } from "@babylonjs/core";
import earcut from 'earcut';

class App {
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    private _camera: FreeCamera;

    private _sphere: Mesh;
    private _box: Mesh;
    private _arrow: Mesh;

    private _intersectingTriangle: Mesh | undefined = undefined;

    constructor() {
        this._createCanvas();
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        this._camera = new FreeCamera("camera1", new Vector3(0, 4, 0), this._scene);
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
        const boxOutsideMaterial = new StandardMaterial('box-outside', this._scene);
        boxOutsideMaterial.diffuseColor = new Color3(1, 1, 0);
        boxOutsideMaterial.specularColor = new Color3(1, 1, 0);
        boxOutsideMaterial.emissiveColor = new Color3(1, 1, 0);
        boxOutsideMaterial.ambientColor = new Color3(1, 1, 0);

        const boxInsideMaterial = new StandardMaterial('box-inside', this._scene);
        boxInsideMaterial.diffuseColor = new Color3(0, 1, 0);
        boxInsideMaterial.specularColor = new Color3(0, 1, 0);
        boxInsideMaterial.emissiveColor = new Color3(0, 1, 0);
        boxInsideMaterial.ambientColor = new Color3(0, 1, 0);

        this._box = MeshBuilder.CreateBox("box", {
            width: 0.25, // meters
            height: 0.25,
            depth: 0.25
        }, this._scene);
        this._box.position = new Vector3(0, 0, 0);
        this._camera.setTarget(this._box.position);

        this._sphere = MeshBuilder.CreateSphere("sphere", { diameter: 0.25 }, this._scene);
        this._scene.ambientColor = new Color3(1, 1, 1);
        this._sphere.position = new Vector3(0.5, 0, 0.5);

        this._arrow = this._createArrow();
        this._arrow.position = new Vector3(-0.5, 0, 0.5);
        this._arrow.rotation = new Vector3(0,Math.PI*1.5,0);

        const pointerDragBehavior = new PointerDragBehavior({
            dragPlaneNormal: new Vector3(0,1,0)
        });
        pointerDragBehavior.useObjectOrientationForDragging = false;
        pointerDragBehavior.updateDragPlane = false;

        let dragStartPosition: Vector3 | undefined = undefined;
        let dragEndPosition: Vector3 | undefined = undefined;
        pointerDragBehavior.onDragStartObservable.add(() => {
            dragStartPosition = this._sphere.position.clone();
            if (this._intersectingTriangle) {
                this._intersectingTriangle.dispose();
            }
        });
        pointerDragBehavior.onDragEndObservable.add(() => {
            dragEndPosition = this._sphere.position.clone();
            const direction = dragEndPosition.subtract(dragStartPosition);
            const distance = 0.5; // meters
            const oldArrowPosition = this._arrow.position.clone();
            const newArrowPosition = dragEndPosition.add(new Vector3(
                (direction.x / direction.length()) * distance,
                this._arrow.position.y, 
                (direction.z / direction.length()) * distance,
            ));
            Animation.CreateAndStartAnimation(
                "move-arrow",
                this._arrow,
                "position", 
                30,
                50,
                this._arrow.position.clone(), 
                newArrowPosition,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
                new CubicEase(),
                () => {
                    this._intersectingTriangle = this._createTriangle([ oldArrowPosition, newArrowPosition, dragStartPosition ]);
                    if (this._box.intersectsMesh(this._intersectingTriangle, true)) {
                        this._box.material = boxInsideMaterial;
                    } else {
                        this._box.material = boxOutsideMaterial;
                    }
                }
            );
            this._arrow.lookAt(dragEndPosition);
            this._arrow.rotation.x = 0;
            this._arrow.rotation.z = 0;
        });
        this._sphere.addBehavior(pointerDragBehavior);
    }

    private _createArrow() {
        const arrowHead = MeshBuilder.CreateCylinder("arrow-head", {
            height: 0.0625,
            diameter: 0.125,
            tessellation: 3
        }, this._scene);
        const arrowBody = MeshBuilder.CreateBox("arrow-body", {
            width: 0.125,
            height: 0.0625,
            depth: 0.0625
        }, this._scene);
        arrowHead.position = new Vector3(0,0.03125,0);
        arrowBody.position = new Vector3(-0.09375,0.03125,0);
        const arrow = Mesh.MergeMeshes([arrowHead, arrowBody], true) as Mesh;
        arrow.rotation = new Vector3(0,Math.PI/2,0);
        arrow.bakeCurrentTransformIntoVertices();
        return arrow;
    }

    private _createTriangle(vectors: Vector3[]) {
        const center = {
            x: vectors.reduce<number>((acc, cur) => acc+=cur.x, 0),
            z: vectors.reduce<number>((acc, cur) => acc+=cur.z, 0)
        };
        const orderedVectors = vectors
            .map(({ x, y, z }) => ({
                x, y, z, 
                angle: Math.atan2(z - center.z, x - center.x)
            }))
            .sort((a, b) => a.angle - b.angle)
            .reverse()
            .map(({ x, y, z }) => new Vector3(x, y, z));
        return MeshBuilder.CreatePolygon(
            'intersecting-triangle',
            {
                shape: orderedVectors,
                updatable: true,
                faceColors: [ new Color4(0,0,255,0.5) ]
            },
            this._scene,
            earcut
        );
    }
}
new App();