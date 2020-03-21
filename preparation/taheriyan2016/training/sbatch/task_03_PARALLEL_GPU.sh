module load nvidia/cudasdk/10.1
module load intel/python/3.6/2019.4.088
source semi_venv/bin/activate
cd semi
for i in $(ls data/taheriyan2016/task_03/learning_datasets/)
do
    cat <<-EOF > ./task_03-${i}.sbatch
#!/bin/bash
#SBATCH --job-name=task_03_parallel_gpu
#SBATCH --mail-type=ALL
#SBATCH --mail-user=giuseppe.futia@polito.it
#SBATCH --partition=cuda
#SBATCH --time=72:00:00
#SBATCH --ntasks-per-node=1
#SBATCH --output=task_03_parallel_gpu_%j.log
#SBATCH --error=task_03_parallel_gpu_%j.log
#SBATCH --gres=gpu:1
#SBATCH --mem=50GB
./task_03_SINGLE.sh ${i}
EOF
sbatch ./task_03-${i}.sbatch
done
