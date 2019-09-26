# SeMi - SEmantic Modeling machIne

SeMi (SEmantic Modeling machIne) is a tool to semi-automatically build large-scale [Knowledge Graphs](https://en.wikipedia.org/wiki/Knowledge_base) from structured sources. To achieve such a goal, it combines [steiner trees detection](https://github.com/giuseppefutia/semi#steiner-tree) with [deep learning applied on graphs](https://github.com/giuseppefutia/semi#r-gcn-model-generation-and-testing), and builds semantic models of the data sources, in terms of classes and relationships within an ontology domain.

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

![Domain Ontology](https://github.com/giuseppefutia/semi/blob/master/images/ontology.png)

the resulting semantic model is:

![Semantic Model](https://github.com/giuseppefutia/semi/blob/master/images/semantic_model.png)


# Download from GitHub

You can download the SeMi tool using the following command. The recursive parameter is necessary to install the external libraries that are available as git modules in this repository:

```bash
$ git clone --recursive https://github.com/giuseppefutia/SeMi
```

# External libraries
SeMi includes two external libraries as git modules:
* JARQL - https://github.com/linked-solutions/jarql
* RODI - https://github.com/chrpin/rodi

JARQL is a tool to materialize KGs as RDF data from JSON files using semantic models written through SPARQL syntax.

RODI is a benchmark framework to compare automatic mapping tools from relational databases to ontologies for the KG generation.

To run SeMi you need to install also [Elasticsearch](https://www.elastic.co/).

In the following section you are going to install SeMi and the external libraries.

# Installation
In this section we explain how to install SeMi and its external libraries.

## Install SeMi

The SeMi tool is composed of a Node.js and a Python components.

### Node.js component

To install the Node.js component, you can run the following script from the root folder:

```bash
$ npm install
```

### Python component

To install the Python component, you can run the following script to create and activate a conda virtual environment and install pip:

```bash
$ conda create -n semi python=3.6
$ conda activate semi
$ conda install pip
```

To install all necessary packages, you can run:

```bash
$ pip install -r requirements.txt
```

## Install JARQL
In order to use JARQL you need to create the JARQL jar file with the following command (it requires Maven and Java) and move the it in the root directory:

```bash
$ cd semantic_modeling/lib/jarql/
$ mvn package -Pexecutable
$ mv target/jarql-1.0.1-SNAPSHOT.jar ../../jarql-1.0.1-SNAPSHOT.jar
```

Once the .jar file is available, you can run the following command:

## Install RODI
To build the RODI benchmark and create a working .jar you can launch the following script (it requires Maven and Java):

```bash
$ cd libs/rodi
$ ./create_jar.sh
```

## Install Elasticsearch
To install Elastic search on Ubuntu 18.04, you can follow instructions available here: https://tecadmin.net/setup-elasticsearch-on-ubuntu/

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

Below an image that represents multi-edge and weighted graph.

![Multi-edge and Weighted Graph](https://github.com/giuseppefutia/semi/blob/master/images/weighted_graph.png)

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

Below an image that represents a steiner tree.

![Steiner Tree](https://github.com/giuseppefutia/semi/blob/master/images/steiner_tree.png)

## Initial Semantic Model
For the automatic generation of the semantic model, you can run the following command:

```bash
$ node run/jarql.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_steiner.json data/pc/ontology/classes.json data/pc/semantic_models/Z4ADEA9DE4
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the input semantic type file.
* `data/pc/semantic_models/Z4ADEA9DE4_steiner.json` is the beautified representation of the steiner tree.
* `data/pc/ontology/classes.json` is the list of all classes in the ontology.
* `data/pc/semantic_models/Z4ADEA9DE4.query` is the output JARQL semantic model.

## KG Generation Through the Initial Semantic Model

In order to create the RDF represention into a KG of the data, you have to run the JARQL tool with the following command:

```bash
$ java -jar jarql-1.0.1-SNAPSHOT.jar data/pc/input/Z4ADEA9DE4.json data/pc/semantic_models/Z4ADEA9DE4.query > data/pc/output/Z4ADEA9DE4.ttl
```

* `data/pc/input/Z4ADEA9DE4.json` is the input file.
* `data/pc/semantic_models/Z4ADEA9DE4.query` is the semantic model in the JARQL format.
* `data/pc/output/Z4ADEA9DE4.ttl` is the output RDF file serialized in turtle.

## R-GCN Model Generation and Testing

For the real-time visualization of the loss, you need to run the Visdom server with the following command:

```
$ python -m visdom.server
```

Then you can run the script for the training and the evaluation:

```
$ cd dgl/rgcn/link-prediction
$ python link_predict.py -d ../../../data/pc/ --gpu 0
```
