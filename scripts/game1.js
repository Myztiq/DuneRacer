var car,ground;
function webGLStart(){
    // by default generate a full screen canvas with automatic resize
    var gl = CubicVR.init();
    var canvas = CubicVR.getCanvas();
    if (!gl) {
        alert("Sorry, no WebGL support.");
        return;
    };

    var physics = new CubicVR.ScenePhysics();
    var scene = new CubicVR.Scene(canvas.width, canvas.height, 80);
    var light = new CubicVR.Light({
        type: "point",
        method: "dynamic",
        diffuse:[1,1,1],
        specular:[1,1,1],
        position:[10,10,0],
        distance:50
    });

    scene.bind(light);
    scene.camera.position = [50,50,0];
    scene.camera.lookat([0,0,0]);

    ground = setupGround(scene,physics);
    car = setupCar(scene,physics);

    // Add our camera to the window resize list
    CubicVR.addResizeable(scene);

    // Start our main drawing loop, it provides a timer and the gl context as parameters
    CubicVR.MainLoop(function(timer, gl) {
        var seconds = timer.getSeconds();
        physics.stepSimulation(timer.getLastUpdateSeconds());

        light.position = car.getSceneObject().position.slice(0);
        light.position[0] -= 2;

        scene.camera.position = car.getSceneObject().position.slice(0);
        scene.camera.position[0]+= 10;
        scene.camera.position[1]+= 10;

        var lookat = scene.camera.position.slice(0);
        lookat[0] -= 10;
        lookat[1] += 10;
        lookat[2] += 10;
        scene.camera.lookat(lookat[0], lookat[1], lookat[2]);

        scene.render();
    });

    $(document).bind('keypress', function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        switch(code){
            case 119: //w
//                car.setGravity(car.getGravity()-1);
                console.log(car);
            break;
            case 97: //a

            break;
            case 115: //s

            break;
            case 100: //d

            break;
        }
    });
}


function setupGround(scene,physics){
    var material = new CubicVR.Material({
        textures: {
            color: "scripts/cubicvr/samples/images/6583-diffuse.jpg"
        }
    });

    var mesh = new CubicVR.Mesh({
        primitive: {
            type: "plane",
            size: 100,
            material: material,
            uvmapper: {
                projectionMode: "planar",
                scale: [1, 1, 1]
            }
        },
        compile: true
    });
    var ground = new CubicVR.SceneObject({
        mesh:mesh,
        position:[0,0,0]
    });
    ground.rotation = [90,0,0];
    
    scene.bind(ground);

    var rigidBox = new CubicVR.RigidBody(ground, {
        type: "static",
        collision: {
            type: "box",
            size: ground.scale
        }
    });
    physics.bind(rigidBox);

    return rigidBox;
}

function setupCar(scene,physics){
    var groundMaterial = new CubicVR.Material({
        textures: {
            color: "scripts/cubicvr/samples/images/6583-diffuse.jpg"
        }
    });

     var boxMesh = new CubicVR.Mesh({
        primitive: {
            type: "box",
            size: 1.0,
            material: groundMaterial,
            uvmapper: {
                projectionMode: "cubic",
                scale: [0.1, 1, 0.1]
            }
        },
        compile: true
    });
    var boxObject = new CubicVR.SceneObject({
        mesh: boxMesh,
        scale: [2,2,2],
        position: [0, 20, 0]
    });
    scene.bind(boxObject);

    var rigidBox = new CubicVR.RigidBody(boxObject, {
        type: "dynamic",
        collision: {
            type: "box",
            size: boxObject.scale
        }
    });
    physics.bind(rigidBox);
    return rigidBox;
}