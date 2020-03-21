#!/bin/bash
#SBATCH --job-name=task_01_single_gpu
#SBATCH --mail-type=ALL
#SBATCH --mail-user=giuseppe.futia@polito.it
#SBATCH --partition=cuda
#SBATCH --time=72:00:00
#SBATCH --ntasks-per-node=1
#SBATCH --output=task_01_single_gpu_%j.log
#SBATCH --error=task_01_single_gpu_%j.log
#SBATCH --gres=gpu:1
#SBATCH --mem=50GB
module load nvidia/cudasdk/10.1
module load intel/python/3.6/2019.4.088
source semi_venv/bin/activate
cd semi
printf "\n"
echo "Run script for s01-cb"
start=$(date +%s.%N)
python src/link_prediction/link_predict.py \
--directory data/taheriyan2016/task_01/learning_datasets/s01-cb/ \
--train data/taheriyan2016/task_01/learning_datasets/s01-cb/train.nt \
--valid data/taheriyan2016/task_01/learning_datasets/s01-cb/valid.nt \
--test data/taheriyan2016/task_01/learning_datasets/s01-cb/test.nt \
--score s01-cb \
--parser TAH \
--gpu 0 \
--graph-batch-size 30000 \
--gpu-eval 0 \
--n-hidden 200 \
--lr 1e-3
# --evaluate-every 10 \
# --n-epochs 20
duration=$(echo "$(date +%s.%N) - $start" | bc)
printf "\n"
echo "Time for training with background of s01-cb is" ${duration} "seconds. Evaluation performed on GPU."
