#!/bin/bash
start_all=$(date +%s.%N)
for i in $(ls data/taheriyan2016/task_04/learning_datasets/)
do
    printf "\n"
    echo "Run script for" ${i}
    start=$(date +%s.%N)
    python src/link_prediction/link_predict.py \
    --directory data/taheriyan2016/task_04/learning_datasets/${i}/ \
    --train data/taheriyan2016/task_04/learning_datasets/${i}/train.nt \
    --valid data/taheriyan2016/task_04/learning_datasets/${i}/valid.nt \
    --test data/taheriyan2016/task_04/learning_datasets/${i}/test.nt \
    --score ${i} \
    --parser TAH \
    --gpu 0 \
    --graph-batch-size 1000 \
    --n-hidden 100 \
    --graph-split-size 1
    # --evaluate-every 10 \
    # --n-epochs 20
    duration=$(echo "$(date +%s.%N) - $start" | bc)
    duration_until_now=$(echo "$(date +%s.%N) - $start_all" | bc)
    printf "\n"
    echo "Time for training with background of" ${i} "is" ${duration} "seconds"
    echo "Time for training until now is" ${duration_until_now} "seconds"
done
duration_all=$(echo "$(date +%s.%N) - $start_all" | bc)
execution_time_all=`printf "%d seconds" $duration_all`
printf "\n"
echo "Total time for training data in Task 04 is" ${execution_time_all}
