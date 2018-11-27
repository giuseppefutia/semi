# semi
A Semantic Modeling Machine.

## Multi-edge and Weighted Graph
The multi-edge and weighted graph includes all plausible semantic models of a data source respect to a domain ontology. To create such graph, you can run the following commands:

```bash
$ node run/graph.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/ontology/public-contracts.ttl rdfs:domain rdfs:range owl:class data/pc/semantic_models/Z4ADEA9DE4
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the input semantic type file.
* `data/pc/ontology/public-contracts.ttl` is the domain ontology file.
* `rdfs:domain` is the domain property in the ontology.
* `rdfs:range` is the range property in the ontology.
* `owl:class` is the property in the ontology to identify classes.
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
* `data/pc/semantic_models/Z4ADEA9DE4` is used as output path for the generation of the steiner tree in different formats.

This script generates two types of steiner trees:

* `data/pc/semantic_models/Z4ADEA9DE4.steiner` is the steiner tree.
* `data/pc/semantic_models/Z4ADEA9DE4_steiner.json` is a beautified representation of the steiner tree.

## Initial Semantic Model
For the automatic generation of JARQL, you can run the following command:

```bash
$ node run/jarql.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_sm.query
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the input semantic type file.
* `data/pc/semantic_models/Z4ADEA9DE4_sm.sparql` is the output JARQL semantic model.

In order to create the RDF represention of the data, you have to run the JARQL tool.

The first step is to create an executable .jar containing all the dependencies running the following command:

```
$ cd semantic_modeling/lib/jarql/
$ mvn package -Pexecutable
```

Once the .jar file is available, you can run the following command:

```bash
$ mv target/jarql-1.0.1-SNAPSHOT.jar ../../../../jarql-1.0.1-SNAPSHOT.jar
$ java -jar jarql-1.0.1-SNAPSHOT.jar data/pc/input/Z4ADEA9DE4.json data/pc/semantic_models/Z4ADEA9DE4_sm.query > data/pc/output/Z4ADEA9DE4.rdf
```
