# 360EAVP

A 360-degree Edition-Aware Video Player (360EAVP), a web browser-based open-source application for tile-based DASH streaming and visualization of 360-degree edited videos on HMDs. The proposed application is built on top of the [VR DASH Tile-Based Player (VDTP)](https://github.com/ForgetMe17/vr-dash-tile-player).

This project is an extension of its previous version and leverages its usability implementing more functionalities, such as:

1. Integration with video editing. (Snap-change and Fade-rotation implemented)

2. Viewport prediction module. (Linear and Ridge Regression)

3. Center of the viewport track for HMDs.

4. New approach the retrieve visible faces and its visibility percentage to be used on ABR algorithms.
5. Data collection and log generation module during video playback.

  

## Tools and Frameworks we use

  

1. dash.js - For adaptive bitrate streaming via DASH.

3. aframe - For 3D rendering (WebXR supported for any videos based on VP9).

4. angular.js - For data virtualization and code optimization.
  

## ABR Algorithms we use


1. FOVEditRule - Choose the bitrate according to the FOV and Edit information.

2. FOVRule - Choose the bitrates for each tile according to FOV.

3. LowestBitrateRule - Always choose the lowest bitrate for each tile.

4. HighestBitrateRule - Always choose the highest bitrate for each tile.

5. DefaultRule - Using default ABR rules by dash.js (observing each tile's stats independently).

  

Default: Using FOVEditRule as default. If need please change the config in HTML page.

  

## How to run

1. Run the HTML file via HTTP address (e.g., http://localhost/360eavp/Index.html).

2. Confirm the location of JSON file, the Mode (VOD/LIVE) and the ABR Rule you want to use in HTML page, then click "link".

3. Click "Render" to create the 3D environment.

4. Click "Load" to initialize MediaPlayer according to JSON description.

5. Click "Play" and "Pause" to control the player.

6.After the playback end, a .CSV file with information per frame of the playback should be start to be downloaded. 

  

## Media Preprocessing

  

1. DASH Adaptive Streaming for HTML 5 Video (Webm) : https://developer.mozilla.org/en-US/docs/Web/Media/DASH_Adaptive_Streaming_for_HTML_5_Video

2. FFMPEG + Bento4 (MP4) : http://www.ffmpeg.org/documentation.html , https://www.bento4.com/documentation/

3. If you want to load the media files locally, you need to set up a HTTP file server on your device. [XAMPP](https://www.apachefriends.org/pt_br/index.html) is an option for an APACHE server.  
  

#### Here is an example of media preprocessing for 360EAVP platform with an ERP video. The file on `scripts/pre_processing.sh` provides a script for doing this pre-processing. (if you have a CMP video, just skip the steps of ERP/CMP converting.)

1. Make sure you have installed the tools we need to use: FFMPEG, Bento4.

2. Use FFMPEG to convert your video from ERP mode to CMP mode (if you have a CMP video, just skip this step). Here's the code for converting an ERP video to a CMP video with the size 4320 x 2880 (each face with 1440 x 1440) using VP9 coder (all the parameters can be customized according to your requirement, more info please check FFMPEG official documentation):

```

ffmpeg -i ERP_video.mp4 -vf v360=e:c3x2:cubic:w=4320:h=2880:out_pad=0 -c:v libvpx-vp9 -crf 0 -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an CMP_video.mp4

```

3. The output video from step 2 should be a single video with 2 x 3 faces embedded together. Use FFMPEG to slice it into 6 video files:

```

ffmpeg -y -i CMP_video.mp4 -vf "crop=w=in_w/3:h=in_h/2:x=0*(in_w/3):y=0*(in_h/2)" -c:v libvpx-vp9 -keyint_min 30 -g 30 -sc_threshold 0 -an face0.mp4

ffmpeg -y -i CMP_video.mp4 -vf "crop=w=in_w/3:h=in_h/2:x=1*(in_w/3):y=0*(in_h/2)" -c:v libvpx-vp9 -keyint_min 30 -g 30 -sc_threshold 0 -an face1.mp4

ffmpeg -y -i CMP_video.mp4 -vf "crop=w=in_w/3:h=in_h/2:x=2*(in_w/3):y=0*(in_h/2)" -c:v libvpx-vp9 -keyint_min 30 -g 30 -sc_threshold 0 -an face2.mp4

ffmpeg -y -i CMP_video.mp4 -vf "crop=w=in_w/3:h=in_h/2:x=0*(in_w/3):y=1*(in_h/2)" -c:v libvpx-vp9 -keyint_min 30 -g 30 -sc_threshold 0 -an face3.mp4

ffmpeg -y -i CMP_video.mp4 -vf "crop=w=in_w/3:h=in_h/2:x=1*(in_w/3):y=1*(in_h/2)" -c:v libvpx-vp9 -keyint_min 30 -g 30 -sc_threshold 0 -an face4.mp4

ffmpeg -y -i CMP_video.mp4 -vf "crop=w=in_w/3:h=in_h/2:x=2*(in_w/3):y=1*(in_h/2)" -c:v libvpx-vp9 -keyint_min 30 -g 30 -sc_threshold 0 -an face5.mp4

```

4. The output videos from step 3 should be six videos as six faces in CMP mode. Use FFMPEG to trancode the videos in different bitrates. ```-crf``` is used to control the video's quality (the parameter smaller, the quality better):

```

ffmpeg -i face0.mp4 -c:v libvpx-vp9 -crf 60 -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an face0_60.mp4

ffmpeg -i face0.mp4 -c:v libvpx-vp9 -crf 40 -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an face0_40.mp4

ffmpeg -i face0.mp4 -c:v libvpx-vp9 -crf 20 -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an face0_20.mp4

ffmpeg -i face0.mp4 -c:v libvpx-vp9 -crf 0 -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an face0_0.mp4

...

ffmpeg -i face0.mp4 -c:v libvpx-vp9 -crf 60 -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an face5_60.mp4

ffmpeg -i face0.mp4 -c:v libvpx-vp9 -crf 40 -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an face5_40.mp4

ffmpeg -i face0.mp4 -c:v libvpx-vp9 -crf 20 -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an face5_20.mp4

ffmpeg -i face0.mp4 -c:v libvpx-vp9 -crf 0 -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an face5_0.mp4

```

5. The output videos from step 4 should be six sets of videos with different qualities. Use Bento4 to convert them into fragment format for segmentation. ```--fragment-duration``` is used to set the length of each segment (millisecond):

```

mp4fragment --fragment-duration 1000 face0_60.mp4 f_face0_60.mp4

mp4fragment --fragment-duration 1000 face0_40.mp4 f_face0_40.mp4

mp4fragment --fragment-duration 1000 face0_20.mp4 f_face0_20.mp4

mp4fragment --fragment-duration 1000 face0_0.mp4 f_face0_0.mp4

...

mp4fragment --fragment-duration 1000 face5_60.mp4 f_face5_60.mp4

mp4fragment --fragment-duration 1000 face5_40.mp4 f_face5_40.mp4

mp4fragment --fragment-duration 1000 face5_20.mp4 f_face5_20.mp4

mp4fragment --fragment-duration 1000 face5_0.mp4 f_face5_0.mp4

```

6. Use Bento4 to convert them into segments for DASH streaming:

```

mp4dash --output-dir=face0 --mpd-name=face0.mpd f_face0_60.mp4 f_face0_40.mp4 f_face0_20.mp4 f_face0_0.mp4

...

mp4dash --output-dir=face5 --mpd-name=face5.mpd f_face5_60.mp4 f_face5_40.mp4 f_face5_20.mp4 f_face5_0.mp4

```

7. If audio is necessary, please follow the steps to extract it from the original video file. Here we set audio as an independent track, you can also embed it into any one of faces' tracks:

```

ffmpeg -i ERP_video.mp4 -vn -acodec copy -y audio.mp4

mp4fragment --fragment-duration 1000 audio.mp4 f_audio.mp4

mp4dash --output-dir=audio --mpd-name=audio.mpd f_audio.mp4

```

8. Here we finish all the steps. A JSON file would be necessary if you want to play it more convenient in our platform. The file `default.json` brings the structure that needs to be followed. It is worth to mention that although the 360EAVP was design to work with edits, they are optional. If audio is unavailable, please change it as ```"audio": ""``` . If one wants to use edits on the video, please fill in the ```edit``` key with the ```frame``` that you want it to happpen, the ```type``` (```instant``` for Snap-change and ```gradual``` for Fade-rotation), and the normalized region of interest of the edit.

```
{
	"baseUrl": "[Your file location]",
	"face": 6,
	"row": 1,
	"col": 1,
	"duration": 1,
    "tiles": [
		[[{"src": "face0/face0.mpd", "width": "1440", "height": "1440", "x": 720, "y": 0, "z": 0, "rx": 0, "ry": 270, "rz": 0}]],
		[[{"src": "face1/face1.mpd", "width": "1440", "height": "1440", "x": -720, "y": 0, "z": 0, "rx": 0, "ry": 90, "rz": 0}]],
		[[{"src": "face2/face2.mpd", "width": "1440", "height": "1440", "x": 0, "y": 720, "z": 0, "rx": 90, "ry": 0, "rz": 180}]],
		[[{"src": "face3/face3.mpd", "width": "1440", "height": "1440", "x": 0, "y": -720, "z": 0, "rx": -90, "ry": 0, "rz": 180}]],
		[[{"src": "face4/face4.mpd", "width": "1440", "height": "1440", "x": 0, "y": 0, "z": -720, "rx": 0, "ry": 0, "rz": 0}]],
		[[{"src": "face5/face5.mpd", "width": "1440", "height": "1440", "x": 0, "y": 0, "z": 720, "rx": 0, "ry": 180, "rz": 0}]]
	],
	"audio": "audio/audio.mpd",
	"edits":
		{
		   "edit" : [
		      {
		         "frame" : 2080,
		         "type": "gradual",
		         "region_of_interest": [                                                                 
		            {
		            "rank": 1,
		            "ROI_theta": 0.267
		            }
		         ]     
		      }
		   ]
		}
}
```

  
(Preprocessed dataset Guitar_Man in Google Drive: https://drive.google.com/file/d/1T3NTSe8v4dRodUizYnejCgaaCoRmSMV9/view?usp=share_link)

Original video available at: https://youtu.be/_v0yuYHiqOY

( Preprocessed dataset CQ07 in Google Drive from VDTP: https://drive.google.com/file/d/1yQpNv4Mpe1OQzgXb6epJdvo44YGX3jDH/view?usp=sharing )

