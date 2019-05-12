import matplotlib.pyplot as plt
import os, re, pprint, sys
from math import pi
import pandas as pd
import numpy as np
import argparse

parser = argparse.ArgumentParser()
parser.add_argument(
	'aggregation_measure',
	type=str,
	help="aggregation function. Either 'avg', 'med' or 'std' (default = 'avg')"
)
parser.add_argument(
	'metrics',
	type=str,
	help="Metrics to plot, comma separated and without spaces. (default = all)"
)
args = parser.parse_args()
aggregation = args.aggregation_measure
base_dir = "."

# parse results files
results = {}
metrics_dict = {}
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

					try:
						metrics_dict[metric][db_name][tool_name] = score
					except KeyError:
						if metric not in metrics_dict.keys():
							metrics_dict[metric] = {}
						if db_name not in metrics_dict[metric].keys():
							metrics_dict[metric][db_name] = {}
						metrics_dict[metric][db_name][tool_name] = score

metrics_set = set(results[tool_name][db_name].keys())

with open("results.csv", "w") as outfile:
	with open("results_avg.csv","w") as outfile_avg:
		outfile.write("tool,metric,db,score\n")
		outfile_avg.write("tool,metric,avg_score\n")
		for tool,v in results.items():
			for metric in metrics_set:
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

for metric, v in metrics_dict.items():
	with open("{}_results.csv".format(metric.split("(AVG)")[0]), "w") as outfile:
		outfile.write("db,tool,score\n")
		for db_name, vv in v.items():
			for tool, score in vv.items():
				outfile.write("{},{},{}\n".format(db_name,tool,score))


df = pd.read_csv("results_avg.csv")

if args.metrics != 'all':
	filter_metrics = [m+" (AVG)" for m in args.metrics.split(",")]
	metrics = [m for m in metrics_set if m in filter_metrics]
	df = df[df['metric'].isin(metrics)]
else:
	metrics = metrics_set

if len(metrics) == 2:
	N = 4
else:
	N = len(list(df['metric'].unique()))

angles = [n / float(N) * 2 * pi for n in range(N)]
angles += angles[:1]

ax = plt.subplot(111, polar=True)

if len(metrics) == 2:
	angles_labels = [
		df['metric'].unique()[0],
		"",
		df['metric'].unique()[1],
		""
	]
else:
	angles_labels = list(df['metric'].unique())
plt.xticks(angles[:-1], angles_labels, color='grey', size=8)

ax.set_rlabel_position(0)
plt.yticks([10,20,30], ["10","20","30"], color="grey", size=7)
if aggregation == 'std':
	y_lim = 0.5
else:
	y_lim = 1.2
plt.ylim(0,1.2)

for num,tool in enumerate(list(df['tool'].unique())):
	if len(metrics) == 2:
		values_list = [
			df[df['tool']==tool]['avg_score'].tolist()[0],
			y_lim/2,
			df[df['tool']==tool]['avg_score'].tolist()[1],
			y_lim/2,
			df[df['tool']==tool]['avg_score'].tolist()[0]
		]
	else:
		values_list = df[df['tool']==tool]['avg_score'].tolist() + df[df['tool']==tool]['avg_score'].tolist()[:1]

	ax.plot(
		angles,
		values_list,
		linewidth=1,
		linestyle='solid',
		label=tool
	)
ax.legend(loc='upper right')
plt.show()
