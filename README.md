# SeMi - SEmantic Modeling machIne

SeMi (SEmantic Modeling machIne) is a tool to semi-automatically build large-scale [Knowledge Graphs](https://en.wikipedia.org/wiki/Knowledge_base) from structured sources. To achieve such a goal, it combines [steiner trees detection](https://github.com/giuseppefutia/semi#steiner-tree) with [deep learning applied on graphs](https://github.com/giuseppefutia/semi#r-gcn-model-generation-and-testing), and builds semantic models of the data sources, in terms of classes and relationships within a domain ontology.

Semantic models can be formalized as graphs, where leaf nodes represent the attributes of the data source and the other nodes and relationships are defined by the ontology.

Considering the following JSON file in the public procurement domain:

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

And consider the following domain ontology related to public procurement:

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
$ cd libs/jarql/
$ mvn package -Pexecutable
$ mv target/jarql-1.0.1-SNAPSHOT.jar ../jarql-1.0.1-SNAPSHOT.jar
```

## Install RODI
To build the RODI benchmark and create a working .jar you can launch the following script (it requires Maven and Java):

```bash
$ cd libs/rodi
$ ./create_jar.sh
```

## Install Elasticsearch
To install Elastic search on Ubuntu 18.04, you can follow instructions available here: https://tecadmin.net/setup-elasticsearch-on-ubuntu/.

# Step-by-step Semantic Models Generation
Using the following scripts, you can generate a semantic model starting from an *input source* and a *domain ontology*.

## Semantic Types
Semantic types (or semantic labels) consist of a combination of an ontology class and an ontology data property. To perform the semantic types detection process you need to execute two different scripts. The first script is the following:

```bash
$ node run/semantic_label_indexer.js pc data/pc/input/
```

* `pc` is the Elasticsearch index name.
* `data/pc/input/` is the input folder containing files that have to be indexed.

This step is necessary to create the Elasticsearch index used as reference to detect the semantic types. The second script is the following:

```bash
$ node run/semantic_label.js pc data/pc/input/Z4ADEA9DE4.json data/pc/semantic_types/Z4ADEA9DE4_st_auto.json
```

* `pc` is the Elasticsearch index name.
* `data/pc/input/Z4ADEA9DE4.json` is the [input file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/input/Z4ADEA9DE4.json).
* `data/pc/semantic_types/Z4ADEA9DE4_st_auto.json` is the [automatically-generated semantic type](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_types/Z4ADEA9DE4_st_auto.json).

In SeMi, we consider the semantic types detection as a semi-automatic task.

For this reason, the [manual-refined version of the semantic type](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_types/Z4ADEA9DE4_st.json) is available in the file:
* `data/pc/semantic_types/Z4ADEA9DE4_st.json`

Below an image that represents semantic types.

![Semantic Types](https://github.com/giuseppefutia/semi/blob/master/images/semantic_type.png)

## Multi-edge and Weighted Graph
The multi-edge and weighted graph includes all plausible semantic models of a data source based on a domain ontology. To create such graph, you can run the following commands:

```bash
$ node run/graph.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/ontology/ontology.ttl rdfs:domain rdfs:range owl:Class data/pc/semantic_models/Z4ADEA9DE4
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the [input semantic type file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_types/Z4ADEA9DE4_st.json).
* `data/pc/ontology/ontology.ttl` is the [domain ontology file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/ontology/ontology.ttl).
* `rdfs:domain` is the domain property in the ontology.
* `rdfs:range` is the range property in the ontology.
* `owl:Class` is the property in the ontology to identify classes.
* `data/pc/semantic_models/Z4ADEA9DE4` is used as output path for the generation of the graph in different formats.

This script generates two types of graph:

* `data/pc/semantic_models/Z4ADEA9DE4.graph` is the [multi-edge and weighted graph](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4.graph).
* `data/pc/semantic_models/Z4ADEA9DE4_graph.json` is a [beautified representation of the weighted graph](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_graph.json).

Below an image that represents a multi-edge and a weighted graph.

![Multi-edge and Weighted Graph](https://github.com/giuseppefutia/semi/blob/master/images/weighted_graph.png)

## Steiner Tree

To create the Steiner Tree on the multi-edge and weighted graph you can run the following command:

```bash
$ node run/steiner_tree.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_graph.json data/pc/semantic_models/Z4ADEA9DE4
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the [semantic type file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_types/Z4ADEA9DE4_st.json).
* `data/pc/semantic_models/Z4ADEA9DE4_graph.json` is the [beautified representation of the weighted graph](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_graph.json).
* `data/pc/semantic_models/Z4ADEA9DE4` is used as output path for the generation of the steiner tree in different formats.

This script generates two types of steiner trees:

* `data/pc/semantic_models/Z4ADEA9DE4.steiner` is the [steiner tree](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4.steiner).
* `data/pc/semantic_models/Z4ADEA9DE4_steiner.json` is a [beautified representation of the steiner tree](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_steiner.json).

Below an image that represents a steiner tree.

![Steiner Tree](https://github.com/giuseppefutia/semi/blob/master/images/steiner_tree.png)

## Initial Semantic Model
For the automatic generation of the semantic model, you can run the following command:

```bash
$ node run/jarql.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_steiner.json data/pc/ontology/classes.json data/pc/semantic_models/Z4ADEA9DE4
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the [semantic type file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_types/Z4ADEA9DE4_st.json).
* `data/pc/semantic_models/Z4ADEA9DE4_steiner.json` is the [beautified representation of the steiner tree](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_steiner.json).
* `data/pc/ontology/classes.json` is the list of [all classes in the ontology](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/ontology/classes.json).
* `data/pc/semantic_models/Z4ADEA9DE4.query` is the output [JARQL semantic model](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4.query).

Below an example of serialized semantic model using SPARQL and JARQL syntax:

```
CONSTRUCT {
    ?Contract0 dcterms:identifier ?cig.
    ?Contract0 rdf:type pc:Contract.
    ?Contract0 rdfs:description ?oggetto.
    ?Contract0 rdf:type pc:Contract.
    ?BusinessEntity0 dcterms:identifier ?strutturaProponente__codiceFiscaleProp.
    ?BusinessEntity0 rdf:type gr:BusinessEntity.
    ?BusinessEntity1 dcterms:identifier ?partecipanti__identificativo.
    ?BusinessEntity1 rdf:type gr:BusinessEntity.
    ?BusinessEntity1 rdfs:label ?partecipanti__ragioneSociale.
    ?BusinessEntity1 rdf:type gr:BusinessEntity.
    ?BusinessEntity1 dcterms:identifier ?aggiudicatari__identificativo.
    ?BusinessEntity1 rdf:type gr:BusinessEntity.
    ?BusinessEntity1 rdfs:label ?aggiudicatari__ragioneSociale.
    ?BusinessEntity1 rdf:type gr:BusinessEntity.
    ?Contract0 pc:contractingAuthority ?BusinessEntity0.
    ?Contract0 pc:contractingAuthority ?BusinessEntity1.
}
WHERE {
    jarql:root jarql:cig ?cig.
    jarql:root jarql:oggetto ?oggetto.
    jarql:root jarql:strutturaProponente ?strutturaProponente.
    ?strutturaProponente jarql:codiceFiscaleProp ?strutturaProponente__codiceFiscaleProp.
    jarql:root jarql:partecipanti ?partecipanti.
    ?partecipanti jarql:identificativo ?partecipanti__identificativo.
    jarql:root jarql:partecipanti ?partecipanti.
    ?partecipanti jarql:ragioneSociale ?partecipanti__ragioneSociale.
    jarql:root jarql:aggiudicatari ?aggiudicatari.
    ?aggiudicatari jarql:identificativo ?aggiudicatari__identificativo.
    jarql:root jarql:aggiudicatari ?aggiudicatari.
    ?aggiudicatari jarql:ragioneSociale ?aggiudicatari__ragioneSociale.
    BIND (URI(CONCAT('http://purl.org/procurement/public-contracts/contract/',?cig)) as ?Contract0)
    BIND (URI(CONCAT('http://purl.org/goodrelations/v1/businessentity/',?strutturaProponente__codiceFiscaleProp)) as ?BusinessEntity0)
    BIND (URI(CONCAT('http://purl.org/goodrelations/v1/businessentity/',?partecipanti__identificativo)) as ?BusinessEntity1)
}
```

## KG Generation Through the Initial Semantic Model
In order to create the RDF represention into a KG of the data, you have to run the JARQL tool with the following command:

```bash
$ java -jar jarql-1.0.1-SNAPSHOT.jar data/pc/input/Z4ADEA9DE4.json data/pc/semantic_models/Z4ADEA9DE4.query > data/pc/output/Z4ADEA9DE4.ttl
```

* `data/pc/input/Z4ADEA9DE4.json` is the [input file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/input/Z4ADEA9DE4.json).
* `data/pc/semantic_models/Z4ADEA9DE4.query` is the [semantic model in the JARQL format](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4.query).
* `data/pc/output/Z4ADEA9DE4.ttl` is the output [RDF file serialized in turtle](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/output/Z4ADEA9DE4.ttl).

Below an example of the generated RDF file:

```
<http://purl.org/procurement/public-contracts/contract/Z4ADEA9DE4>
        a       <http://purl.org/procurement/public-contracts#Contract> ;
        <http://www.w3.org/2000/01/rdf-schema#description>
                "C.E. 23 Targa E9688 ( RIP.OFF.PRIVATE ) MANUTENZIONE ORDINARIA MEZZI DI TRASPORTO"^^<http://www.w3.org/2001/XMLSchema#string> ;
        <http://purl.org/dc/terms/identifier>
                "Z4ADEA9DE4"^^<http://www.w3.org/2001/XMLSchema#string> ;
        <http://purl.org/procurement/public-contracts#contractingAuthority>
                <http://purl.org/goodrelations/v1/businessentity/03382820920> , <http://purl.org/goodrelations/v1/businessentity/80004990927> .

<http://purl.org/goodrelations/v1/businessentity/03382820920>
        a       <http://purl.org/goodrelations/v1#BusinessEntity> ;
        <http://www.w3.org/2000/01/rdf-schema#label>
                "CAR WASH CARALIS DI PUSCEDDU GRAZIANO   C  S N C"^^<http://www.w3.org/2001/XMLSchema#string> ;
        <http://purl.org/dc/terms/identifier>
                "03382820920"^^<http://www.w3.org/2001/XMLSchema#string> .

<http://purl.org/goodrelations/v1/businessentity/80004990927>
        a       <http://purl.org/goodrelations/v1#BusinessEntity> ;
        <http://purl.org/dc/terms/identifier>
                "80004990927"^^<http://www.w3.org/2001/XMLSchema#string> .
```

# Refinement Process
The refinement process requires to prepare the training, the testing, and the validation datasets for the deep learning model. This model includes an encoder component called [Relational Graph Convolutional Networks (R-GCNs)]() and a decoder component called [DistMult]().

The training and the testing datasets are built from a complete dataset corresponding to a KG built on top of the semantic model(s) created by domain experts based on the input data. In our example, if we consider data available in `data/pc/input` [folder](https://github.com/giuseppefutia/semi/tree/master/data/pc/input), the human-created semantic model is available in the `semi/data/training/pc/pc.query` [file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/training/pc/pc.query). The generated KG is available in the `semi/data/training/pc/complete.ttl` [file](https://github.com/giuseppefutia/semi/blob/master/data/training/pc/complete.ttl). The training dataset is available in the `semi/data/training/pc/training.ttl` [file](https://github.com/giuseppefutia/semi/blob/master/data/training/pc/training.ttl), while the test dataset is available in the [file](https://github.com/giuseppefutia/semi/blob/master/data/training/pc/test.ttl).

## Plausible Semantic Models
The validation dataset is a KG resulting from the semantic model built on top of all plausible semantic models. The creation of the validation dataset is based on different steps. The first step is the JARQL-serialized construction of plausible semantic models.

```bash
$ node run/jarql.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_graph.json data/pc/ontology/classes.json data/pc/semantic_models/Z4ADEA9DE4_plausible
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the [semantic type file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_types/Z4ADEA9DE4_st.json).
* `data/pc/semantic_models/Z4ADEA9DE4_graph.json` is the [beautified representation of the weighted graph](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_graph.json).
* `data/pc/ontology/classes.json` is the list of [all classes in the ontology](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/ontology/classes.json).
* `data/pc/semantic_models/Z4ADEA9DE4_plausible.query` is the output [JARQL of plausible semantic models](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_plausible.query).  

## Plausible KG
The second step to create the validation dataset is the generation of the KG running the JARQL tool.

```bash
$ java -jar jarql-1.0.1-SNAPSHOT.jar data/pc/input/Z4ADEA9DE4.json data/pc/semantic_models/Z4ADEA9DE4_plausible.query > data/pc/output/Z4ADEA9DE4_plausible.ttl
```

* `data/pc/input/Z4ADEA9DE4.json` is the [input file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/input/Z4ADEA9DE4.json).
* `data/pc/semantic_models/Z4ADEA9DE4_plausible.query` is the [semantic model in the JARQL format](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_plausible.query).
* `data/pc/output/Z4ADEA9DE4_plausible.ttl` is the output [RDF file serialized in turtle](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/output/Z4ADEA9DE4_plausible.ttl).
