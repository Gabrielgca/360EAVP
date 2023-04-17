var FOVEditRule;

function FOVEditRuleClass() {

    let factory = dashjs.FactoryMaker;
    let SwitchRequest = factory.getClassFactoryByName('SwitchRequest');
    let DashMetrics = factory.getSingletonFactoryByName('DashMetrics');
    let DashManifestModel = factory.getSingletonFactoryByName('DashManifestModel');
    
    let StreamController = factory.getSingletonFactoryByName('StreamController');
    let Debug = factory.getSingletonFactoryByName('Debug');

    let context = this.context;
    let next_edit = 0;
    let instance,
        logger;

    function setup() {
        logger = Debug(context).getInstance().getLogger(instance);
    }

    function getBytesLength(request) {
        return request.trace.reduce(function (accumulator, currentByte) {
            return accumulator + currentByte.b[0];
        }, 0);
    }

    function getMaxIndex(rulesContext) {
        
        let mediaType = rulesContext.getMediaInfo().type;
        
        let dashMetrics = DashMetrics(context).getInstance();
        let streamController = StreamController(context).getInstance();
        let dashManifest = DashManifestModel(context).getInstance();
        let abrController = rulesContext.getAbrController();
        let current = abrController.getQualityFor(mediaType, streamController.getActiveStreamInfo().id);
        let mediaInfo = rulesContext.getMediaInfo();
        
        var appElement = document.querySelector('[ng-controller=DashController]');
        var $scope = angular.element(appElement).scope();

        var currentFrame = $scope.frameNumber.get();
        var currentBuffer = dashMetrics.getCurrentBufferLevel('video');
        
        let frameRate = $scope.videoFrameRate;

        let editInfoJSON = $scope.contents.edits.edit;
        let editInfo = editInfoJSON[next_edit];
        let nextEditedFrame = editInfo && editInfo["frame"];
        let segmentWithEdit = nextEditedFrame && Math.ceil(nextEditedFrame / frameRate);
        // Segment being displayed on video
        let currentSegmentPlayback = currentFrame && Math.ceil(currentFrame / frameRate)
        // Current segment being requested
        let currentSegmentNumber;
        let requests = dashMetrics.getHttpRequests(mediaType),
        lastRequest = null,
        currentRequest = null,
        downloadTime,
        totalTime,
        calculatedBandwidth,
        currentBandwidth,
        latencyInBandwidth,
        switchUpRatioSafetyFactor,
        currentRepresentation,
        count,
        bandwidths = [],
        i,
        q = SwitchRequest.NO_CHANGE,
        p = SwitchRequest.PRIORITY.DEFAULT,
        totalBytesLength = 0;
        latencyInBandwidth = true;
        switchUpRatioSafetyFactor = 1.5;
        
        
        let lastSegmentUrl = requests[requests.length - 1]["url"];
        
        // console.log("🚀 ~ file: FOVEditRule.js:71 ~ getMaxIndex ~ lastSegment", lastSegmentUrl);
        // console.log("🚀 ~ file: FOVEditRule.js:55 ~ getMaxIndex ~ segmentWithEdit", segmentWithEdit)
        
        const re = /seg-(\d+).m4s/gm;

        let lastSegmentNumber = re.exec(lastSegmentUrl);
        // console.log("🚀 ~ file: FOVEditRule.js:75 ~ getMaxIndex ~ lastSegmentNumber", lastSegmentNumber);
        

        // console.log("[CustomRules][" + mediaType + "][FOVEditRule] Checking download ratio rule... (current = " + current + ")");

        if (!requests) {
            // console.log("[CustomRules][" + mediaType + "][FOVEditRule] No metrics, bailing.");
            return SwitchRequest(context).create();
        }
        //_tfinish = The real time at which the request finished.
        // trequest = The real time at which the request was sent.
        // tresponse =  The real time at which the first byte of the response was received.
        // trace = Throughput traces, for successful requests only.
        
        // Get last valid request
        i = requests.length - 1;
        while (i >= 0 && lastRequest === null) {
            currentRequest = requests[i];
            if (currentRequest._tfinish && currentRequest.trequest && currentRequest.tresponse && currentRequest.trace && currentRequest.trace.length > 0) {
                lastRequest = requests[i];
            }
            i--;
        }
        
        if (lastRequest === null) {
            // console.log("[CustomRules][" + mediaType + "][FOVEditRule] No valid requests made for this stream yet, bailing.");
            return SwitchRequest(context).create();
        }
        
        if (lastRequest.type !== 'MediaSegment') {
            // console.log("[CustomRules][" + mediaType + "][FOVEditRule] Last request is not a media segment, bailing.");
            return SwitchRequest(context).create();
        }
        
        totalTime = (lastRequest._tfinish.getTime() - lastRequest.trequest.getTime()) / 1000;
        downloadTime = (lastRequest._tfinish.getTime() - lastRequest.tresponse.getTime()) / 1000;
        
        if (totalTime <= 0) {
            // console.log("[CustomRules][" + mediaType + "][FOVEditRule] Don't know how long the download of the last fragment took, bailing.");
            return SwitchRequest(context).create();
        }
        // console.log("LAST REQUEST", lastRequest)
        totalBytesLength = getBytesLength(lastRequest);
        
        // console.log("[CustomRules][" + mediaType + "][FOVEditRule] DL Lasr Request: " + Number(downloadTime.toFixed(3)) + "s, Total: " + Number(totalTime.toFixed(3)) + "s, Length: " + totalBytesLength);

        // Take average bandwidth over 5 requests
        count = 1;
        // console.log("requests LENGTH", requests.length)
        while (i >= 0 && count < 5) {
            currentRequest = requests[i];

            if (currentRequest._tfinish && currentRequest.trequest && currentRequest.tresponse && currentRequest.trace && currentRequest.trace.length > 0) {

                let _totalTime = (currentRequest._tfinish.getTime() - currentRequest.trequest.getTime()) / 1000;

                let _downloadTime = (currentRequest._tfinish.getTime() - currentRequest.tresponse.getTime()) / 1000;
                
                // console.log("[CustomRules][" + mediaType + "][FOVEditRule] DL Average [" + count + "]: " + Number(_downloadTime.toFixed(3)) + "s, Total: " + Number(_totalTime.toFixed(3)) + "s, Length: " + getBytesLength(currentRequest));
                // console.log("currentRequest IF", currentRequest)
                totalTime += _totalTime;
                downloadTime += _downloadTime;
                totalBytesLength += getBytesLength(currentRequest);
                count += 1;
            }
            else {
                // console.log("[CustomRules][" + mediaType + "][FOVEditRule] Not a valid Request [" + count + "]");
                // console.log("currentRequest ELSE", currentRequest)
            }
            i--;
        }

        // Set length in bits
        totalBytesLength *= 8;

        calculatedBandwidth = latencyInBandwidth ? (totalBytesLength / totalTime) : (totalBytesLength / downloadTime);

        // console.log("[CustomRules][" + mediaType + "][FOVEditRule] BW = " + Math.round(calculatedBandwidth / 1000) + " kb/s");

        if (isNaN(calculatedBandwidth)) {
            return SwitchRequest(context).create();
        }

        count = rulesContext.getMediaInfo().representationCount;
        currentRepresentation = rulesContext.getRepresentationInfo();
        currentBandwidth = dashManifest.getBandwidth(currentRepresentation);
        for (i = 0; i < count; i += 1) {
            bandwidths.push(rulesContext.getMediaInfo().bitrateList[i].bandwidth);
        }
        if (calculatedBandwidth <= currentBandwidth) {
            for (i = current - 1; i > 0; i -= 1) {
                if (bandwidths[i] <= calculatedBandwidth) {
                    break;
                }
            }
            q = i;
            p = SwitchRequest.PRIORITY.WEAK;

            // // console.log("[CustomRules] SwitchRequest Low: q=" + q + "/" + (count - 1) + " (" + bandwidths[q] + ")"/* + ", p=" + p*/);
            // return SwitchRequest(context).create(q, { name: FOVEditRuleClass.__dashjs_factory_name }, p);
        } else {
            for (i = count - 1; i > current; i -= 1) {
                if (calculatedBandwidth > (bandwidths[i] * switchUpRatioSafetyFactor)) {
                    // console.log("[CustomRules][" + mediaType + "][FOVEditRule] bw = " + calculatedBandwidth + " results[i] * switchUpRatioSafetyFactor =" + (bandwidths[i] * switchUpRatioSafetyFactor) + " with i=" + i);
                    break;
                }
            }

            q = i;
            p = SwitchRequest.PRIORITY.STRONG;

            // // console.log("[CustomRules] SwitchRequest High: q=" + q + "/" + (count - 1) + " (" + bandwidths[q] + ")"/* + ", p=" + p*/);
            // return SwitchRequest(context).create(q, { name: FOVEditRuleClass.__dashjs_factory_name }, p);
        }

        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////

        var info = abrController.getSettings().info;


        // console.log("predictedViewport", predictedViewport);
        // console.log("FRAME NUMBER", $scope.frameNumber.get());
        currentSegmentNumber = +lastSegmentNumber[1] && +lastSegmentNumber[1] + 1;

        let index_dist_nearest_roi;

        let predictWindow = currentSegmentNumber -  currentSegmentPlayback;


        // console.log("info", info)
        // console.log("$visible_faces", visible_faces);
        // console.log("center_viewport_x, center_viewport_y", center_viewport_x, center_viewport_y);
        let predictedViewport;
        if (predictWindow > 1){
            // RIDGE REGRESSION
            predictedViewport = $scope.predict_center_viewport(predictWindow*frameRate, ridge = true);
        }
        else {
            // LINEAR REGRESSION
            predictedViewport = $scope.predict_center_viewport(predictWindow*frameRate);
        }

        let predict_center_viewport_x = predictedViewport[0];
        let predict_center_viewport_y = predictedViewport[1];

        // console.log("currentSegmentPlayback: ", currentSegmentPlayback,"currentSegmentNumber: ", currentSegmentNumber, "Predict windows: ", currentSegmentNumber -  currentSegmentPlayback);

        if (currentSegmentNumber == segmentWithEdit){
           let result = getNearestRegionOfInterest(predict_center_viewport_x, editInfo);
           if (result){
               index_dist_nearest_roi = result[2];

               let nearest_region_of_interest = editInfo["region_of_interest"][index_dist_nearest_roi]["ROI_theta"];
               let roi_x_radians = convert_normalized_to_radians(nearest_region_of_interest);
               let roi_viewport = [roi_x_radians, predict_center_viewport_y];

               return computedQuality(info, q, roi_viewport, bandwidths, $scope);
            }
            
            next_edit++;
            
        }

        return computedQuality(info, q, predictedViewport, bandwidths, $scope);

    }


    function computedQuality (info, maxQuality,  predictedViewport, bandwidths, $scope) {
        let factory = dashjs.FactoryMaker;
        let SwitchRequest = factory.getClassFactoryByName('SwitchRequest');
        const switchRequest = SwitchRequest(context).create();

        let predicted_visible_faces = $scope.get_visible_faces(predictedViewport[0], predictedViewport[1]);

        let [isFaceVisible, percentageVisibleFace] = isFaceVisibleOnVP(info, predicted_visible_faces);

        if (isFaceVisible){
            // console.log("FACE ", info.face, "IS VISIBLE AND ITS PERCENTAGE IS ", percentageVisibleFace);

            if (percentageVisibleFace < 0.10){
                switchRequest.quality = maxQuality - 1;
                switchRequest.reason = 'Face is slightly visible. Getting one quality lower than the max quality possible';
            }
            else {
                switchRequest.quality = maxQuality;
                switchRequest.reason = 'Face is visible. Selecting high quality possible.';      
            }
            switchRequest.priority = SwitchRequest.PRIORITY.STRONG;
        }
        else {
            // console.log("FACE ", info.face, "IS NOT VISIBLE. SELECTING THE LOWEST QUALITY.");

            let tag = 0;

            // Choose the lowest bitrate
            for (let i = 1; i < bandwidths.length; i++) {  
                if (bandwidths[i] < bandwidths[tag]) {
                    tag = i;
                }
            }

            switchRequest.quality = tag;
            switchRequest.reason = 'Face is not visible. Selecting the lowest quality';
            switchRequest.priority = SwitchRequest.PRIORITY.WEAK;
        }

        return switchRequest;  
    }

function isFaceVisibleOnVP(info, center_viewport) {

    let isFaceVisible = false;
    let percentageVisibleFace;
    for (face in center_viewport){
        
        if (face.includes(info.face) ){
            isFaceVisible = true;
            percentageVisibleFace = center_viewport[face];
            break;
        }

    }
    return [isFaceVisible, percentageVisibleFace];

}

function getNearestRegionOfInterest(CvpXRadians, editInfo)
    {
        let abs_dist_nearest_roi = Infinity;
        let dist_nearest_roi;
        let index_dist_nearest_roi = 0;

        // console.log("editInfo['region_of_interest']",editInfo["region_of_interest"]);

        for (let i in editInfo["region_of_interest"])
        {
            let ROIXRadians = convert_normalized_to_radians(editInfo["region_of_interest"][i]["ROI_theta"]);
            
            let CvpXOpositeRadians = CvpXRadians > 0 ? CvpXRadians - Math.PI : CvpXRadians + Math.PI;
            // let getRotationDirecition = CvpXRadians > 0 ? getRotationDirecitionByNegativeCvp() : getRotationDirecitionByPositiveCvp();
            
            let curr_dist_roi = getSphereRotation(CvpXRadians, CvpXOpositeRadians, ROIXRadians);
            
            if (Math.abs(curr_dist_roi) < abs_dist_nearest_roi){
                index_dist_nearest_roi = i;
                abs_dist_nearest_roi = Math.abs(curr_dist_roi);		
                dist_nearest_roi = curr_dist_roi;
                
            }
            
        }
        // console.log("🚀 ~ file: FOVEditRule.js:318 ~ FOVEditRuleClass ~ abs_dist_nearest_roi", abs_dist_nearest_roi)
        return [abs_dist_nearest_roi, dist_nearest_roi, index_dist_nearest_roi];
    }

function getSphereRotation(CvpXRadians, CvpXOpositeRadians, ROIXRadians)
    {
        // //console.log("ROIXRadians " + ROIXRadians);
        // //console.log("CvpXOpositeRadians " + CvpXOpositeRadians);
        // //console.log("CvpXRadians " + CvpXRadians);
        if ((CvpXRadians > 0 && ROIXRadians > 0) || (CvpXRadians < 0 && ROIXRadians < 0))
        {
            // //console.log("CvpXRadians and ROIXRadians in the same quadrant")
            return ROIXRadians - CvpXRadians;
        }
        
        if (CvpXOpositeRadians > 0)
        {

            // CvpXRadians is negative and ROIXRadians is positive
            if (CvpXOpositeRadians < ROIXRadians)
            {
                //Rotates to the left
                // //console.log("CvpXRadians is negative and ROIXRadians is positive Rotates to the left")
                return -1*((Math.PI + CvpXRadians) + (Math.PI - ROIXRadians));
            }
            else
            {
                //Rotates to the right
                // //console.log("CvpXRadians is negative and ROIXRadians is positive Rotates to the right")
                return ROIXRadians - CvpXRadians;
            }
        }
        else
        {
            // CvpXRadians is positive and ROIXRadians is negative
            
            if (CvpXOpositeRadians < ROIXRadians)
            {
                //Rotates to the left
                // //console.log("CvpXRadians is positive and ROIXRadians is negative Rotates to the left")
                return -1*(CvpXRadians - ROIXRadians);
            }
            else
            {
                //Rotates to the right
                // //console.log("CvpXRadians is positive and ROIXRadians is negative Rotates to the right")
                return (Math.PI - CvpXRadians) + (Math.PI + ROIXRadians);
            }
            
        }
    }

function convert_normalized_to_radians(cvp_norm) {
    return 2*Math.PI*cvp_norm - Math.PI;
};

    instance = {
        getMaxIndex: getMaxIndex,
    };

    setup();

    return instance;
}

FOVEditRuleClass.__dashjs_factory_name = 'FOVEditRule';
FOVEditRule = dashjs.FactoryMaker.getClassFactory(FOVEditRuleClass);
