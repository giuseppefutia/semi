# SeMi - SEmantic Modeling machIne

*SeMi (SEmantic Modeling machIne)* is a tool to semi-automatically build large-scale *Knowledge Graphs* from structured sources such as CSV, JSON, and XML files. To achieve such a goal, SeMi builds the *semantic models* of the data sources, in terms of concepts and relations within a domain ontology. Most of the research contributions on automatic semantic modeling is focused on the detection of semantic types of source attributes. However, the inference of the correct semantic relations between these attributes is critical to reconstruct the precise meaning of the data. SeMi covers the entire process of semantic modeling:
1. it provides a semi-automatic step to detect semantic types;
2. it exploits a novel approach to inference semantic relations, based on a graph neural network trained on background linked data.

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

# Requirements
Before installing SeMi, you need to check the following [requirements](https://github.com/giuseppefutia/semi/wiki/Requirements).

# Download
To download SeMi, you can run the commands available [here](https://github.com/giuseppefutia/semi/wiki/Download).

# Set-up
To install SeMi, you can use the following [instructions](https://github.com/giuseppefutia/semi/wiki/Installation).

# Step-by-step Semantic Models Generation
Using the following scripts, you can generate a semantic model starting from an *target source* and a *domain ontology*.

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

## Multi-edge and Weighted Graph (MEWG)
The Multi-edge and Weighted Graph (MEWG) includes all plausible semantic models of a data source based on a domain ontology. To create such graph, you can run the following commands:

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

Below an image that represents the MEWG:

![Multi-edge and Weighted Graph](https://github.com/giuseppefutia/semi/blob/master/images/weighted_graph.png)

## Steiner Tree

To create the Steiner Tree on the MEWG: you can run the following command:

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

Below an example of the semantic model serialized using SPARQL and JARQL syntax:

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
    ?root a jarql:Root.
    OPTIONAL { ?root jarql:cig ?cig. }
    OPTIONAL { ?root jarql:oggetto ?oggetto. }
    OPTIONAL { ?root jarql:strutturaProponente ?strutturaProponente. }
    OPTIONAL { ?strutturaProponente jarql:codiceFiscaleProp ?strutturaProponente__codiceFiscaleProp. }
    OPTIONAL { ?root jarql:partecipanti ?partecipanti. }
    OPTIONAL { ?partecipanti jarql:identificativo ?partecipanti__identificativo. }
    OPTIONAL { ?root jarql:partecipanti ?partecipanti. }
    OPTIONAL { ?partecipanti jarql:ragioneSociale ?partecipanti__ragioneSociale. }
    OPTIONAL { ?root jarql:aggiudicatari ?aggiudicatari. }
    OPTIONAL { ?aggiudicatari jarql:identificativo ?aggiudicatari__identificativo. }
    OPTIONAL { ?root jarql:aggiudicatari ?aggiudicatari. }
    OPTIONAL { ?aggiudicatari jarql:ragioneSociale ?aggiudicatari__ragioneSociale. }
    BIND (URI(CONCAT('http://purl.org/procurement/public-contracts/contract/',?cig)) as ?Contract0)
    BIND (URI(CONCAT('http://purl.org/goodrelations/v1/businessentity/',?strutturaProponente__codiceFiscaleProp)) as ?BusinessEntity0)
    BIND (URI(CONCAT('http://purl.org/goodrelations/v1/businessentity/',?partecipanti__identificativo)) as ?BusinessEntity1)
}
```

## KG Generation Through the Initial Semantic Model
In order to create the KG resulting from the initial semantic model, you have to run the JARQL tool with the following command:

```bash
$ ./jarql.sh data/pc/input/Z4ADEA9DE4.json data/pc/semantic_models/Z4ADEA9DE4.query > data/pc/output/Z4ADEA9DE4.ttl
```

* `data/pc/input/Z4ADEA9DE4.json` is the [input file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/input/Z4ADEA9DE4.json).
* `data/pc/semantic_models/Z4ADEA9DE4.query` is the [semantic model in the JARQL format](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4.query).
* `data/pc/output/Z4ADEA9DE4.ttl` is the output [RDF file serialized in turtle](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/output/Z4ADEA9DE4.ttl).

Below an example of the generated RDF file:

```
<http://purl.org/procurement/public-contracts/contract/Z4ADEA9DE4>
        <http://purl.org/dc/terms/identifier>
                "Z4ADEA9DE4"^^<http://www.w3.org/2001/XMLSchema#string> ;
        <http://purl.org/procurement/public-contracts#contractingAuthority>
                <http://purl.org/goodrelations/v1/businessentity/03382820920> , <http://purl.org/goodrelations/v1/businessentity/80004990927> ;
        <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>
                <http://purl.org/procurement/public-contracts#Contract> ;
        <http://www.w3.org/2000/01/rdf-schema#description>
                "C.E. 23 Targa E9688 ( RIP.OFF.PRIVATE ) MANUTENZIONE ORDINARIA MEZZI DI TRASPORTO"^^<http://www.w3.org/2001/XMLSchema#string> .

<http://purl.org/goodrelations/v1/businessentity/03382820920>
        <http://purl.org/dc/terms/identifier>
                "03382820920"^^<http://www.w3.org/2001/XMLSchema#string> ;
        <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>
                <http://purl.org/goodrelations/v1#BusinessEntity> ;
        <http://www.w3.org/2000/01/rdf-schema#label>
                "CAR WASH CARALIS DI PUSCEDDU GRAZIANO   C  S N C"^^<http://www.w3.org/2001/XMLSchema#string> .

<http://purl.org/goodrelations/v1/businessentity/80004990927>
        <http://purl.org/dc/terms/identifier>
                "80004990927"^^<http://www.w3.org/2001/XMLSchema#string> ;
        <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>
                <http://purl.org/goodrelations/v1#BusinessEntity> .

```

## Issues Related to the Initial Semantic Model
The approach for generating the initial semantic model has a main limit: the steiner tree within the graph includes the shortest path to connect semantic type classes, however it does not necessarily express the correct semantic description of the target source. For this reason, a refinement process is required in order to identify a more accurate semantic model.

# Semantic Model Refinement
The semantic model refinement requires to prepare the training, the test, and the validation datasets as input of the deep learning model. Such model is a *graph neural network* and its main goal is to reconstruct the linked data edges using the latent representation of entities and properties. The architecture of the graph neural network is an auto-encoder composed of:
* An encoder called [Relational Graph Convolutional Networks (R-GCNs)](https://arxiv.org/abs/1703.06103):
* A decoder called [DistMult](https://arxiv.org/abs/1412.6575).

The training, the test, and the validation datasets are built splitting a linked data repository (background knowledge) that is built through the semantic models defined by the domain experts on various sources, which are similar to the target source.  

In our example, the input sources are available in the `data/pc/input` [folder](https://github.com/giuseppefutia/semi/tree/master/data/pc/input) and the ground-truth semantic model is available in the `semi/data/learning_datasets/pc.query` [file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/learning_datasets/pc.query).

The background linked data is available in the `data/pc/learning_datasets/complete.ttl` [file](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/complete.ttl). This background knowledge is then splitted in the following datasets:
* the training dataset available in the `data/pc/learning_datasets/training.ttl` [file](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/training.ttl);
* the validation dataset available in the `data/pc/learning_datasets/valid.ttl` [file](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/valid.ttl);
* the test dataset available in the `data/pc/learning_datasets/test.ttl` [file](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/test.ttl).

## Graph Neural Network Training
For the graph neural network training, you can launch the following script:

```bash
python src/link_prediction/link_predict.py --directory data/pc/learning_datasets/  --train data/pc/learning_datasets/training.ttl --valid data/pc/learning_datasets/valid.ttl --test data/pc/learning_datasets/test.ttl --score pc --parser PC --gpu 0 --graph-batch-size 1000 --n-hidden 100 --graph-split-size 1
```

* `--directory data/pc/learning_datasets/` is the directory in which entity and property dictionaries are stored. In addition, this directory stores also the trained model with its related outputs..
* `--train data/pc/learning_datasets/training.ttl` is the file containing the training facts.
* `--valid data/pc/learning_datasets/valid.ttl` is the file containing the validation facts.
* `--test data/pc/learning_datasets/test.ttl` is the file containing the test facts.
* `--score pc` is the subdirectory in which the scores resulting from the training and the evaluation process will be stored.
* `--parser PC` is the parameter to drive the construction of the dictionaries of entities and relationships.
* `--gpu 0` is the parameter to establish how many GPUs (if available) can be used to train the model.
* `--graph-batch-size 1000` is a parameter to indicate the number of edges extracted at each step with the graph sampling process.
* `--n-hidden 100` is an hyperparameter of the model to define the number of neurons (and consequently the dimension of the embeddings) at each network layer.
* `--graph-split-size 1` is a parameter to establish the portion of edges used as positive examples.

The outputs of the training stage are the following:
* `entities.dict`: [dictionary](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/dicts/entities.dict) that maps ids to entity URIs.
* `relations.dict`: [dictionary](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/dicts/relations.dict) that maps ids to property URIs.
* `model_state.pth`: python version of the [trained model](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/model_datasets/model_state.pth).
* `train.npy`: [numpy representation](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/model_datasets/train.npy) of the training dataset.
* `valid.npy`: [numpy representation](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/model_datasets/valid.npy) of the validation dataset.
* `test.npy`: [numpy representation](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/model_datasets/test.npy) of the test dataset.
* `emb_nodes.json`: [JSON](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/model_datasets/scores/best/emb_nodes.json) with entity embeddings.
* `emb_rels.json`: [JSON](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/model_datasets/scores/best/emb_rels.json) with object property embeddings.
* `score.json`: [fact scores](https://github.com/giuseppefutia/semi/blob/master/data/pc/learning_datasets/model_datasets/best/6000/score.json) obtained on the test data set.

## Weights Refinement of the MEWG
The goal of this stage to refine the edge weights of the MEWG exploiting embedding obtained from the graph neural netwrk training. In this way, we incorporate the information from the background knowledge, in order to improve the accuracy of the semantic model.

The first step is to produce the JARQL representation of the MEWG:

```bash
$ node run/jarql.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_graph.json data/pc/ontology/classes.json data/pc/semantic_models/Z4ADEA9DE4_plausible
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the [semantic type file](https://github.com/giuseppefutia/semi/blob/master/data/pc/semantic_types/Z4ADEA9DE4_st.json).
* `data/pc/semantic_models/Z4ADEA9DE4_graph.json` is the [beautified representation of the weighted graph](https://github.com/giuseppefutia/semi/blob/master/data/pc/semantic_models/Z4ADEA9DE4_graph.json).
* `data/pc/ontology/classes.json` is the list of [all classes in the ontology](https://github.com/giuseppefutia/semi/blob/master/data/pc/ontology/classes.json).
* `data/pc/semantic_models/Z4ADEA9DE4_plausible.query` is the output [JARQL of plausible semantic models](https://github.com/giuseppefutia/semi/blob/master/data/pc/semantic_models/Z4ADEA9DE4_plausible.query).  

Then, you can proceed with the refinement process with the following command:

```bash
node run/refinement.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/model_datasets/scores/pc/6000/score.json data/pc/semantic_models/Z4ADEA9DE4_steiner.json data/pc/semantic_models/Z4ADEA9DE4_graph.json data/pc/semantic_models/Z4ADEA9DE4
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the [semantic type file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_types/Z4ADEA9DE4_st.json).
* `data/pc/model_datasets/scores/pc/6000/score.json` is the [score file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/model_datasets/scores/pc/6000/score.json) generated during the training at the epoch 6000
* `data/pc/semantic_models/Z4ADEA9DE4_steiner.json` is the beautified version of the [initial semantic model file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_steiner.json) generated through the [steiner tree](https://github.com/giuseppefutia/semi#steiner-tree) algorithm.
* `data/pc/semantic_models/Z4ADEA9DE4_graph.json` is the beautified version of [weighted graph file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_graph.json) including all plausible semantic models.

This script generates two different outputs:

* `data/pc/semantic_models/Z4ADEA9DE4_refined.graph` is the [refined semantic model file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_refined.graph).
* `data/pc/semantic_models/Z4ADEA9DE4_refined_graph.json` is the [beautified version of the refined semantic model file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_refined_graph.json).

Below an image that represents the refined semantic model.

![Refined Semantic Model](https://github.com/giuseppefutia/semi/blob/master/images/rgcn.png)


## JARQL Serialization of the Refined Semantic Model
For the generation of the refined semantic model serialized in JARQL, you need to run the following command:

```bash
node run/jarql.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_refined_graph.json data/pc/ontology/classes.json data/pc/semantic_models/Z4ADEA9DE4_refined
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the [semantic type file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_types/Z4ADEA9DE4_st.json).
* `data/pc/semantic_models/Z4ADEA9DE4_refined_graph.json` is the [beautified version of the refined semantic model file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_refined_graph.json).
* `data/pc/ontology/classes.json` is the list of [all classes in the ontology](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/ontology/classes.json).

This script generates as output the following file:

* `data/pc/semantic_models/Z4ADEA9DE4_refined.query` is the [JARQL serialization](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_refined.query) of the refined semantic model.

<!---

Below an example of the refined semantic model serialized using SPARQL and JARQL syntax:

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
    ?Contract0 pc:tender ?Tender0.
    ?Tender0 pc:bidder ?BusinessEntity0.
    ?Tender1 pc:bidder ?BusinessEntity1.
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
    BIND (URI(CONCAT('http://purl.org/procurement/public-contracts/tender/',?cig)) as ?Tender0)
    BIND (URI(CONCAT('http://purl.org/procurement/public-contracts/tender/',?partecipanti__identificativo)) as ?Tender1)
```
-->

## KG Generation from the Refined Semantic Model
In order to create the KG resulting from the refined semantic model, you have to run the JARQL tool with the following command:

```bash
$ ./jarql.sh data/pc/input/Z4ADEA9DE4.json data/pc/semantic_models/Z4ADEA9DE4_refined.query > data/pc/output/Z4ADEA9DE4_refined.ttl
```

* `data/pc/input/Z4ADEA9DE4.json` is the [input file](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/input/Z4ADEA9DE4.json).
* `data/pc/semantic_models/Z4ADEA9DE4_refined.query` is the [refined semantic model in the JARQL format](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/semantic_models/Z4ADEA9DE4_refined.query).
* `data/pc/output/Z4ADEA9DE4_refined.ttl` is the output [RDF file serialized in turtle](https://raw.githubusercontent.com/giuseppefutia/semi/master/data/pc/output/Z4ADEA9DE4_refined.ttl).
