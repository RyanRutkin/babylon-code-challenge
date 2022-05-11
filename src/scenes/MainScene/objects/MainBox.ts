import { StandardMaterial, Color3, Mesh, MeshBuilder, Vector3 } from "@babylonjs/core";
import { MainScene } from "../MainScene";

export class MainBox {
    private _intersectingMaterial: StandardMaterial;
    private _standardMaterial: StandardMaterial;
    private _mesh: Mesh;

    constructor(scene: MainScene) {
        this._mesh = MeshBuilder.CreateBox("box", {
            width: 0.25, // meters
            height: 0.25,
            depth: 0.25
        }, scene);
        this._mesh.position = new Vector3(0, 0, 0);
        this._buildMaterials(scene);
        scene.onIntersectingTriangleAdded.add(triangle => this._handleTriangleIntersection(triangle));
    }

    get position() {
        return this._mesh.position;
    }

    private _buildMaterials(scene: MainScene) {
        this._standardMaterial = new StandardMaterial('MainBox-standard', scene);
        this._standardMaterial.diffuseColor = new Color3(1, 1, 0);
        this._standardMaterial.specularColor = new Color3(1, 1, 0);
        this._standardMaterial.emissiveColor = new Color3(1, 1, 0);
        this._standardMaterial.ambientColor = new Color3(1, 1, 0);

        this._intersectingMaterial = new StandardMaterial('MainBox-intersecting', scene);
        this._intersectingMaterial.diffuseColor = new Color3(0, 1, 0);
        this._intersectingMaterial.specularColor = new Color3(0, 1, 0);
        this._intersectingMaterial.emissiveColor = new Color3(0, 1, 0);
        this._intersectingMaterial.ambientColor = new Color3(0, 1, 0);

        this._mesh.material = this._standardMaterial;
    }

    private _handleTriangleIntersection(triangle: Mesh) {
        if (this._mesh.intersectsMesh(triangle, true)) {
            this._mesh.material = this._intersectingMaterial;
        } else {
            this._mesh.material = this._standardMaterial;
        }
    }
}