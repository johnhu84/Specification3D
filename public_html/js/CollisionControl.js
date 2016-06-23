/**
 * 文件名: CollisionControl.js
 * threejs 3D 展品控制器
 *
 * @version V 1.00   2016-05-13
 * @author Chunlin Hu
 */
( function () {

	THREE.CollisionControl = function ( parameters ) {
            var self = this;

            this._nonCollidibleObjs = ( parameters.nonCollidibleObjs !== void 0 ) ? parameters.nonCollidibleObjs:[];
            this._objects = ( parameters.objects !== void 0 ) ? parameters.objects:[];
            this._display = ( parameters.display !== void 0 ) ? parameters.display:null;
            this._camera = ( parameters.camera !== void 0 ) ? parameters.camera:null;
            this._line = ( parameters.line !== void 0 ) ? parameters.line : null;
            this._transformControl = ( parameters.transformControl !== void 0 ) ? parameters.transformControl : null;
            this._snapBackDistance = ( parameters.snapBackDistance !== void 0 ) ? parameters.snapBackDistance : 90;
            this._lastVector = ( parameters.lastVector !== void 0 ) ? parameters.lastVector : null;//new THREE.Vector3();
            this._floorY = ( parameters.floorY !== void 0 ) ? parameters.floorY : -199;
            
            this.enable = true; // 是否可用
           
            this.checkFloorY = function(object) {
                if (object.position.y <= self._floorY) {
                    object.position.setY(self._floorY + 1);
                    if (self._transformControl)
                        self._transformControl.detach( self._transformControl.object );
                    return true;
                }
                return false;
            };
            
            this.checkFloorYForDescription = function(description) {
                var object = description._pivot;
                if (object.position.y <= self._floorY) {
                    object.position.setY(self._floorY + 1);
                    if (self._transformControl)
                        self._transformControl.detach( self._transformControl.object );
                    return true;
                } else {
                    var obj = description.sprite;
                    var height = Math.abs(obj.geometry.boundingBox.max.y - obj.geometry.boundingBox.min.y) * obj.scale.y;
                    if (obj.position.y - height <= self._floorY) {
                        description.target.setY(self._floorY + height + 10);
                        description._pivot2.position.copy(description.target.clone());
                        obj.position.setY(self._floorY + height + 10);
                        if (self._transformControl)
                            self._transformControl.detach( self._transformControl.object );
                        return true;
                    }
                }
                return false;
            };
            
            this.checkCollisionsForDescription4 = function(object, doNotDoSnapBack, isOriginal, lastVector) {
                var v1 = new THREE.Vector3(1, 1, 1);
                var v2 = new THREE.Vector3(1, 1, -1);
                var v3 = new THREE.Vector3(1, -1, 1);
                var v4 = new THREE.Vector3(1, -1, -1);
                var v5 = new THREE.Vector3(-1, 1, 1);
                var v6 = new THREE.Vector3(-1, 1, -1);
                var v7 = new THREE.Vector3(-1, -1, 1);
                var v8 = new THREE.Vector3(-1, -1, -1);
                var yawRight = new THREE.Vector3(1, 0, 0);
                var yawLeft = new THREE.Vector3(-1, 0, 0);
                var pitchForward = new THREE.Vector3(0, 1, 0);
                var pitchBackward = new THREE.Vector3(0, -1, 0);
                var rollClockwise = new THREE.Vector3(0, 0, 1);
                var rollCounterclockwise = new THREE.Vector3(0, 0, -1);
                var vertices = [];
                if (isOriginal) {
                    var d = getDimension(object._pivot);
                    var position = object._pivot.position.clone();
                    //position.setX(position.x-(d.width/2));
                    vertices.push(position);
                } else {
                    var d = getDimension(object.sprite);
                    d.width = d.width * object.sprite.scale.x;
                    d.height = d.height * object.sprite.scale.y;
                    var position = object._pivot2.position.clone();
                    position.setX(position.x-(d.width/2));
                    vertices.push(position);
                    var position2 = object._pivot2.position.clone();
                    position2.setX(position2.x+(d.width/2));
                    vertices.push(position2);
                    var position3 = object._pivot2.position.clone();
                    position3.setY(position3.y-(d.height/2));
                    vertices.push(position3);
                    var position4 = object._pivot2.position.clone();
                    position4.setY(position4.y+(d.height/2));
                    vertices.push(position4);
                }
                if (!object)// || object.position === void 0)
                    return false;
                var originPoint = isOriginal?object.origin.clone():object._pivot2.position.clone();//object.position.clone();
                
                var objectToCheck = self._nonCollidibleObjs[0];
                var directionVector = lastVector.sub(originPoint).normalize();
                var negDirectionVector = directionVector.clone().negate();
                
                if (isOriginal) {
                    var radius = isOriginal?object._pivotSize/2:self.object.getSpriteRadius();
                    for (var i in vertices) {
                        var vertex = vertices[i];
                        var raycaster = new THREE.Raycaster(vertex, directionVector);
                        var collisionResults = raycaster.intersectObjects(self._nonCollidibleObjs);
                        if (collisionResults.length > 0) {
                            var radius = isOriginal?object._pivotSize/2:self.object.getSpriteRadius();
                            if (collisionResults[0].distance < radius) {
                                //if (self._transformControl) {
                                    //self._transformControl.detach( self._transformControl.object );
                                //}
                                return true;
                            }
                        }
                        var reflectionVectorDest = vertex.clone();
                        var reflectionVector = directionVector.clone();
                        reflectionVector.multiplyScalar(radius);
                        reflectionVectorDest.add(reflectionVector);
                        var raycaster = new THREE.Raycaster(reflectionVectorDest, negDirectionVector);
                        var collisionResults = raycaster.intersectObjects(self._nonCollidibleObjs);
                        if (collisionResults.length > 0) {
                            
                            if ((radius - collisionResults[0].distance) < radius) {//radius) {
                                //if (self._transformControl) {
                                    //self._transformControl.detach( self._transformControl.object );
                                //}
                                return true;
                            }
                        }
                    }
                } else {
                    return self.checkCollisionsForDescription2(object, doNotDoSnapBack, isOriginal);
                }
                
                function getDimension(obj) {
                    return { width: Math.abs(obj.geometry.boundingBox.max.x - obj.geometry.boundingBox.min.x),
                        height: Math.abs(obj.geometry.boundingBox.max.y - obj.geometry.boundingBox.min.y),
                        depth: Math.abs(obj.geometry.boundingBox.max.z - obj.geometry.boundingBox.min.z)
                    };
                }
                
                return false;
            };
            
            this.checkCollisionsForDescription2 = function(object, doNotDoSnapBack, isOriginal) {
                var yawRight = new THREE.Vector3(1, 0, 0);
                var yawLeft = new THREE.Vector3(-1, 0, 0);
                var pitchForward = new THREE.Vector3(0, 1, 0);
                var pitchBackward = new THREE.Vector3(0, -1, 0);
                var rollClockwise = new THREE.Vector3(0, 0, 1);
                var rollCounterclockwise = new THREE.Vector3(0, 0, -1);
                if (!object)// || object.position === void 0)
                    return false;
                var originPoint = isOriginal?object.origin.clone():object.target.clone();//object.position.clone();
                
                var ray = new THREE.Raycaster(originPoint, yawRight.clone().normalize());
                var ray2 = new THREE.Raycaster(originPoint, yawLeft.clone().normalize());
                var ray3 = new THREE.Raycaster(originPoint, pitchForward.clone().normalize());
                var ray4 = new THREE.Raycaster(originPoint, pitchBackward.clone().normalize());
                var ray5 = new THREE.Raycaster(originPoint, rollClockwise.clone().normalize());
                var ray6 = new THREE.Raycaster(originPoint, rollCounterclockwise.clone().normalize());
                var raycasters = [ray, ray2, ray3, ray4, ray5, ray6];
                for (var i in raycasters) {
                    var collisionResults = raycasters[i].intersectObjects(self._nonCollidibleObjs);
                    if (collisionResults.length > 0) {
                        var radius = object.getSpriteRadius();
                        if (collisionResults[0].distance < radius) {
                            if (!doNotDoSnapBack) {
                                var checkCollisionHelperRet = self.checkCollisionHelper(collisionResults);
                                var diff = new THREE.Vector3(checkCollisionHelperRet.geometry.vertices[1].x-checkCollisionHelperRet.geometry.vertices[0].x,
                                    checkCollisionHelperRet.geometry.vertices[1].y-checkCollisionHelperRet.geometry.vertices[0].y,
                                    checkCollisionHelperRet.geometry.vertices[1].z-checkCollisionHelperRet.geometry.vertices[0].z);
                                if (checkCollisionHelperRet) {
                                    if (self._transformControl)
                                        self._transformControl.detach( self._transformControl.object );
                                    var lastVector = originPoint;
                                        //assuming object is line
                                    if (isOriginal) {
                                        object._pivotLast.setX(lastVector.x + diff.x);//>0?1:-1));
                                        object._pivotLast.setY(lastVector.y + diff.y);//>0?1:-1));
                                        object._pivotLast.setZ(lastVector.z + diff.z);//>0?1:-1));
                                        object.origin.copy(object._pivotLast.clone());//checkCollisionHelperRet);
                                        object._pivot.position.copy(object._pivotLast.clone());
                                        object.line.geometry.vertices[0].copy(object._pivotLast.clone());
                                    } else {
                                        diff.multiplyScalar( 2 );
                                        object._pivot2Last.setX(lastVector.x + diff.x);//>0?1:-1));
                                        object._pivot2Last.setY(lastVector.y + diff.y);//>0?1:-1));
                                        object._pivot2Last.setZ(lastVector.z + diff.z);//>0?1:-1));
                                        object.target.copy(object._pivot2Last.clone());//checkCollisionHelperRet);
                                        object._pivot2.position.copy(object._pivot2Last.clone());
                                        object.sprite.position.copy(object._pivot2Last.clone());
                                        object.line.geometry.vertices[1].copy(object._pivot2Last.clone());
                                    }
                                    object.line.geometry.verticesNeedUpdate = true;
                                }
                            } else if (self._transformControl) {
                                self._transformControl.detach( self._transformControl.object );
                                return true;
                            }
                        }
                    }
                }
                
                function getDimension(obj) {
                    return { width: Math.abs(obj.geometry.boundingBox.max.x - obj.geometry.boundingBox.min.x),
                        height: Math.abs(obj.geometry.boundingBox.max.y - obj.geometry.boundingBox.min.y),
                        depth: Math.abs(obj.geometry.boundingBox.max.z - obj.geometry.boundingBox.min.z)
                    };
                }
                
                return false;
            };
            
            this.checkCollisionsForDescription = function(object, doNotDoSnapBack, isOriginal) {
                // collision detection:
                //   determines if any of the rays from the cube's origin to each vertex
                //		intersects any face of a mesh in the array of target meshes
                //   for increased collision accuracy, add more vertices to the cube;
                //		for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
                //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
                if (!object)// || object.position === void 0)
                    return false;
                var originPoint = isOriginal?object.origin.clone():object.target.clone();//object.position.clone();
                //var originPoint2 = object.localToWorld(originPoint);
                self.clearText();
                
                //array of THREE.Vector3 to check for collision
                var vertices = [];
                //for (var vertexIndex = 0; vertexIndex < object.line.geometry.vertices.length; vertexIndex++) {
                if (isOriginal) {
                    //vertices.push(object.origin.clone());
                    var d = getDimension(object._pivot);
                    var boundingBoxMinClone = object._pivot.geometry.boundingBox.min.clone();
                    boundingBoxMinClone.setY(boundingBoxMinClone.y + d.height);
                    vertices.push(boundingBoxMinClone);
                    var boundingBoxMinClone2 = object._pivot.geometry.boundingBox.min.clone();
                    boundingBoxMinClone2.setX(boundingBoxMinClone2.x + d.width);
                    vertices.push(boundingBoxMinClone2);
                    var boundingBoxMinClone3 = object._pivot.geometry.boundingBox.min.clone();
                    boundingBoxMinClone3.setZ(boundingBoxMinClone3.z + d.depth);
                    vertices.push(boundingBoxMinClone3);
                    var boundingBoxMinClone4 = object._pivot.geometry.boundingBox.min.clone();
                    vertices.push(boundingBoxMinClone4);
                    var boundingBoxMaxClone4 = object._pivot.geometry.boundingBox.max.clone();
                    boundingBoxMaxClone4.setY(boundingBoxMaxClone4.y - d.height);
                    vertices.push(boundingBoxMaxClone4);
                    var boundingBoxMaxClone5 = object._pivot.geometry.boundingBox.max.clone();
                    boundingBoxMaxClone5.setX(boundingBoxMaxClone5.x - d.width);
                    vertices.push(boundingBoxMaxClone5);
                    var boundingBoxMaxClone6 = object._pivot.geometry.boundingBox.max.clone();
                    boundingBoxMaxClone6.setZ(boundingBoxMaxClone6.z - d.depth);
                    vertices.push(boundingBoxMaxClone6);
                    var boundingBoxMaxClone7 = object._pivot.geometry.boundingBox.max.clone();
                    vertices.push(boundingBoxMaxClone7);
                } else {
                    vertices = object.getSpriteVertices();
                }
        
                //if (object.line.geometry.vertices && object.line.geometry.vertices.length > 0) {
                if (isOriginal) {
                    for (var i in vertices) {
                        var localVertex = vertices[i].clone();
                        //var localVertex = object.line.geometry.vertices[vertexIndex].clone();
                        var globalVertex = localVertex.applyMatrix4( isOriginal?object._pivot.matrix:object.sprite.matrix );
                        var directionVector = globalVertex.sub( originPoint );
		
                        var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
                        var collisionResults = ray.intersectObjects( self._nonCollidibleObjs );
                        if ( collisionResults.length > 0) {
                            if ( collisionResults[0].distance < directionVector.length() ) {
                                self.appendText(" Hit ");
                                if (!doNotDoSnapBack) {
                                    var checkCollisionHelperRet = self.checkCollisionHelper(collisionResults);
                                    var diff = new THREE.Vector3(checkCollisionHelperRet.geometry.vertices[1].x-checkCollisionHelperRet.geometry.vertices[0].x,
                                        checkCollisionHelperRet.geometry.vertices[1].y-checkCollisionHelperRet.geometry.vertices[0].y,
                                        checkCollisionHelperRet.geometry.vertices[1].z-checkCollisionHelperRet.geometry.vertices[0].z);
                                    /*var diff = new THREE.Vector3(self._lastVector.x-collisionResults[0].point.x,
                                        self._lastVector.y-collisionResults[0].point.y,
                                        self._lastVector.z-collisionResults[0].point.z);*/
                                    if (checkCollisionHelperRet) {
                                        if (self._transformControl)
                                            self._transformControl.detach( self._transformControl.object );
                                        var lastVector = originPoint;
                                        //assuming object is line
                                        if (isOriginal) {
                                            object._pivotLast.setX(lastVector.x + diff.x);//>0?1:-1));
                                            object._pivotLast.setY(lastVector.y + diff.y);//>0?1:-1));
                                            object._pivotLast.setZ(lastVector.z + diff.z);//>0?1:-1));
                                            object.origin.copy(object._pivotLast.clone());//checkCollisionHelperRet);
                                            object._pivot.position.copy(object._pivotLast.clone());
                                            object.line.geometry.vertices[0].copy(object._pivotLast.clone());
                                        } else {
                                            diff.multiplyScalar( 5 );
                                            object._pivot2Last.setX(lastVector.x + diff.x);//>0?1:-1));
                                            object._pivot2Last.setY(lastVector.y + diff.y);//>0?1:-1));
                                            object._pivot2Last.setZ(lastVector.z + diff.z);//>0?1:-1));
                                            object.target.copy(object._pivot2Last.clone());//checkCollisionHelperRet);
                                            object._pivot2.position.copy(object._pivot2Last.clone());
                                            object.sprite.position.copy(object._pivot2Last.clone());
                                            object.line.geometry.vertices[1].copy(object._pivot2Last.clone());
                                        }
                                        object.line.geometry.verticesNeedUpdate = true;
                                    }
                                    //object.line.geometry.verticesNeedUpdate = true;
                                }
                                return true;
                            } else {
                                var objectOriginClone = object.origin.clone();
                                var objectTargetClone = object.target.clone();
                                object._pivotLast.copy(objectOriginClone);
                                object._pivot2Last.copy(objectTargetClone);
                            }
                        }
                    }
                } else {
                    return self.checkCollisionsForDescription2(object, doNotDoSnapBack, isOriginal);
                }
                
                function getDimension(obj) {
                    return { width: Math.abs(obj.geometry.boundingBox.max.x - obj.geometry.boundingBox.min.x),
                        height: Math.abs(obj.geometry.boundingBox.max.y - obj.geometry.boundingBox.min.y),
                        depth: Math.abs(obj.geometry.boundingBox.max.z - obj.geometry.boundingBox.min.z)
                    };
                }
                
                return false;
            };
            
            this.intersection = {
		intersects: false,
		point: new THREE.Vector3(),
		normal: new THREE.Vector3()
            };
            
            this.checkCollisionHelper = function(intersects) {

		if ( intersects.length > 0 ) {

                    var p = intersects[ 0 ].point;
                    //var mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 10 ), new THREE.MeshNormalMaterial() );
                    //mouseHelper.visible = false;
                    //scene.add(mouseHelper);
                    //mouseHelper.position.copy( p );
                    self.intersection.point.copy( p );

                    var n = intersects[ 0 ].face.normal.clone();
                    n.multiplyScalar( self._snapBackDistance );
                    n.add( intersects[ 0 ].point );

                    self.intersection.normal.copy( intersects[ 0 ].face.normal );
                    //mouseHelper.lookAt( n );
                    self._line.geometry.vertices[ 0 ].copy( self.intersection.point );
                    self._line.geometry.vertices[ 1 ].copy( n );
                    self._line.geometry.verticesNeedUpdate = true;
                    self._line.visible = false;

                    self.intersection.intersects = true;
                    return self._line;
		} else {

                    self.intersection.intersects = false;

		}

            };
            
            this.clearText = function() {   
                document.getElementById(self._display).innerHTML = '..........';   
            };

            this.appendText = function(txt) {   
                document.getElementById(self._display).innerHTML += txt;   
            };
            
            this.reset = function() {
                
            };

        };

/* 原型 */
THREE.CollisionControl.prototype = {
    constructor: THREE.CollisionControl
};
}() );