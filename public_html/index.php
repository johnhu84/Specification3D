<!DOCTYPE HTML>


<html>
<head>
<meta charset="utf-8">
<title>世中心3D购物商城</title>
<link href="css/types.css" rel="stylesheet" />
<style>
div.icon-cuohao{left:10px;top:10px;}
div.icon-tuceng{left:10px;top:60px;}
div.icon-shang{left:10px;top:110px;}
div.icon-xia{left:10px;top:160px;}
div.icon-zuo{left:10px;top:210px;}
div.icon-you{left:10px;top:260px;}
div#workarea{left:0px;top:0px;bottom:0px;width:50%;}
div#sidebar{left:50%;top:0px;right:0px;bottom:0px;}
div#videobar{left:50px;top:50px;right:50px;height:calc(55% - 100px);}
div#textbar{left:50px;right:50px;bottom:50px;height:calc(45% - 100px);overflow-x:hidden;overflow-y:scroll;}
</style>
<script src="js/three.js"></script>
<script src="js/ExhibitionControls.js"></script>
<script>
var container;
var renderer, scene, camera;
var controls;
var clock;

window.addEventListener( 'load', onWindowLoad, false );

function onWindowLoad() {
    init();
    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
    animate();
}

function onWindowResize() {
    renderer.setSize( container.offsetWidth, container.offsetHeight );
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
}

function init() {
    container = document.getElementById("workarea");

    clock = new THREE.Clock();

    /* 场景 */
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x1e4877, 1000, 15000 );

    /* 渲染器 */
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize( container.offsetWidth, container.offsetHeight );
    renderer.setClearColor( scene.fog.color, 1 );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;
    //renderer.shadowMapAutoUpdate = true;
    //renderer.shadowMapType = THREE.PCFShadowMap;
    renderer.domElement.style.position = "relative";
    
    renderer.domElement.addEventListener('mousedown', function(event) {
    var vector = new THREE.Vector3(
        renderer.devicePixelRatio * (event.pageX - this.offsetLeft) /
            this.width * 2 - 1,
            -renderer.devicePixelRatio * (event.pageY - this.offsetTop) /
            this.height * 2 + 1,
            0
        );
        projector.unprojectVector(vector, camera);
        var raycaster = new THREE.Raycaster(
        camera.position,
        vector.sub(camera.position).normalize()
    );
        var intersects = raycaster.intersectObjects(OBJECTS);
        if (intersects.length) {
            // intersects[0] describes the clicked object
        }
    }, false);
    
    /*The previous code assumes that you are using the PerspectiveCamera
class. If you are using the OrthographicCamera class, projectors have a
utility method that returns an appropriate raycaster, and you do not have
to un-project the vector first:
var raycaster = projector.pickingRay(vector, camera);*/
    
    //It's also possible to go in reverse (3D to 2D) by projecting instead of un-projecting:
    var widthHalf = 0.5 * renderer.domElement.width / renderer.devicePixelRatio,
        heightHalf = 0.5 * renderer.domElement.height / renderer.devicePixelRatio;
    var vector = mesh.position.clone(); // or an arbitrary point
    projector.projectVector(vector, camera);
    vector.x = vector.x * widthHalf + widthHalf;
    vector.y = -vector.y * heightHalf + heightHalf;
    /*After this code runs, vector.x and vector.y will hold the horizontal and
    vertical coordinates of the specified point relative to the upper-left corner of
    the canvas.*/
    
    container.appendChild( renderer.domElement );

    /* 摄像头 */
    camera = new THREE.PerspectiveCamera( 45, container.offsetWidth / container.offsetHeight, 1, 20000 );
    //camera.position.set( 300, 160,1500);
    //camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
    scene.add( camera );

    /* 控制器 */
    controls = new THREE.ExhibitionControls( camera, container );
    controls.zoomSpeed = 3000;
    controls.moveSpeed = Math.PI;
    controls.target.set( 0, 200, 0 );
    controls.origin.set(0, 200, 0);
    controls.minRadius = 1000;
    controls.maxRadius = 10000;
    controls.minLatitude = 0;
    controls.maxLatitude = Math.PI / 2;
    controls.autoMove = false;
    controls.setPosition(1500,200,0);

    /* 光 */
    var ambient = new THREE.AmbientLight( scene.fog.color );
    scene.add( ambient );

    var light = new THREE.DirectionalLight( 0xebf3ff, 1.6 );
    light.position.set( 0, 20000, 20000 ).multiplyScalar( 2);
    scene.add( light );
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    var d = 2048;
    light.shadow.camera.left = -d * 2;
    light.shadow.camera.right = d * 2;
    light.shadow.camera.top = d * 1.4;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 100000;

    /* 背景 */
    var groundTexture = new THREE.TextureLoader().load( "images/grasslight-big.jpg" );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(64, 64);
    groundTexture.anisotropy = 16;
    var groundMat = new THREE.MeshPhongMaterial( {color: 0x606060, emissive: 0x111111, map: groundTexture} );
    var groundGeo = new THREE.PlaneGeometry(20000, 20000);
    var ground = new THREE.Mesh( groundGeo, groundMat );
    ground.position.set( 0, 0, 0 );
    ground.rotation.x = -Math.PI/2;
    ground.receiveShadow = true;
    scene.add( ground );

    /* 显示对象 */
    var loader = new THREE.JSONLoader(THREE.DefaultLoadingManager);
    loader.load("js/printer.js", function ( geometry, materials )  {
        //materials[0].side = THREE.DoubleSide;
        mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials));
        mesh.scale.set( 6, 6, 6 );
        mesh.castShadow =true;
        mesh.position.setY(100);
        //mesh.receiveShadow = true;
        scene.add( mesh );
    });

    var spritey = makeTextSprite( "你好！",1);
    spritey.position.set(100,200,300);
    scene.add( spritey );

    var geometry = new THREE.Geometry();
    geometry.vertices.push( new THREE.Vector3(0, 250, 0 ) );
    geometry.vertices.push( new THREE.Vector3( 100, 200, 300 ) );
    var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
    scene.add( line );

}


function makeTextSprite(message, scale) {
    var fontsize = 16;
    var canvas = document.createElement('canvas');
    canvas.height = fontsize + 12;

    var context = canvas.getContext('2d');

    context.font = fontsize + "px 宋体";
    var metrics = context.measureText( message );
    var textWidth = metrics.width;
    canvas.width =  textWidth +12;
    context.font = fontsize + "px 宋体";

    context.fillStyle = "#3f4046";
    context.strokeStyle = "#3f4046";
    context.lineWidth = 2;
    roundRect(context, 1, 1, textWidth + 10, fontsize + 10, 6);

//    context.fillStyle = "#41addd";
//    context.strokeStyle = "#41addd";
//    context.lineWidth = 2;
//    roundRect(context, 1, fontsize + 15, textWidth + 10, fontsize + 10, 6);


    context.fillStyle = "#ffffff";
    context.fillText( message, 5, fontsize  + 5);
//    context.fillText( message, 5, fontsize * 2  + 20);

    var texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: true } );
    var sprite = new THREE.Sprite( spriteMaterial );

    sprite.scale.set(scale * (textWidth +12), scale * (fontsize + 12),1.0);
    return sprite;

}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    controls.update(clock.getDelta());
    renderer.render( scene, camera );
}

</script>
</head>
<body>
<div class="iconfont icon-cuohao"></div>
<div class="iconfont icon-tuceng"></div>
<div class="iconfont icon-shang"></div>
<div class="iconfont icon-xia"></div>
<div class="iconfont icon-zuo"></div>
<div class="iconfont icon-you"></div>
<div id="workarea"></div>
<div id="sidebar">
<div id="videobar" class="info"></div>
<div id="textbar" class="info"></div>
</div>
</body>
</html>
