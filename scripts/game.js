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
        position:[100,100,0],
        distance:1000
    });

    scene.bind(light);
    scene.camera.position = [50,50,0];
    scene.camera.lookat([0,0,0]);

    // Create a material for the mesh
    var groundMaterial = new CubicVR.Material({
        textures: {
            color: "scripts/cubicvr/samples/images/6583-diffuse.jpg"
        }
    });

    
    
    var ground = new CubicVR.Landscape(1000,100,100,groundMaterial);
    ground.mapGen(getGroundPoint);

    var landscapeUV = new CubicVR.UVMapper({
        projectionMode: CubicVR.enums.uv.projection.PLANAR,
        projectionAxis: CubicVR.enums.uv.axis.Y,
        scale: [1, 1, 1]
    });

    landscapeUV.apply(ground.getMesh(),groundMaterial);
    ground.getMesh().calcNormals().compile();
    scene.bindSceneObject(ground);

    console.log(ground);
    ground.rotation = [0,0,0];

//    var rigidFloor = new CubicVR.RigidBody(ground, {
//        type: "static",
//        mass: 0,
//        collision: {
//            type: "box",
//            size: ground.scale
//        }
//    });
//    physics.bind(rigidFloor);

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

    console.log(boxObject);
    scene.bind(boxObject);

    var rigidBox = new CubicVR.RigidBody(boxObject, {
                    type: "dynamic",
        collision: {
            type: "box",
            size: boxObject.scale
        }
    });
    physics.bind(rigidBox);


    mvc = new CubicVR.MouseViewController(canvas, scene.camera);

    // Add our camera to the window resize list
    CubicVR.addResizeable(scene);

    // Start our main drawing loop, it provides a timer and the gl context as parameters
    CubicVR.MainLoop(function(timer, gl) {
        var seconds = timer.getSeconds();
        physics.stepSimulation(timer.getLastUpdateSeconds());
        scene.render();
    });
}

function getGroundPoint(x,z){
    return Math.random()*10;
}