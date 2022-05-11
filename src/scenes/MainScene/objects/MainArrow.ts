import { MeshBuilder, Vector3, Mesh, Animation, CubicEase, Observable } from "@babylonjs/core";
import { MainScene } from "../MainScene";
import { PositionUpdate } from "../types/PositionUpdate.type";

export class MainArrow {
    private _mesh: Mesh;

    constructor(scene: MainScene) {
        this._mesh = this._createArrow(scene);
        this._mesh.position = new Vector3(-0.5, 0, 0.5);
        this._mesh.rotation = new Vector3(0,Math.PI/2,0);
        scene.onSphereDragComplete.add(positionUpdate => this._updatePosition(positionUpdate));
    }

    onArrowPositionUpdate: Observable<PositionUpdate> = new Observable();

    private _updatePosition({ start, end }: PositionUpdate) {
        const direction = end.subtract(start);
        const distance = 0.5; // meters
        const oldArrowPosition = this._mesh.position.clone();
        const newArrowPosition = end.add(new Vector3(
            (direction.x / direction.length()) * distance,
            this._mesh.position.y, 
            (direction.z / direction.length()) * distance,
        ));
        Animation.CreateAndStartAnimation(
            "move-arrow",
            this._mesh,
            "position", 
            30,
            50,
            this._mesh.position.clone(), 
            newArrowPosition,
            Animation.ANIMATIONLOOPMODE_CONSTANT,
            new CubicEase(),
            () => {
                this._mesh.lookAt(end);
                this._mesh.rotation.x = 0;
                this._mesh.rotation.z = 0;
                this.onArrowPositionUpdate.notifyObservers({
                    start: oldArrowPosition,
                    end: newArrowPosition
                })
            }
        );
    }

    private _createArrow(scene: MainScene) {
        const arrowHead = MeshBuilder.CreateCylinder("arrow-head", {
            height: 0.0625,
            diameter: 0.125,
            tessellation: 3
        }, scene);
        const arrowBody = MeshBuilder.CreateBox("arrow-body", {
            width: 0.125,
            height: 0.0625,
            depth: 0.0625
        }, scene);
        arrowHead.position = new Vector3(0,0.03125,0);
        arrowBody.position = new Vector3(-0.09375,0.03125,0);
        const arrow = Mesh.MergeMeshes([arrowHead, arrowBody], true) as Mesh;
        arrow.rotation = new Vector3(0,Math.PI*1.5,0);
        arrow.bakeCurrentTransformIntoVertices();
        return arrow;
    }
}