#!/bin/bash
printf "\n"
echo "Run script for" $1
start=$(date +%s.%N)
python src/link_prediction/link_predict.py \
--directory data/taheriyan2016/task_04/learning_datasets/$1/ \
--train data/taheriyan2016/task_04/learning_datasets/$1/train.nt \
--valid data/taheriyan2016/task_04/learning_datasets/$1/valid.nt \
--test data/taheriyan2016/task_04/learning_datasets/$1/test.nt \
--score $1 \
--parser TAH \
--gpu 0 \
--graph-batch-size 1000 \
--n-hidden 100 \
--graph-split-size 1 \
--evaluate-every 10 \
--n-epochs 20 \
--gpu-eval 0
duration=$(echo "$(date +%s.%N) - $start" | bc)
printf "\n"
echo "Time for training with background of" $1 "is" ${duration} "seconds"
