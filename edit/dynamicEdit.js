// Dynamic Edit with SnapCut and Fade Rotation

const INSTANT_EDIT = "instant";
const GRADUAL_EDIT = "gradual";

const EDIT_TIME = 1.5; //time in seconds that the edit will take
const FADE_TIME = EDIT_TIME/2; //time in seconds after edit started to start the fade animation
const ROTATION_SPEED = 0.002; //radians per frame (60 frames per second on web)
const OPACITY_THRESHOLD = 0.95; // opacity that will start the snapcut on the fade rotation edit
const ENABLE_EDIT = true;



var sphere_reference, camera_reference;
var doIt = true;
var doFade = true;

var enableRotation = true;
var enableFade = true;
var fadeStarted = false;
var fadePaused = false;
var isSnapCutEnabled = true;
var dist_nearest_roi_gradual;
var direction;
var isRotating = false;
var editEditInfoJSON;
let next_edit = 0;
let CvpXRadians, CvpYRadians;
let last_frame_with_edit = 0;
    
function dynamicEditClass () {
        
    [sphere_reference, camera_reference ] = getIframeEntities('frame');
    
    var appElement = document.querySelector('[ng-controller=DashController]');
    var $scope = angular.element(appElement).scope();
    editEditInfoJSON = $scope.contents.edits && $scope.contents.edits.edit;
    
    if ( $scope.frameNumber == 0) {
        $scope.frameNumber = camera_reference.videoFrames["video_0"];
        $scope.videoFrameRate = camera_reference.videoFrames["video_0"]["frameRate"];
    }

    let isVideoRunning = $scope.buffer_empty_flag.filter(empty => empty == true).length > 0 ? false : true;

    if (ENABLE_EDIT && isVideoRunning && editEditInfoJSON){
    
        var currentFrame = $scope.frameNumber.get();
        var frameRate = $scope.videoFrameRate;

        let CvpRadians = sphere_reference["head_movement_radians"];
        
        if (CvpRadians != undefined){

            
            // Only use the X axis for the edit
            CvpXRadians = CvpRadians[0];
            $scope.yaw = CvpRadians[0];
            CvpYRadians = CvpRadians[1];
            $scope.pitch = CvpRadians[1];     
    
            let sphereOpacity = sphere_reference.object3DMap.mesh.material.opacity;

            //Fade Effect Showcase
            if (editEditInfoJSON[next_edit] && editEditInfoJSON[next_edit]["type"] == GRADUAL_EDIT){

                if (fadeStarted && fadePaused){
                    console.log("RESUME")
                    sphere_reference.emit('resumeFadeEffect');
                    fadePaused = false;
                }
                
                let currentFrameEdit = editEditInfoJSON[next_edit] ? editEditInfoJSON[next_edit]["frame"] : 0;
                let frameStartGradualRotation = Math.ceil(currentFrameEdit - (EDIT_TIME * 2 * frameRate));
                let frameStopGradualRotation = Math.ceil(currentFrameEdit + (EDIT_TIME * 0.5 * frameRate));
                let frameStartFade = Math.ceil(frameStopGradualRotation - ((EDIT_TIME + FADE_TIME)* 2 * frameRate));
                
                if (currentFrame >= frameStartGradualRotation  && enableRotation ){
                    console.log("START ROTATION");
                    
                    //Predict where the user will be looking on the Edit frame to know if the edit will happen or not

                    let predictedViewport = $scope.predict_center_viewport(currentFrameEdit - currentFrameEdit);
                    let predict_center_viewport_x = predictedViewport[0];;

                    [dist_nearest_roi_gradual, direction,] = getNearestRegionOfInterest(predict_center_viewport_x);
                    


                    // if the RoI is under 30° from the current center of the viewport, it is not needed to do an edit
                    if (dist_nearest_roi_gradual >= 0.5235 ){
                        isRotating = true;
                    }

                    enableRotation = false;
                }

    
                if (currentFrame >= frameStartFade && enableFade && isRotating){
                    console.log("START FADE");
                    sphere_reference.emit('startFadeEffect');
                    enableFade = false;
                    fadeStarted = true;
                }

                if (sphereOpacity >= OPACITY_THRESHOLD && fadeStarted && doIt){
                    console.log("START SNAPCUT");
                    doIt = false;
                    let snapCutRotation;
                    let delay;
                    if (direction > 0){
                        delay = -ROTATION_SPEED * (frameRate / 2);
                    }
                    else {
                        delay = ROTATION_SPEED * (frameRate / 2);
                    }
                    snapCutRotation = handleSnapCut(CvpXRadians - delay);

                    

                    if (snapCutRotation != undefined){
                        $scope.radiansRotationValue = snapCutRotation;
                        $scope.editHappenedValue = true;
                    }
                }
    
                if (isRotating){
                    $scope.editTypeValue = GRADUAL_EDIT;
                    $scope.hasEditScheduledValue = true;

                    const quaternion = new THREE.Quaternion();
                    

                    if (direction > 0)
                    {
                        quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), ROTATION_SPEED );
                        camera_reference.object3D.quaternion.multiply(quaternion);
                        sphere_reference.object3D.quaternion.multiply(quaternion);

                        const quaternionFace = new THREE.Quaternion();
                        quaternionFace.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), ROTATION_SPEED );
                
                        for (var face in camera_reference.faceStructure) {
                            for (var position = 0; position < camera_reference.faceStructure[face].length; position++){
                                camera_reference.faceStructure[face][position].applyQuaternion(quaternionFace);
                                
                            }
                        }
                    }
                    else {
                        quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ),-1*ROTATION_SPEED );
                        camera_reference.object3D.quaternion.multiply(quaternion);
                        sphere_reference.object3D.quaternion.multiply(quaternion);

                        const quaternionFace = new THREE.Quaternion();
                        quaternionFace.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), -1*ROTATION_SPEED );
                
                        for (var face in camera_reference.faceStructure) {
                            for (var position = 0; position < camera_reference.faceStructure[face].length; position++){
                                camera_reference.faceStructure[face][position].applyQuaternion(quaternionFace);
                                
                            }
                        }
                    }
    
                }

                if (currentFrame >= frameStopGradualRotation){
                    console.log("STOP ROTATION");
                    next_edit++;
                    isRotating = false;
                    enableRotation = true;
                    enableSnapCut = true;
                    enableFade = true;
                    fadeStarted = false;
                    doIt = true;

                    $scope.editTypeValue = "null";
                    $scope.radiansRotationValue = 0;
                    $scope.hasEditScheduledValue = false;
                    $scope.editHappenedValue = false;
                }
            }
        
            
            // Check if there is another edit to be done, if the current frame has an edit on the ediInfo file 
            // and if the last frame already had an edit (this is needed because the last frame is redrawn when the edit happens)
            if (editEditInfoJSON[next_edit] && editEditInfoJSON[next_edit]["type"] == INSTANT_EDIT)
            {
                let currentFrameEdit = editEditInfoJSON[next_edit] ? editEditInfoJSON[next_edit]["frame"] : 0;
                
                if (currentFrame >= currentFrameEdit && last_frame_with_edit != currentFrame ){
                    console.log("START INSTANT SNAPCUT");
                    $scope.editTypeValue = INSTANT_EDIT;
                    $scope.hasEditScheduledValue = true;

                    let snapCutRotation = handleSnapCut(CvpXRadians);
                    last_frame_with_edit = currentFrame;
                    if (snapCutRotation != undefined){
                        $scope.radiansRotationValue = snapCutRotation;
                        $scope.editHappenedValue = true;
                    }
                    next_edit++;
                }
            }
        }
    }
    else if (fadeStarted && !isVideoRunning){
        console.log("PAUSE")
        fadePaused = true;
        sphere_reference.emit('pauseFadeEffect');
    }
    console.log("fadeStarted:", fadeStarted)
    requestAnimationFrame(dynamicEditClass);
}


function getIframeEntities(frameId) {
    var frameObj = document.getElementById(frameId);
    if (frameObj){
        var camera_reference = frameObj.contentWindow.document.querySelector('#video_camera');
        var sphere_reference = frameObj.contentWindow.document.querySelector('#sky-sphere'); 
        return [sphere_reference, camera_reference];
    }
    return;
    }


function fireRotation (roi_radians)
    {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), roi_radians );
        console.log("fire Rotation!!");
        console.log("BEFORE camera_reference.faceStructure", camera_reference.faceStructure);
        const quaternionFace = new THREE.Quaternion();
        quaternionFace.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), roi_radians );

        for (var face in camera_reference.faceStructure) {
            for (var position = 0; position < camera_reference.faceStructure[face].length; position++){
                camera_reference.faceStructure[face][position].applyQuaternion(quaternionFace);
                
            }
        }
        console.log("AFTER camera_reference.faceStructure", camera_reference.faceStructure);
        camera_reference.object3D.quaternion.multiply(quaternion);
        sphere_reference.object3D.quaternion.multiply(quaternion);
    }


function handleSnapCut(CvpXRadians)
{
    let abs_dist_nearest_roi, dist_nearest_roi, index_dist_nearest_roi;
            
    [abs_dist_nearest_roi, dist_nearest_roi, index_dist_nearest_roi]= getNearestRegionOfInterest(CvpXRadians)
    

    // if the RoI is under 30° from the current center of the viewport, it is not needed to do a snapcut
    if (abs_dist_nearest_roi >= 0.5235){
                    
        fireRotation(dist_nearest_roi);
    }
    else {
        doIt = false;
    }

    return dist_nearest_roi;

}

function getNearestRegionOfInterest(CvpXRadians)
{
    let abs_dist_nearest_roi = Infinity;
    let dist_nearest_roi;
    let index_dist_nearest_roi = 0;

    for (let i in editEditInfoJSON[next_edit]["region_of_interest"])
    {
        let ROIXRadians = convert_normalized_to_radians(editEditInfoJSON[next_edit]["region_of_interest"][i]["ROI_theta"]);
        
        let CvpXOpositeRadians = CvpXRadians > 0 ? CvpXRadians - Math.PI : CvpXRadians + Math.PI;

        let curr_dist_roi = getSphereRotation(CvpXRadians, CvpXOpositeRadians, ROIXRadians);
        
        if (Math.abs(curr_dist_roi) < abs_dist_nearest_roi){
            index_dist_nearest_roi = i;
            abs_dist_nearest_roi = Math.abs(curr_dist_roi);		
            dist_nearest_roi = curr_dist_roi;

        }
    }

    return [abs_dist_nearest_roi, dist_nearest_roi, index_dist_nearest_roi]
}

function getSphereRotation(CvpXRadians, CvpXOpositeRadians, ROIXRadians)
{
    if ((CvpXRadians > 0 && ROIXRadians > 0) || (CvpXRadians < 0 && ROIXRadians < 0))
    {
        return ROIXRadians - CvpXRadians;
    }
    
    if (CvpXOpositeRadians > 0)
    {
        // CvpXRadians is negative and ROIXRadians is positive
        if (CvpXOpositeRadians < ROIXRadians)
        {
            //Rotates to the left
            return -1*((Math.PI + CvpXRadians) + (Math.PI - ROIXRadians));
        }
        else
        {
            //Rotates to the right
            return ROIXRadians - CvpXRadians;
        }
    }
    else
    {
        // CvpXRadians is positive and ROIXRadians is negative
        if (CvpXOpositeRadians < ROIXRadians)
        {
            //Rotates to the left
            return -1*(CvpXRadians - ROIXRadians);
        }
        else
        {
            //Rotates to the right
            return (Math.PI - CvpXRadians) + (Math.PI + ROIXRadians);
        }
        
    }
}

function convert_normalized_to_degree(cvp_norm) {
    return 360*cvp_norm - 180;
};

function convert_normalized_to_radians(cvp_norm) {
    return 2*Math.PI*cvp_norm - Math.PI;
};