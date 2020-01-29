#!/bin/bash
for i in $(ls data/taheriyan2016/task_04/learning_datasets/)
do
    echo "Run script for" ${i}
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
done
