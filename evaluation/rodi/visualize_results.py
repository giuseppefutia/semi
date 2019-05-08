import matplotlib.pyplot as plt
import os, re, pprint, sys
from math import pi
import pandas as pd
import numpy as np

base_dir = "."
if len(sys.argv) == 2:
	aggregation = sys.argv[1] # avd, med or std
else:
	aggregation = 'avg'

# parse results files
results = {}
for db_name in os.listdir(base_dir):
	#results[db_name] = {}
	if not os.path.isdir(os.path.join(base_dir, db_name)):
		continue

	for report_file in os.listdir(os.path.join(base_dir, db_name, "reports")):
		if not report_file.startswith("tabular"):
			continue

		tool_name = report_file.split("_")[1]
		if tool_name not in results.keys():
			results[tool_name] = {}
		if db_name not in results[tool_name].keys():
			results[tool_name][db_name] = {}
		for line in open(os.path.join(base_dir, db_name, "reports", report_file), "r"):
			if "(AVG)" in line:
				if not re.search("path-[0-9]+", line):
					metric, score, _, _ = line.split("|")
					score = float(score) if score != 'NaN' else None
					results[tool_name][db_name][metric] = score

metrics = set(results[tool_name][db_name].keys())

with open("results.csv", "w") as outfile:
	with open("results_avg.csv","w") as outfile_avg:
		outfile.write("tool,metric,db,score\n")
		outfile_avg.write("tool,metric,avg_score\n")
		for tool,v in results.items():
			for metric in metrics:
				scores = []
				for db,vv in v.items():
					outfile.write("{},{},{},{}\n".format(tool,metric,db,vv[metric]))

					if vv[metric] is not None:
						scores.append(vv[metric])
					else:
						#pass
						scores.append(0)
				if aggregation == 'avg':
					avg_score = np.mean(np.array(scores))
				elif aggregation == 'std':
					avg_score = np.std(np.array(scores))
				elif aggregation == 'med':
					avg_score = np.median(np.array(scores))
				outfile_avg.write("{},{},{}\n".format(tool,metric,avg_score))

df = pd.read_csv("results_avg.csv")
print(df)

if True:
	N = len(list(df['metric'].unique()))

	angles = [n / float(N) * 2 * pi for n in range(N)]
	angles += angles[:1]

	ax = plt.subplot(111, polar=True)

	plt.xticks(angles[:-1], list(df['metric'].unique()), color='grey', size=8)

	ax.set_rlabel_position(0)
	plt.yticks([10,20,30], ["10","20","30"], color="grey", size=7)
	if aggregation == 'std':
		plt.ylim(0,0.5)
	else:
		plt.ylim(0,1.2)

	for num,tool in enumerate(list(df['tool'].unique())):
		ax.plot(angles, df[df['tool']==tool]['avg_score'].tolist()+df[df['tool']==tool]['avg_score'].tolist()[:1], linewidth=1, linestyle='solid', label=tool)
	ax.legend(loc='upper right')
	plt.show()
