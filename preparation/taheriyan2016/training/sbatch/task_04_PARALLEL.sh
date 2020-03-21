module load nvidia/cudasdk/10.1
module load intel/python/3.6/2019.4.088
source semi_venv/bin/activate
cd semi
for i in $(ls data/taheriyan2016/task_04/learning_datasets/)
do
    cat <<-EOF > ./task_04-${i}.sbatch
#!/bin/bash
#SBATCH --job-name=task_04_parallel
#SBATCH --mail-type=ALL
#SBATCH --mail-user=giuseppe.futia@polito.it
#SBATCH --partition=cuda
#SBATCH --time=2:00:00
#SBATCH --ntasks-per-node=1
#SBATCH --output=test_task_04_parallel_%j.log
#SBATCH --error=error_test_task_04_parallel_%j.log
#SBATCH --gres=gpu:1
#SBATCH --mem=5GB
./task_04_SINGLE.sh ${i}
EOF
sbatch ./task_04-${i}.sbatch
done
