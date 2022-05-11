import { Mesh, MeshBuilder, Vector3, PointerDragBehavior } from "@babylonjs/core";
import { MainScene } from "../MainScene";

export class MainSphere {
    private _mesh: Mesh;

    constructor(scene: MainScene) {
        this._mesh = MeshBuilder.CreateSphere("sphere", { diameter: 0.25 }, scene);
        this._mesh.position = new Vector3(0.5, 0, 0.5);
        this._setupBehavior(scene);
    }

    private _setupBehavior(scene: MainScene) {
        const pointerDragBehavior = new PointerDragBehavior({
            dragPlaneNormal: new Vector3(0,1,0)
        });
        pointerDragBehavior.useObjectOrientationForDragging = false;
        pointerDragBehavior.updateDragPlane = false;

        let dragStartPosition: Vector3 | undefined = undefined;

        pointerDragBehavior.onDragStartObservable.add(() => {
            dragStartPosition = this._mesh.position.clone();
            scene.onSphereDragStart.notifyObservers(dragStartPosition);
        });
        pointerDragBehavior.onDragEndObservable.add(() => {
            scene.onSphereDragComplete.notifyObservers({
                start: dragStartPosition,
                end: this._mesh.position.clone()
            })
        });
        this._mesh.addBehavior(pointerDragBehavior);
    }
}