import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Vector3, HemisphericLight, Mesh, MeshBuilder, FreeCamera, PointerDragBehavior, Animation, EasingFunction, CircleEase, Color4, CubicEase, Color3, StandardMaterial } from "@babylonjs/core";
import earcut from 'earcut';
import { MainScene } from "./scenes/MainScene/MainScene";

class App {
    constructor() {
        const canv = this._createCanvas();
        const engine = new Engine(canv, true);
        const scene = new MainScene(engine);

        const camera = new FreeCamera("camera1", new Vector3(0, 4, 0), scene);
        camera.attachControl(canv, true);
        new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        scene.getSceneTarget(camera);

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === "I") {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }

    private _createCanvas() {
        const canv = document.createElement("canvas");
        canv.style.width = "100%";
        canv.style.height = "100%";
        canv.id = "gameCanvas";
        document.body.appendChild(canv);
        return canv;
    }
}
new App();