import { Mesh, Vector3, Color4, MeshBuilder } from "@babylonjs/core";
import { MainScene } from "../MainScene";
import earcut from 'earcut';

export class MainIntersectingTriangle {
    constructor(scene: MainScene, vectors: Vector3[]) {
        this.mesh = this._createTriangle(scene, vectors);
    }
    
    mesh: Mesh;

    private _createTriangle(scene: MainScene, vectors: Vector3[]) {
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
            scene,
            earcut
        );
    }
}