import networkx as nx

G = nx.nx_agraph.read_dot(
    'data/taheriyan2016/task_one/semantic_models/plausibles/dot/s01-cb.dot')

print("Nodes in G: ", G.nodes(data=True))
print("Edges in G: ", G.edges(data=True))
