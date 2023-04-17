var LowestBitrateRule;

// Rule that selects the possible lowest bitrate
function LowestBitrateRuleClass() {

    let factory = dashjs.FactoryMaker;
    let SwitchRequest = factory.getClassFactoryByName('SwitchRequest');
    let DashMetrics = factory.getSingletonFactoryByName('DashMetrics');
    let StreamController = factory.getSingletonFactoryByName('StreamController');
    let context = this.context;
    let instance;

    function setup() {
    }

    // Always select the lowest bitrate
    function getMaxIndex(rulesContext) {
        //console.log("rulesContext: ", rulesContext);
        //console.log("rulesContext.getMediaInfo(): ", rulesContext.getMediaInfo());
        const switchRequest = SwitchRequest(context).create();

        if (!rulesContext || !rulesContext.hasOwnProperty('getMediaInfo') || !rulesContext.hasOwnProperty('getAbrController')) {
            return switchRequest;
        }

        const mediaType = rulesContext.getMediaInfo().type;
        const mediaInfo = rulesContext.getMediaInfo();
        const abrController = rulesContext.getAbrController();
        let dashMetrics = DashMetrics(context).getInstance();
        let streamController = StreamController(context).getInstance();

        var appElement = document.querySelector('[ng-controller=DashController]');
        var $scope = angular.element(appElement).scope();
        let center_viewport_x = $scope.center_viewport_x;
        let center_viewport_y = $scope.center_viewport_y;
        // console.log("streamController: ", streamController);
        // console.log("$center_viewport_x", $scope.center_viewport_x);
        // console.log("$time_array", $scope.time_array);
        if (mediaType != "video") {  // Default settings for audio
            return switchRequest;           
        }

        // Ask to switch to the lowest bitrate
        switchRequest.quality = 0;
        switchRequest.reason = 'Always switching to the lowest bitrate';
        switchRequest.priority = SwitchRequest.PRIORITY.STRONG;

        const bitrateList = abrController.getBitrateList(mediaInfo);  // List of all the selectable bitrates

        let tag = 0;
        if (bitrateList.length <= 1) {
            return switchRequest;
        }
        for (let i = 1; i < bitrateList.length; i++) {  // Choose the lowest bitrate
            if (bitrateList[i].bitrate < bitrateList[tag].bitrate) {
                tag = i;
            }
        }


        switchRequest.quality = tag;

        return switchRequest;
    }

    instance = {
        getMaxIndex: getMaxIndex,
    };

    setup();

    return instance;
}

LowestBitrateRuleClass.__dashjs_factory_name = 'LowestBitrateRule';
LowestBitrateRule = dashjs.FactoryMaker.getClassFactory(LowestBitrateRuleClass);

