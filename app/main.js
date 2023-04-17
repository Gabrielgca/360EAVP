var app = angular.module('myapp', [
    'ngRoute'
  ]);

// Definindo Rotas
app.config(function($routeProvider, $locationProvider){
  // Utilizando o HTML5 History API

  $routeProvider
  .when('/', {
    templateUrl : 'pages/home.html',
    controller  : 'HomeController'
  })
  .when('/about', {
    templateUrl : 'pages/about.html',
    controller  : 'AboutController'
  })
  .when('/contact', {
    templateUrl : 'pages/contact.html',
    controller  : 'ContactController'
  })
  .when('/player', {
    templateUrl : 'pages/player.html',
    controller  : 'DashController'
  })
});


app.controller('HomeController', function($scope) {
    $scope.message = 'Routing pages with ngRoute is damn awesome!';
  });
  
  app.controller('AboutController', function($scope) {
    $scope.message = 'You can see more about ngRoute in the oficial website.';
  });
  
  app.controller('ContactController', function($scope) {
    $scope.message = 'No. :P';
  });

  app.controller('DashController', ['$scope','$interval', function ($scope, $interval) {
      //$interval(function () {}, 1);
      //// Global variables for storage
      $scope.players = [];  // Container for players, which is easy for us to operate in them.
      $scope.playerCount = 0;
      //Value will be fullfil on the dynamincEdit File on the beginning of the playback
      $scope.videoFrameRate = 0;
      $scope.frameNumber = 0;
      $scope.buffer_empty_flag = [];  // Flags for players, showing whether the player is frozen or not.
      $scope.lon = 90, $scope.lat = 0;  // Longitude and latitude in spherical coordinates.
      $scope.pointerX, $scope.pointerY;  // Position of mouse click
      $scope.contents = {};  // Contents from JSON file
      $scope.startupTime = new Date().getTime();  // Initialize the startup time
      $scope.totalQOE = 0;  // Compute the QoE considering all playing tiles
      $scope.viewerQOE = 0;  // Compute the QoE considering the tiles in FOV
      $scope.contentQOE = 0;  // Compute the QoE considering the tiles in FOV with contents as well
  
      $scope.player_ready = 0;
  
      $scope.auto_play_vr = false; // Set to enter automatically to VR mode when the the video is ready
  
      $scope.json_output = [];
      $scope.download_started = false;
  
      $scope.normalizedTime = 0;  // Set the fastest mediaplayer's timeline as the normalized time
      $scope.totalThroughput = 0;  // Data from monitor
      $scope.playerBufferLength = [];  // Data from monitor
      $scope.playerAverageThroughput = [];  // Data from monitor
      $scope.playerTime = [];  // Data from monitor
      $scope.playerDownloadingQuality = [];  // Data from monitor
      $scope.playerFOVScore = [];  // Data from monitor
      $scope.playerContentScore = [];  // Data from monitor
      $scope.playerPastDownloadingQuality = [];  // Data from monitor's playerDownloadingQuality
      $scope.playerCatchUp = [];  // Data from playback controller
      $scope.playerDivation = [];  // Data from computing QoE
  
      $scope.playerBitrateList = [];  // Data from bitrate list
      $scope.requestList = [];  // Data from all HTTPRequests
      $scope.ssresults = {};  // Data from contents analytics CSV files
  
      $scope.selectedItem = {  // Save the selected media source
          type:"json",
          value:"https://192.168.1.69/Guitar_Man/aframeVP907.json"
      };
      $scope.optionButton = "Show Options";  // Save the state of option button
      $scope.selectedRule = "FOVEditRule";  // Save the selected media source
      $scope.stats = [];  // Save all the stats need to put on the charts
      $scope.chartData_quality = [];  // Save the qualtiy data need to put on the charts
      $scope.chartData_buffer = [];  // Save the buffer data need to put on the charts
      $scope.chartData_throughput = [];  // Save the throughput data need to put on the charts
      $scope.chartState = {  // Save the charts' states
          quality:{
              video_0: {
                  data: [], color: '#00CCBE', label: 'video_0'
              },
              video_1:{
                  data: [], color: '#ffd446', label: 'video_1'
              },
              video_2:{
                  data: [], color: '#FF6700', label: 'video_2'
              },
              video_3: {
                  data: [], color: '#44c248', label: 'video_3'
              },
              video_4:{
                  data: [], color: '#ff000a', label: 'video_4'
              },
              video_5:{
                  data: [], color: '#b300ff', label: 'video_5'
              },
              audio:{
                  data: [], color: '#1100ff', label: 'audio'
              }
          },
          buffer:{
              video_0: {
                  data: [], color: '#00CCBE', label: 'video_0'
              },
              video_1:{
                  data: [], color: '#ffd446', label: 'video_1'
              },
              video_2:{
                  data: [], color: '#FF6700', label: 'video_2'
              },
              video_3: {
                  data: [], color: '#44c248', label: 'video_3'
              },
              video_4:{
                  data: [], color: '#ff000a', label: 'video_4'
              },
              video_5:{
                  data: [], color: '#b300ff', label: 'video_5'
              },
              audio:{
                  data: [], color: '#1100ff', label: 'audio'
              }
          },
          throughput:{
              video_0: {
                  data: [], color: '#00CCBE', label: 'video_0'
              },
              video_1:{
                  data: [], color: '#ffd446', label: 'video_1'
              },
              video_2:{
                  data: [], color: '#FF6700', label: 'video_2'
              },
              video_3: {
                  data: [], color: '#44c248', label: 'video_3'
              },
              video_4:{
                  data: [], color: '#ff000a', label: 'video_4'
              },
              video_5:{
                  data: [], color: '#b300ff', label: 'video_5'
              },
              audio:{
                  data: [], color: '#1100ff', label: 'audio'
              }
          }
      };
  
  
      //// Global variables (flexible)
      $scope.mycanvas = {  // [For capturing each frame] Set the width and height of the canvases
          "width":"120",
          "height":"120"
      };
      $scope.drawmycanvas = {  // [For capturing each frame] Set the width and height of the capture pictures
          "width":"300",
          "height":"150"
      };
      $scope.requestDuration = 3000;  // [For computing total throughput] Set the duration we consider (ms)
      $scope.requestLayBack = 0;  // [For computing total throughput] Set the lay-back time for avoiding the on-going requests (ms)
      $scope.rotateRatio = 0.1148;  // [For focusing FOV] Set the ratio of rotating when switching the angle of view
      $scope.playerBufferToKeep = 3;  // [For initializing mediaplayers] Allows you to modify the buffer that is kept in source buffer in seconds
      $scope.playerStableBufferTime = 3;  // [For initializing mediaplayers] The time that the internal buffer target will be set to post startup/seeks (NOT top quality)
      $scope.playerBufferTimeAtTopQuality = 3;  // [For initializing mediaplayers] The time that the internal buffer target will be set to once playing the top quality
      $scope.playerMinDrift = 0.02;  // [For initializing mediaplayers] The minimum latency deviation allowed
      $scope.lambdaQOE = 1.0;  // [For computing QoE] Value of the quality switches constant
      $scope.miuQOE = 4.3;  // [For computing QoE] Stall weight
      $scope.omegaQOE = 4.3;  // [For computing QoE] Content weight
      $scope.qQOE = 'log';  // [For computing QoE] a mapping function that translates the bitrate of chunk to the quality perceived by the user (Linear || Log)
      $scope.a1QOE = 0.7;  // [For computing QoE] Influence of the quality of Zone 1
      $scope.a2QOE = 0.3;  // [For computing QoE] Influence of the quality of Zone 2
      $scope.a3QOE = 0.0;  // [For computing QoE] Influence of the quality of Zone 3
      $scope.content_curTile_bias = 0.1;  // [For computing QoE] bias of tiles for computing content score
      $scope.availableStreams = [  // [For setting up the media source] All the available preset media sources
          {
              name:"LVOD",
              json:"http://localhost/CMPVP907/aframeVP907.json",
          },
          {
              name:"SVOD",
              json:"http://115.156.159.94:8800/CMPVP907/aframeVP907.json",
          },
          {
              name:"LIVE",
              json:"http://222.20.77.111/dash/default.json",
          },
          {
              name:"BUNNY",
              url:"https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd"
          }
      ];
      //IMPORTANT - List of ABR rules
      $scope.rules = ["FOVRule", "HighestBitrateRule", "LowestBitrateRule", "FOVEditRule", "DefaultRule"];  // [For seeting the ABR rule] All the available preset ABR rules
      $scope.chartOptions = {  // [For printing the chart] Set up the style of the charts
          legend: {
              labelBoxBorderColor: '#ffffff',
              placement: 'outsideGrid',
              container: '#legend-wrapper',
              // labelFormatter: function (label, series) {
              //     return '<div  style="cursor: pointer;" id="' + series.type + '.' + series.id + '" onclick="legendLabelClickHandler(this)">' + label + '</div>';
              // }
          },
          series: {
              lines: {
                  show: true,
                  lineWidth: 2,
                  shadowSize: 1,
                  steps: false,
                  fill: false,
              },
              points: {
                  radius: 4,
                  fill: true,
                  show: true
              }
          },
          grid: {
              clickable: false,
              hoverable: false,
              autoHighlight: true,
              color: '#136bfb',
              backgroundColor: '#ffffff'
          },
          axisLabels: {
              position: 'left'
          },
          xaxis: {
              tickFormatter: function tickFormatter(value) {
                  return $scope.players[0].convertToTimeCode(value);
              },
              tickDecimals: 0,
              color: '#136bfb',
              alignTicksWithAxis: 1
          },
          yaxis: {
              min: 0,
              tickLength: 0,
              tickDecimals: 0,
              color: '#136bfb',
              position: 'right',
              axisLabelPadding: 20,
          },
          yaxes: []
      };
      $scope.maxPointsToChart = 30;  // [For printing the chart] Set the maximum of the points printed on the charts
      $scope.IntervalOfSetNormalizedTime = 10;  // [For setting interval] Set the fastest mediaplayer's timeline as the normalized time
      $scope.IntervalOfDynamicEdit = 10; // [For setting interval] Set the same interval as the normalized time so that it can be sync
      $scope.IntervalOfComputetotalThroughput = 1000;  // [For setting interval] Compute total throughput according to recent HTTP requests
      $scope.IntervalOfComputeQoE = 1000;  // [For setting interval] Compute QoE
      $scope.IntervalOfUpdateStats = 100;  // [For setting interval] Show the data in monitor
      $scope.IntervalOfUpdateFigures = 1000;  // [For setting interval] Show the data in figures
      $scope.IntervalOfCaptures = 500;  // [For setting interval] Capture the pictures from mediaplayers

      $scope.center_viewport_x = []; // Array for arrays with x axis center of the viewport with sample size given in viewportUtils.js
      $scope.center_viewport_y = []; // Array for arrays with y axis center of the viewport with sample size given in viewportUtils.js
      $scope.frame_array = []; // time Array with the last times with the sample size given in the viewportUtils.js
      $scope.current_center_viewport_x = 0;
      $scope.current_center_viewport_y = 0;
      $scope.yaw   = 0
      $scope.pitch = 0
      $scope.hasEditScheduledValue = false;
      $scope.editHappenedValue = false;
      $scope.radiansRotationValue = 0;
      $scope.editTypeValue = "null";

      // It uses both Linear Regression and Ridge Regression depending if the ridge input is used
      $scope.predict_center_viewport = function (prediction_frame, ridge = false) {
        
        // if the ridge input is true than it will be done a Ridge Regression
        // with the lambda as the ridge constant 
        //############## LINEAR REGRESSION ##############//
           
        function linear_function (a, b, x) {
            return a*x + b;
        }
            
        function linearRegression(y,x){
                var lr = {};
                var n = y.length;
                var sum_x = 0;
                var sum_y = 0;
                var sum_xy = 0;
                var sum_xx = 0;
                var sum_yy = 0;
                var lambda = 0;

                for (var i = 0; i < y.length; i++) {

                        sum_x += x[i];
                        sum_y += y[i];
                        sum_xy += (x[i]*y[i]);
                        sum_xx += (x[i]*x[i]);
                        sum_yy += (y[i]*y[i]);
                } 

                if (ridge){
                    // Using a lambda that will always be 5% of the sum_xx variable so it can follow the expression 
                    // when it increases its values; 
                    lambda = sum_xx * 0.05;
                }
                lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*(sum_xx + lambda) - sum_x * sum_x);
                lr['intercept'] = ((sum_xx + lambda)*sum_y - sum_x*sum_xy) / (n*(sum_xx + lambda) - sum_x * sum_x)
                // lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
                // lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
                return lr;
        }

        function convert_normalized_to_radians(cvp_norm) {
			return 2*Math.PI*cvp_norm - Math.PI;
		};

        function convert_radians_to_normalized_from_array(cvp_radians) {
			return cvp_radians.map( cvp => cvp/(2*Math.PI) + 0.5);
		};

        if ($scope.frame_array.length < $scope.videoFrameRate)
        return;

        lr_width = linearRegression(convert_radians_to_normalized_from_array($scope.center_viewport_x), $scope.frame_array);
    
        lr_height = linearRegression(convert_radians_to_normalized_from_array($scope.center_viewport_y), $scope.frame_array);

        new_yaw = linear_function(lr_width.slope, lr_width.intercept, $scope.frame_array[$scope.frame_array.length -1] + prediction_frame);
        new_pitch = linear_function(lr_height.slope, lr_height.intercept, $scope.frame_array[$scope.frame_array.length -1] + prediction_frame);
        
        new_yaw = convert_normalized_to_radians(new_yaw);
        new_pitch = convert_normalized_to_radians(new_pitch);

        if (new_yaw > Math.PI){
            new_yaw   =   -Math.PI     + new_yaw % Math.PI;
        }
        else if (new_yaw < -Math.PI){
            new_yaw   =   Math.PI     + new_yaw % Math.PI;
        }

        if (new_pitch > Math.PI){
            new_pitch   =   new_pitch     - Math.floor(new_pitch / Math.PI) * Math.PI;
        }
        else if (new_pitch < -Math.PI){
            new_pitch   =   new_pitch     + Math.floor(new_pitch / Math.PI) * Math.PI;
        }

        return [new_yaw, new_pitch];
    }
    



      $scope.get_visible_faces = function (cvp_x_radians, cvp_y_radians){
        var frameObj = document.getElementById('frame');
        var scene = frameObj.contentWindow.document.querySelector('a-scene');
        var camera = scene.camera;
        var camera_reference = scene.children[2]; //camera_reference

        let faceStructureModified = camera_reference.faceStructure;
        var visibleObjects = {};
    
            if (camera && faceStructureModified)
            {
            camera.updateMatrix();
            camera.updateMatrixWorld();
            
            //Copy the actual camera to simulate rotations so that the original camera is not influenced
            var cameraAux = camera.clone();        
    
            var frustum = new THREE.Frustum();
    
            // Make a frustum to know what is in the camera vision
            frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));  
            // console.log("-----------------------------------------------------")
    
            // Uses the faceStructureModified value because it could have an edit on the playback
            for (var face in faceStructureModified) {
                    let countPointsVisible = 0;
                    let numberPoints = faceStructureModified[face].length;
                    for (var position = 0; position < numberPoints; position++)
                            if (frustum.containsPoint( faceStructureModified[face][position] ))
                                    countPointsVisible++;
                                    
                    if (countPointsVisible > 0){
                            let numberTruncaded = Math.floor((countPointsVisible / numberPoints)*1000) / 1000;
                            visibleObjects[face] = numberTruncaded;
                    }
    
            }
    
            // Use quaternion to simulate the camera rotation
            // It was noticed that the camera object does not change its quaternion value after the render process.
            // With that in mind, the simulation is done by rotating the camera to the given center of the viewport
            // as if the camera was in the initial position.
            const quaternion_x = new THREE.Quaternion();
            const quaternion_y = new THREE.Quaternion();
    
            // Multiply by -1 because the quaternion rotation reference is the oposite from the one received from the update_center_viewport() function
            quaternion_x.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), -1*cvp_x_radians );
    
            // Divide the Y center of the viewport because it goes from -PI to +PI and the rotation goes from -PI/2 to +PI/2 in this axis
            quaternion_y.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), cvp_y_radians/2 );
            
            //Just to make sure that its start from the initial position
            cameraAux.quaternion = new THREE.Quaternion(0, 0, 0, 1);
            cameraAux.quaternion.multiply(quaternion_x).multiply(quaternion_y);
    
            cameraAux.updateMatrix();
            cameraAux.updateMatrixWorld();
    
    
            // Make a new frustum to know what is in the camera vision simulation
            var frustum2 = new THREE.Frustum();
    
            frustum2.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cameraAux.projectionMatrix, cameraAux.matrixWorldInverse));  
    
            visibleObjects = {};
    
            //Uses the faceStructure object because the value is not updaded on the render
            for (var face in faceStructure) {
                    let countPointsVisible = 0;
                    let numberPoints = faceStructure[face].length;
                    for (var position = 0; position < numberPoints; position++)
                            if (frustum2.containsPoint( faceStructure[face][position] ))
                                    countPointsVisible++;
    
                    if (countPointsVisible > 0){
                            let numberTruncaded = Math.floor((countPointsVisible / numberPoints)*1000) / 1000;
                            visibleObjects[face] = numberTruncaded;
                    }
            }
            
            }
            return visibleObjects;
    }
  
      //// Variables and functions for UI and options
      // For setting up the media source
      $scope.setStream = function (item) {
          if(item.json){
              $scope.selectedItem.type = "json";
              $scope.selectedItem.value = item.json;
          }else{
              $scope.selectedItem.type = "url";
              $scope.selectedItem.value = item.url;
          }
      };
      $scope.changeStream = function () {
          console.log($scope.selectedItem.value.slice(-4));
          if($scope.selectedItem.value.length > 5 && $scope.selectedItem.value.slice(-4) == "json"){
              $scope.selectedItem.type = "json";
          }else{
              $scope.selectedItem.type = "url";
          }
      };
  
      // For setting up the ABR rule
      $scope.showoption = function () {
          if($scope.optionButton == "Show Options"){
              document.getElementById('option').style = "background-color: #e2e1e4; z-index: 1000; position: absolute;";
              $scope.optionButton = "Hide Options";
          }else{
              document.getElementById('option').style = "display: none;";
              $scope.optionButton = "Show Options";
          }
      };
      $scope.changeABRStrategy = function (strategy) {
          for(let i = 0; i < $scope.rules.length; i++){
              let d = document.getElementById($scope.rules[i]);
              d.checked = false;
          }
          document.getElementById(strategy).checked = true;
          $scope.selectedRule = strategy;
      };
  
      // For printing the charts
      $scope.pushData = function (id, type) {
          switch(type) {
              case "quality":
                  var data = {
                      id: id,
                      data: $scope.chartState[type][id].data,
                      label: $scope.chartState[type][id].label,
                      color: $scope.chartState[type][id].color,
                      yaxis: $scope.chartData_quality.length + 1,
                      type: type
                  };
                  $scope.chartData_quality.push(data);
                  $scope.chartOptions.yaxes.push({
                      axisLabel: data.label
                  });
                  break;
              case "buffer":
                  var data = {
                      id: id,
                      data: $scope.chartState[type][id].data,
                      label: $scope.chartState[type][id].label,
                      color: $scope.chartState[type][id].color,
                      yaxis: $scope.chartData_buffer.length + 1,
                      type: type
                  };
                  $scope.chartData_buffer.push(data);
                  $scope.chartOptions.yaxes.push({
                      axisLabel: data.label
                  });
                  break;
              case "throughput":
                  var data = {
                      id: id,
                      data: $scope.chartState[type][id].data,
                      label: $scope.chartState[type][id].label,
                      color: $scope.chartState[type][id].color,
                      yaxis: $scope.chartData_throughput.length + 1,
                      type: type
                  };
                  $scope.chartData_throughput.push(data);
                  $scope.chartOptions.yaxes.push({
                      axisLabel: data.label
                  });
                  break;
          }
          $scope.chartOptions.legend.noColumns = Math.min($scope.chartData_quality.length, 5);
      };
      $scope.plotPoint = function (name, type, value, time) {
          var specificChart = $scope.chartState[type];
          if (specificChart) {
              var data = specificChart[name].data;
              data.push([time, value]);
              if (data.length > $scope.maxPointsToChart) {
                  data.splice(0, 1);
              }
          }
      };
      $scope.clearchartData_quality = function () {
          for (var key in $scope.chartState) {
              for (var i in $scope.chartState[key]) {
                  $scope.chartState[key][i].data.length = 0;
              }
          }
      };
      $scope.initChartingByMediaType = function (type) {
          var arr = $scope.chartState[type];
          for (var key in arr) {
              var obj = arr[key];
              $scope.pushData(key, type);
          }
      };
  
  
      //// Loading sources
      // Get contents through HTTP requests
      function getContents(url, callback) {
          var xhr = new XMLHttpRequest();

          
          xhr.open("GET", url, true);

          xhr.onload = callback;
          xhr.send();
      }
  
      // Read json file if json is available
       $scope.openJSON = function(url) {
          $scope.players = [];
          $scope.buffer_empty_flag = [];
          $scope.playerCount = 0;
          $scope.lon = 90;
          $scope.lat = 0;
          $scope.contents = {};
          getContents(url, function() {
              $scope.contents = JSON.parse(this.responseText);
              if ($scope.contents.ssresults && $scope.contents.ssresults != "") {
                  getContents($scope.contents.baseUrl + $scope.contents.ssresults, function() {
                      $scope.ssresults = JSON.parse(this.responseText);
                  });
              }
              if ($scope.contents.edits){
                console.log ($scope.contents.edits);
              }
              document.getElementById('Link').style = "display: none;";
              document.getElementById('Render').style = "display: inline;";
          });
      };
  
      // Read default json file if json is unavailable, then change the srcs
      $scope.openURLs = function(url) {
          $scope.contents = {};
          getContents('./default.json', function() {
              $scope.contents = JSON.parse(this.responseText);
              let urls = url.split(/[(\n)\n]+/);
              for (let i = 0; i < $scope.contents.face; i++) {
                  for (let j = 0; j < $scope.contents.row; j++) {
                      for (let k = 0; k < $scope.contents.col; k++) {
                          $scope.contents.tiles[i][j][k].src = (i * $scope.contents.row * $scope.contents.col + j * $scope.contents.col + k) < urls.length ? urls[i * $scope.contents.row * $scope.contents.col + j * $scope.contents.col + k] : urls[urls.length - 1];
                      }
                  }
              }
              document.getElementById('Link').style = "display: none;";
              document.getElementById('Render').style = "display: inline;";
          });
      }
  
  
      //// Initialize the aframe page
      // Open the iframe according to the number of faces, rows and cols
      $scope.aframe_init = function() {
          if ($scope.contents == {}) {
              return;
          }
          document.getElementById( 'frame' ).src = "./pages/" + $scope.contents.face + "_" + $scope.contents.row + "_" + $scope.contents.col + ".html";
          $scope.lon = 90;
          $scope.lat = 0;
          document.getElementById('Render').style = "display: none;";
          document.getElementById('Load').style = "display: inline;";
      }
  
  
      //// Building mediaplayers
      // Pause in all the players
      $scope.pause_all = function() {
          for (let i = 0; i < $scope.playerCount; i++) {
              $scope.players[i].pause();
              console.log("Player_" + i + " pauses.");
          }
          if ($scope.contents.audio && $scope.contents.audio != "") {
              $scope.players[$scope.playerCount].pause();
              console.log("Audio pauses.");
          }
          document.getElementById('Pause').style = "display: none;";
          document.getElementById('Play').style = "display: inline;";
      };
  
      // Play in all the players
      $scope.play_all = function() {
          for (let i = 0; i < $scope.playerCount; i++) {
              $scope.players[i].play();
              console.log("Player_" + i + " plays.");
          }
          if ($scope.contents.audio && $scope.contents.audio != "") {
              $scope.players[$scope.playerCount].play();
              console.log("Audio plays.");
          }
          document.getElementById('Play').style = "display: none;";
          document.getElementById('Pause').style = "display: inline;";
      };
  
      // Triggered when any player's buffer is empty, which to stop all the players and wait for rebuffering.
      function buffer_empty_event(e) {
          $scope.buffer_empty_flag[e.info.count] = true;
          $scope.pause_all();
      }
  
      // Triggered when any player's buffer is loaded (again), which to start all the players when all-set.
      function buffer_loaded_event(e) {
          if ($scope.buffer_empty_flag[e.info.count] == true) {
              $scope.buffer_empty_flag[e.info.count] = false;
              for (let i = 0; i < $scope.playerCount; i++) {
                  if ($scope.buffer_empty_flag[i] == true) {
                      return;
                  }
              }
              if ($scope.contents.audio && $scope.contents.audio != "" && $scope.buffer_empty_flag[$scope.playerCount] == true) {
                  return;
              }
            console.log("$scope.player_ready: ", $scope.player_ready);
              if ($scope.player_ready >= 6){
                  $scope.play_all();
              }
   
          }
      }
  
      function can_play_event (e) {
          $scope.player_ready++
          if ($scope.player_ready >= 6){
              console.log("PLAY")
              $scope.play_all();
              //AUTO-PLAY
              if($scope.auto_play_vr)
              {
                  console.log("AUTO PLAY VR");
                  document.getElementById('frame').contentWindow.document.querySelector('a-scene').enterVR();
              }
          }
      }
  
      function download_csv(e) {
          console.log(e);
          console.log("END OF PLAYBACK REACHED!!")
          console.log("DOWNLOAD CSV WAS TRIGGERED!!!")
          // var json_pre = '[{"Id":1,"UserName":"Sam Smith"},{"Id":2,"UserName":"Fred Frankly"},{"Id":1,"UserName":"Zachary Zupers"}]';;
          console.log("$scope.json_output: ", $scope.json_output);
          var json_pre = $scope.json_output;
          var json = json_pre;
          if (!$scope.download_started)
          {
              console.log("downloading CSV...")
              var csv = JSON2CSV(json, true);
              var downloadLink = document.createElement("a");
              var blob = new Blob(["\ufeff", csv]);
              var url = URL.createObjectURL(blob);
      
              downloadLink.id = "download_csv";
              downloadLink.href = url;
              downloadLink.download = "data.csv";
          
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              
              $scope.download_started = true;
          }
  
  
          function JSON2CSV(objArray, header = false) {
              var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
              var str = '';
              var line = '';
  
              if (header)
              {
                  head = objArray[0];
                  for (var key in head){
  
                      str += key + ',';
                  }
                  str = str.slice(0, -1);
                  str += '\r\n';
              }
  
              if ($("#labels").is(':checked')) {
                  var head = array[0];
                  if ($("#quote").is(':checked')) {
                      for (var index in array[0]) {
                          var value = index + "";
                          line += '"' + value.replace(/"/g, '""') + '",';
                      }
                  } else {
                      for (var index in array[0]) {
                          line += index + ',';
                      }
                  }
          
                  line = line.slice(0, -1);
                  str += line + '\r\n';
              }
          
              for (var i = 0; i < array.length; i++) {
                  var line = '';
          
                  if ($("#quote").is(':checked')) {
                      for (var index in array[i]) {
                          var value = array[i][index] + "";
                          line += '"' + value.replace(/"/g, '""') + '",';
                      }
                  } else {
                      for (var index in array[i]) {
                          line += array[i][index] + ',';
                      }
                  }
          
                  line = line.slice(0, -1);download_csv
                  str += line + '\r\n';
              }
              return str;
          }
      }
  
      // Initialize when loading the videos
      $scope.initial = function() {
          $scope.initChartingByMediaType('quality');
          $scope.initChartingByMediaType('buffer');
          $scope.initChartingByMediaType('throughput');
          let video, url;
  
          // Video part
          for (let i = 0; i < $scope.contents.face; i++) {
              for (let j = 0; j < $scope.contents.row; j++) {
                  for (let k = 0; k < $scope.contents.col; k++) {
                      //if (i != 4 && i != 1) continue;
                      video = document.getElementById( "frame" ).contentWindow.document.querySelector("#" + "video_" + [i * $scope.contents.row * $scope.contents.col + j * $scope.contents.col + k]);

                    
                      //IMPORTANT - Create one player for each face of the cube and each tile of the face.
                      $scope.players[$scope.playerCount] = new dashjs.MediaPlayer().create();
                      url = $scope.contents.baseUrl + $scope.contents.tiles[i][j][k].src;
                      $scope.buffer_empty_flag[$scope.playerCount] = true;
  
                      // Don't use dash.js default rules
                      $scope.players[$scope.playerCount].updateSettings({
                          'info': {
                              'id': "video_" + [i * $scope.contents.row * $scope.contents.col + j * $scope.contents.col + k],
                              'count': $scope.playerCount,
                              'face': i,
                              'row': j,
                              'col': k,
                              'duration': $scope.contents.duration,
                              'width': $scope.contents.tiles[i][j][k].width,
                              'height': $scope.contents.tiles[i][j][k].height,
                              'location': {'x': $scope.contents.tiles[i][j][k].x, 'y': $scope.contents.tiles[i][j][k].y, 'z': $scope.contents.tiles[i][j][k].z},
                              'rotation': {'rx': $scope.contents.tiles[i][j][k].rx, 'ry': $scope.contents.tiles[i][j][k].ry, 'rz': $scope.contents.tiles[i][j][k].rz},
                              'totalThroughputNeeded': true
                          },
                          'streaming': {
                              'abr': {
                                  'useDefaultABRRules': false
                              },
                              'buffer': {
                                  'bufferToKeep': $scope.playerBufferToKeep,
                                  'stableBufferTime': $scope.playerStableBufferTime,
                                  'bufferTimeAtTopQuality': $scope.playerBufferTimeAtTopQuality,
                                  'fastSwitchEnabled': true
                              },
                              'delay': {
                                  'liveDelay': 0
                              },
                              'liveCatchup': {
                                  'enabled': true,
                                  'minDrift': $scope.playerMinDrift
                              }
                          }
                      });
                      
                      //IMPORTANT - Adds the ABR algorithm to be used
                      // More info in https://cdn.dashjs.org/latest/jsdoc/module-MediaPlayer.html
                      // Add my custom quality switch rule, look at [].js to know more about the structure of a custom rule
                      switch ($scope.selectedRule) {
                          case "FOVRule":
                              $scope.players[$scope.playerCount].addABRCustomRule('qualitySwitchRules', 'FOVRule', FOVRule);
                              break;
                          case "HighestBitrateRule":
                              $scope.players[$scope.playerCount].addABRCustomRule('qualitySwitchRules', 'HighestBitrateRule', HighestBitrateRule);
                              break;
                          case "LowestBitrateRule":
                              $scope.players[$scope.playerCount].addABRCustomRule('qualitySwitchRules', 'LowestBitrateRule', LowestBitrateRule);
                              break;                            
                          case "FOVEditRule":
                              $scope.players[$scope.playerCount].addABRCustomRule('qualitySwitchRules', 'FOVEditRule', FOVEditRule);
                              break;
                          default:
                              $scope.players[$scope.playerCount].updateSettings({
                                  'streaming': {
                                      'abr': {
                                          'useDefaultABRRules': true
                                      }
                                  }
                              });
                              break;
                      }
  
                      // Turn on the event listeners and add actions for triggers 
                      $scope.players[$scope.playerCount].on(dashjs.MediaPlayer.events["BUFFER_EMPTY"], buffer_empty_event);
                      $scope.players[$scope.playerCount].on(dashjs.MediaPlayer.events["BUFFER_LOADED"], buffer_loaded_event);
  
                      $scope.players[$scope.playerCount].on(dashjs.MediaPlayer.events["CAN_PLAY"], can_play_event);
                      $scope.players[$scope.playerCount].on(dashjs.MediaPlayer.events["PLAYBACK_ENDED"], download_csv);

                      // Initializing
                      $scope.players[$scope.playerCount].initialize(video, url, false);
                      $scope.playerBufferLength[$scope.playerCount] = $scope.players[$scope.playerCount].getBufferLength();
                      $scope.playerAverageThroughput[$scope.playerCount] = $scope.players[$scope.playerCount].getAverageThroughput("video");
                      $scope.playerTime[$scope.playerCount] = $scope.players[$scope.playerCount].time();
                      $scope.playerDownloadingQuality[$scope.playerCount] = $scope.players[$scope.playerCount].getQualityFor("video");
                      $scope.playerFOVScore[$scope.playerCount] = NaN;
                      $scope.playerContentScore[$scope.playerCount] = NaN;
                      $scope.playerBitrateList[$scope.playerCount] = [];
                      $scope.playerCatchUp[$scope.playerCount] = false;

  
                      $scope.playerCount++;
                  }
              }
          }
  
          // Audio part
          if ($scope.contents.audio && $scope.contents.audio != "") {
              var audio = document.getElementById( "frame" ).contentWindow.document.querySelector("#audio");
              $scope.players[$scope.playerCount] = new dashjs.MediaPlayer().create();
              url = $scope.contents.baseUrl + $scope.contents.audio;
              $scope.buffer_empty_flag[$scope.playerCount] = true;
  
              $scope.players[$scope.playerCount].updateSettings({
                  'info': {
                      'id': "audio",
                      'count': $scope.playerCount,
                      'duration': $scope.contents.duration
                  }
                //   'debug': {
                //     'logLevel': dashjs.Debug.LOG_LEVEL_DEBUG
                // }
              });
  
              // Turn on the event listeners and add actions for triggers 
              $scope.players[$scope.playerCount].on(dashjs.MediaPlayer.events["BUFFER_EMPTY"], buffer_empty_event);
              $scope.players[$scope.playerCount].on(dashjs.MediaPlayer.events["BUFFER_LOADED"], buffer_loaded_event);
  
              // Initializing
              $scope.players[$scope.playerCount].initialize(audio, url, false);
              $scope.playerBufferLength[$scope.playerCount] = $scope.players[$scope.playerCount].getBufferLength();;
              $scope.playerAverageThroughput[$scope.playerCount] = $scope.players[$scope.playerCount].getAverageThroughput("audio");
              $scope.playerTime[$scope.playerCount] = $scope.players[$scope.playerCount].time();
              $scope.playerDownloadingQuality[$scope.playerCount] = $scope.players[$scope.playerCount].getQualityFor("audio");
              $scope.playerCatchUp[$scope.playerCount] = false;
          }
  
          $scope.startupTime = new Date().getTime();

          // Set the fastest mediaplayer's timeline as the normalized time
          requestAnimationFrame(setNormalizedTime);

          //setInterval(setNormalizedTime, $scope.IntervalOfSetNormalizedTime);
          // Compute total throughput according to recent HTTP requests
          setInterval(computetotalThroughput, $scope.IntervalOfComputetotalThroughput);
          // Compute QoE
          //setInterval(computeQoE, $scope.IntervalOfComputeQoE);
          // // Show the data in monitor
          //setInterval(updateStats, $scope.IntervalOfUpdateStats);
          // // Show the data in figures
          // setInterval(updateFigures, $scope.IntervalOfUpdateFigures);
          // //Capture the pictures from mediaplayers
          // setInterval(function () {
          //     for (let i = 0; i < $scope.playerCount; i++) {
          //         let capture_face = document.getElementById("capture_" + i);
          //         if (capture_face)
          //             document.getElementById("capture_" + i).getContext('2d').drawImage(document.getElementById( "frame" ).contentWindow.document.querySelector("#" + "video_" + i), 0, 0, $scope.drawmycanvas.width, $scope.drawmycanvas.height);
          //         // img.src = canvas.toDataURL("image/png");
          //     }
          // }, $scope.IntervalOfCaptures);
  
  
          //setInterval(dynamicEditClass, $scope.IntervalOfDynamicEdit);
          requestAnimationFrame(dynamicEditClass);
          
          requestAnimationFrame(update_center_viewport);
          //setInterval(update_center_viewport, $scope.IntervalOfDynamicEdit);

          requestAnimationFrame(updateOutputFile);


          document.getElementById('Load').style = "display: none;";
          document.getElementById('Play').style = "display: inline;";
      };
      

      function updateOutputFile (){
        let numPlayer = $scope.players.length;
        let stringListQuality = "[";
        //Gets only de videos, not the audio
        let predicted_visible_faces = $scope.get_visible_faces($scope.yaw, $scope.pitch);
        for (let i = 0 ; i < numPlayer - 1; i++)
            stringListQuality += $scope.players[i].getQualityFor('video') + ";";
        
        stringListQuality = stringListQuality.slice(0,stringListQuality.length - 1);
        stringListQuality += "]"

        visibleFaces = "["
        percentageVisibleFaces = "["
        for (face in predicted_visible_faces){
            visibleFaces += face.slice(-1) + ";";
            percentageVisibleFaces += predicted_visible_faces[face] + ";";
        }

        visibleFaces = visibleFaces.slice(0,visibleFaces.length - 1);
        visibleFaces += "]";

        
        percentageVisibleFaces = percentageVisibleFaces.slice(0,percentageVisibleFaces.length - 1);
        percentageVisibleFaces += "]";

        let frame_data = {
            frame: $scope.frameNumber != 0 ? $scope.frameNumber.get() : 0,
            totalThroughput: $scope.totalThroughput,
            listQuality: stringListQuality,
            visibleFaces: visibleFaces,
            percentageVisibleFaces: percentageVisibleFaces,
            yaw: Number.parseFloat($scope.yaw).toFixed(4),
            pitch: Number.parseFloat($scope.pitch).toFixed(4),
            hasEditScheduled: $scope.hasEditScheduledValue,
            editHappened: $scope.editHappenedValue,
            radiansRotation:  Number.parseFloat($scope.radiansRotationValue).toFixed(4),
            editType: $scope.editTypeValue
        }

        $scope.json_output.push(frame_data);

        if ( $scope.editTypeValue === "instant"){
             $scope.editTypeValue = "null";
             $scope.radiansRotationValue = 0;
             $scope.hasEditScheduledValue = false;
             $scope.editHappenedValue = false;
        }

        requestAnimationFrame(updateOutputFile);
      }

      // Set the fastest mediaplayer's timeline as the normalized time
      function setNormalizedTime() {
          $scope.normalizedTime = $scope.players[0].time();
          for (let i = 0; i < $scope.playerCount; i++) {
              if ($scope.players[i].time() > $scope.normalizedTime) {
                  $scope.normalizedTime = $scope.players[i].time();
              }
          }
          if ($scope.contents.audio && $scope.contents.audio != "") {
              if ($scope.players[$scope.playerCount].time() > $scope.normalizedTime) {
                  $scope.normalizedTime = $scope.players[$scope.playerCount].time();
              }
          }
          $scope.$apply();
  
        requestAnimationFrame(setNormalizedTime);
      }
  
      // Compute total throughput according to recent HTTP requests (Total data in ONE second)
      function computetotalThroughput() {
          const precurTime = new Date().getTime();  // Get current time
          const curTime = precurTime - $scope.requestLayBack;
          let TotalDataInAnInterval = 0;  // Byte
          let TotalTimeInAnInterval = $scope.requestDuration;  // ms
          let requestListLength = $scope.requestList.length;
          let requestListIndex = requestListLength - 1;
          let requestTimeIndex = curTime;
          while (requestListLength > 0 && requestListIndex >= 0) {
              let requestFinishTime = $scope.requestList[requestListIndex]._tfinish.getTime();
              let requestResponseTime  = $scope.requestList[requestListIndex].tresponse.getTime();
              if (requestFinishTime > curTime - $scope.requestDuration && requestResponseTime < curTime) {
                  // Accumulate the downloaded data (Byte)
                  let requestDownloadBytes = $scope.requestList[requestListIndex].trace.reduce((a, b) => a + b.b[0], 0);
                  if (requestResponseTime > curTime - $scope.requestDuration) {
                      if (requestFinishTime <= curTime) {
                          TotalDataInAnInterval += requestDownloadBytes;
                      } else {
                          TotalDataInAnInterval += ( requestDownloadBytes * ( ( curTime - requestResponseTime ) / ( requestFinishTime - requestResponseTime ) ) );
                      }
                  } else {
                      if (requestFinishTime <= curTime) {
                          TotalDataInAnInterval += ( requestDownloadBytes * ( ( requestFinishTime - (curTime - $scope.requestDuration) ) / ( requestFinishTime - requestResponseTime ) ) );
                      } else {
                          TotalDataInAnInterval += ( requestDownloadBytes * ( $scope.requestDuration / ( requestFinishTime - requestResponseTime ) ) );
                      }
                  }
                  // Subtract the free time (ms)
                  if (requestTimeIndex > requestFinishTime) {
                      TotalTimeInAnInterval -= (requestTimeIndex - requestFinishTime);
                  }
                  // More the time index forward
                  if (requestTimeIndex > requestResponseTime) {
                      requestTimeIndex = requestResponseTime;
                  }
              }
              requestListIndex--;
          }
          if (curTime - $scope.requestDuration < requestTimeIndex) {
              TotalTimeInAnInterval -= (requestTimeIndex - (curTime - $scope.requestDuration));
          }
          if (TotalDataInAnInterval != 0 && TotalTimeInAnInterval != 0) {
              $scope.totalThroughput = Math.round((8 * TotalDataInAnInterval) / (TotalTimeInAnInterval / 1000));  // bps
          }
      }
  
      // Compute QoE
      function computeQoE() {
          if ($scope.playerPastDownloadingQuality.length == 0 || $scope.playerDownloadingQuality.length == 0) {
              $scope.totalQOE = NaN;
              $scope.viewerQOE = NaN;
              $scope.contentQOE = NaN;
              $scope.playerPastDownloadingQuality = $scope.playerDownloadingQuality;
              return;
          }
          let pretotalQOE = 0;  // = Quality - miu * Stalls - lambda * Quality switches
          let previewerQOE = 0;  // = FOVScore * (Quality - miu * Stalls - lambda * Quality switches)
          let precontentQOE = 0;  // = FOVScore * ContentScore * (Quality - miu * Stalls - lambda * Quality switches + omega * Content score)
          for (let i = 0; i < $scope.playerCount; i++) {
              // Compute divation between angle of view and location of tile
              let playerSettings = $scope.players[i].getSettings().info;
              let r = Math.sqrt(playerSettings.location.x * playerSettings.location.x + playerSettings.location.y * playerSettings.location.y + playerSettings.location.z * playerSettings.location.z);
              let tile_theta = Math.acos(playerSettings.location.y / (r == 0 ? 1 : r));
              let tile_phi = Math.atan(playerSettings.location.x / (playerSettings.location.z == 0 ? 1 : playerSettings.location.z));
              let view_theta = (90 - $scope.lat) * (Math.PI / 180);
              let view_phi = (270 - $scope.lon >= 0 ? 270 - $scope.lon : 270 - $scope.lon + 360) * (Math.PI / 180);
              let tile_z = Math.sin(tile_theta) * Math.cos(tile_phi);
              tile_z = playerSettings.location.z < 0 ? tile_z < 0 ? tile_z : -tile_z : tile_z;
              let tile_x = Math.sin(tile_theta) * Math.sin(tile_phi);
              let tile_y = Math.cos(tile_theta);
              let view_z = Math.sin(view_theta) * Math.cos(view_phi);
              let view_x = Math.sin(view_theta) * Math.sin(view_phi);
              let view_y = Math.cos(view_theta);
              $scope.playerDivation[i] = Math.acos((tile_z * view_z + tile_x * view_x + tile_y * view_y) / (Math.sqrt(tile_z * tile_z + tile_x * tile_x + tile_y * tile_y) * Math.sqrt(view_z * view_z + view_x * view_x + view_y * view_y))) * (180 / Math.PI);
          }
          for (let i = 0; i < $scope.playerCount; i++) {
              // Computing FOV score
              $scope.playerFOVScore[i] = 100 * (($scope.playerDivation[i] - Math.min.apply(Math,$scope.playerDivation)) / (Math.max.apply(Math,$scope.playerDivation) - Math.min.apply(Math,$scope.playerDivation)));
              // Computing content score
              let info = $scope.players[i].getSettings().info;
              if ($scope.ssresults) {
                  // gains from current segment's level
                  let currentTime = parseInt($scope.playerTime[i] + $scope.playerBufferLength[i]);
                  let currentIndex = parseInt(currentTime / info.duration) + 1;
                  let currentIndexString = info.face.toString() + "_" + (info.row * $scope.contents.col + info.col).toString() + "_" + currentIndex.toString();
                  if ($scope.ssresults[currentIndexString] != NaN && $scope.ssresults['maximum'] != NaN && $scope.ssresults['minimum'] != NaN) {
                      let currentResult = $scope.ssresults[currentIndexString];
                      let MaximumResult = $scope.ssresults['maximum'];
                      let MinimumResult = $scope.ssresults['minimum'];
                      let RankingResult = (currentResult - MinimumResult) / (MaximumResult - MinimumResult);
                      // gains from tile's level
                      let curTileIndexString = info.face.toString() + "_" + (info.row * $scope.contents.col + info.col).toString();
                      if ($scope.ssresults[curTileIndexString] != NaN || $scope.ssresults['average'] != NaN) {
                          let curTileResult = $scope.ssresults[curTileIndexString];
                          let AverageResult = $scope.ssresults['average'];
                          if (curTileResult >= AverageResult) {
                              RankingResult = Math.min(RankingResult + $scope.content_curTile_bias, 1);
                          } else {
                              RankingResult = Math.max(RankingResult - $scope.content_curTile_bias, 0);
                          }
                      }
                      $scope.playerContentScore[i] = RankingResult.toFixed(2) * 100;
                  }
              }
              ////////////////////////////////// Regardless of stall, only totalQOE //////////////////////////////////
              switch ($scope.qQOE) {
                  case 'linear':
                      pretotalQOE = pretotalQOE + ($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate - $scope.playerBitrateList[i][0].bitrate) - $scope.lambdaQOE * Math.abs($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate - $scope.playerBitrateList[i][$scope.playerPastDownloadingQuality[i]].bitrate);
                      previewerQOE = previewerQOE + $scope.playerFOVScore[i] * (($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate - $scope.playerBitrateList[i][0].bitrate) - $scope.lambdaQOE * Math.abs($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate - $scope.playerBitrateList[i][$scope.playerPastDownloadingQuality[i]].bitrate));
                      precontentQOE = precontentQOE + $scope.playerFOVScore[i] * $scope.playerContentScore[i] * (($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate - $scope.playerBitrateList[i][0].bitrate) - $scope.lambdaQOE * Math.abs($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate - $scope.playerBitrateList[i][$scope.playerPastDownloadingQuality[i]].bitrate));
                      break;
                  case 'log':
                      pretotalQOE = pretotalQOE + Math.log(($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate - $scope.playerBitrateList[i][0].bitrate) + 1) - $scope.lambdaQOE * Math.abs(Math.log($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate + 1) - Math.log($scope.playerBitrateList[i][$scope.playerPastDownloadingQuality[i]].bitrate + 1));
                      previewerQOE = previewerQOE + $scope.playerFOVScore[i] * (Math.log(($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate - $scope.playerBitrateList[i][0].bitrate) + 1) - $scope.lambdaQOE * Math.abs(Math.log($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate + 1) - Math.log($scope.playerBitrateList[i][$scope.playerPastDownloadingQuality[i]].bitrate + 1)));
                      precontentQOE = precontentQOE + $scope.playerFOVScore[i] * $scope.playerContentScore[i] * (Math.log(($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate - $scope.playerBitrateList[i][0].bitrate) + 1) - $scope.lambdaQOE * Math.abs(Math.log($scope.playerBitrateList[i][$scope.playerDownloadingQuality[i]].bitrate + 1) - Math.log($scope.playerBitrateList[i][$scope.playerPastDownloadingQuality[i]].bitrate + 1)));
                      break;
                  default:
                      break;
              }
          }
          $scope.totalQOE = pretotalQOE;
          $scope.viewerQOE = previewerQOE;
          $scope.contentQOE = precontentQOE;
          $scope.playerPastDownloadingQuality = $scope.playerDownloadingQuality;
      }
  
      // Show the data in monitor
      function updateStats() {
          $scope.stats.splice(0, $scope.stats.length);
          for (let i = 0; i <= $scope.playerCount; i++) {
              if(i == $scope.playerCount) {
                  if ($scope.contents.audio && $scope.contents.audio != "") {
                      $scope.playerBufferLength[i] = $scope.players[i].getBufferLength("audio");
                      $scope.playerAverageThroughput[i] = $scope.players[i].getAverageThroughput("audio");
                      $scope.playerTime[i] = $scope.players[i].time();
                      $scope.playerDownloadingQuality[i] = $scope.players[i].getQualityFor("audio");
                      $scope.stats.push({
                          playerid : "audio",
                          bufferlevel : $scope.playerBufferLength[i].toFixed(2) + " s",
                          throughput : $scope.playerAverageThroughput[i].toFixed(0)+ " bps",
                          time : $scope.playerTime[i].toFixed(2) + " s",
                          quality : $scope.players[i].getQualityFor("audio").toFixed(0),
                          fovscore : NaN,
                          playerContentScore : NaN,
                          totaltime : ($scope.playerBufferLength[i] + $scope.playerTime[i]).toFixed(2) + " s",
                          playerCatchUp : ($scope.playerCatchUp[$scope.i] ? "Catching up" : "Synchronizing")
                      });
                  }
              } else {
                  if (i < $scope.playerCount && $scope.playerBitrateList[i].length == 0) {
                      $scope.playerBitrateList[i] = $scope.players[i].getBitrateInfoListFor("video");
                  }
                  $scope.playerBufferLength[i] = $scope.players[i].getBufferLength("video");
                  $scope.playerAverageThroughput[i] = $scope.players[i].getAverageThroughput("video");
                  $scope.playerTime[i] = $scope.players[i].time();
                  $scope.playerDownloadingQuality[i] = $scope.players[i].getQualityFor("video");
                  $scope.stats.push({
                      playerid : "video_" + i,
                      bufferlevel : $scope.playerBufferLength[i].toFixed(2) + " s",
                      throughput : $scope.playerAverageThroughput[i].toFixed(0)+ " bps",
                      time : $scope.playerTime[i].toFixed(2) + " s",
                      quality : $scope.playerDownloadingQuality[i].toFixed(0),
                      fovscore : $scope.playerFOVScore[i].toFixed(0),
                      playerContentScore : $scope.playerContentScore[i].toFixed(0),
                      totaltime : ($scope.playerBufferLength[i] + $scope.playerTime[i]).toFixed(2) + " s",
                      playerCatchUp : ($scope.playerCatchUp[i] ? "Catching up" : "Synchronizing")
                  });
              }
          }
      }
  
      // Show the data in figures
      function updateFigures() {
          let time = getTimeForPlot();
          for (let i = 0; i < $scope.playerCount; i++) {
              //$.plot(plotArea, scope.dataset, scope.options)
              $scope.plotPoint("video_" + i, 'quality', $scope.playerDownloadingQuality[i], time);
              $scope.plotPoint("video_" + i, 'buffer', $scope.playerBufferLength[i], time);
              $scope.plotPoint("video_" + i, 'throughput', $scope.playerAverageThroughput[i], time);
          }
          if ($scope.contents.audio && $scope.contents.audio != "") {
              $scope.plotPoint("audio", 'quality', $scope.playerDownloadingQuality[$scope.playerCount], time);
              $scope.plotPoint("audio", 'buffer', $scope.playerBufferLength[$scope.playerCount], time);
              $scope.plotPoint("audio", 'throughput', $scope.playerAverageThroughput[$scope.playerCount], time);
          }
      }
      function getTimeForPlot() {
          let now = new Date().getTime() / 1000;
          return Math.max(now - $scope.startupTime / 1000, 0);
      }
  
  
     /*  //// Enable the FOV event listener in iframe
      document.getElementById('frame').onload = function () {
          document.getElementById('frame').contentDocument.addEventListener( 'pointerdown', onPointerDown );
      } */
  
      function onPointerDown( event ) {
          if ( event.isPrimary === false ) return;
          $scope.pointerX = event.clientX;
          $scope.pointerY = event.clientY;
          document.getElementById('frame').contentDocument.addEventListener( 'pointermove', onPointerMove );
          document.getElementById('frame').contentDocument.addEventListener( 'pointerup', onPointerUp );
          console.log("Pointer downs. lon: "+ $scope.lon + "; lat: " + $scope.lat + ".");
      }
  
      function onPointerMove( event ) {
          if ( event.isPrimary === false ) return;
          $scope.lon += ( event.clientX - $scope.pointerX ) * $scope.rotateRatio;  // In Chrome, turn right then the lon increases.
          $scope.lon > 360 ? $scope.lon = $scope.lon - 360 : null;
          $scope.lon < 0 ? $scope.lon = $scope.lon + 360 : null;
          $scope.lat -= ( event.clientY - $scope.pointerY ) * $scope.rotateRatio;  // In Chrome, turn up then the lat increases.
          $scope.lat > 90 ? $scope.lat = 90 : null;
          $scope.lat < -90 ? $scope.lat = -90 : null;
          $scope.pointerX = event.clientX;
          $scope.pointerY = event.clientY;
          console.log("Pointer moves. lon: "+ $scope.lon + "; lat: " + $scope.lat + ".");
      }
  
      function onPointerUp() {
          if ( event.isPrimary === false ) return;
          document.getElementById('frame').contentDocument.removeEventListener( 'pointermove', onPointerMove );
          document.getElementById('frame').contentDocument.removeEventListener( 'pointerup', onPointerUp );
          console.log("Pointer ups. lon: "+ $scope.lon + "; lat: " + $scope.lat + ".");
      }
  
  
  }]);