#!/bin/bash -e
############################################################
# 360 EDITION-AWARE VIDEO PLAYER PRE-PROCESSING            #
############################################################

opts=$(getopt \
    --options "d:b:s:" \
    -- "$@"
)

############################################################
# Help                                                     #
############################################################
Help()
{
   echo "This script do the traffic control for the 360EAVP Experiment"
   echo
   echo "Syntax: $0 [<ARGS>] "
   echo
   echo "ARGS:"
   echo -e "\t Mandatory:"
   echo -e "\t\t -d \"<DEVICE>\""
   echo -e "\t\t -b \"<BANDWIDTH LIMIT>\""
   echo -e "\t\t -s \"<SLEEP TIME>\""

}

############################################################
# Main program                                             #
############################################################
#set -e

scriptDir="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
resultDir="results/"

eval set --$opts

paramD="enp0s3"
paramB="5Mbit"
paramS=3

while true; do
   case "$1" in
      -d) paramD="$2" ; shift 2 ;;
      -b) paramB="$2" ; shift 2 ;;
      -s) paramS="$2" ; shift 2 ;;
      --) shift; break;;
      *) Help ; break;;
   esac
done



echo "Trying to remove existing rules for device $paramD..."
$(sudo tc qdisc del dev $paramD root)|| echo "There is no active rule to $paramD"


echo "Bandwidth limit at $paramB/s..."
sudo tc qdisc add dev $paramD root tbf rate $paramB burst 32kbit latency 400ms

sleep $paramS

sudo tc qdisc del dev enp0s3 root
echo "Bandwidth limit removed..."