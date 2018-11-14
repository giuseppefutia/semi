# semi
A Semantic Modeling Machine.

## Semantic Model Generation
For the JARQL generation you can type:

```bash
$ node semantic_modeling/jarql.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_sm.query
```

* `data/pc/semantic_types/Z4ADEA9DE4_st.json` is the input semantic type file.
* `data/pc/semantic_models/Z4ADEA9DE4_sm.sparql` is the JARQL semantic model.

In order to create the RDF represention you have to run the JARQL tool.

Initially, you have to create an executable .jar containing all the dependencies running the following command:

```bash
$ cd semantic_modeling/lib/jarql/
$ mvn package -Pexecutable
```

Then, you can create the RDF file as follows:

```bash
$ mv target/jarql-1.0.1-SNAPSHOT.jar ../../../../jarql-1.0.1-SNAPSHOT.jar
$ java -jar jarql-1.0.1-SNAPSHOT.jar data/pc/input/Z4ADEA9DE4.json data/pc/semantic_models/Z4ADEA9DE4_sm.query > data/pc/output/Z4ADEA9DE4.rdf
```
