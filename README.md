# SeMi - SEmantic Modeling machIne

SeMi (SEmantic Modeling machIne) is a tool to semi-automatically build large-scale [Knowledge Graphs]() from structured sources. To achieve such a goal, it combines [steiner trees detection](https://github.com/giuseppefutia/semi#steiner-tree) with [deep learning applied on graphs](https://github.com/giuseppefutia/semi#r-gcn-model-generation-and-testing), and builds semantic models of the data sources, in terms of classes and relationships within an ontology domain.

Semantic models can be formalized as graphs, where leaf nodes represent the attributes of the data source and the other nodes and relationships are defined by the ontology.

Considering the following JSON file,

```json
{           
   "contract_id": "Z4ADEA9DE4",
   "contract_object": "Excavations",
   "proponent_struct": {
     "business_id": "80004990927",
     "business_name": "municipality01"
 },
 "participants":
 [
  {
    "business_id": "08106710158",
    "business_name": "company01"
  }
 ]
}
```

and the following domain ontology,

![alt text](https://github.com/giuseppefutia/semi/blob/master/images/ontology.png)

the resulting semantic model is:

![alt text](https://github.com/giuseppefutia/semi/blob/master/images/ontology.png)

https://github.com/giuseppefutia/semi/blob/master/images/semantic_model.png


# Download from GitHub

You can download the SeMi tool using the following command (the recursive parameter is necessary to install the external libraries as git modules):

```bash
$ git clone --recursive https://github.com/giuseppefutia/SeMi
```

# External libraries
SeMi includes two external libraries as git modules:
* JARQL - https://github.com/linked-solutions/jarql
* RODI - https://github.com/chrpin/rodi

JARQL is a tool to materialize KGs as RDF data from JSON files using through models written using SPARQL syntax.
RODI is a benchmark framework to compare automatic mapping tools from relational databases to ontologies for the RDF data generation.

In the following section you are going to install SeMi and the external libraries.

# Installation
To install the node.js component, you need to run:

```bash
$ npm install
```

To install the python component, you need to run:

```bash
$ conda create -n dgl python=3.6
$ conda activate dgl
$ conda install -c dglteam dgl
$ conda install requests
$ conda install -c conda-forge rdflib
$ conda install -c anaconda pandas
$ conda install -c pytorch pytorch
```

# Step-by-step Semantic Models Generation
Using the following scripts, you can generate a semantic model starting from an input source, a reference ontology and a semantic type definition.

## Multi-edge and Weighted Graph
The multi-edge and weighted graph includes all plausible semantic models of a data source based on a domain ontology. To create such graph, you can run the following commands:

```bash
$ node run/graph.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/ontology/ontology.ttl rdfs:domain rdfs:range owl:Class data/pc/semantic_models/Z4ADEA9DE4
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the input semantic type file.
* `data/pc/ontology/ontology.ttl` is the domain ontology file.
* `rdfs:domain` is the domain property in the ontology.
* `rdfs:range` is the range property in the ontology.
* `owl:Class` is the property in the ontology to identify classes.
* `data/pc/semantic_models/Z4ADEA9DE4` is used as output path for the generation of the graph in different formats.

This script generates two types of graph:

* `data/pc/semantic_models/Z4ADEA9DE4.graph` is the multi-edge and weighted graph.
* `data/pc/semantic_models/Z4ADEA9DE4_graph.json` is a beautified representation of the weighted graph.

## Steiner Tree

To create the Steiner Tree on the multi-edge and weighted graph you can run the following command:

```bash
$ node run/steiner_tree.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_graph.json data/pc/semantic_models/Z4ADEA9DE4
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the input semantic type file.
* `data/pc/semantic_models/Z4ADEA9DE4_graph.json` is the beautified representation of the weighted graph.
* `data/pc/semantic_models/Z4ADEA9DE4` is used as output path for the generation of the steiner tree in different formats.

This script generates two types of steiner trees:

* `data/pc/semantic_models/Z4ADEA9DE4.steiner` is the steiner tree.
* `data/pc/semantic_models/Z4ADEA9DE4_steiner.json` is a beautified representation of the steiner tree.

## Initial Semantic Model
For the automatic generation of the semantic model, you can run the following command:

```bash
$ node run/jarql.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_steiner.json data/pc/ontology/classes.json data/pc/semantic_models/Z4ADEA9DE4
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the input semantic type file.
* `data/pc/semantic_models/Z4ADEA9DE4_steiner.json` is the beautified representation of the steiner tree.
* `data/pc/ontology/classes.json` is the list of all classes in the ontology.
* `data/pc/semantic_models/Z4ADEA9DE4.query` is the output JARQL semantic model.

In order to create the RDF represention of the data, you have to run the JARQL tool.

The first step is to create an executable .jar containing all the dependencies running the following command (it requires Maven):

```
$ cd semantic_modeling/lib/jarql/
$ mvn package -Pexecutable
```

Once the .jar file is available, you can run the following command:

```
$ mv target/jarql-1.0.1-SNAPSHOT.jar ../../../jarql-1.0.1-SNAPSHOT.jar
$ cd ../../../
$ java -jar jarql-1.0.1-SNAPSHOT.jar data/pc/input/Z4ADEA9DE4.json data/pc/semantic_models/Z4ADEA9DE4.query > data/pc/output/Z4ADEA9DE4.rdf
```

## R-GCN Model Generation and Testing

```
$ cd /dgl/rgcn/link-prediction
$ python link_predict.py -d ../../../data/pc/ --gpu 0
```
