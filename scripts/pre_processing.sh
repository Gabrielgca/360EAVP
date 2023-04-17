#!/bin/bash -e
############################################################
# 360 EDITION-AWARE VIDEO PLAYER PRE-PROCESSING            #
############################################################

opts=$(getopt \
    --options "i:w:h:" \
    -- "$@"
)

############################################################
# Help                                                     #
############################################################
Help()
{
   echo "This script do the pre-process required to use the video into the 360 EDITION-AWARE VIDEO PLAYER"
   echo
   echo "Syntax: $0 [<ARGS>] "
   echo
   echo "ARGS:"
   echo -e "\t Mandatory:"
   echo -e "\t\t -i \"<VIDEO MP4>\""
   echo -e "\t\t -w \"<VIDEO WIDTH>\""
   echo -e "\t\t -h \"<VIDEO HEIGHT>\""

}

############################################################
# Main program                                             #
############################################################
set +H
#set -e

echo "[INFO] 360 EDITION-AWARE VIDEO PLAYER PRE-PROCESSING : Execution Started"

scriptDir="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
resultDir="results/"

eval set --$opts

while true; do
   case "$1" in
      -i) paramI="$2" ; shift 2 ;;
      -w) paramW="$2" ; shift 2 ;;
      -h) paramH="$2" ; shift 2 ;;
      --) shift; break;;
      *) Help ; break;;
   esac
done

############################################################
# CONVERT EQUIRETANGULAR TO CUBE MAPPING PROJECTION        #
############################################################
echo "[INFO] Converting Equirectangular Projection to Cube Mapping Projection"
ffmpeg -i $paramI -vf v360=e:c3x2:cubic:w=$paramW:h=$paramH:out_pad=0 -c:v libvpx-vp9 -crf 0 -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an CMP_$paramI
echo "[DONE] Converting Equirectangular Projection to Cube Mapping Projection"


############################################################
# SLICE FACES INTO INDIVIDUAL VIDEOS                       #
############################################################

for ((i=0;i<6;i++));
do
    mkdir -p ./face$i/
done

for ((y=0, face=0;y<=1;y++));
do
    for ((x=0;x<=2;x++, face++));
    do
        echo "[INFO] Now slicing face $face..."

        vfParam="crop=w=in_w/3:h=in_h/2:x=$x*(in_w/3):y=$y*(in_h/2)"
        ffmpeg -y -i CMP_$paramI -vf "$vfParam" -c:v libvpx-vp9 -keyint_min 30 -g 30 -sc_threshold 0 -an face$face/face$face.mp4
        
        echo "[DONE] Slicing face $face!"
    done
done


############################################################
# TRANSCONDING THE VIDEOS INTO DIFFERENT BITRATES          #
############################################################

for ((i=0;i<6;i++));
do
    for ((crfValue=0;crfValue<=60;crfValue+=20));
    do
    echo "[INFO] Transcoding the face $i into bitrate with CRF $crfValue..."

    outputName="face$i/face${i}_$crfValue.mp4"
    ffmpeg -i face$i/face$i.mp4 -c:v libvpx-vp9 -crf $crfValue -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an $outputName
    
    echo "[DONE] Transcoding the face $i into bitrate with CRF $crfValue!"
    done

    echo "[INFO] Transcoding the face $i into bitrate with high CRF..."

    crfValue="63"
    outputName="face$i/face${i}_$crfValue.mp4"
    ffmpeg -i face$i/face$i.mp4 -c:v libvpx-vp9 -crf $crfValue -b:v 0 -keyint_min 30 -g 30 -sc_threshold 0 -an $outputName
    
    echo "[DONE] Transcoding the face $i into bitrate with CRF $crfValue!"
    # 
done

############################################################
# CONVERT VIDEO INTO FRAGMENT FORMAT                       #
############################################################

for ((i=0;i<=5;i++));
do
    for ((crfValue=0;crfValue<=60;crfValue+=20));
    do
    echo "[INFO] Convert the face $i and CRF $crfValue into fragment..."
    
    inputName="face$i/face${i}_$crfValue.mp4"
    outputName="face$i/f_face${i}_$crfValue.mp4"
    mp4fragment --fragment-duration 1000 $inputName $outputName
    
    echo "[DONE] Convert the face $i and CRF $crfValue into fragment!"
    done
    
    echo "[INFO] Creating fragment with a high CRF to be the lowest quality of the unvisible faces"
    
    crfValue="63"
    inputName="face$i/face${i}_$crfValue.mp4"
    outputName="face$i/f_face${i}_$crfValue.mp4"
    mp4fragment --fragment-duration 1000 $inputName $outputName
    
    echo "[DONE] Creating fragment with a high CRF to be the lowest quality of the unvisible face!"
done

###########################################################
#CONVERT INTO DASH SEGMENTS                               #
###########################################################
for ((i=0;i<=5;i++));
do
    echo "[INFO] Convert the face $i into dash segment..."
    
    findResult=$(find $scriptDir/face$i -type f -name "f_face*.mp4" | tr '\n' ' ')
    mp4dash --output-dir=$scriptDir/face$i/output -f --mpd-name=face$i.mpd $findResult
    
    echo "[DONE] Convert the face $i into dash segment!"
done



############################################################
# EXTRACT AUDIO FROM VIDEO                                 #
############################################################
echo "[INFO] Extracting the audio from the video and dashing it..."

mkdir -p ./audio
ffmpeg -i $paramI -vn -acodec copy -y audio/audio.mp4
mp4fragment --fragment-duration 1000 audio/audio.mp4 audio/f_audio.mp4
mp4dash --output-dir=audio -f --mpd-name=audio.mpd audio/f_audio.mp4
echo "[DONE] Extracting the audio from the video and dashing it!"

echo "[DONE] Pre-process done! Remember to create the JSON file to store the whole information."