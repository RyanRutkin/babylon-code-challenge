import { Scene, Engine, Observable, Vector3, Color3, FreeCamera, Mesh } from "@babylonjs/core";
import { PositionUpdate } from "./types/PositionUpdate.type";
import { MainBox } from "./objects/MainBox";
import { MainSphere } from "./objects/MainSphere";
import { MainArrow } from "./objects/MainArrow";
import { MainIntersectingTriangle } from "./objects/MainIntersectingTriangle";

export class MainScene extends Scene {
    constructor(engine: Engine) {
        super(engine);
        this._setupScene();
    }

    onSphereDragStart: Observable<Vector3> = new Observable();
    onSphereDragComplete: Observable<PositionUpdate> = new Observable();

    onIntersectingTriangleAdded: Observable<Mesh> = new Observable();

    getSceneTarget(camera: FreeCamera) {
        camera.setTarget(new Vector3(0,0,0));
    }

    private _setupScene() {
        this.ambientColor = new Color3(1, 1, 1);
        const box = new MainBox(this);

        const sphere = new MainSphere(this);
        let intersectingTriangle: MainIntersectingTriangle | undefined = undefined;
        let sphereDragStartPosition: Vector3 | undefined = undefined;

        this.onSphereDragStart.add(start => {
            sphereDragStartPosition = start;
            if (intersectingTriangle) {
                intersectingTriangle.mesh.dispose();
                intersectingTriangle = undefined;
            }
        });

        const arrow = new MainArrow(this);
        arrow.onArrowPositionUpdate.add(({ start, end }) => {
            intersectingTriangle = new MainIntersectingTriangle(this, [ start, end, sphereDragStartPosition! ]);
            this.onIntersectingTriangleAdded.notifyObservers(intersectingTriangle.mesh);
        });
    }
}