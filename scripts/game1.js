var car,ground,particles;
function webGLStart(){
    // by default generate a full screen canvas with automatic resize
    var gl = CubicVR.init();
    var canvas = CubicVR.getCanvas();
    if (!gl) {
        alert("Sorry, no WebGL support.");
        return;
    };

    var physics = new CubicVR.ScenePhysics();
    var scene = new CubicVR.Scene();
    
    var light1 = new CubicVR.Light({
        type: "point",
        method: "dynamic",
        diffuse:[1,1,1],
        specular:[1,1,1],
        position:[800,800,0],
        distance:1000,
        intensity:.5
    });
    scene.bind(light1);

    scene.setCamera(new CubicVR.Camera({
        width: canvas.width,
        height: canvas.height,
        fov: 80,
        position: [0,0,0],
        targeted: false
    }));

    ground = setupGround(scene,physics);
    jump = setupJump(scene,physics);
//    car = setup3dCar(scene,physics);
    car = addCarAndPhysics(scene,physics);
//    generateGround(scene,physics);
//    particles = addParticles(scene,physics);
    



    // Add our camera to the window resize list
    CubicVR.addResizeable(scene);

    // Start our main drawing loop, it provides a timer and the gl context as parameters
    CubicVR.MainLoop(function(timer, gl) {
        var seconds = timer.getSeconds();
        physics.stepSimulation(timer.getLastUpdateSeconds());
        if(particles){
            var modelViewMat = CubicVR.mat4.lookat(30.0, 30.0, 30.0, 0, 0, 0, 0, 1, 0);
            var projectionMat = CubicVR.mat4.perspective(40, 1.0, 0.1, 1000.0);
            particles.draw(modelViewMat,projectionMat,Math.abs(seconds%20-10));
        }
        if(car){
            car.evaluate();
        }
        scene.render();
    });

    $(document).bind('keypress', function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        switch(code){
            case 119: //w
                car.setEngineForce(20);
//                car.applyForce([-20,0,0],[0,0,0]);
            break;
            case 97: //a
//                car.applyForce([0,0,-2],[10,0,0]);
            break;
            case 115: //s
//                car.applyForce([20,0,0],[0,0,0]);
            break;
            case 100: //d
//                car.applyForce([0,0,2],[10,0,0]);
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
            size: 1,
            material: material,
            uvmapper: {
                projectionMode: "planar",
                scale: [.2, .2, .2]
            }
        },
        compile: true
    });
    var ground = new CubicVR.SceneObject({
        mesh:mesh,
        position:[0,0,0],
        scale:[1000,1000,1]
    });
    ground.rotation = [90,0,0];
    
    scene.bind(ground);

    var rigidBox = new CubicVR.RigidBody(ground, {
        type: CubicVR.enums.physics.body.STATIC,
        collision: {
            type: CubicVR.enums.collision.shape.BOX,
            size: ground.scale
        }
    });
    physics.bind(rigidBox);

    return rigidBox;
}

function setupJump(scene,physics){
    var material = new CubicVR.Material({
        textures: {
            color: "scripts/cubicvr/samples/images/6583-diffuse.jpg"
        }
    });

    var mesh = new CubicVR.Mesh({
        primitive: {
            type: "plane",
            size: 1,
            material: material,
            uvmapper: {
                projectionMode: "planar",
                scale: [1, 1, 1]
            }
        },
        compile: true
    });
    mesh.color = [0,1,0];
    var jump = new CubicVR.SceneObject({
        mesh:mesh,
        position:[0,0,0],
        scale:[20,20,1]
    });
    jump.getInstanceMaterials()[0].color = [0,1,0];
    jump.rotation = [90,0,-30];

    scene.bind(jump);

    var rigidBox = new CubicVR.RigidBody(jump, {
        type: CubicVR.enums.physics.body.STATIC,
        collision: {
            type: CubicVR.enums.collision.shape.BOX,
            size: jump.scale
        }
    });
    physics.bind(rigidBox);

    return rigidBox;
}

function setup3dCar(scene,physics){
    // load the collada file, specify path for images
    var colladaScene = CubicVR.loadCollada("resources/car/car.dae");

    // need to know it's name in the default scene
    var carMesh = colladaScene.getSceneObject("car").obj;

    // SceneObject container for the mesh
    var carObject = new CubicVR.SceneObject({
        mesh: carMesh,
        scale:[2,2,2],
        position: [75,2,0],
        rotation: [90,-90,0]
    });

    scene.camera.position = [0,-4,-3];
    scene.camera.rotation = [120,0,180];
    scene.camera.setParent(carObject);

    // Add SceneObject containing the mesh to the scene
    scene.bindSceneObject(carObject);

    var rigidBox = new CubicVR.RigidBody(carObject, {
        type: CubicVR.enums.physics.body.DYNAMIC,
        collision: {
            type: CubicVR.enums.collision.shape.BOX,
            size: carObject.scale
        }
    });
    rigidBox.setMass(20);
    physics.bind(rigidBox);

    addHeadlights(scene,carObject);
    return rigidBox;
}

function addHeadlights(scene,car){
    var light = new CubicVR.Light({
        type: CubicVR.enums.light.type.SPOT_SHADOW,
        method: CubicVR.enums.light.method.DYNAMIC,
        diffuse:[1,1,1],
        specular:[1,1,1],
        position:[0,-1,0],
        distance:90,
        intensity:1,
        direction:[0,-1,0]
    });
    light.setParent(car);

    scene.bind(light);
};

function addParticles(scene,physics){
    var particles = new CubicVR.ParticleSystem(100000,false,null,100,100);
    for(var i =0;i<100000;i++){
        var particle = new CubicVR.Particle(
            [Math.random(),Math.random(),Math.random()],
            1,
            10*Math.random(),
            [Math.random(),Math.random(),Math.random()],
            [Math.random()*.2,Math.random()*.2,Math.random()*.2]
        );
        particles.addParticle(particle);
    }
    return particles;
}


function generateGround(scene,physics){
    var terrain = generateTerrain(1000, 1000, .7);

    // Create a material for the mesh
    var groundMaterial = new CubicVR.Material({
        textures: {
            color: "sandtexture256x256.jpg"
        }
    });

    var ground = new CubicVR.Landscape(1000,100,100,groundMaterial);
    ground.mapGen(function(x,z){
         return terrain[x+500][z+500]*50;
    });

    var landscapeUV = new CubicVR.UVMapper({
        projectionMode: CubicVR.enums.uv.projection.PLANAR,
        projectionAxis: CubicVR.enums.uv.axis.Y,
        scale: [1, 1, 1]
    });
    landscapeUV.apply(ground.getMesh(),groundMaterial);
    ground.getMesh().calcNormals().compile();
    scene.bindSceneObject(ground);

//    var rigidFloor = new CubicVR.RigidBody(ground, {
//        type: "static",
//        mass: 0,
//        collision: {
//            type: "box",
//            size: ground.scale
//        }
//    });
//    physics.bind(rigidFloor);
}

function addCarAndPhysics(scene,physics){
    var colladaScene = CubicVR.loadCollada("resources/sportscar/car1.dae","resources/sportscar");

    var carMesh = colladaScene.getSceneObject("car").obj;

    // SceneObject container for the mesh
    var carObject = new CubicVR.SceneObject({
        mesh: carMesh,
        scale:[2,2,2],
        position: [75,15,0],
        rotation: [90,90,0]
    });

    scene.camera.position = [0,4,-3];
    scene.camera.rotation = [-120,0,0];
    scene.camera.setParent(carObject);

    // Add SceneObject containing the mesh to the scene
    scene.bindSceneObject(carObject);

    var vehicle = new CubicVR.Vehicle(physics,carMesh,carMesh);
    var wheel = new CubicVR.VehicleWheel();
    wheel.setDriving(true);
    vehicle.addWheel(0,wheel);
//    vehicle.addWheel(1,wheel);
//    vehicle.addWheel(2,wheel);
//    vehicle.addWheel(3,wheel);
    vehicle.initBody();


//    var rigidBox = new CubicVR.RigidBody(carObject, {
//        type: CubicVR.enums.physics.body.DYNAMIC,
//        collision: {
//            type: CubicVR.enums.collision.shape.BOX,
//            size: carObject.scale
//        }
//    });
//    rigidBox.setMass(20);
//    physics.bind(vehicle);

    addHeadlights(scene,carObject);
    return vehicle;
    
}